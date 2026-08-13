// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesProvider, CoordinatesSpec, CoordinatesType } from '../types.ts'

interface SimpleConverterOptions {
  purlType: string
  cdType: CoordinatesType
  provider: CoordinatesProvider
  namespacePolicy: 'from-purl' | 'fixed-dash'
  requireNamespace?: boolean
  normalizeName?: (name: string) => string
}

export function makeConverter(opts: SimpleConverterOptions): ConverterModule {
  const { purlType, cdType, provider, namespacePolicy, requireNamespace, normalizeName } = opts

  async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
    if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
      throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
    if (requireNamespace && !p.namespace) throw new Error(`${purlType} PURL requires a namespace: ${p.toString()}`)
    const namespace = namespacePolicy === 'from-purl' ? (p.namespace ?? '-') : '-'
    const name = normalizeName ? normalizeName(p.name) : p.name
    return { type: cdType, provider, namespace, name, revision: p.version ?? undefined }
  }

  function toPurl(c: CoordinatesSpec): PackageURL {
    return new PackageURL(purlType, c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
  }

  return {
    purlTypes: [purlType],
    coordKeys: [`${cdType}:${provider}`],
    toCoordinates,
    toPurl
  }
}
