# Golang PURL ↔ ClearlyDefined Coordinates Converter

## Context

`purl-coordinates-converter` converts between [PURL](https://github.com/package-url/purl-spec) strings and [ClearlyDefined](https://clearlydefined.io) coordinate objects. This spec adds support for the `golang` PURL type.

## ClearlyDefined Coordinate Structure for Go

```
type:     go
provider: golang
namespace: <module host + optional subpath, e.g. golang.org/x or cloud.google.com>
name:     <last path segment of module path, e.g. xerrors or go>
revision: <semver or pseudo-version, e.g. v0.0.0-20200804184101-5ec99f83aff1>
```

Verified against live ClearlyDefined API (`/definitions?pattern=...`). Examples:

| Module path                               | namespace                       | name    |
|-------------------------------------------|---------------------------------|---------|
| `rsc.io/quote`                            | `rsc.io`                        | `quote` |
| `golang.org/x/xerrors`                    | `golang.org/x`                  | `xerrors` |
| `cloud.google.com/go`                     | `cloud.google.com`              | `go` |
| `github.com/kucherenkovova/gopypaste/xerrors` | `github.com/kucherenkovova/gopypaste` | `xerrors` |
| `go.f110.dev/xerrors`                     | `go.f110.dev`                   | `xerrors` |

**Out of scope:** bare domain modules with no path (e.g. `collectd.org` → namespace=`-`).

## PURL Structure

PURL type is `golang`. Namespace holds everything before the final `/`, name holds the final segment. `packageurl-js` parses multi-slash namespaces correctly without manual encoding — `toString()` emits unencoded slashes in namespace, and `fromString()` parses them back correctly (verified).

Examples:
- `pkg:golang/rsc.io/quote@v1.3.0`
- `pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1`
- `pkg:golang/cloud.google.com/go@v0.56.0`
- `pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1`

## Architecture

### New file: `src/converters/golang.ts`

```ts
toCoordinates(p: PackageURL): Promise<CoordinatesSpec>
```
- Throw on any unsupported qualifiers
- Throw if `p.namespace` is missing (bare domain modules out of scope)
- Return `{ type: 'go', provider: 'golang', namespace: p.namespace, name: p.name, revision: p.version ?? undefined }`

```ts
toPurl(c: CoordinatesSpec): PackageURL
```
- `new PackageURL('golang', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)`
- `packageurl-js` handles slash-in-namespace serialization automatically

### Modified: `src/index.ts`

- Add `golang: golang.toCoordinates` to `converters` (keyed by PURL type)
- Add `'go:golang': golang.toPurl` to `reverseConverters` (keyed by `type:provider`)

## Tests

### `test/converters/golang.test.ts`

`toCoordinates`:
- `pkg:golang/rsc.io/quote@v1.3.0` → `{type:'go', provider:'golang', namespace:'rsc.io', name:'quote', revision:'v1.3.0'}`
- `pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1` → namespace=`golang.org/x`, name=`xerrors`
- `pkg:golang/cloud.google.com/go@v0.56.0` → namespace=`cloud.google.com`, name=`go`
- `pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1` → namespace=`github.com/kucherenkovova/gopypaste`, name=`xerrors`
- Throws when namespace missing
- Throws on unsupported qualifiers

`toPurl`:
- Roundtrip for each of the above cases

### `test/roundtrip.test.ts`

Add all four PURL strings above to the roundtrip cases array.

## Error Handling

Consistent with existing converters:
- Unsupported qualifiers → `Error('PURL qualifiers are not supported for type: golang')`
- Missing namespace → `Error('Golang PURL requires a namespace: <purl>')`
