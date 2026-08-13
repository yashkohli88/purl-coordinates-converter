# Simple Converter Factory Design

**Date:** 2026-08-13
**Repo:** purl-coordinates-converter

## Summary

Replace duplicated boilerplate in 9 simple converter files with a `makeConverter` factory function. Complex converters (maven, debian) are untouched. Each simple converter file stays as an individual file but shrinks to ~5 lines.

## Motivation

Converters for cargo, gem, nuget, cocoapods, pypi, npm, composer, github, and golang share near-identical structure: reject qualifiers, map purlType→cdType+provider, apply a namespace policy, optionally transform the name, optionally require a namespace. Deduplicating via a factory eliminates ~15 lines of boilerplate per converter while preserving the one-file-per-type structure.

## New File: `src/converters/simpleConverter.ts`

Exports one function: `makeConverter(opts: SimpleConverterOptions): ConverterModule`.

### Options Interface

```ts
interface SimpleConverterOptions {
  purlType: string
  cdType: CoordinatesType
  provider: CoordinatesProvider
  namespacePolicy: 'from-purl' | 'fixed-dash'
  requireNamespace?: boolean
  normalizeName?: (name: string) => string
}
```

- `namespacePolicy: 'fixed-dash'` — always uses `'-'` as namespace (cargo, gem, nuget, cocoapods, pypi)
- `namespacePolicy: 'from-purl'` — uses `p.namespace ?? '-'` (npm, composer, github, golang)
- `requireNamespace` — if true and `p.namespace` is absent, throws (golang only)
- `normalizeName` — optional name transform applied before building coordinates (pypi: lowercase + `_` → `-`)

### `toCoordinates` Logic

1. If `p.qualifiers` has any keys → throw `PURL qualifiers are not supported for type: ${p.type}`
2. If `requireNamespace && !p.namespace` → throw `Golang PURL requires a namespace: ${p.toString()}`
3. `namespace = namespacePolicy === 'from-purl' ? (p.namespace ?? '-') : '-'`
4. `name = opts.normalizeName ? opts.normalizeName(p.name) : p.name`
5. Return `{ type: cdType, provider, namespace, name, revision: p.version ?? undefined }`

### `toPurl` Logic

```ts
new PackageURL(purlType, c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
```

### Exported `ConverterModule`

```ts
{
  supportedPurlTypes: [purlType],
  supportedTypeProviderPairs: [`${cdType}:${provider}`],
  toCoordinates,
  toPurl
}
```

## Migration: 9 Simple Converter Files

Each file replaces its ~20 lines with a single `makeConverter` call:

```ts
// cargo.ts (example)
import { makeConverter } from './simpleConverter.ts'
export const converter = makeConverter({
  purlType: 'cargo', cdType: 'crate', provider: 'cratesio',
  namespacePolicy: 'fixed-dash'
})
```

### Full Mapping

| File | purlType | cdType | provider | namespacePolicy | special |
|---|---|---|---|---|---|
| cargo | cargo | crate | cratesio | fixed-dash | — |
| gem | gem | gem | rubygems | fixed-dash | — |
| nuget | nuget | nuget | nuget | fixed-dash | — |
| cocoapods | cocoapods | pod | cocoapods | fixed-dash | — |
| pypi | pypi | pypi | pypi | fixed-dash | `normalizeName: n => n.toLowerCase().replace(/_/g, '-')` |
| npm | npm | npm | npmjs | from-purl | — |
| composer | composer | composer | packagist | from-purl | — |
| github | github | git | github | from-purl | — |
| golang | golang | go | golang | from-purl | `requireNamespace: true` |

## Untouched Files

`maven.ts` and `debian.ts` — complex qualifier logic, multiple coord keys. Not migrated.

## No Changes To

- `src/index.ts` — imports unchanged
- `src/types.ts` — `ConverterModule` interface unchanged

## Testing

Existing per-converter tests verify correctness after migration (no behavior change).

New `src/converters/simpleConverter.test.ts` unit tests:
- Qualifier rejection throws correct message
- `requireNamespace: true` throws when namespace absent
- `normalizeName` applied to name
- `namespacePolicy: 'fixed-dash'` always yields `'-'` namespace
- `namespacePolicy: 'from-purl'` passes namespace through; falls back to `'-'` when absent
