import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { makeConverter } from '../../src/converters/simpleConverter.ts'

describe('makeConverter — qualifier rejection', () => {
  it('throws when qualifiers are present', async () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    const p = new PackageURL('cargo', null, 'bitflags', '1.0.4', { foo: 'bar' }, null)
    await assert.rejects(c.toCoordinates(p), /PURL qualifiers are not supported for type: cargo/)
  })
})

describe('makeConverter — namespacePolicy: fixed-dash', () => {
  it('always yields namespace "-" regardless of PURL namespace', async () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    const p = PackageURL.fromString('pkg:cargo/bitflags@1.0.4')
    const coords = await c.toCoordinates(p)
    assert.strictEqual(coords.namespace, '-')
  })
})

describe('makeConverter — namespacePolicy: from-purl', () => {
  it('passes namespace through when present', async () => {
    const c = makeConverter({ purlType: 'golang', cdType: 'go', provider: 'golang', namespacePolicy: 'from-purl' })
    const p = PackageURL.fromString('pkg:golang/rsc.io/quote@v1.3.0')
    const coords = await c.toCoordinates(p)
    assert.strictEqual(coords.namespace, 'rsc.io')
  })

  it('falls back to "-" when namespace absent', async () => {
    const c = makeConverter({ purlType: 'npm', cdType: 'npm', provider: 'npmjs', namespacePolicy: 'from-purl' })
    const p = PackageURL.fromString('pkg:npm/lodash@4.17.21')
    const coords = await c.toCoordinates(p)
    assert.strictEqual(coords.namespace, '-')
  })
})

describe('makeConverter — requireNamespace', () => {
  it('throws when namespace is absent and requireNamespace is true', async () => {
    const c = makeConverter({
      purlType: 'golang',
      cdType: 'go',
      provider: 'golang',
      namespacePolicy: 'from-purl',
      requireNamespace: true
    })
    const p = new PackageURL('golang', null, 'fmt', 'v1.0.0', null, null)
    await assert.rejects(c.toCoordinates(p), /golang PURL requires a namespace/)
  })
})

describe('makeConverter — normalizeName', () => {
  it('applies name transform when provided', async () => {
    const c = makeConverter({
      purlType: 'pypi',
      cdType: 'pypi',
      provider: 'pypi',
      namespacePolicy: 'fixed-dash',
      normalizeName: n => n.toLowerCase().replace(/_/g, '-')
    })
    const p = PackageURL.fromString('pkg:pypi/My_Package@1.0.0')
    const coords = await c.toCoordinates(p)
    assert.strictEqual(coords.name, 'my-package')
  })
})

describe('makeConverter — ConverterModule shape', () => {
  it('exposes correct purlTypes and coordKeys', () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    assert.deepStrictEqual(c.supportedPurlTypes, ['cargo'])
    assert.deepStrictEqual(c.supportedTypeProviderPairs, ['crate:cratesio'])
  })
})

describe('makeConverter — toPurl', () => {
  it('maps namespace "-" to null in PURL', () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    const purl = c.toPurl({ type: 'crate', provider: 'cratesio', namespace: '-', name: 'bitflags', revision: '1.0.4' })
    assert.strictEqual(purl.toString(), 'pkg:cargo/bitflags@1.0.4')
  })

  it('passes namespace through when not "-"', () => {
    const c = makeConverter({ purlType: 'golang', cdType: 'go', provider: 'golang', namespacePolicy: 'from-purl' })
    const purl = c.toPurl({ type: 'go', provider: 'golang', namespace: 'rsc.io', name: 'quote', revision: 'v1.3.0' })
    assert.strictEqual(purl.toString(), 'pkg:golang/rsc.io/quote@v1.3.0')
  })

  it('round-trip: fixed-dash policy preserves PURL through coordinates', async () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    const original = PackageURL.fromString('pkg:cargo/bitflags@1.0.4')
    const coords = await c.toCoordinates(original)
    const roundtrip = c.toPurl(coords)
    assert.strictEqual(roundtrip.toString(), original.toString())
  })
})
