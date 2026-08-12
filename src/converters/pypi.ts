// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesSpec } from '../types.ts'

const supportedPurlTypes = ['pypi']
const supportedTypeProviderPairs = ['pypi:pypi']

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
    throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
  const name = p.name.toLowerCase().replace(/_/g, '-')
  return { type: 'pypi', provider: 'pypi', namespace: '-', name, revision: p.version ?? undefined }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  return new PackageURL('pypi', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
}

export const converter: ConverterModule = {
  supportedPurlTypes: supportedPurlTypes,
  supportedTypeProviderPairs: supportedTypeProviderPairs,
  toCoordinates,
  toPurl
}
