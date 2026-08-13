# Debian Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bidirectional conversion between `pkg:deb` PURLs and ClearlyDefined `deb`/`debsrc` coordinates.

**Architecture:** Single converter file `src/converters/debian.ts` following the existing pattern (see `src/converters/cargo.ts` for simplest example, `src/converters/maven.ts` for multi-coord-key pattern). Registered in `src/index.ts` alongside all other converters.

**Tech Stack:** TypeScript, Node.js ≥22.12, `packageurl-js` for PURL parsing, `node:test` for tests.

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/converters/debian.ts` | deb/debsrc converter |
| Modify | `src/index.ts` | register debian converter |
| Modify | `test/index.test.ts` | add deb to registry coverage tests |
| Modify | `test/roundtrip.test.ts` | add deb round-trip cases |

---

### Task 1: Create `debian.ts` with failing tests

**Files:**
- Create: `src/converters/debian.ts`
- Modify: `test/index.test.ts`

- [ ] **Step 1: Add deb to the registry coverage test in `test/index.test.ts`**

In the `'registers all expected purl types'` test, add `['deb', 'pkg:deb/debian/curl@7.50.3-1?arch=amd64']` to the `cases` array:

```typescript
// test/index.test.ts  — inside the cases array in 'registers all expected purl types'
['deb', 'pkg:deb/debian/curl@7.50.3-1?arch=amd64'],
```

In the `'registers all expected coord keys'` test, add both debian coord keys to the `supported` array:

```typescript
// inside the supported array in 'registers all expected coord keys'
{ type: 'deb', provider: 'debian' },
{ type: 'debsrc', provider: 'debian' },
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -E 'fail|deb|FAIL' -i
```

Expected: failures mentioning `Unsupported PURL type: deb` and `Unsupported coordinate type/provider: deb/debian`.

- [ ] **Step 3: Create `src/converters/debian.ts`**

```typescript
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { CoordinatesSpec, ConverterModule } from '../types.ts'

const ALLOWED_QUALIFIERS = new Set(['arch', 'distro', 'upstream'])

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  const unsupported = p.qualifiers ? Object.keys(p.qualifiers).filter(k => !ALLOWED_QUALIFIERS.has(k)) : []
  if (unsupported.length > 0) throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)

  const arch = p.qualifiers?.arch
  const isSource = arch === 'source'
  const revision = isSource || !arch ? (p.version ?? undefined) : `${p.version}_${arch}`

  return {
    type: isSource ? 'debsrc' : 'deb',
    provider: 'debian',
    namespace: '-',
    name: p.name,
    revision
  }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  if (c.type === 'debsrc') {
    return new PackageURL('deb', 'debian', c.name, c.revision, { arch: 'source' }, null)
  }
  if (!c.revision) {
    return new PackageURL('deb', 'debian', c.name, c.revision, null, null)
  }
  const lastUnderscore = c.revision.lastIndexOf('_')
  if (lastUnderscore === -1) {
    return new PackageURL('deb', 'debian', c.name, c.revision, null, null)
  }
  const version = c.revision.slice(0, lastUnderscore)
  const arch = c.revision.slice(lastUnderscore + 1)
  return new PackageURL('deb', 'debian', c.name, version, { arch }, null)
}

export const converter: ConverterModule = {
  purlTypes: ['deb'],
  coordKeys: ['deb:debian', 'debsrc:debian'],
  toCoordinates,
  toPurl
}
```

- [ ] **Step 4: Register in `src/index.ts`**

Add import after the existing imports (alphabetical order — after `golang`, before `maven`):

```typescript
import { converter as debian } from './converters/debian.ts'
```

Add `debian` to the `allConverters` array:

```typescript
const allConverters: ConverterModule[] = [npm, pypi, cargo, gem, nuget, cocoapods, composer, github, maven, golang, debian]
```

- [ ] **Step 5: Run tests to verify registry tests pass**

```bash
npm test 2>&1 | grep -E 'deb|fail|pass' -i
```

Expected: the two registry tests for `deb` now pass.

- [ ] **Step 6: Commit**

```bash
git add src/converters/debian.ts src/index.ts test/index.test.ts
git commit -m "feat: add debian converter with registry wiring"
```

---

### Task 2: Add conversion tests

**Files:**
- Modify: `test/index.test.ts`

- [ ] **Step 1: Add a `describe('deb converter')` block to `test/index.test.ts`**

Add after the existing `describe` blocks:

```typescript
describe('deb converter', () => {
  it('binary deb with arch and distro qualifier', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/curl@7.50.3-1?arch=amd64&distro=jessie')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'curl', revision: '7.50.3-1_amd64' })
  })

  it('binary deb without arch', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/curl@7.50.3-1')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'curl', revision: '7.50.3-1' })
  })

  it('source package via arch=source', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/attr@1:2.4.47-2?arch=source')
    assert.deepEqual(coords, { type: 'debsrc', provider: 'debian', namespace: '-', name: 'attr', revision: '1:2.4.47-2' })
  })

  it('ubuntu namespace maps to debian provider', async () => {
    const coords = await purlToCoordinates('pkg:deb/ubuntu/procps@2:3.3.17-6ubuntu2.1?arch=amd64')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'procps', revision: '2:3.3.17-6ubuntu2.1_amd64' })
  })

  it('version with + character', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/base-files@12.4+deb12u10?arch=amd64')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'base-files', revision: '12.4+deb12u10_amd64' })
  })

  it('upstream qualifier is silently dropped', async () => {
    const coords = await purlToCoordinates('pkg:deb/debian/libgomp1@10.2.1-6?arch=amd64&distro=debian-11&upstream=gcc-10')
    assert.deepEqual(coords, { type: 'deb', provider: 'debian', namespace: '-', name: 'libgomp1', revision: '10.2.1-6_amd64' })
  })

  it('throws on unsupported qualifier', async () => {
    await assert.rejects(purlToCoordinates('pkg:deb/debian/curl@7.50.3-1?foo=bar'), /qualifiers.*not supported/i)
  })

  it('coordinatesToPurl: deb with arch', () => {
    const purl = coordinatesToPurl({ type: 'deb', provider: 'debian', namespace: '-', name: 'curl', revision: '7.50.3-1_amd64' })
    assert.strictEqual(purl, 'pkg:deb/debian/curl@7.50.3-1?arch=amd64')
  })

  it('coordinatesToPurl: deb without arch', () => {
    const purl = coordinatesToPurl({ type: 'deb', provider: 'debian', namespace: '-', name: 'curl', revision: '7.50.3-1' })
    assert.strictEqual(purl, 'pkg:deb/debian/curl@7.50.3-1')
  })

  it('coordinatesToPurl: debsrc emits arch=source', () => {
    const purl = coordinatesToPurl({ type: 'debsrc', provider: 'debian', namespace: '-', name: 'attr', revision: '1:2.4.47-2' })
    assert.strictEqual(purl, 'pkg:deb/debian/attr@1%3A2.4.47-2?arch=source')
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npm test 2>&1 | grep -E 'deb|fail' -i
```

Expected: all deb converter tests pass.

- [ ] **Step 3: Commit**

```bash
git add test/index.test.ts
git commit -m "test: add deb converter conversion tests"
```

---

### Task 3: Add round-trip tests

**Files:**
- Modify: `test/roundtrip.test.ts`

Note: Round-trip only works for PURLs that survive `purlToCoordinates → coordinatesToPurl` unchanged. PURLs with `distro`/`upstream` qualifiers won't round-trip (those are dropped). Ubuntu namespace won't round-trip (maps to `debian` provider). Only add cases that are known to round-trip.

- [ ] **Step 1: Add deb round-trip cases to `test/roundtrip.test.ts`**

Add to the `cases` array:

```typescript
// deb
'pkg:deb/debian/curl@7.50.3-1?arch=amd64',
'pkg:deb/debian/curl@7.50.3-1',
'pkg:deb/debian/attr@1:2.4.47-2?arch=source',
'pkg:deb/debian/base-files@12.4+deb12u10?arch=amd64',
```

- [ ] **Step 2: Run tests**

```bash
npm test 2>&1 | grep -E 'roundtrip.*deb|deb.*roundtrip|fail' -i
```

Expected: all 4 new round-trip cases pass.

- [ ] **Step 3: Run full test suite and confirm no regressions**

```bash
npm test 2>&1 | tail -30
```

Expected: all tests pass, 100% line coverage maintained.

- [ ] **Step 4: Commit**

```bash
git add test/roundtrip.test.ts
git commit -m "test: add deb round-trip cases"
```

---

### Task 4: Lint and final check

- [ ] **Step 1: Run lint**

```bash
npm run lint 2>&1
```

Expected: no errors.

- [ ] **Step 2: If lint errors, fix them**

Common issues: unused imports, missing type annotations. Run `npm run lint:fix` to auto-fix formatting issues.

- [ ] **Step 3: Run full test suite one final time**

```bash
npm test 2>&1 | tail -15
```

Expected: all tests pass.

- [ ] **Step 4: Commit lint fixes if any**

```bash
git add -p
git commit -m "chore: fix lint issues in debian converter"
```
