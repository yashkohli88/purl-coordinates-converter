import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/nuget.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('nuget converter', () => {
  describe('toCoordinates', () => {
    it('converts nuget purl preserving case', async () => {
      const p = PackageURL.fromString('pkg:nuget/NuGet.Protocol@6.7.1')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'nuget',
        provider: 'nuget',
        namespace: '-',
        name: 'NuGet.Protocol',
        revision: '6.7.1'
      })
    })

    it('converts docs example: xunit.core', async () => {
      const p = PackageURL.fromString('pkg:nuget/xunit.core@2.4.1')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'nuget',
        provider: 'nuget',
        namespace: '-',
        name: 'xunit.core',
        revision: '2.4.1'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:nuget/xunit.core@2.4.1?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts nuget coordinates to purl', () => {
      const purl = toPurl({
        type: 'nuget',
        provider: 'nuget',
        namespace: '-',
        name: 'NuGet.Protocol',
        revision: '6.7.1'
      })
      assert.strictEqual(purl.toString(), 'pkg:nuget/NuGet.Protocol@6.7.1')
    })

    it('converts docs example: xunit.core', () => {
      const purl = toPurl({ type: 'nuget', provider: 'nuget', namespace: '-', name: 'xunit.core', revision: '2.4.1' })
      assert.strictEqual(purl.toString(), 'pkg:nuget/xunit.core@2.4.1')
    })
  })
})

describe('nuget converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.supportedPurlTypes, ['nuget'])
    assert.deepStrictEqual(m.supportedTypeProviderPairs, ['nuget:nuget'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
