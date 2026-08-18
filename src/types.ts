// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import type { PackageURL } from 'packageurl-js'

export type CoordinatesType =
  | 'npm'
  | 'conda'
  | 'condasrc'
  | 'crate'
  | 'git'
  | 'maven'
  | 'composer'
  | 'nuget'
  | 'gem'
  | 'go'
  | 'pod'
  | 'pypi'
  | 'sourcearchive'
  | 'deb'
  | 'debsrc'

export type CoordinatesProvider =
  | 'anaconda-main'
  | 'anaconda-r'
  | 'npmjs'
  | 'cocoapods'
  | 'conda-forge'
  | 'cratesio'
  | 'github'
  | 'gitlab'
  | 'packagist'
  | 'golang'
  | 'mavencentral'
  | 'mavengoogle'
  | 'gradleplugin'
  | 'nuget'
  | 'rubygems'
  | 'pypi'
  | 'debian'

export interface CoordinatesSpec {
  type: CoordinatesType
  provider: CoordinatesProvider
  namespace: string
  name: string
  revision: string | undefined
}

export interface ConverterModule {
  supportedPurlTypes: string[]
  supportedTypeProviderPairs: string[]
  toCoordinates: (p: PackageURL) => Promise<CoordinatesSpec>
  toPurl: (c: CoordinatesSpec) => PackageURL
}
