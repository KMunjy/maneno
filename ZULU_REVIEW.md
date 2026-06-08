# isiZulu — Native-Speaker Review Checklist (Beta gate)

**Status: BETA.** Zulu ships behind a "Beta" label until a native/fluent isiZulu
speaker signs off on this list. This document is the gate — when a reviewer
confirms the items below, the Beta label can be removed (see "How to graduate"
at the bottom).

## Why Beta
Per the feasibility analysis, accuracy is non-negotiable for a language-learning
tool: a wrong word damages trust across *all* languages, not just Zulu. Zulu's
orthography (click consonants `c/q/x`, digraphs, trigraphs like `ntsh`) is also
the most complex in the app. So Zulu shipped tested-but-Beta, pending human review.

## Machine audit already done (2026-06-08)
An automated linguistic audit of all 59 Zulu entries found:

- **56 / 59 high-confidence correct** (spelling + translation + clue all sound)
- **0 clear errors**
- **3 items tightened or flagged** (below)

This is a *machine* pass — good signal, **not** a substitute for a native speaker.

## Items a native reviewer should confirm

### Already tightened (please confirm the fix reads naturally)
| Word | Was | Now | Note |
|------|-----|-----|------|
| `udadewethu` | clue "udade wakho" (your sister) / "sister" | clue "Udade womndeni wakwethu" / "my sister" | possessive consistency |
| `umfowethu` | clue "umfana wakwethu" / "brother" | clue "Umfana womndeni wakwethu" / "my brother" | possessive consistency |

### Still to confirm
| Word | Question |
|------|----------|
| `intuthwane` | "ant" — both `intuthwane` and `intuthane` are attested; confirm preferred standard form |

### Display-only (not correctness) — optional polish
Phonetic dot-segmentation on a few words doesn't match the digraph table
(e.g. `inja` shown `i·nja`; `ndl` in `indlovu`/`isandla` split inconsistently).
These affect the pronunciation hint display only, never the answer or grid.

## How to graduate Zulu out of Beta
Once a native/fluent speaker has reviewed the full list and is satisfied:
1. In `web/index.html`, find the `Zulu` entry and remove the `beta:true` marker / "Beta" label wiring (search "Beta").
2. Update the language `<option>` label if it shows "(Beta)".
3. Commit: `feat(crossword): graduate Zulu out of Beta after native review`.

Tell me "graduate Zulu" once you've reviewed and I'll make the change.
