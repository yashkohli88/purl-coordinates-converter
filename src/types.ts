// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import type { PackageURL } from 'packageurl-js'

export interface CoordinatesSpec {
  type: string
  provider: string
  namespace: string
  name: string
  revision: string | undefined
}

export interface ConverterModule {
  purlTypes: string[]
  coordKeys: string[]
  toCoordinates: (p: PackageURL) => Promise<CoordinatesSpec>
  toPurl: (c: CoordinatesSpec) => PackageURL
}
