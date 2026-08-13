# Debian Support Design

**Date:** 2026-08-03  
**Repo:** purl-coordinates-converter

## Summary

Add bidirectional conversion between `pkg:deb` PURLs and ClearlyDefined `deb`/`debsrc` coordinates.

## Mapping

ClearlyDefined coordinate format: `type/provider/namespace/name/revision`

| Field      | PURL                                          | CD Coordinates                        |
|------------|-----------------------------------------------|---------------------------------------|
| type       | `deb`                                         | `deb` (binary) or `debsrc` (source)   |
| provider   | —                                             | always `debian` (only supported provider) |
| namespace  | distro (e.g. `debian`, `ubuntu`, `gardenlinux`) | `-` (always)                        |
| name       | package name                                  | same                                  |
| version    | `@7.50.3-1`                                   | revision prefix before last `_`       |
| arch       | `?arch=amd64` qualifier                       | revision suffix after last `_`        |

**Provider note:** CD only supports `deb/debian` and `debsrc/debian`. All deb PURLs regardless of namespace (`ubuntu`, `gardenlinux`, etc.) map to provider `debian`.

**Examples:**
- `pkg:deb/debian/curl@7.50.3-1?arch=amd64&distro=jessie` ↔ `deb/debian/-/curl/7.50.3-1_amd64`
- `pkg:deb/ubuntu/curl@7.81.0-1ubuntu1?arch=amd64&distro=ubuntu-22.04` → `deb/debian/-/curl/7.81.0-1ubuntu1_amd64`
- `pkg:deb/debian/curl@7.50.3-1` ↔ `deb/debian/-/curl/7.50.3-1` (no arch — crawler picks one)
- `pkg:deb/debian/attr@1:2.4.47-2?arch=source` ↔ `debsrc/debian/-/attr/1:2.4.47-2`
- `pkg:deb/ubuntu/procps@2:3.3.17-6ubuntu2.1?arch=amd64` → `deb/debian/-/procps/2:3.3.17-6ubuntu2.1_amd64` (epoch)

## Architecture Handling

No hardcoded default architecture. Verified from `clearlydefined/crawler` `debianFetch.js`:
- If no arch in revision, crawler picks the first available architecture from registry data at crawl time.
- Converter passes revision as-is; omitting arch is valid.
- `arch=source` is special — maps to `debsrc` CD type, not encoded into revision.

## `debsrc` Coordinates

PURL spec uses `?arch=source` qualifier to designate source packages. CD uses `debsrc` type. Therefore:
- `toCoordinates`: `arch=source` → `type = 'debsrc'`, no arch suffix in revision.
- `toPurl` for `debsrc`: emit `pkg:deb` with `arch=source` qualifier.
- `purlTypes: ['deb']`, `coordKeys: ['deb:debian', 'debsrc:debian']`.

## Qualifier Handling

| Qualifier    | Action                          |
|--------------|---------------------------------|
| `arch`       | encode into revision (or set `debsrc` type if `arch=source`) |
| `distro`     | drop silently (informational only) |
| `upstream`   | drop silently (informational only) |
| anything else | throw error                    |

## Implementation

**File:** `src/converters/debian.ts` — single file, follows `maven.ts` pattern for multiple coord keys.

```
purlTypes: ['deb']
coordKeys: ['deb:debian', 'debsrc:debian']
```

**`toCoordinates(p: PackageURL): Promise<CoordinatesSpec>`**
1. Reject qualifiers other than `arch`, `distro`, `upstream` (throw consistent error message).
2. `arch = p.qualifiers?.arch`
3. `type = arch === 'source' ? 'debsrc' : 'deb'`
4. `provider = 'debian'`
5. `namespace = '-'`
6. `name = p.name`
7. `revision = arch === 'source' || !arch ? p.version : p.version + '_' + arch`

**`toPurl(c: CoordinatesSpec): PackageURL`**
1. If `c.type === 'debsrc'`: `qualifiers = { arch: 'source' }`, `version = c.revision`
2. Else: split `c.revision` on last `_` → `[version, arch?]`; `qualifiers = arch ? { arch } : null`
3. `new PackageURL('deb', 'debian', c.name, version, qualifiers, null)`

**`src/index.ts`**: import and register `debian` converter in `allConverters`.

## Test Cases

| # | PURL | CD Coordinates | Notes |
|---|------|----------------|-------|
| 1 | `pkg:deb/debian/curl@7.50.3-1?arch=amd64&distro=jessie` | `deb/debian/-/curl/7.50.3-1_amd64` | distro dropped |
| 2 | `pkg:deb/debian/curl@7.50.3-1` | `deb/debian/-/curl/7.50.3-1` | no arch |
| 3 | `pkg:deb/debian/apt@1.4.9?arch=i386` | `deb/debian/-/apt/1.4.9_i386` | binary |
| 4 | `pkg:deb/debian/attr@1:2.4.47-2?arch=source` | `debsrc/debian/-/attr/1:2.4.47-2` | source package, epoch |
| 5 | `pkg:deb/ubuntu/curl@7.81.0-1ubuntu1?arch=amd64&distro=ubuntu-22.04` | `deb/debian/-/curl/7.81.0-1ubuntu1_amd64` | ubuntu→debian provider |
| 6 | `pkg:deb/ubuntu/procps@2:3.3.17-6ubuntu2.1?arch=amd64` | `deb/debian/-/procps/2:3.3.17-6ubuntu2.1_amd64` | epoch + ubuntu |
| 7 | `pkg:deb/debian/base-files@12.4+deb12u10?arch=amd64` | `deb/debian/-/base-files/12.4+deb12u10_amd64` | `+` in version |
| 8 | (reverse) `deb/debian/-/curl/7.50.3-1_amd64` | `pkg:deb/debian/curl@7.50.3-1?arch=amd64` | round-trip |
| 9 | (reverse) `debsrc/debian/-/attr/1:2.4.47-2` | `pkg:deb/debian/attr@1:2.4.47-2?arch=source` | debsrc round-trip |
