# UAT Report — Maneno (pre-store-launch user-acceptance walkthrough)

**Date:** 2026-06-16 · **Tool:** Playwright (Chromium) · **Spec:** `qa/e2e/uat.spec.ts`
**Viewports:** Desktop 1280×800 + Mobile (Pixel 5) · **Result:** ✅ **2/2 passed · 11/11 outcomes captured per viewport · 0 console errors**

This is a *user-acceptance* pass: the app is driven exactly as a player would, and a screenshot
is captured at each accepted outcome. Shots are written to `qa/uat-shots/<viewport>/` (git-ignored,
regenerable). Re-run: `cd qa && npx playwright test uat.spec.ts`.

## Acceptance outcomes (each captured on desktop **and** mobile)

| # | Acceptance criterion | Outcome — what the screenshot proves | ✅ |
|---|---|---|---|
| 01 | First-run onboarding | Onboarding modal explains the grapheme rule before play | ✅ |
| 02 | Game board renders | Indaba-styled grid + live Shona clues + digraph keypad (CH, DZ, MB, NG, ZV…) | ✅ |
| 03 | Cell selection | Selecting a square activates it + highlights its word | ✅ |
| 04 | Win celebration | "WAKUNDA!" modal: time / words / streak / **Clean ★**, Share + New, confetti, achievement toast | ✅ |
| 05 | Difficulty settings | Settings drawer with the 4-level dropdown | ✅ |
| 06 | Expert level | Expert applied → longer-word grid, "1 hint left" budget | ✅ |
| 07 | Daily puzzle | Shared daily grid loads | ✅ |
| 08 | Language — Swahili | Board rebuilds in Swahili | ✅ |
| 09 | Language — Zulu (Beta) | Zulu grid + **honest Beta banner** + full Zulu keypad incl. NTSH trigraph, NGQ/NKX clicks | ✅ |
| 10 | Profile / achievements | Profile modal with stats + achievement grid | ✅ |
| 11 | Learn Mode | "LEARN" badge + vocab card (word · English · phonetic) + grid pre-revealed for study | ✅ |

## Signals captured along the way
- **Zero console errors** across the entire walkthrough on both viewports.
- **State persistence** visible: the 🔥 streak badge carries across language switches and reloads.
- **Grapheme integrity** visible on screen: digraphs (BH, CH, ZV) and trigraphs (NTSH) each occupy a single cell — the core differentiator, shown not just asserted.
- **Mobile** reflows cleanly (toolbar wraps, grid fits, keypad re-lays-out) — store-screenshot quality.

## Method notes (honesty)
- The win step solves programmatically (fills `puzzle.cells` → fires `allSolved()`/`onWin()`),
  so it exercises the *real* win path deterministically rather than typing 16 words.
- The walkthrough is best-effort: each step is isolated so one flaky interaction never costs the
  others' evidence. Two interactions needed real fixes to pass (not app bugs): Zulu is selected by
  option **value** ("Zulu") because its label is "Zulu (Beta)"; the Learn-Mode toggle is a hidden
  input so its `<label>` is clicked. Both fixed in the spec.
- Native iOS haptic/share execution is **not** in this UAT (needs an Xcode simulator) — covered by
  code review + the web-inertness test in `QA_REPORT.md`.

## Verdict
✅ **Accepted.** Every core user journey produces its expected outcome on both form factors with no
errors. The captured frames double as source material for the store screenshots.
