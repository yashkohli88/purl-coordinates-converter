import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { toCoordinates, toPurl } from '../../src/converters/github.ts'
import { converter } from '../../src/converters/github.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('github converter', () => {
  describe('toCoordinates', () => {
    it('converts github purl to git coordinates', async () => {
      const p = PackageURL.fromString('pkg:github/ratatui-org/ratatui@bcf43688ec4a13825307aef88f3cdcd007b32641')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'git',
        provider: 'github',
        namespace: 'ratatui-org',
        name: 'ratatui',
        revision: 'bcf43688ec4a13825307aef88f3cdcd007b32641'
      })
    })

    it('throws when qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:github/ratatui-org/ratatui@bcf43688ec4a13825307aef88f3cdcd007b32641?foo=bar')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })
  })

  describe('toPurl', () => {
    it('converts git/github coordinates to github purl', () => {
      const purl = toPurl({
        type: 'git',
        provider: 'github',
        namespace: 'ratatui-org',
        name: 'ratatui',
        revision: 'bcf43688ec4a13825307aef88f3cdcd007b32641'
      })
      assert.strictEqual(purl.toString(), 'pkg:github/ratatui-org/ratatui@bcf43688ec4a13825307aef88f3cdcd007b32641')
    })
  })
})

describe('github converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['github'])
    assert.deepStrictEqual(m.coordKeys, ['git:github'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
