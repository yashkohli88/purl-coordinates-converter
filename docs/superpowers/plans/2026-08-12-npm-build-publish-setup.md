# npm Build & Publish Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `tsc`-based build pipeline that compiles TypeScript to `dist/` and configures `package.json` for correct npm publishing.

**Architecture:** A new `tsconfig.build.json` handles emit only — existing `tsconfig.json` stays type-check-only so the `lint` script is unaffected. `package.json` `main`/`exports`/`types`/`files` are updated to point at compiled `dist/` output. `prepublishOnly` ensures `dist/` is always fresh before `npm publish`.

**Tech Stack:** TypeScript (`tsc`), Node 24, ESM

---

### Task 1: Add `dist/` to `.gitignore`

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append `dist/` to `.gitignore`**

Open `.gitignore` and add one line at the end:

```
dist/
```

Full file after change:
```
node_modules/
.nyc_output/
coverage/
.DS_Store
dist/
```

- [ ] **Step 2: Verify**

```bash
cat .gitignore
```

Expected output includes `dist/` on its own line.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore dist/ build output"
```

---

### Task 2: Create `tsconfig.build.json`

**Files:**
- Create: `tsconfig.build.json`

- [ ] **Step 1: Create the file**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["test"]
}
```

Key points:
- `extends ./tsconfig.json` — inherits all strict settings
- `noEmit: false` — overrides the `true` in `tsconfig.json` to actually emit files
- `outDir: "dist"` — all compiled output goes to `dist/`
- `declaration: true` — emit `.d.ts` type declaration files for consumers
- `declarationMap: true` — emit `.d.ts.map` files for IDE go-to-definition into source
- `exclude: ["test"]` — don't compile test files

- [ ] **Step 2: Verify it parses correctly**

```bash
npx tsc -p tsconfig.build.json --noEmit --listFiles
```

Expected: lists `src/**/*.ts` files without errors, no `test/` files listed.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.build.json
git commit -m "chore: add tsconfig.build.json for dist emit"
```

---

### Task 3: Update `package.json` — scripts, exports, files

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update `package.json`**

Apply these changes to `package.json`:

```json
{
  "name": "@clearlydefined/purl-coordinates-converter",
  "version": "0.1.0",
  "description": "Convert between PURL strings and ClearlyDefined coordinates",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "engines": {
    "node": ">=22.12"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepublishOnly": "npm run build",
    "test": "node --test --experimental-strip-types --experimental-test-coverage 'test/**/*.test.ts'",
    "tsc": "tsc && tsc -p test/tsconfig.json",
    "lint": "npm run tsc && biome check .",
    "lint:fix": "biome check . --write"
  }
}
```

Changes from original:
- `main`: `./src/index.ts` → `./dist/index.js`
- `types`: added `"./dist/index.d.ts"` (new field)
- `exports`: now has `import` + `types` conditions instead of raw `.ts` path
- `files`: `["src"]` → `["dist"]`
- `scripts`: added `build` and `prepublishOnly`

- [ ] **Step 2: Run the build to verify `dist/` is generated**

```bash
npm run build
```

Expected: exits 0, `dist/` directory created with:
```
dist/
  index.js
  index.d.ts
  index.d.ts.map
  converters/
    cargo.js  cargo.d.ts  cargo.d.ts.map
    ... (one .js + .d.ts + .d.ts.map per converter)
  types.js
  types.d.ts
  types.d.ts.map
```

- [ ] **Step 3: Verify lint still works (tsconfig.json unchanged)**

```bash
npm run lint
```

Expected: exits 0. This confirms the existing `tsconfig.json` (`noEmit: true`) is still used by `lint` and the build config didn't break it.

- [ ] **Step 4: Verify tests still pass**

```bash
npm test
```

Expected: all tests pass. Tests use `--experimental-strip-types` directly on `.ts` files — unaffected by build config.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "feat: add build script and update package exports for npm publish"
```

---

### Task 4: Smoke-test the published package shape

**Files:** none modified

- [ ] **Step 1: Check what `npm publish` would include**

```bash
npm pack --dry-run
```

Expected output lists only files under `dist/`:
```
dist/index.js
dist/index.d.ts
dist/index.d.ts.map
dist/converters/cargo.js
dist/converters/cargo.d.ts
...
```

Must NOT list `src/` files or `test/` files.

- [ ] **Step 2: Verify exports resolve correctly**

```bash
node -e "import('@clearlydefined/purl-coordinates-converter').then(m => console.log(Object.keys(m)))"
```

Run from inside the project dir. Expected: prints `[ 'buildMap', 'purlToCoordinates', 'coordinatesToPurl' ]` (the public exports from `src/index.ts`).

- [ ] **Step 3: Commit if any fixup needed, otherwise done**

If step 1 or 2 revealed problems (e.g. wrong paths, missing exports), fix and commit. Otherwise no commit needed.
