import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { converter, toCoordinates, toPurl } from '../../src/converters/maven.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('maven converter', () => {
  describe('toCoordinates', () => {
    it('converts maven purl without repository_url to mavencentral', async () => {
      const p = PackageURL.fromString('pkg:maven/org.apache.httpcomponents/httpcore@4.3')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'maven',
        provider: 'mavencentral',
        namespace: 'org.apache.httpcomponents',
        name: 'httpcore',
        revision: '4.3'
      })
    })

    it('converts maven purl with repo1.maven.org to mavencentral', async () => {
      const p = PackageURL.fromString(
        'pkg:maven/org.apache.httpcomponents/httpcore@4.3?repository_url=https%3A%2F%2Frepo1.maven.org%2Fmaven2%2F'
      )
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'maven',
        provider: 'mavencentral',
        namespace: 'org.apache.httpcomponents',
        name: 'httpcore',
        revision: '4.3'
      })
    })

    it('converts maven purl with repo.maven.apache.org to mavencentral', async () => {
      const p = PackageURL.fromString(
        'pkg:maven/org.apache.httpcomponents/httpcore@4.3?repository_url=https%3A%2F%2Frepo.maven.apache.org%2Fmaven2%2F'
      )
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'maven',
        provider: 'mavencentral',
        namespace: 'org.apache.httpcomponents',
        name: 'httpcore',
        revision: '4.3'
      })
    })

    it('converts maven purl with maven.google.com to mavengoogle', async () => {
      const p = PackageURL.fromString(
        'pkg:maven/android.arch.lifecycle/common@1.0.1?repository_url=https%3A%2F%2Fmaven.google.com'
      )
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'maven',
        provider: 'mavengoogle',
        namespace: 'android.arch.lifecycle',
        name: 'common',
        revision: '1.0.1'
      })
    })

    it('converts maven purl with plugins.gradle.org to gradleplugin', async () => {
      const p = PackageURL.fromString(
        'pkg:maven/io.github.lognet/grpc-spring-boot-starter-gradle-plugin@4.6.0?repository_url=https%3A%2F%2Fplugins.gradle.org%2Fm2%2F'
      )
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'maven',
        provider: 'gradleplugin',
        namespace: 'io.github.lognet',
        name: 'grpc-spring-boot-starter-gradle-plugin',
        revision: '4.6.0'
      })
    })

    it('throws when unsupported qualifiers are present', async () => {
      const p = PackageURL.fromString('pkg:maven/org.apache/commons@1.0?type=pom')
      await assert.rejects(toCoordinates(p), /qualifiers/i)
    })

    it('converts maven purl with classifier=sources to sourcearchive', async () => {
      const p = PackageURL.fromString('pkg:maven/org.apache.xmlgraphics/batik-anim@1.9.1?classifier=sources')
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'sourcearchive',
        provider: 'mavencentral',
        namespace: 'org.apache.xmlgraphics',
        name: 'batik-anim',
        revision: '1.9.1'
      })
    })

    it('converts maven purl with classifier=sources and mavengoogle to sourcearchive/mavengoogle', async () => {
      const p = PackageURL.fromString(
        'pkg:maven/android.arch.lifecycle/common@1.0.1?classifier=sources&repository_url=https%3A%2F%2Fmaven.google.com'
      )
      const c = await toCoordinates(p)
      assert.deepStrictEqual(c, {
        type: 'sourcearchive',
        provider: 'mavengoogle',
        namespace: 'android.arch.lifecycle',
        name: 'common',
        revision: '1.0.1'
      })
    })

    it('throws when unsupported classifier is present', async () => {
      const p = PackageURL.fromString('pkg:maven/org.apache/commons@1.0?classifier=javadoc')
      await assert.rejects(toCoordinates(p), /classifier/i)
    })

    it('throws when namespace is missing', async () => {
      assert.throws(() => new PackageURL('maven', null, 'httpcore', '4.3', null, null), /namespace/i)
    })
  })

  describe('toPurl', () => {
    it('converts mavencentral coordinates to purl without repository_url', () => {
      const purl = toPurl({
        type: 'maven',
        provider: 'mavencentral',
        namespace: 'org.apache.httpcomponents',
        name: 'httpcore',
        revision: '4.3'
      })
      assert.strictEqual(purl.toString(), 'pkg:maven/org.apache.httpcomponents/httpcore@4.3')
    })

    it('converts mavengoogle coordinates to purl with repository_url', () => {
      const purl = toPurl({
        type: 'maven',
        provider: 'mavengoogle',
        namespace: 'android.arch.lifecycle',
        name: 'common',
        revision: '1.0.1'
      })
      assert.strictEqual(
        purl.toString(),
        'pkg:maven/android.arch.lifecycle/common@1.0.1?repository_url=https%3A%2F%2Fmaven.google.com'
      )
    })

    it('converts gradleplugin coordinates to purl with repository_url', () => {
      const purl = toPurl({
        type: 'maven',
        provider: 'gradleplugin',
        namespace: 'io.github.lognet',
        name: 'grpc-spring-boot-starter-gradle-plugin',
        revision: '4.6.0'
      })
      assert.strictEqual(
        purl.toString(),
        'pkg:maven/io.github.lognet/grpc-spring-boot-starter-gradle-plugin@4.6.0?repository_url=https%3A%2F%2Fplugins.gradle.org%2Fm2%2F'
      )
    })

    it('converts sourcearchive/mavencentral coordinates to purl with classifier=sources', () => {
      const purl = toPurl({
        type: 'sourcearchive',
        provider: 'mavencentral',
        namespace: 'org.apache.xmlgraphics',
        name: 'batik-anim',
        revision: '1.9.1'
      })
      assert.strictEqual(purl.toString(), 'pkg:maven/org.apache.xmlgraphics/batik-anim@1.9.1?classifier=sources')
    })

    it('converts sourcearchive/mavengoogle coordinates to purl with classifier=sources and repository_url', () => {
      const purl = toPurl({
        type: 'sourcearchive',
        provider: 'mavengoogle',
        namespace: 'android.arch.lifecycle',
        name: 'common',
        revision: '1.0.1'
      })
      assert.strictEqual(
        purl.toString(),
        'pkg:maven/android.arch.lifecycle/common@1.0.1?classifier=sources&repository_url=https%3A%2F%2Fmaven.google.com'
      )
    })
  })
})

describe('maven converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.supportedPurlTypes, ['maven'])
    assert.deepStrictEqual(m.supportedTypeProviderPairs, [
      'maven:mavencentral',
      'maven:mavengoogle',
      'maven:gradleplugin',
      'sourcearchive:mavencentral',
      'sourcearchive:mavengoogle',
      'sourcearchive:gradleplugin'
    ])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
