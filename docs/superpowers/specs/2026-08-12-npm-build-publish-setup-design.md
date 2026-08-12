---
name: npm-build-publish-setup
description: Add TypeScript build pipeline and npm publish configuration to purl-coordinates-converter
metadata:
  type: project
---

# npm Build & Publish Setup

## Context

`purl-coordinates-converter` is a TypeScript ESM library. Currently `tsconfig.json` has `noEmit: true` — no compiled output exists. `package.json` `main`/`exports` point at raw `.ts` source files, which breaks npm consumers. Needs a build step to compile to `dist/` before publishing.

Consumers: `clearlydefined/crawler` and `clearlydefined/service`, both Node 24, both ESM. No CJS consumers — ESM-only output is sufficient.

## Build Tool

`tsc` (already a dev dependency). No new dependencies needed.

## Architecture

Two tsconfigs, separate concerns:

- `tsconfig.json` — type-checking only (`noEmit: true`), used by `lint` script. Unchanged.
- `tsconfig.build.json` — extends `tsconfig.json`, overrides for emit: `noEmit: false`, `outDir: "dist"`, `declaration: true`, `declarationMap: true`. Excludes `test/`.

## package.json Changes

### Scripts

```json
"build": "tsc -p tsconfig.build.json",
"prepublishOnly": "npm run build"
```

`prepublishOnly` ensures dist is always fresh on `npm publish`.

### Exports

```json
"main": "./dist/index.js",
"types": "./dist/index.d.ts",
"exports": {
  ".": {
    "import": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
},
"files": ["dist"]
```

Ships compiled output only — no source `.ts` files in the published package.

## Other Files

- Add `dist/` to `.gitignore` — compiled output is not committed to git.

## What Does NOT Change

- `tsconfig.json` — stays type-check only, `lint` script unaffected
- `test/` — not compiled by build tsconfig, test runner uses `--experimental-strip-types` directly
- Source structure in `src/` — unchanged
