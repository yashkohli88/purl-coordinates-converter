# Converter Module Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace two hand-maintained lookup maps in `index.ts` with a `ConverterModule` interface implemented by each converter, so both maps are auto-generated from a single array.

**Architecture:** Add `ConverterModule` interface to `types.ts`. Each of the 10 converter modules exports a `converter` object declaring its `purlTypes`, `coordKeys`, `toCoordinates`, and `toPurl`. `index.ts` derives both runtime maps by iterating that array.

**Tech Stack:** TypeScript, Node.js `--experimental-strip-types`, `packageurl-js`

---

### Task 1: Add `ConverterModule` interface to `types.ts`

**Files:**
- Modify: `src/types.ts`

No new test needed — the interface is a type-only change; type errors surface at compile time. We'll verify with `npm run tsc` after each task.

- [ ] **Step 1: Add the interface**

Replace the entire contents of `src/types.ts` with:

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import type { PackageURL } from 'packageurl-js'

export interface CoordinatesSpec {
  type: string
  provider: string
  namespace: string
  name: string
  revision: string | undefined
}

export interface ConverterModule {
  purlTypes: string[]
  coordKeys: string[]
  toCoordinates: (p: PackageURL) => Promise<CoordinatesSpec>
  toPurl: (c: CoordinatesSpec) => PackageURL
}
```

- [ ] **Step 2: Verify types compile**

Run: `npm run tsc`
Expected: exits 0, no errors

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add ConverterModule interface to types"
```

---

### Task 2: Add `converter` export to `npm.ts`

**Files:**
- Modify: `src/converters/npm.ts`
- Test: `test/converters/npm.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/npm.test.ts`:

```ts
import { converter } from '../../src/converters/npm.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('npm converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['npm'])
    assert.deepStrictEqual(m.coordKeys, ['npm:npmjs'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/npm.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/npm.ts`**

Add at the bottom of `src/converters/npm.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['npm'],
  coordKeys: ['npm:npmjs'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/npm.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/npm.ts test/converters/npm.test.ts
git commit -m "feat: add ConverterModule export to npm converter"
```

---

### Task 3: Add `converter` export to `pypi.ts`

**Files:**
- Modify: `src/converters/pypi.ts`
- Test: `test/converters/pypi.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/pypi.test.ts`:

```ts
import { converter } from '../../src/converters/pypi.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('pypi converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['pypi'])
    assert.deepStrictEqual(m.coordKeys, ['pypi:pypi'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/pypi.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/pypi.ts`**

Add at the bottom of `src/converters/pypi.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['pypi'],
  coordKeys: ['pypi:pypi'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/pypi.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/pypi.ts test/converters/pypi.test.ts
git commit -m "feat: add ConverterModule export to pypi converter"
```

---

### Task 4: Add `converter` export to `cargo.ts`

**Files:**
- Modify: `src/converters/cargo.ts`
- Test: `test/converters/cargo.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/cargo.test.ts`:

```ts
import { converter } from '../../src/converters/cargo.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('cargo converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['cargo'])
    assert.deepStrictEqual(m.coordKeys, ['crate:cratesio'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/cargo.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/cargo.ts`**

Add at the bottom of `src/converters/cargo.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['cargo'],
  coordKeys: ['crate:cratesio'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/cargo.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/cargo.ts test/converters/cargo.test.ts
git commit -m "feat: add ConverterModule export to cargo converter"
```

---

### Task 5: Add `converter` export to `gem.ts`

**Files:**
- Modify: `src/converters/gem.ts`
- Test: `test/converters/gem.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/gem.test.ts`:

```ts
import { converter } from '../../src/converters/gem.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('gem converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['gem'])
    assert.deepStrictEqual(m.coordKeys, ['gem:rubygems'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/gem.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/gem.ts`**

Add at the bottom of `src/converters/gem.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['gem'],
  coordKeys: ['gem:rubygems'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/gem.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/gem.ts test/converters/gem.test.ts
git commit -m "feat: add ConverterModule export to gem converter"
```

---

### Task 6: Add `converter` export to `nuget.ts`

**Files:**
- Modify: `src/converters/nuget.ts`
- Test: `test/converters/nuget.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/nuget.test.ts`:

```ts
import { converter } from '../../src/converters/nuget.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('nuget converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['nuget'])
    assert.deepStrictEqual(m.coordKeys, ['nuget:nuget'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/nuget.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/nuget.ts`**

Add at the bottom of `src/converters/nuget.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['nuget'],
  coordKeys: ['nuget:nuget'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/nuget.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/nuget.ts test/converters/nuget.test.ts
git commit -m "feat: add ConverterModule export to nuget converter"
```

---

### Task 7: Add `converter` export to `cocoapods.ts`

**Files:**
- Modify: `src/converters/cocoapods.ts`
- Test: `test/converters/cocoapods.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/cocoapods.test.ts`:

```ts
import { converter } from '../../src/converters/cocoapods.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('cocoapods converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['cocoapods'])
    assert.deepStrictEqual(m.coordKeys, ['pod:cocoapods'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/cocoapods.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/cocoapods.ts`**

Add at the bottom of `src/converters/cocoapods.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['cocoapods'],
  coordKeys: ['pod:cocoapods'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/cocoapods.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/cocoapods.ts test/converters/cocoapods.test.ts
git commit -m "feat: add ConverterModule export to cocoapods converter"
```

---

### Task 8: Add `converter` export to `composer.ts`

**Files:**
- Modify: `src/converters/composer.ts`
- Test: `test/converters/composer.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/composer.test.ts`:

```ts
import { converter } from '../../src/converters/composer.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('composer converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['composer'])
    assert.deepStrictEqual(m.coordKeys, ['composer:packagist'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/composer.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/composer.ts`**

Add at the bottom of `src/converters/composer.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['composer'],
  coordKeys: ['composer:packagist'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/composer.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/composer.ts test/converters/composer.test.ts
git commit -m "feat: add ConverterModule export to composer converter"
```

---

### Task 9: Add `converter` export to `github.ts`

**Files:**
- Modify: `src/converters/github.ts`
- Test: `test/converters/github.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/github.test.ts`:

```ts
import { converter } from '../../src/converters/github.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('github converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['github'])
    assert.deepStrictEqual(m.coordKeys, ['git:github'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/github.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/github.ts`**

Add at the bottom of `src/converters/github.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['github'],
  coordKeys: ['git:github'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/github.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/github.ts test/converters/github.test.ts
git commit -m "feat: add ConverterModule export to github converter"
```

---

### Task 10: Add `converter` export to `maven.ts`

**Files:**
- Modify: `src/converters/maven.ts`
- Test: `test/converters/maven.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/maven.test.ts`:

```ts
import { converter } from '../../src/converters/maven.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('maven converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['maven'])
    assert.deepStrictEqual(m.coordKeys, ['maven:mavencentral', 'maven:mavengoogle', 'maven:gradleplugin'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/maven.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/maven.ts`**

Add at the bottom of `src/converters/maven.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['maven'],
  coordKeys: ['maven:mavencentral', 'maven:mavengoogle', 'maven:gradleplugin'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/maven.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/maven.ts test/converters/maven.test.ts
git commit -m "feat: add ConverterModule export to maven converter"
```

---

### Task 11: Add `converter` export to `golang.ts`

**Files:**
- Modify: `src/converters/golang.ts`
- Test: `test/converters/golang.test.ts`

- [ ] **Step 1: Write failing test**

Add to the bottom of `test/converters/golang.test.ts`:

```ts
import { converter } from '../../src/converters/golang.ts'
import type { ConverterModule } from '../../src/types.ts'

describe('golang converter module', () => {
  it('implements ConverterModule interface', () => {
    const m: ConverterModule = converter
    assert.deepStrictEqual(m.purlTypes, ['golang'])
    assert.deepStrictEqual(m.coordKeys, ['go:golang'])
    assert.strictEqual(typeof m.toCoordinates, 'function')
    assert.strictEqual(typeof m.toPurl, 'function')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types 'test/converters/golang.test.ts'`
Expected: FAIL — `converter` is not exported

- [ ] **Step 3: Add `converter` export to `src/converters/golang.ts`**

Add at the bottom of `src/converters/golang.ts`:

```ts
import type { ConverterModule } from '../types.ts'

export const converter: ConverterModule = {
  purlTypes: ['golang'],
  coordKeys: ['go:golang'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types 'test/converters/golang.test.ts'`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/converters/golang.ts test/converters/golang.test.ts
git commit -m "feat: add ConverterModule export to golang converter"
```

---

### Task 12: Refactor `index.ts` to auto-generate maps

**Files:**
- Modify: `src/index.ts`
- Test: `test/index.test.ts` (existing tests cover this)

- [ ] **Step 1: Run existing tests to confirm baseline**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 2: Replace `src/index.ts`**

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import { converter as cargo } from './converters/cargo.ts'
import { converter as cocoapods } from './converters/cocoapods.ts'
import { converter as composer } from './converters/composer.ts'
import { converter as gem } from './converters/gem.ts'
import { converter as github } from './converters/github.ts'
import { converter as golang } from './converters/golang.ts'
import { converter as maven } from './converters/maven.ts'
import { converter as npm } from './converters/npm.ts'
import { converter as nuget } from './converters/nuget.ts'
import { converter as pypi } from './converters/pypi.ts'
import type { ConverterModule, CoordinatesSpec } from './types.ts'

export type { CoordinatesSpec } from './types.ts'

const allConverters: ConverterModule[] = [npm, pypi, cargo, gem, nuget, cocoapods, composer, github, maven, golang]

const converters = Object.fromEntries(
  allConverters.flatMap(c => c.purlTypes.map(t => [t, c.toCoordinates]))
)

const reverseConverters = Object.fromEntries(
  allConverters.flatMap(c => c.coordKeys.map(k => [k, c.toPurl]))
)

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

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 4: Verify types**

Run: `npm run tsc`
Expected: exits 0, no errors

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "refactor: auto-generate converter maps from ConverterModule array"
```
