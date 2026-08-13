// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'pypi',
  cdType: 'pypi',
  provider: 'pypi',
  namespacePolicy: 'fixed-dash',
  normalizeName: n => n.toLowerCase().replace(/_/g, '-')
})

export const { toCoordinates, toPurl } = converter
