---
name: converter-module-interface-design
description: Unify converters and reverseConverters maps via ConverterModule interface
metadata:
  type: project
---

# Converter Module Interface Design

## Problem

`index.ts` maintains two hand-managed maps:
- `converters`: keyed by PURL type (`npm`, `maven`, ...)
- `reverseConverters`: keyed by `type:provider` (`npm:npmjs`, `maven:mavencentral`, ...)

These are parallel structures — adding a new converter requires editing both. They can fall out of sync.

## Solution

Introduce a `ConverterModule` interface. Each converter module exports one object implementing this interface. `index.ts` builds both maps automatically from an array of converter modules.

## Interface

Add to `types.ts`:

```ts
import type { PackageURL } from 'packageurl-js'

export interface ConverterModule {
  purlTypes: string[]
  coordKeys: string[]
  toCoordinates: (p: PackageURL) => Promise<CoordinatesSpec>
  toPurl: (c: CoordinatesSpec) => PackageURL
}
```

## Converter Modules

Each converter exports a `converter` object. Example for `npm.ts`:

```ts
export const converter: ConverterModule = {
  purlTypes: ['npm'],
  coordKeys: ['npm:npmjs'],
  toCoordinates,
  toPurl
}
```

Maven (multi-provider):

```ts
export const converter: ConverterModule = {
  purlTypes: ['maven'],
  coordKeys: ['maven:mavencentral', 'maven:mavengoogle', 'maven:gradleplugin'],
  toCoordinates,
  toPurl
}
```

All 10 converter modules get the same treatment. `toCoordinates` and `toPurl` function implementations are unchanged.

## index.ts

Replace hand-maintained maps with auto-generated ones:

```ts
import { converter as npm } from './converters/npm.ts'
// ... all 10 converters

const allConverters: ConverterModule[] = [npm, pypi, cargo, gem, nuget, cocoapods, composer, github, maven, golang]

const converters = Object.fromEntries(
  allConverters.flatMap(c => c.purlTypes.map(t => [t, c.toCoordinates]))
)
const reverseConverters = Object.fromEntries(
  allConverters.flatMap(c => c.coordKeys.map(k => [k, c.toPurl]))
)
```

`purlToCoordinates` and `coordinatesToPurl` functions are unchanged.

## Rationale

Keys live with the converter that owns them. Adding a new provider to maven means editing `maven.ts` only. `index.ts` is mechanical — list converters, build maps.

## Scope

- `src/types.ts`: add `ConverterModule` interface + `PackageURL` import
- `src/converters/*.ts` (all 10): add `converter` export
- `src/index.ts`: replace manual maps with auto-generated ones, update imports
