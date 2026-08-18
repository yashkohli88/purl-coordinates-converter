// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'golang',
  cdType: 'go',
  provider: 'golang',
  namespacePolicy: 'from-purl',
  requireNamespace: true
})

export const { toCoordinates, toPurl } = converter
