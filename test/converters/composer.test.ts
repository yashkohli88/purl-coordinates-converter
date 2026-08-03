import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/composer.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('composer converter', () => {
  describe('toCoordinates', () => {
    it('converts composer purl with vendor namespace', async () => {
      const p = PackageURL.fromString('pkg:composer/symfony/polyfill-mbstring@v1.28.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'composer',
        provider: 'packagist',
        namespace: 'symfony',
        name: 'polyfill-mbstring',
        revision: 'v1.28.0'
      })
    })

    it('converts docs example: symfony/polyfill-mbstring@1.11.0', async () => {
      const p = PackageURL.fromString('pkg:composer/symfony/polyfill-mbstring@1.11.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'composer',
        provider: 'packagist',
        namespace: 'symfony',
        name: 'polyfill-mbstring',
        revision: '1.11.0'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:composer/symfony/polyfill-mbstring@1.11.0?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts composer coordinates to purl', () => {
      const purl = toPurl({
        type: 'composer',
        provider: 'packagist',
        namespace: 'symfony',
        name: 'polyfill-mbstring',
        revision: 'v1.28.0'
      })
      assert.strictEqual(purl.toString(), 'pkg:composer/symfony/polyfill-mbstring@v1.28.0')
    })

    it('converts docs example: symfony/polyfill-mbstring@1.11.0', () => {
      const purl = toPurl({
        type: 'composer',
        provider: 'packagist',
        namespace: 'symfony',
        name: 'polyfill-mbstring',
        revision: '1.11.0'
      })
      assert.strictEqual(purl.toString(), 'pkg:composer/symfony/polyfill-mbstring@1.11.0')
    })
  })
})

describe('composer converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['composer'])
    assert.deepStrictEqual(m.coordKeys, ['composer:packagist'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
