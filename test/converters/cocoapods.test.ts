import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/cocoapods.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('cocoapods converter', () => {
  describe('toCoordinates', () => {
    it('converts cocoapods purl', async () => {
      const p = PackageURL.fromString('pkg:cocoapods/SoftButton@0.1.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'pod',
        provider: 'cocoapods',
        namespace: '-',
        name: 'SoftButton',
        revision: '0.1.0'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:cocoapods/SoftButton@0.1.0?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts pod coordinates to cocoapods purl', () => {
      const purl = toPurl({ type: 'pod', provider: 'cocoapods', namespace: '-', name: 'SoftButton', revision: '0.1.0' })
      assert.strictEqual(purl.toString(), 'pkg:cocoapods/SoftButton@0.1.0')
    })
  })
})

describe('cocoapods converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['cocoapods'])
    assert.deepStrictEqual(m.coordKeys, ['pod:cocoapods'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
