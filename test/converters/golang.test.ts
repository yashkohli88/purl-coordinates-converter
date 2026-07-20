import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { toCoordinates, toPurl } from '../../src/converters/golang.ts'
import { converter } from '../../src/converters/golang.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('golang converter', () => {
  describe('toCoordinates', () => {
    it('converts simple two-segment module (rsc.io/quote)', async () => {
      const p = PackageURL.fromString('pkg:golang/rsc.io/quote@v1.3.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'go',
        provider: 'golang',
        namespace: 'rsc.io',
        name: 'quote',
        revision: 'v1.3.0'
      })
    })

    it('converts golang.org/x sub-package (xerrors)', async () => {
      const p = PackageURL.fromString('pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'go',
        provider: 'golang',
        namespace: 'golang.org/x',
        name: 'xerrors',
        revision: 'v0.0.0-20200804184101-5ec99f83aff1'
      })
    })

    it('converts cloud.google.com/go', async () => {
      const p = PackageURL.fromString('pkg:golang/cloud.google.com/go@v0.56.0')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'go',
        provider: 'golang',
        namespace: 'cloud.google.com',
        name: 'go',
        revision: 'v0.56.0'
      })
    })

    it('converts deep namespace (github.com/org/repo/pkg)', async () => {
      const p = PackageURL.fromString('pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'go',
        provider: 'golang',
        namespace: 'github.com/kucherenkovova/gopypaste',
        name: 'xerrors',
        revision: 'v0.1.1'
      })
    })

    it('throws when namespace is missing', async () => {
      // Bare domain modules (e.g. collectd.org) are out of scope
      const p = new PackageURL('golang', null, 'collectd.org', 'v0.5.0', null, null)
      await assert.rejects(toCoordinates(p), /namespace/i)
    })

    it('throws when unsupported qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:golang/rsc.io/quote@v1.3.0?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts rsc.io/quote coordinates to purl', () => {
      const purl = toPurl({ type: 'go', provider: 'golang', namespace: 'rsc.io', name: 'quote', revision: 'v1.3.0' })
      assert.strictEqual(purl.toString(), 'pkg:golang/rsc.io/quote@v1.3.0')
    })

    it('converts golang.org/x/xerrors coordinates to purl', () => {
      const purl = toPurl({
        type: 'go',
        provider: 'golang',
        namespace: 'golang.org/x',
        name: 'xerrors',
        revision: 'v0.0.0-20200804184101-5ec99f83aff1'
      })
      assert.strictEqual(purl.toString(), 'pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1')
    })

    it('converts cloud.google.com/go coordinates to purl', () => {
      const purl = toPurl({
        type: 'go',
        provider: 'golang',
        namespace: 'cloud.google.com',
        name: 'go',
        revision: 'v0.56.0'
      })
      assert.strictEqual(purl.toString(), 'pkg:golang/cloud.google.com/go@v0.56.0')
    })

    it('converts deep namespace coordinates to purl', () => {
      const purl = toPurl({
        type: 'go',
        provider: 'golang',
        namespace: 'github.com/kucherenkovova/gopypaste',
        name: 'xerrors',
        revision: 'v0.1.1'
      })
      assert.strictEqual(purl.toString(), 'pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1')
    })
  })
})

describe('golang converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['golang'])
    assert.deepStrictEqual(m.coordKeys, ['go:golang'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
