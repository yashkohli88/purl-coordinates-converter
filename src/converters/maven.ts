// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesProvider, CoordinatesSpec } from '../types.ts'

const PURL_TYPES = ['maven']
const COORD_KEYS = [
  'maven:mavencentral',
  'maven:mavengoogle',
  'maven:gradleplugin',
  'sourcearchive:mavencentral',
  'sourcearchive:mavengoogle',
  'sourcearchive:gradleplugin'
]

const REPO_TO_PROVIDER: Record<string, CoordinatesProvider> = {
  'https://repo.maven.apache.org/maven2/': 'mavencentral',
  'https://repo1.maven.org/maven2/': 'mavencentral',
  'https://maven.google.com': 'mavengoogle',
  'https://plugins.gradle.org/m2/': 'gradleplugin'
}

const PROVIDER_TO_REPO: Record<string, string> = {
  mavengoogle: 'https://maven.google.com',
  gradleplugin: 'https://plugins.gradle.org/m2/'
}

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  const qualifierKeys = p.qualifiers ? Object.keys(p.qualifiers) : []
  const unsupported = qualifierKeys.filter(k => k !== 'repository_url' && k !== 'classifier')
  if (unsupported.length > 0) throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)

  const classifier = p.qualifiers && 'classifier' in p.qualifiers ? p.qualifiers.classifier : undefined
  if (classifier && classifier !== 'sources') throw new Error(`Unsupported classifier: ${classifier}`)

  const repoUrl = p.qualifiers && 'repository_url' in p.qualifiers ? p.qualifiers.repository_url : undefined
  const provider: CoordinatesProvider = (repoUrl ? REPO_TO_PROVIDER[repoUrl] : undefined) ?? 'mavencentral'

  if (!p.namespace) throw new Error(`Maven PURL requires a namespace: ${p.toString()}`)
  const type = classifier === 'sources' ? 'sourcearchive' : 'maven'
  return { type, provider, namespace: p.namespace, name: p.name, revision: p.version ?? undefined }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  const repoUrl = PROVIDER_TO_REPO[c.provider]
  const qualifiers: Record<string, string> = {}
  if (c.type === 'sourcearchive') qualifiers.classifier = 'sources'
  if (repoUrl) qualifiers.repository_url = repoUrl
  return new PackageURL(
    'maven',
    c.namespace === '-' ? null : c.namespace,
    c.name,
    c.revision,
    Object.keys(qualifiers).length > 0 ? qualifiers : null,
    null
  )
}

export const converter: ConverterModule = {
  purlTypes: PURL_TYPES,
  coordKeys: COORD_KEYS,
  toCoordinates,
  toPurl
}
