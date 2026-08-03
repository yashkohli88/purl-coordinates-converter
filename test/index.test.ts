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
      ['deb', 'pkg:deb/debian/curl@7.50.3-1?arch=amd64']
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
      { type: 'deb', provider: 'debian' },
      { type: 'debsrc', provider: 'debian' }
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
      () =>
        buildMap([
          ['npm', 1],
          ['npm', 2]
        ] as [string, number][]),
      /Duplicate converter key: npm/i
    )
  })
})

describe('deb converter', () => {
  it('binary deb with arch and distro qualifier', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/curl@7.50.3-1?arch=amd64&distro=jessie')
    assert.deepEqual(coords, {
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'curl',
      revision: '7.50.3-1_amd64'
    })
  })

  it('binary deb without arch', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/curl@7.50.3-1')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'curl', revision: '7.50.3-1' })
  })

  it('source package via arch=source', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/attr@1:2.4.47-2?arch=source')
    assert.deepEqual(coords, {
      type: 'debsrc',
      provider: 'debian',
      namespace: '-',
      name: 'attr',
      revision: '1:2.4.47-2'
    })
  })

  it('ubuntu namespace maps to debian provider', async () => {
    const coords = await purlToCoordinates('pkg:deb/ubuntu/procps@2:3.3.17-6ubuntu2.1?arch=amd64')
    assert.deepEqual(coords, {
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'procps',
      revision: '2:3.3.17-6ubuntu2.1_amd64'
    })
  })

  it('version with + character', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/base-files@12.4+deb12u10?arch=amd64')
    assert.deepEqual(coords, {
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'base-files',
      revision: '12.4+deb12u10_amd64'
    })
  })

  it('upstream qualifier is silently dropped', async () => {
    const coords = await purlToCoordinates(
      'pkg:deb/debian/libgomp1@10.2.1-6?arch=amd64&distro=debian-11&upstream=gcc-10'
    )
    assert.deepEqual(coords, {
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'libgomp1',
      revision: '10.2.1-6_amd64'
    })
  })

  it('throws on unsupported qualifier', async () => {
    await assert.rejects(purlToCoordinates('pkg:deb/debian/curl@7.50.3-1?foo=bar'), /qualifiers.*not supported/i)
  })

  it('coordinatesToPurl: deb with arch', () => {
    const purl = coordinatesToPurl({
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'curl',
      revision: '7.50.3-1_amd64'
    })
    assert.strictEqual(purl, 'pkg:deb/debian/curl@7.50.3-1?arch=amd64')
  })

  it('coordinatesToPurl: deb without arch', () => {
    const purl = coordinatesToPurl({
      type: 'deb',
      provider: 'debian',
      namespace: '-',
      name: 'curl',
      revision: '7.50.3-1'
    })
    assert.strictEqual(purl, 'pkg:deb/debian/curl@7.50.3-1')
  })

  it('coordinatesToPurl: debsrc emits arch=source', () => {
    const purl = coordinatesToPurl({
      type: 'debsrc',
      provider: 'debian',
      namespace: '-',
      name: 'attr',
      revision: '1:2.4.47-2'
    })
    assert.strictEqual(purl, 'pkg:deb/debian/attr@1:2.4.47-2?arch=source')
  })
})
