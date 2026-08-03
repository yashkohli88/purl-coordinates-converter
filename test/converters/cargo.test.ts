import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/cargo.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('cargo converter', () => {
  describe('toCoordinates', () => {
    it('converts cargo purl to crate coordinates', async () => {
      const p = PackageURL.fromString('pkg:cargo/ratatui@0.26.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'crate',
        provider: 'cratesio',
        namespace: '-',
        name: 'ratatui',
        revision: '0.26.0'
      })
    })

    it('converts docs example: bitflags', async () => {
      const p = PackageURL.fromString('pkg:cargo/bitflags@1.0.4')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'crate',
        provider: 'cratesio',
        namespace: '-',
        name: 'bitflags',
        revision: '1.0.4'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:cargo/bitflags@1.0.4?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts crate coordinates to cargo purl', () => {
      const purl = toPurl({ type: 'crate', provider: 'cratesio', namespace: '-', name: 'ratatui', revision: '0.26.0' })
      assert.strictEqual(purl.toString(), 'pkg:cargo/ratatui@0.26.0')
    })

    it('converts docs example: bitflags', () => {
      const purl = toPurl({ type: 'crate', provider: 'cratesio', namespace: '-', name: 'bitflags', revision: '1.0.4' })
      assert.strictEqual(purl.toString(), 'pkg:cargo/bitflags@1.0.4')
    })
  })
})

describe('cargo converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['cargo'])
    assert.deepStrictEqual(m.coordKeys, ['crate:cratesio'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
