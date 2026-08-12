import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/gem.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('gem converter', () => {
  describe('toCoordinates', () => {
    it('converts gem purl', async () => {
      const p = PackageURL.fromString('pkg:gem/sorbet@0.5.11226')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'gem',
        provider: 'rubygems',
        namespace: '-',
        name: 'sorbet',
        revision: '0.5.11226'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:gem/sorbet@0.5.11226?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts gem coordinates to purl', () => {
      const purl = toPurl({ type: 'gem', provider: 'rubygems', namespace: '-', name: 'sorbet', revision: '0.5.11226' })
      assert.strictEqual(purl.toString(), 'pkg:gem/sorbet@0.5.11226')
    })
  })
})

describe('gem converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.supportedPurlTypes, ['gem'])
    assert.deepStrictEqual(m.supportedTypeProviderPairs, ['gem:rubygems'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
