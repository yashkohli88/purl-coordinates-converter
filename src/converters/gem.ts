// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { CoordinatesSpec } from '../types.ts'
import type { ConverterModule } from '../types.ts'

const PURL_TYPES = ['gem']
const COORD_KEYS = ['gem:rubygems']

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
    throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
  return { type: 'gem', provider: 'rubygems', namespace: '-', name: p.name, revision: p.version ?? undefined }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  return new PackageURL('gem', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
}

export const converter: ConverterModule = {
  purlTypes: PURL_TYPES,
  coordKeys: COORD_KEYS,
  toCoordinates,
  toPurl
}
