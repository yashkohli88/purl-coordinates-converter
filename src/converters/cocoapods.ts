// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesSpec } from '../types.ts'

const supportedPurlTypes = ['cocoapods']
const supportedTypeProviderPairs = ['pod:cocoapods']

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
    throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
  return { type: 'pod', provider: 'cocoapods', namespace: '-', name: p.name, revision: p.version ?? undefined }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  return new PackageURL('cocoapods', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
}

export const converter: ConverterModule = {
  supportedPurlTypes: supportedPurlTypes,
  supportedTypeProviderPairs: supportedTypeProviderPairs,
  toCoordinates,
  toPurl
}
