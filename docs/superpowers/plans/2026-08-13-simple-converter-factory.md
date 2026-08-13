# Simple Converter Factory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deduplicate boilerplate across 9 simple converters by introducing a `makeConverter` factory function, while leaving `maven.ts` and `debian.ts` untouched.

**Architecture:** A new `src/converters/simpleConverter.ts` exports `makeConverter(opts)` which returns a full `ConverterModule`. Each of the 9 simple converter files is replaced with a single `makeConverter` call. No changes to `index.ts`, `types.ts`, or test files for individual converters.

**Tech Stack:** TypeScript, Node.js built-in test runner (`node --test`), `packageurl-js`

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/converters/simpleConverter.ts` | Factory function `makeConverter` |
| Create | `test/converters/simpleConverter.test.ts` | Unit tests for the factory |
| Modify | `src/converters/cargo.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/gem.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/nuget.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/cocoapods.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/pypi.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/npm.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/composer.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/github.ts` | Replace with `makeConverter` call |
| Modify | `src/converters/golang.ts` | Replace with `makeConverter` call |
| Untouched | `src/converters/maven.ts` | Complex qualifier logic — skip |
| Untouched | `src/converters/debian.ts` | Complex qualifier logic — skip |

---

## Task 1: Create `simpleConverter.ts` with failing tests first

**Files:**
- Create: `test/converters/simpleConverter.test.ts`
- Create: `src/converters/simpleConverter.ts`

- [ ] **Step 1: Write the failing tests**

Create `test/converters/simpleConverter.test.ts`:

```ts
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { PackageURL } from 'packageurl-js'
import { makeConverter } from '../../src/converters/simpleConverter.ts'

describe('makeConverter — qualifier rejection', () => {
  it('throws when qualifiers are present', async () => {
    const c = makeConverter({ purlType: 'cargo', cdType: 'crate', provider: 'cratesio', namespacePolicy: 'fixed-dash' })
    const p = PackageURL.fromString('pkg:cargo/bitflags@1.0.4?foo=bar')
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
    const c = makeConverter({ purlType: 'golang', cdType: 'go', provider: 'golang', namespacePolicy: 'from-purl', requireNamespace: true })
    const p = new PackageURL('golang', null, 'collectd.org', 'v0.5.0', null, null)
    await assert.rejects(c.toCoordinates(p), /golang PURL requires a namespace/)
  })
})

describe('makeConverter — normalizeName', () => {
  it('applies name transform when provided', async () => {
    const c = makeConverter({
      purlType: 'pypi', cdType: 'pypi', provider: 'pypi', namespacePolicy: 'fixed-dash',
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
    assert.deepStrictEqual(c.purlTypes, ['cargo'])
    assert.deepStrictEqual(c.coordKeys, ['crate:cratesio'])
    assert.strictEqual(typeof c.toCoordinates, 'function')
    assert.strictEqual(typeof c.toPurl, 'function')
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
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test --experimental-strip-types 'test/converters/simpleConverter.test.ts'
```

Expected: all tests fail with `Cannot find module '../../src/converters/simpleConverter.ts'`

- [ ] **Step 3: Implement `src/converters/simpleConverter.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { ConverterModule, CoordinatesSpec, CoordinatesType, CoordinatesProvider } from '../types.ts'

interface SimpleConverterOptions {
  purlType: string
  cdType: CoordinatesType
  provider: CoordinatesProvider
  namespacePolicy: 'from-purl' | 'fixed-dash'
  requireNamespace?: boolean
  normalizeName?: (name: string) => string
}

export function makeConverter(opts: SimpleConverterOptions): ConverterModule {
  const { purlType, cdType, provider, namespacePolicy, requireNamespace, normalizeName } = opts

  async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
    if (p.qualifiers && Object.keys(p.qualifiers).length > 0)
      throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)
    if (requireNamespace && !p.namespace)
      throw new Error(`${purlType} PURL requires a namespace: ${p.toString()}`)
    const namespace = namespacePolicy === 'from-purl' ? (p.namespace ?? '-') : '-'
    const name = normalizeName ? normalizeName(p.name) : p.name
    return { type: cdType, provider, namespace, name, revision: p.version ?? undefined }
  }

  function toPurl(c: CoordinatesSpec): PackageURL {
    return new PackageURL(purlType, c.namespace === '-' ? null : c.namespace, c.name, c.revision, null, null)
  }

  return {
    purlTypes: [purlType],
    coordKeys: [`${cdType}:${provider}`],
    toCoordinates,
    toPurl
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test --experimental-strip-types 'test/converters/simpleConverter.test.ts'
```

Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/converters/simpleConverter.ts test/converters/simpleConverter.test.ts
git commit -m "feat: add makeConverter factory for simple converters"
```

---

## Task 2: Migrate fixed-dash converters (cargo, gem, nuget, cocoapods)

**Files:**
- Modify: `src/converters/cargo.ts`
- Modify: `src/converters/gem.ts`
- Modify: `src/converters/nuget.ts`
- Modify: `src/converters/cocoapods.ts`

- [ ] **Step 1: Replace `cargo.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'cargo',
  cdType: 'crate',
  provider: 'cratesio',
  namespacePolicy: 'fixed-dash'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 2: Replace `gem.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'gem',
  cdType: 'gem',
  provider: 'rubygems',
  namespacePolicy: 'fixed-dash'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 3: Replace `nuget.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'nuget',
  cdType: 'nuget',
  provider: 'nuget',
  namespacePolicy: 'fixed-dash'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 4: Replace `cocoapods.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'cocoapods',
  cdType: 'pod',
  provider: 'cocoapods',
  namespacePolicy: 'fixed-dash'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 5: Run all tests**

```bash
node --test --experimental-strip-types 'test/**/*.test.ts'
```

Expected: all tests pass (cargo, gem, nuget, cocoapods test files still import `toCoordinates`/`toPurl` by name — these are re-exported via destructuring above).

- [ ] **Step 6: Commit**

```bash
git add src/converters/cargo.ts src/converters/gem.ts src/converters/nuget.ts src/converters/cocoapods.ts
git commit -m "refactor: migrate cargo, gem, nuget, cocoapods to makeConverter"
```

---

## Task 3: Migrate pypi (fixed-dash + normalizeName)

**Files:**
- Modify: `src/converters/pypi.ts`

- [ ] **Step 1: Replace `pypi.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'pypi',
  cdType: 'pypi',
  provider: 'pypi',
  namespacePolicy: 'fixed-dash',
  normalizeName: n => n.toLowerCase().replace(/_/g, '-')
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 2: Run all tests**

```bash
node --test --experimental-strip-types 'test/**/*.test.ts'
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/converters/pypi.ts
git commit -m "refactor: migrate pypi to makeConverter"
```

---

## Task 4: Migrate from-purl converters (npm, composer, github)

**Files:**
- Modify: `src/converters/npm.ts`
- Modify: `src/converters/composer.ts`
- Modify: `src/converters/github.ts`

- [ ] **Step 1: Replace `npm.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'npm',
  cdType: 'npm',
  provider: 'npmjs',
  namespacePolicy: 'from-purl'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 2: Replace `composer.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'composer',
  cdType: 'composer',
  provider: 'packagist',
  namespacePolicy: 'from-purl'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 3: Replace `github.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'github',
  cdType: 'git',
  provider: 'github',
  namespacePolicy: 'from-purl'
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 4: Run all tests**

```bash
node --test --experimental-strip-types 'test/**/*.test.ts'
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/converters/npm.ts src/converters/composer.ts src/converters/github.ts
git commit -m "refactor: migrate npm, composer, github to makeConverter"
```

---

## Task 5: Migrate golang (from-purl + requireNamespace)

**Files:**
- Modify: `src/converters/golang.ts`

- [ ] **Step 1: Replace `golang.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { makeConverter } from './simpleConverter.ts'

export const converter = makeConverter({
  purlType: 'golang',
  cdType: 'go',
  provider: 'golang',
  namespacePolicy: 'from-purl',
  requireNamespace: true
})

export const { toCoordinates, toPurl } = converter
```

- [ ] **Step 2: Run all tests**

```bash
node --test --experimental-strip-types 'test/**/*.test.ts'
```

Expected: all tests pass including golang namespace-required throw test.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/converters/golang.ts
git commit -m "refactor: migrate golang to makeConverter"
```
