# Maneno — Clue Audit & Native-Review Package

Accuracy gate before any app-store launch. The **answers** (spellings) are high-confidence;
the **in-language clues** are the higher-risk machine-generated part and need a native pass.

## How to do the review
1. Open **`/review.html`** (live: https://kmunjy.github.io/maneno/review.html).
2. Pick a language, tick **OK** or **Flag** + note per word. Filter to **Audit-flagged** to do the priority items first.
3. Click **Export results** → send the CSV back; I'll apply the corrections.

## Automated audit summary (machine screen — not a native speaker)
| Language | Entries | High-confidence correct | Flagged for review |
|---|---|---|---|
| Shona | 208 | ~190 | 12 |
| Swahili | 204 | ~190 | 8 |
| Zulu (Beta) | 144 | ~131 | 12 |

## Auto-fixed already (clear, objective errors)
| Lang | Word | Field | Was → Now |
|---|---|---|---|
| Shona | bota | clue | "…mangwana" (tomorrow) → "…mangwanani" (in the morning) |
| Shona | nhasi | clue | "Nhasi ndirini?" (nonsensical) → "Zuva ratiri kurarama iri zvino" |
| Shona | dunhu | clue | "Nzvimbo yakacherwa" (a dug place) → "Chikamu chenyika" (district) |
| Shona | mzukuru | — | removed (misspelled duplicate of *muzukuru*) |
| Swahili | tembo | clue | "…mkono mrefu" (arm) → "…mkonga mrefu" (trunk) |

## Flagged for native review (priority — surfaced in review.html "Audit-flagged" filter)

### Shona
- **jani** — "leaf" is usually *shizha*; *jani* is colloquial. Confirm.
- **soko** — glossed "monkey"; standard is *shoko/tsoko* ( *soko* often = word/totem). Verify.
- **manhanga** — clue wording "kumudzimba" non-standard.
- **tsanga** — clue lacks headword precision (single grain/stalk).
- **chitubu** — spring/fountain; confirm vs *tsime*.
- **gonye** — worm vs maggot/caterpillar nuance.
- **twiza** — giraffe; confirm preferred standard.
- **mango** — English borrowing; confirm vs *manga*.
- **maungu** — overlaps with pumpkin sense; confirm distinction.
- **chiso / huro** — minor clue-concord grammar.
- **awa** — "hour" (borrowing) + clue uses *maminitsi* (borrowing); confirm acceptability.

### Swahili
- **kima / nyani** — monkey-vs-baboon clues overlap (*kima* = blue/Sykes' monkey; *nyani* = baboon). Untangle.
- **mvua** — clue "inanyesha siku ya leo" → "inanyesha leo" more natural.
- **utu** — glossed "ubuntu/humanity"; *ubuntu* is Nguni — prefer "humanity/dignity" for Swahili.
- **elfu** — clue weak/vague.
- **buibui** (also = woman's veil), **saa**, **ardhi** (phonetic split) — low priority, confirm.

### Zulu (Beta — extra scrutiny)
- **unkosikazi** — spelling: confirm standard form.
- **ubabamkhulu** — clue grammar ("Uyise kayihlo") + overlaps base *umkhulu*.
- **umfowabo / udadewethu / umfowethu** — clues are circular/loose; tighten ("a brother/sister you were born with").
- **isele** — clue contains suspect word *esiqolo*; rewrite.
- **umyeni / ihhashi / inyoka** — verb concords/forms to confirm.
- **umngane** — "umuntu omthandayo" (a person you love) → better "a person you're friends with".
- **imamba / intombazane** — minor; confirm.

## Note
This is a *screen*, not a verdict — only a native/fluent speaker's sign-off graduates the
clues (and lifts Zulu out of Beta). The reviewer tool makes that pass fast and trackable.
