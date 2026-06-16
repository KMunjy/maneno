# QA Report — Maneno (pre-store-launch)

**Date:** 2026-06-16 · **Tool:** Playwright 1.x (Chromium) · **Skill:** qa-engineer
**Scope:** PR diff = the iOS Haptics/Share bridge in `play.html`, widened to launch-regression
of the web crossword (per user "best outcome" steer).

## Setup note
No E2E tool pre-existed (this is a zero-build static PWA). Installed Playwright **into a
self-contained `qa/` folder** so the shipped app root stays dependency-free (GitHub Pages
serves it untouched). `qa/node_modules`, results, and reports are git-ignored; only the specs
+ config are committed. The harness serves the parent dir via `python3 -m http.server` and
drives `play.html`.

## Flows tested (confirmed scope)
| Flow | Why in scope |
|---|---|
| Core solve loop → win | The headline game loop; gates everything |
| Difficulty dropdown (4 levels) | User-requested 4-level feature |
| Daily puzzle determinism | "Same grid for everyone" — the share-loop premise |
| Share fallback + bridge inertness | **Directly covers the iOS-bridge diff** |
| Smoke (render + no console errors) | Boot integrity on mobile + desktop |

## Results — ✅ 24 / 24 passed (12 specs × desktop 1280×800 + mobile Pixel 5)

| Spec | Asserts | Result |
|---|---|---|
| `game.smoke.spec.ts` | board cells + clues render; **zero console errors**; core controls present | ✅ ×2 |
| `game.solve.spec.ts` | fill solution from `puzzle.cells` → `allSolved()` true → **#winModal + share + stats**; and wrong entries do **not** win | ✅ ×2 |
| `game.daily.spec.ts` | Daily grid byte-identical across reload (seeded determinism) | ✅ ×2 |
| `game.difficulty.spec.ts` | each of learner/intermediate/experienced/expert applies + rebuilds a valid grid, no errors | ✅ ×2 (×4 levels) |
| `game.share.spec.ts` | web `navigator.share` receives `{title:"Maneno", text:…"Maneno"…}`; **`window.Capacitor` undefined on web** (native branch never taken); clipboard fallback toasts "copied" | ✅ ×2 |

The share spec is the key regression guard for this PR: it proves the bridge edit did **not**
change browser behaviour (share payload intact, native branch inert) — which is exactly the
"inert on web" guarantee the diff claimed.

## Defects found
**App defects: none.** The 5 failures in the first run were **test-authoring bugs**, fixed and
re-run green:
1. Difficulty specs didn't open the `#btnMore` overflow menu before `#btnSettings` (the button
   is menu-nested) — `file:line` qa/e2e/game.difficulty.spec.ts:10. Fixed.
2. Clipboard stub used plain assignment on the read-only `navigator.clipboard` getter — switched
   to `Object.defineProperty`. Fixed.

## Not covered (honest gaps)
- **Native Haptics/Share execution** — only runs inside the iOS app (`window.Capacitor`), which
  needs an Xcode simulator (full Xcode not installed here). Verified by code review instead
  (the `ImpactStyle` casing fix) + the web-inertness assertion. Recommend a manual pass on a
  real device/simulator post-Xcode-install: solve a puzzle → confirm a light haptic + the
  native iOS share sheet.
- **Offline service-worker install** — flaky to assert headless; the precache integrity was
  validated structurally in BUILD_VALIDATION_REPORT.md. Recommend one manual airplane-mode load.
- **Auth flows** — none exist (device-local, no accounts), so nothing to test.

## How to re-run
```bash
cd qa && npm i && npx playwright test          # both viewports
```
build-validator will pick these specs up on subsequent runs.

## Self-check (step 7)
1. **Accuracy** — every row maps to a named spec that ran; counts taken from the Playwright
   summary "24 passed". ✅
2. **Authenticity** — tests actually executed against a live server (HTTP 200 logs observed);
   first run genuinely failed 5, fixed, re-run green. No fabricated results. ✅
3. **Source reliability** — Playwright + Chromium are the versions installed in `qa/` this
   session. ✅
