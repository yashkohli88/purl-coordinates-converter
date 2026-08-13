# Golang Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `golang` PURL type converter that maps between `pkg:golang/<namespace>/<name>@<version>` and ClearlyDefined `go/golang/<namespace>/<name>` coordinates.

**Architecture:** Single new converter file `src/converters/golang.ts` following the existing pattern (see `src/converters/cargo.ts` for reference). `packageurl-js` correctly handles multi-slash namespaces like `golang.org/x` without manual encoding. Wire into `src/index.ts` the same way all other converters are wired.

**Tech Stack:** TypeScript, `packageurl-js`, Node.js built-in test runner (`node:test`), Biome for linting/formatting.

---

### Task 1: Write failing tests for `toCoordinates`

**Files:**
- Create: `test/converters/golang.test.ts`

- [ ] **Step 1: Write the failing test file**

```typescript
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { toCoordinates, toPurl } from '../../src/converters/golang.ts'

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --test-name-pattern="golang"
```

Expected: errors like `Cannot find module '../../src/converters/golang.ts'`

---

### Task 2: Implement `src/converters/golang.ts`

**Files:**
- Create: `src/converters/golang.ts`

- [ ] **Step 1: Write the converter**

```typescript
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { CoordinatesSpec } from '../types.ts'

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
    throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
  if (!p.namespace) throw new Error(`Golang PURL requires a namespace: ${p.toString()}`)
  return {
    type: 'go',
    provider: 'golang',
    namespace: p.namespace,
    name: p.name,
    revision: p.version ?? undefined
  }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  return new PackageURL('golang', c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test -- --test-name-pattern="golang"
```

Expected: all tests pass (✓)

- [ ] **Step 3: Commit**

```bash
git add test/converters/golang.test.ts src/converters/golang.ts
git commit -m "feat: add golang PURL converter"
```

---

### Task 3: Wire golang into `src/index.ts`

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add import and register in both maps**

In `src/index.ts`, add the import alongside the others:

```typescript
import * as golang from './converters/golang.ts'
```

Add to the `converters` object (PURL type → coordinates):

```typescript
golang: golang.toCoordinates,
```

Add to the `reverseConverters` object (ClearlyDefined type:provider → PURL):

```typescript
'go:golang': golang.toPurl,
```

The full updated `src/index.ts` after changes:

```typescript
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import * as cargo from './converters/cargo.ts'
import * as cocoapods from './converters/cocoapods.ts'
import * as composer from './converters/composer.ts'
import * as gem from './converters/gem.ts'
import * as github from './converters/github.ts'
import * as golang from './converters/golang.ts'
import * as maven from './converters/maven.ts'
import * as npm from './converters/npm.ts'
import * as nuget from './converters/nuget.ts'
import * as pypi from './converters/pypi.ts'
import type { CoordinatesSpec } from './types.ts'

export type { CoordinatesSpec } from './types.ts'

type PurlConverter = (p: PackageURL) => Promise<CoordinatesSpec>
type CoordConverter = (c: CoordinatesSpec) => PackageURL

const converters: Record<string, PurlConverter> = {
  npm: npm.toCoordinates,
  pypi: pypi.toCoordinates,
  cargo: cargo.toCoordinates,
  gem: gem.toCoordinates,
  nuget: nuget.toCoordinates,
  cocoapods: cocoapods.toCoordinates,
  composer: composer.toCoordinates,
  github: github.toCoordinates,
  maven: maven.toCoordinates,
  golang: golang.toCoordinates
}

const reverseConverters: Record<string, CoordConverter> = {
  'npm:npmjs': npm.toPurl,
  'pypi:pypi': pypi.toPurl,
  'crate:cratesio': cargo.toPurl,
  'gem:rubygems': gem.toPurl,
  'nuget:nuget': nuget.toPurl,
  'pod:cocoapods': cocoapods.toPurl,
  'composer:packagist': composer.toPurl,
  'git:github': github.toPurl,
  'maven:mavencentral': maven.toPurl,
  'maven:mavengoogle': maven.toPurl,
  'maven:gradleplugin': maven.toPurl,
  'go:golang': golang.toPurl
}

export async function purlToCoordinates(purl: string): Promise<CoordinatesSpec> {
  const p = PackageURL.fromString(purl)
  if (p.subpath) throw new Error(`PURL subpath is not supported: ${purl}`)
  const converter = converters[p.type]
  if (!converter) throw new Error(`Unsupported PURL type: ${p.type}`)
  return converter(p)
}

export function coordinatesToPurl(coordinates: CoordinatesSpec): string {
  const key = `${coordinates.type}:${coordinates.provider}`
  const converter = reverseConverters[key]
  if (!converter) throw new Error(`Unsupported coordinate type/provider: ${coordinates.type}/${coordinates.provider}`)
  return converter(coordinates).toString()
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: all existing tests still pass, no new failures.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire golang converter into index"
```

---

### Task 4: Add golang cases to roundtrip tests

**Files:**
- Modify: `test/roundtrip.test.ts`

- [ ] **Step 1: Add four golang PURLs to the cases array**

In `test/roundtrip.test.ts`, add to the `cases` array after the existing `// github` block:

```typescript
  // golang
  'pkg:golang/rsc.io/quote@v1.3.0',
  'pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1',
  'pkg:golang/cloud.google.com/go@v0.56.0',
  'pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1',
```

- [ ] **Step 2: Run roundtrip tests**

```bash
npm test -- --test-name-pattern="roundtrip"
```

Expected: all roundtrip tests pass including the four new golang cases (✓)

- [ ] **Step 3: Run full test suite and type-check**

```bash
npm test && npm run tsc
```

Expected: all tests pass, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add test/roundtrip.test.ts
git commit -m "test: add golang roundtrip cases"
```
