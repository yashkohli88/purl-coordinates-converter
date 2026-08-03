// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesSpec } from '../types.ts'

const PURL_TYPES = ['golang']
const COORD_KEYS = ['go:golang']

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
    throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
  if (!p.namespace) throw new Error(`Golang PURL requires a namespace: ${p.toString()}`)
  return {
    type: 'go',
    provider: 'golang',
    namespace: p.namespace,
    name: p.name,
    revision: p.version ?? undefined
  }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  return new PackageURL('golang', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
}

export const converter: ConverterModule = {
  purlTypes: PURL_TYPES,
  coordKeys: COORD_KEYS,
  toCoordinates,
  toPurl
}
