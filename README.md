# bantu_crossword

A grapheme-aware crossword generator for languages whose orthographies use
**digraphs and trigraphs** as single units — built for Bantu languages
(Shona, Swahili, Zulu, Xhosa, Tswana, Sotho) that don't have a strong
crossword tradition and which standard "one letter = one cell" generators
mangle.

The core idea: a word is a sequence of **graphemes**, not characters. One
grapheme fills one grid cell, and crossings happen at the grapheme level. So
Shona `zvombo` is `zv · o · mb · o` (4 cells) and Swahili `ng'ombe` is
`ng' · o · mb · e` (4 cells, apostrophe preserved).

## Scope

**MVP1 targets Shona and Swahili** — the two easiest Bantu languages to
generate crosswords for: regular orthographies, the smallest tokenizer
edge-case surface (only Swahili's `ng'` apostrophe), vowel-heavy structure for
dense crossings, and the best word-list availability. The Nguni group
(Zulu/Xhosa) is deferred — clicks and trigraphs need tuning before they're
puzzle-ready. `configs/zulu.json` is shipped as a **preview only** (flagged in
its `_status` field), not an MVP1 target.

## Files

| Path | Purpose |
|------|---------|
| `crossword.py` | Tokenizer + generator + renderer + CLI (stdlib only) |
| `configs/shona.json`, `swahili.json` | MVP1 language rules |
| `configs/zulu.json` | Deferred preview (not MVP1) |
| `words/shona.json`, `words/swahili.json` | 10-word test datasets with clues |
| `test_tokenizer.py` | Asserts digraphs occupy single cells |

## Usage

```bash
python3 crossword.py --config configs/shona.json --words words/shona.json --show-solution
python3 crossword.py --config configs/swahili.json --words words/swahili.json
python3 test_tokenizer.py
```

## Config structure

```json
{
  "language": "Swahili",
  "atomic_graphemes": ["ng'", "ch", "sh", "gh", "ng", "ny", "mb", "nd"],
  "ignore_casing": true,
  "strip_diacritics": true,
  "preserve_marks": ["'"]
}
```

- **`atomic_graphemes`** — sequences that occupy one cell. Order is irrelevant;
  the tokenizer always uses *longest match first*, so `ng'` beats `ng` beats `n`.
- **`ignore_casing`** — fold to lower case before tokenizing.
- **`strip_diacritics`** — drop combining accents (NFD), but...
- **`preserve_marks`** — ...keep these load-bearing marks (e.g. the apostrophe
  in the Swahili velar nasal `ng'`).

## How generation works

1. Tokenize every word into graphemes; measure length in **cells, not characters**.
2. Place the longest word first, then greedily attach each remaining word at its
   best-scoring legal crossing (most intersections, then most compact).
3. Standard crossword legality: crossings must share the same grapheme; no
   head-to-tail runs; no flush-parallel words. Sweep repeatedly so words that
   couldn't fit early get another chance once their crossing partner lands.
4. Number start-cells in reading order; render blank grid, answer key, and
   Across/Down clues (each clue shows its length in cells).

## Library API

```python
from crossword import Language, Entry, generate

lang = Language.from_json("configs/shona.json")
entries = [Entry("chikoro", "School"), Entry("mbira", "Thumb piano")]
puzzle = generate(entries, lang)
print(puzzle.render_blank())
print(puzzle.render_solution())
print(puzzle.render_clues())
```
