import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildMap, coordinatesToPurl, purlToCoordinates } from '../src/index.ts'

describe('purlToCoordinates', () => {
  it('throws on invalid purl string', async () => {
    await assert.rejects(purlToCoordinates('not-a-purl'))
  })

  it('throws with /unsupported/i on unknown purl type', async () => {
    await assert.rejects(purlToCoordinates('pkg:docker/redis@7.0'), /unsupported/i)
  })

  it('throws when subpath is present', async () => {
    await assert.rejects(purlToCoordinates('pkg:cocoapods/ShareKit@2.0#Twitter'), /subpath/i)
  })

  it('throws when qualifiers are present on unsupported type', async () => {
    await assert.rejects(purlToCoordinates('pkg:npm/redis@0.1.0?vcs_url=https://github.com/redis/redis'), /qualifiers/i)
  })
})

describe('coordinatesToPurl', () => {
  it('throws with /unsupported/i on unknown type/provider', () => {
    assert.throws(
      () => coordinatesToPurl({ type: 'unknown', provider: 'unknown', namespace: '-', name: 'foo', revision: '1.0' }),
      /unsupported/i
    )
  })
})

describe('converter registry', () => {
  it('registers all expected purl types', async () => {
    const cases: [string, string][] = [
      ['npm', 'pkg:npm/foo@1.0.0'],
      ['pypi', 'pkg:pypi/foo@1.0.0'],
      ['cargo', 'pkg:cargo/foo@1.0.0'],
      ['gem', 'pkg:gem/foo@1.0.0'],
      ['nuget', 'pkg:nuget/foo@1.0.0'],
      ['cocoapods', 'pkg:cocoapods/foo@1.0.0'],
      ['composer', 'pkg:composer/vendor/foo@1.0.0'],
      ['github', 'pkg:github/myorg/foo@abc123'],
      ['maven', 'pkg:maven/org.foo/bar@1.0.0'],
      ['golang', 'pkg:golang/github.com/foo/bar@v1.0.0'],
    ]
    for (const [type, purl] of cases) {
      await assert.doesNotReject(purlToCoordinates(purl), `Expected purl type ${type} to be registered`)
    }
  })

  it('registers all expected coord keys', () => {
    const supported = [
      { type: 'npm', provider: 'npmjs' },
      { type: 'pypi', provider: 'pypi' },
      { type: 'crate', provider: 'cratesio' },
      { type: 'gem', provider: 'rubygems' },
      { type: 'nuget', provider: 'nuget' },
      { type: 'pod', provider: 'cocoapods' },
      { type: 'composer', provider: 'packagist' },
      { type: 'git', provider: 'github' },
      { type: 'maven', provider: 'mavencentral' },
      { type: 'maven', provider: 'mavengoogle' },
      { type: 'maven', provider: 'gradleplugin' },
      { type: 'go', provider: 'golang' },
    ]
    for (const { type, provider } of supported) {
      assert.doesNotThrow(
        () => coordinatesToPurl({ type, provider, namespace: 'ns', name: 'foo', revision: '1.0.0' }),
        `Expected coord key ${type}:${provider} to be registered`
      )
    }
  })

  it('buildMap throws on duplicate key', () => {
    assert.throws(
      () => buildMap([['npm', 1], ['npm', 2]] as [string, number][]),
      /Duplicate converter key: npm/i
    )
  })
})
