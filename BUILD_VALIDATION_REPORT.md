# Build Validation Report — Maneno

**Date:** 2026-06-16 · **Mode:** apply-fix · **Validator:** build-validator skill

## Stack reality (why the standard Node pipeline was adapted)
`maneno/` root has **no `package.json`** — it is a static, zero-build PWA (HTML + CSS +
vanilla JS, served as files). So `tsc / eslint / jest / vitest / next build` genuinely do
not apply and were **not faked** (no-fabrication rule). Two real toolchains exist and were
validated directly:
- **Python** generator at `generator/`
- **Capacitor/iOS** wrapper at `~/maneno-ios` (`@capacitor/*`)

Validation was mapped to the equivalent meaningful checks for each.

## Results

| # | Check | Tool / command | Result |
|---|---|---|---|
| 1 | JS syntax — 7 units (inline + external) | `node --check` per block | ✅ **0 errors** |
| 2 | JSON validity (manifest, vercel, assetlinks) | `json.load` | ✅ all 4 valid |
| 3 | Broken internal links (href/src) | filesystem resolve | ✅ **0 broken** |
| 4 | Python generator compile | `py_compile crossword.py test_tokenizer.py` | ✅ compiles |
| 4 | Python generator tests | `test_tokenizer.py` | ✅ **all pass** (tokenizer, Zulu digraph/trigraph, end-to-end grid w/ 3 crossings) |
| 5 | iOS `package.json` / `capacitor.config.json` | `json.load` | ✅ valid · appId `com.kmunjy.maneno` |
| 5 | CocoaPods install | `Podfile.lock` | ✅ Capacitor 6.2.1, Haptics 6.0.3, Share 6.0.4 |
| 5 | Native bridge in bundled `www/play.html` | `grep` | ✅ 2 hooks present (haptics + share) |
| 6 | SW precache integrity | resolve each cached path | ✅ all 8 exist (no broken offline install) |
| 6 | Manifest icons + start_url | resolve | ✅ icon-192/512 exist, start_url `play.html`, `standalone` |

## Build verification
- **Web:** no build step (static files) — "build" = files serve as-is; all assets resolve. ✅
- **Android:** signed `.aab` already produced (`~/maneno-android/maneno-release.aab`). ✅
- **iOS:** Xcode workspace + Pods generated; archive/sign requires full Xcode (not installed here). ⏸️ documented in `BUILD_IOS.md`.

## Coverage
- **Static PWA:** no test-coverage instrumentation exists (no test framework in the project).
  Not fabricated. Functional coverage is via the checks above (syntax, links, SW, manifest).
- **Python generator:** hand-rolled test suite present and green; covers tokenizer + grid build.
- Recommendation (non-blocking): a tiny smoke harness (headless Playwright loading `play.html`,
  asserting a grid renders + a win fires) would give the web app real regression coverage.

## Fixes applied
**None required** — zero errors/warnings surfaced, so there was nothing in the safe-fix set to apply.

## Observations (non-defects)
- `sw.js` precaches the core game (`index/play/register`, `words.js`, icons) but **not**
  `privacy.html`, `admin.html`, `review.html`, `audit-flags.js`. Intentional: those are
  online-only tool/legal pages. Only note: `privacy.html` (linked from the landing footer)
  won't open offline — acceptable for a legal page; precache it if you want it offline.
- `npm audit` could not run: the active registry mirror (`npmmirror.com`) returns
  `NOT_IMPLEMENTED` for the audit endpoint. Skipped, not faked. Capacitor deps are pinned to
  current 6.x.

## Self-check (step 9)
1. **Accuracy** — every row cites a command run in this session. ✅
2. **Authenticity** — tools actually executed (`node --check`, `py_compile`, test run, `json.load`, `Podfile.lock` read); no summarised-from-memory output. ✅
3. **Source reliability** — versions read from `Podfile.lock` / `package.json` in-tree, not assumed. ✅

## Headline
✅ **Build-ready.** Every toolchain that exists in the project validates clean; no fixes needed.
