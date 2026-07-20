import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { toCoordinates, toPurl } from '../../src/converters/pypi.ts'
import { converter } from '../../src/converters/pypi.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('pypi converter', () => {
  describe('toCoordinates', () => {
    it('converts pypi purl', async () => {
      const p = PackageURL.fromString('pkg:pypi/platformdirs@4.2.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'pypi',
        provider: 'pypi',
        namespace: '-',
        name: 'platformdirs',
        revision: '4.2.0'
      })
    })

    it('converts docs example: backports.ssl-match-hostname', async () => {
      const p = PackageURL.fromString('pkg:pypi/backports.ssl-match-hostname@3.7.0.1')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'pypi',
        provider: 'pypi',
        namespace: '-',
        name: 'backports.ssl-match-hostname',
        revision: '3.7.0.1'
      })
    })

    it('normalizes name: lowercase and underscores to dashes', async () => {
      const p = PackageURL.fromString('pkg:pypi/Django_REST_framework@3.14.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'pypi',
        provider: 'pypi',
        namespace: '-',
        name: 'django-rest-framework',
        revision: '3.14.0'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:pypi/platformdirs@4.2.0?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts pypi coordinates to purl', () => {
      const purl = toPurl({ type: 'pypi', provider: 'pypi', namespace: '-', name: 'platformdirs', revision: '4.2.0' })
      assert.strictEqual(purl.toString(), 'pkg:pypi/platformdirs@4.2.0')
    })

    it('converts docs example: backports.ssl-match-hostname', () => {
      const purl = toPurl({
        type: 'pypi',
        provider: 'pypi',
        namespace: '-',
        name: 'backports.ssl-match-hostname',
        revision: '3.7.0.1'
      })
      assert.strictEqual(purl.toString(), 'pkg:pypi/backports.ssl-match-hostname@3.7.0.1')
    })
  })
})

describe('pypi converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['pypi'])
    assert.deepStrictEqual(m.coordKeys, ['pypi:pypi'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
