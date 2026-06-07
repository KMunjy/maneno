# Build Validation Report — Mhanga Bantu Crossword

**Target:** `bantu_crossword/web/` (static single-file web app) · **Mode:** apply-fix
**Date:** 2026-06-07 · **Validator:** build-validator (adapted) + /code-audit + /design-critique

> **Stack note (no fabrication):** This is a **static project** — `index.html` (HTML + inline CSS + vanilla JS) + `sw.js` + `manifest.json` + `vercel.json`. There is **no `package.json`, no build step, no test framework** in `web/`. Node/TS-specific steps (tsc, ESLint, Jest/Vitest/Playwright, bundle analysis, npm audit, coverage %) are therefore **Not Applicable — skipped with reason**, per the skill's no-fabrication rule. The only `package.json` in the repo belongs to the unrelated `elevenreader` app and was intentionally not targeted.

## Headline: ✅ Build-ready (9 fixes applied, 2 recommendations deferred)

---

## Checks run (applicable to a static app)

| Step | Check | Result |
|---|---|---|
| Serve / "build" | `index.html`, `manifest.json`, `sw.js` over HTTP | **200** all three (98 KB) |
| JS syntax | `node --check` on extracted inline script | **PASS** (clean, both pre- and post-fix) |
| Logic integrity | tokenizer × 3 languages, all words → valid graphemes | **0 bad tokens** (170 Shona + 204 Swahili + 59 Zulu) |
| Test suite | `python3 test_tokenizer.py` (26 assertions incl. Zulu clicks/trigraphs) | **All passed** |
| Runtime | live DOM load, no thrown errors, puzzle generates | **PASS** |
| Dead code | `just-solved` / `popIn` references after removal | **0** (removed) |

---

## Fixes applied (apply-mode)

Each cites the audit finding's `file:line`. All re-validated (syntax + integrity + tests + live DOM).

### Correctness / bugs
1. **Timeout no longer credited as a win** — `index.html` (timer `timerSec<=0` path → `onWin`). Added a `gameOver` flag set on countdown expiry; `onWin()` now returns early without recording a Profile solve. *Was: a timed-out puzzle incremented `totalSolved`.*
2. **Empty-grid render freeze guarded** — `newPuzzle()` after `generateBest()`. If generation yields no cells, bounds would become `Infinity` and `render()` would loop forever. Now bails with a status message.
3. **"Check" highlights errors** — `checkManual()`. Previously only set a status string; error cells only showed if Autocheck was already on. Now flashes wrong cells red for 1.2 s even with Autocheck off (users expect Check to mark errors).

### Robustness
4. **`GameConfig.load()` key whitelist** — was `Object.assign(this, JSON.parse(...))`, which could overwrite methods or inject junk from a stale/corrupt blob. Now copies only known keys.
5. **`Profile.load()` key whitelist** — same fix for the profile store.

### Performance
6. **Delegated board click listener** — `render()` previously re-queried and re-bound a click listener on every `.live` cell on every keystroke. Replaced with a single delegated listener on `#board`, bound once at boot. Removes per-keystroke `querySelectorAll` + listener churn.

### Accessibility (from /design-critique)
7. **Visible keyboard focus** — added global `*:focus-visible` outline (was none; `outline:none` on inputs left keyboard users with no cursor). WCAG 2.4.7.
8. **Autocheck non-colour cue** — correct/incorrect cells now carry a ✓ / ✗ glyph, not colour alone. WCAG 1.4.1 (colour-blind users).
9. **Pinch-zoom restored** — removed `maximum-scale=1, user-scalable=no` from the viewport meta. WCAG 1.4.4.

### Cleanup
- Removed dead CSS (`.sq.live.just-solved` + `@keyframes popIn`, never referenced in JS).

---

## Contrast fixes (WCAG AA) — applied

| Token | Before | After | Reason |
|---|---|---|---|
| `--dim` | `#556080` (~3.1:1) | `#7080a8` (~4.5:1) | Used for legend/help copy — was below AA |
| `--muted` | `#8896b3` (~4.6:1) | `#9aa8c8` | Margin of safety for body copy |
| `--cw-num` | `#1e3a5f` | `#0a2540` | Clue number held ~3.4:1 on the gold active cell |

---

## Deferred (proposed, NOT auto-applied — they are features, not fixes)

These are the two highest-impact items from /design-critique. They change scope/behaviour, so per fix-policy they are recommendations, not auto-applied:

1. **First-run onboarding** teaching the grapheme/digraph rule ("one cell = one sound: ng', zv, ch"). The product's core differentiator is currently invisible until a user is confused mid-solve. Highest conversion lever for learners/classrooms.
2. **Toolbar declutter** — ~11 flat controls in one row; demote secondary tools (Print, Pencil, Timer, Clear) into the Settings drawer / overflow.

(Also low-priority, from /code-audit: daily-puzzle seed uses local device date so "same for everyone" varies by timezone — cosmetic.)

---

## Self-check (step 9)

1. **Accuracy** — every applied fix maps to an audit finding with a code reference. ✅
2. **Authenticity** — tools actually run: `node --check`, `python3 test_tokenizer.py`, Node integrity eval, live DOM inspection. No summarised/assumed output. ✅
3. **Source reliability** — all checks run against the on-disk file and the live served build; re-validated after every edit. ✅

**Overall: ✅ Build-ready.** No blocking issues. Security clean (no unescaped user data in any `innerHTML` sink; only the player name, via `textContent`). The two highest-value next steps are product features (onboarding, toolbar declutter), not defects.
