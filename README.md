# purl-coordinates-converter

Converts between [PURL](https://github.com/package-url/purl-spec) strings and [ClearlyDefined coordinates](https://docs.clearlydefined.io/docs/using-data/swagger#coordinates).

## Supported ecosystems

| PURL type | ClearlyDefined type/provider |
|-----------|------------------------------|
| `npm` | `npm/npmjs` |
| `pypi` | `pypi/pypi` |
| `cargo` | `crate/cratesio` |
| `gem` | `gem/rubygems` |
| `nuget` | `nuget/nuget` |
| `cocoapods` | `pod/cocoapods` |
| `composer` | `composer/packagist` |
| `github` | `git/github` |
| `maven` | `maven/mavencentral`, `maven/mavengoogle` |
| `golang` | `go/golang` |

## Installation

```sh
npm install @clearlydefined/purl-coordinates-converter
```

Requires Node.js >= 22.12.

## Usage

```ts
import { purlToCoordinates, coordinatesToPurl } from '@clearlydefined/purl-coordinates-converter'

// PURL → ClearlyDefined coordinates
const coords = await purlToCoordinates('pkg:npm/%40angular/core@17.0.0')
// { type: 'npm', provider: 'npmjs', namespace: '@angular', name: 'core', revision: '17.0.0' }

// ClearlyDefined coordinates → PURL
const purl = coordinatesToPurl({ type: 'npm', provider: 'npmjs', namespace: '@angular', name: 'core', revision: '17.0.0' })
// 'pkg:npm/%40angular/core@17.0.0'
```

## API

### `purlToCoordinates(purl: string): Promise<CoordinatesSpec>`

Parses a PURL string and returns ClearlyDefined coordinates. Throws if the PURL type is unsupported or a subpath is present.

### `coordinatesToPurl(coordinates: CoordinatesSpec): string`

Converts ClearlyDefined coordinates to a PURL string. Throws if the `type`/`provider` combination is unsupported.

### `CoordinatesSpec`

```ts
interface CoordinatesSpec {
  type: string
  provider: string
  namespace: string
  name: string
  revision: string | undefined
}
```

## Development

```sh
npm install
npm test        # run tests
npm run lint    # type-check + biome lint
npm run lint:fix
```

## License

[MIT](LICENSE)
