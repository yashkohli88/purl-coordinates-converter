# Biome Linting Setup — purl-coordinates-converter

## Goal

Add Biome linting and formatting to `purl-coordinates-converter`, consistent with `crawler` and `service` packages but stricter, since this is a greenfield TypeScript-only package.

## biome.json

- Schema: `https://biomejs.dev/schemas/2.4.11/schema.json`
- Formatter: `lineWidth: 120`, `indentStyle: space`, `indentWidth: 2`
- JS formatter: single quotes, no semicolons, no trailing commas, arrow parens as needed
- Linter: `recommended: true`
- No rules disabled — all existing violations fixed in code instead

### File excludes

```
.nyc_output, coverage, node_modules
```

Also exclude test JSON/YAML files from formatter (same pattern as crawler/service).

## Code fixes

Two lint violations in existing code:

1. `src/converters/maven.ts` — `complexity/useLiteralKeys`: bracket notation `p.qualifiers['repository_url']` → dot notation `p.qualifiers.repository_url` (auto-fixable)
2. `src/converters/maven.ts` — `style/noNonNullAssertion`: `p.namespace!` → add explicit null/undefined guard with `throw` or restructure to satisfy type checker without assertion

## Formatter

All `src/**/*.ts` and `test/**/*.ts` files reformatted via `biome check . --write` (quotes, semicolons, trailing commas align to config).

## package.json changes

### scripts

```json
"lint": "npm run tsc && biome check .",
"lint:fix": "biome check . --write"
```

### devDependencies

```json
"@biomejs/biome": "2.5.0"
```

## Success criteria

- `npm run lint` passes with zero errors
- `npm test` still passes after formatting changes
- No rules disabled in `biome.json`
