// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import { converter as cargo } from './converters/cargo.ts'
import { converter as cocoapods } from './converters/cocoapods.ts'
import { converter as composer } from './converters/composer.ts'
import { converter as debian } from './converters/debian.ts'
import { converter as gem } from './converters/gem.ts'
import { converter as github } from './converters/github.ts'
import { converter as golang } from './converters/golang.ts'
import { converter as maven } from './converters/maven.ts'
import { converter as npm } from './converters/npm.ts'
import { converter as nuget } from './converters/nuget.ts'
import { converter as pypi } from './converters/pypi.ts'
import type { ConverterModule, CoordinatesSpec } from './types.ts'

export type { CoordinatesSpec } from './types.ts'

const allConverters: ConverterModule[] = [
  npm,
  pypi,
  cargo,
  gem,
  nuget,
  cocoapods,
  composer,
  github,
  maven,
  golang,
  debian
]

export function buildMap<V>(entries: [string, V][]): Record<string, V> {
  const seen = new Set<string>()
  for (const [k] of entries) {
    if (seen.has(k)) throw new Error(`Duplicate converter key: ${k}`)
    seen.add(k)
  }
  return Object.fromEntries(entries)
}

const converters = buildMap(
  allConverters.flatMap(c => c.purlTypes.map(t => [t, c.toCoordinates] as [string, typeof c.toCoordinates]))
)

const reverseConverters = buildMap(
  allConverters.flatMap(c => c.coordKeys.map(k => [k, c.toPurl] as [string, typeof c.toPurl]))
)

export async function purlToCoordinates(purl: string): Promise<CoordinatesSpec> {
  const p = PackageURL.fromString(purl)
  if (p.subpath) throw new Error(`PURL subpath is not supported: ${purl}`)
  const converter = converters[p.type]
  if (!converter) throw new Error(`Unsupported PURL type: ${p.type}`)
  return converter(p)
}

export function coordinatesToPurl(coordinates: CoordinatesSpec): string {
  const key = `${coordinates.type}:${coordinates.provider}`
  const converter = reverseConverters[key]
  if (!converter) throw new Error(`Unsupported coordinate type/provider: ${coordinates.type}/${coordinates.provider}`)
  return converter(coordinates).toString()
}
