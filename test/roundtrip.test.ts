import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { coordinatesToPurl, purlToCoordinates } from '../src/index.ts'

const cases = [
  // npm
  'pkg:npm/redis@0.1.0',
  'pkg:npm/%40angular/core@15.0.0',
  // pypi
  'pkg:pypi/platformdirs@4.2.0',
  'pkg:pypi/backports.ssl-match-hostname@3.7.0.1',
  // cargo
  'pkg:cargo/ratatui@0.26.0',
  'pkg:cargo/bitflags@1.0.4',
  // gem
  'pkg:gem/sorbet@0.5.11226',
  // nuget
  'pkg:nuget/NuGet.Protocol@6.7.1',
  'pkg:nuget/xunit.core@2.4.1',
  // cocoapods
  'pkg:cocoapods/SoftButton@0.1.0',
  // composer
  'pkg:composer/symfony/polyfill-mbstring@v1.28.0',
  'pkg:composer/symfony/polyfill-mbstring@1.11.0',
  // github
  'pkg:github/ratatui-org/ratatui@bcf43688ec4a13825307aef88f3cdcd007b32641',
  // golang
  'pkg:golang/rsc.io/quote@v1.3.0',
  'pkg:golang/golang.org/x/xerrors@v0.0.0-20200804184101-5ec99f83aff1',
  'pkg:golang/cloud.google.com/go@v0.56.0',
  'pkg:golang/github.com/kucherenkovova/gopypaste/xerrors@v0.1.1'
]

describe('PURL ↔ Coordinates roundtrip', () => {
  for (const purl of cases) {
    it(`roundtrip: ${purl}`, async () => {
      const coords = await purlToCoordinates(purl)
      const result = coordinatesToPurl(coords)
      assert.strictEqual(result, purl)
    })
  }
})
