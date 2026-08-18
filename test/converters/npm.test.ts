import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/npm.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('npm converter', () => {
  describe('toCoordinates', () => {
    it('converts unscoped npm purl', async () => {
      const p = PackageURL.fromString('pkg:npm/redis@0.1.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, { type: 'npm', provider: 'npmjs', namespace: '-', name: 'redis', revision: '0.1.0' })
    })

    it('converts scoped npm purl', async () => {
      const p = PackageURL.fromString('pkg:npm/%40angular/core@15.0.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'npm',
        provider: 'npmjs',
        namespace: '@angular',
        name: 'core',
        revision: '15.0.0'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:npm/redis@0.1.0?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts unscoped npm coordinates to purl', () => {
      const purl = toPurl({ type: 'npm', provider: 'npmjs', namespace: '-', name: 'redis', revision: '0.1.0' })
      assert.strictEqual(purl.toString(), 'pkg:npm/redis@0.1.0')
    })

    it('converts scoped npm coordinates to purl', () => {
      const purl = toPurl({ type: 'npm', provider: 'npmjs', namespace: '@angular', name: 'core', revision: '15.0.0' })
      assert.strictEqual(purl.toString(), 'pkg:npm/%40angular/core@15.0.0')
    })
  })
})

describe('npm converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.supportedPurlTypes, ['npm'])
    assert.deepStrictEqual(m.supportedTypeProviderPairs, ['npm:npmjs'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
