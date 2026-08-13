# Biome Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Biome linting and formatting to `purl-coordinates-converter` with strict settings and no disabled rules.

**Architecture:** Add `biome.json` with recommended rules + same formatter settings as crawler/service, fix the two existing violations in source, then apply formatter to all files. Wire lint scripts into `package.json`.

**Tech Stack:** `@biomejs/biome@2.5.0`, Node.js, TypeScript

---

## File Map

| File | Action |
|------|--------|
| `biome.json` | Create |
| `package.json` | Modify — add scripts + devDependency |
| `src/converters/maven.ts` | Modify — fix 2 lint violations |
| All `src/**/*.ts`, `test/**/*.ts`, `test/tsconfig.json` | Modify — reformatted by biome |

---

### Task 1: Fix lint violations in maven.ts

**Files:**
- Modify: `src/converters/maven.ts`

- [ ] **Step 1: Read the current file**

```bash
cat src/converters/maven.ts
```

- [ ] **Step 2: Fix `useLiteralKeys` and `noNonNullAssertion`**

Replace lines 24 and 27 in `src/converters/maven.ts`:

```ts
// (c) Copyright 2026, SAP SE and ClearlyDefined contributors. Licensed under the MIT license.
// SPDX-License-Identifier: MIT

import { PackageURL } from 'packageurl-js'
import type { CoordinatesSpec } from '../types.ts'

const REPO_TO_PROVIDER: Record<string, string> = {
  'https://repo.maven.apache.org/maven2/': 'mavencentral',
  'https://repo1.maven.org/maven2/': 'mavencentral',
  'https://maven.google.com': 'mavengoogle',
  'https://plugins.gradle.org/m2/': 'gradleplugin'
}

const PROVIDER_TO_REPO: Record<string, string> = {
  mavengoogle: 'https://maven.google.com',
  gradleplugin: 'https://plugins.gradle.org/m2/'
}

export async function toCoordinates(p: PackageURL): Promise<CoordinatesSpec> {
  const qualifierKeys = p.qualifiers ? Object.keys(p.qualifiers) : []
  const unsupported = qualifierKeys.filter(k => k !== 'repository_url')
  if (unsupported.length > 0) throw new Error(`PURL qualifiers are not supported for type: ${p.type}`)

  const repoUrl = p.qualifiers && 'repository_url' in p.qualifiers ? p.qualifiers.repository_url : undefined
  const provider = (repoUrl && REPO_TO_PROVIDER[repoUrl]) ?? 'mavencentral'

  if (!p.namespace) throw new Error(`Maven PURL requires a namespace: ${p.toString()}`)
  return { type: 'maven', provider, namespace: p.namespace, name: p.name, revision: p.version ?? undefined }
}

export function toPurl(c: CoordinatesSpec): PackageURL {
  const repoUrl = PROVIDER_TO_REPO[c.provider]
  const qualifiers = repoUrl ? { repository_url: repoUrl } : null
  return new PackageURL('maven', c.namespace === '-' ? null : c.namespace, c.name, c.revision, qualifiers, null)
}
```

- [ ] **Step 3: Run existing tests to confirm no regression**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/converters/maven.ts
git commit -m "fix: replace non-null assertion and bracket notation in maven converter"
```

---

### Task 2: Add biome.json

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Create biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.11/schema.json",
  "files": {
    "includes": [
      "**",
      "!**/.nyc_output",
      "!**/coverage/**",
      "!**/node_modules/**",
      "!**/test/**/*.json",
      "!**/test/**/*.yaml"
    ]
  },
  "formatter": {
    "lineWidth": 120,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "none",
      "arrowParentheses": "asNeeded"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

- [ ] **Step 2: Verify biome sees no lint errors on src/test**

```bash
npx @biomejs/biome check src/ test/
```

Expected: 0 lint errors (may still have formatter errors — that's fine, fixed in Task 3).

- [ ] **Step 3: Commit**

```bash
git add biome.json
git commit -m "chore: add biome.json with strict recommended rules"
```

---

### Task 3: Apply formatter to all files

**Files:**
- Modify: all `src/**/*.ts`, `test/**/*.ts`, `test/tsconfig.json`

- [ ] **Step 1: Apply formatter**

```bash
npx @biomejs/biome check . --write
```

- [ ] **Step 2: Run tests to confirm formatting didn't break anything**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Verify no remaining biome errors**

```bash
npx @biomejs/biome check .
```

Expected: no errors, no warnings (aside from any non-src/test files you don't care about).

- [ ] **Step 4: Commit**

```bash
git add src/ test/
git commit -m "style: apply biome formatting to all source and test files"
```

---

### Task 4: Wire biome into package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add devDependency and scripts**

In `package.json`, add to `"scripts"`:

```json
"lint": "npm run tsc && biome check .",
"lint:fix": "biome check . --write"
```

And add to `"devDependencies"`:

```json
"@biomejs/biome": "2.5.0"
```

- [ ] **Step 2: Install**

```bash
npm install
```

- [ ] **Step 3: Run lint script end-to-end**

```bash
npm run lint
```

Expected: exits 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @biomejs/biome devDependency and lint scripts"
```
