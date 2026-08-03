// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { CoordinatesSpec, ConverterModule } from '../types.ts'

const ALLOWED_QUALIFIERS = new Set(['arch', 'distro', 'upstream'])

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  const unsupported = p.qualifiers ? Object.keys(p.qualifiers).filter(k => !ALLOWED_QUALIFIERS.has(k)) : []
  if (unsupported.length > 0) throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)

  const arch = p.qualifiers?.arch
  const isSource = arch === 'source'
  const revision = isSource || !arch ? (p.version ?? undefined) : `${p.version}_${arch}`

  return {
    type: isSource ? 'debsrc' : 'deb',
    provider: 'debian',
    namespace: '-',
    name: p.name,
    revision
  }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  if (c.type === 'debsrc') {
    return new PackageURL('deb', 'debian', c.name, c.revision, { arch: 'source' }, null)
  }
  if (!c.revision) {
    return new PackageURL('deb', 'debian', c.name, c.revision, null, null)
  }
  const lastUnderscore = c.revision.lastIndexOf('_')
  if (lastUnderscore === -1) {
    return new PackageURL('deb', 'debian', c.name, c.revision, null, null)
  }
  const version = c.revision.slice(0, lastUnderscore)
  const arch = c.revision.slice(lastUnderscore + 1)
  return new PackageURL('deb', 'debian', c.name, version, { arch }, null)
}

export const converter: ConverterModule = {
  purlTypes: ['deb'],
  coordKeys: ['deb:debian', 'debsrc:debian'],
  toCoordinates,
  toPurl
}
