#!/usr/bin/env python3
"""Tests proving multi-letter graphemes occupy exactly one cell.

Run with:  python3 test_tokenizer.py
(plain asserts, no test framework required)
"""

from crossword import Language, Entry, generate

# --- load the shipped sample configs --------------------------------------
shona = Language.from_json("configs/shona.json")
swahili = Language.from_json("configs/swahili.json")
zulu = Language.from_json("configs/zulu.json")


def check(label, got, expected):
    status = "ok " if got == expected else "FAIL"
    print(f"[{status}] {label}: {got}")
    assert got == expected, f"{label}: expected {expected}, got {got}"


print("== Shona digraph tokenization ==")
# "chikoro" -> ch | i | k | o | r | o  == 6 cells, not 7 letters
check("chikoro", shona.tokenize("chikoro"), ["ch", "i", "k", "o", "r", "o"])
check("chikoro length", shona.length("chikoro"), 6)
# "zvombo" -> zv | o | mb | o == 4 cells, not 6 letters
check("zvombo", shona.tokenize("zvombo"), ["zv", "o", "mb", "o"])
check("zvombo length", shona.length("zvombo"), 4)
# "ngoma" -> ng | o | m | a
check("ngoma", shona.tokenize("ngoma"), ["ng", "o", "m", "a"])
# "tsanga" -> ts | a | ng | a  (two different digraphs in one word)
check("tsanga", shona.tokenize("tsanga"), ["ts", "a", "ng", "a"])
# casing folded
check("CHIKORO casefold", shona.tokenize("CHIKORO"), shona.tokenize("chikoro"))

print("\n== Swahili: preserve the apostrophe in ng' ==")
# "ng'ombe" -> ng' | o | mb | e  : ng' is ONE cell, ng is NOT split out
check("ng'ombe", swahili.tokenize("ng'ombe"), ["ng'", "o", "mb", "e"])
check("ng'ombe length", swahili.length("ng'ombe"), 4)
# the bare "ng" digraph still works when no apostrophe follows
check("ndege", swahili.tokenize("ndege"), ["nd", "e", "g", "e"])
# longest-match: ng' must beat ng must beat n
check("ng'aa", swahili.tokenize("ng'aa"), ["ng'", "a", "a"])
# diacritics stripped but apostrophe preserved
check("diacritic strip", swahili.tokenize("ng'ómbe"), ["ng'", "o", "mb", "e"])

print("\n== Zulu (Beta): clicks, digraphs, trigraphs ==")
# "dlala" -> dl | a | l | a
check("dlala", zulu.tokenize("dlala"), ["dl", "a", "l", "a"])
# nasalised click "nq" is atomic
check("inqola", zulu.tokenize("inqola"), ["i", "nq", "o", "l", "a"])
# "gc" click beats g+c
check("gcina", zulu.tokenize("gcina"), ["gc", "i", "n", "a"])
# real word: indlovu -> dl atomic, prenasalised n+d kept SEPARATE (Zulu convention)
check("indlovu", zulu.tokenize("indlovu"), ["i", "n", "dl", "o", "v", "u"])
# inkomo -> nk is NOT atomic in Zulu (unlike Shona/Swahili); n and k separate
check("inkomo", zulu.tokenize("inkomo"), ["i", "n", "k", "o", "m", "o"])
# double-h digraph + sh
check("ihhashi", zulu.tokenize("ihhashi"), ["i", "hh", "a", "sh", "i"])
# trigraph ntsh is atomic, beats nt+sh
check("ntsh trigraph", zulu.tokenize("intsha"), ["i", "ntsh", "a"])

print("\n== End-to-end: a crossing happens at the GRAPHEME level ==")
# Two words sharing the digraph "ng" should be able to cross on that one cell.
entries = [
    Entry("ngoma", "drum"),
    Entry("tsanga", "grain"),
    Entry("nyika", "land"),
    Entry("amai", "mother"),
]
puzzle = generate(entries, shona)
# Every grid cell must hold exactly one token; assert no cell holds a raw
# 2-char string that was meant to be two separate letters by verifying each
# cell value is a configured grapheme or a single character.
valid = set(shona._ordered) | set("abcdefghijklmnopqrstuvwxyz'")
for coord, tok in puzzle.grid.cells.items():
    assert tok in valid, f"cell {coord} holds non-atomic token {tok!r}"
print(f"[ok ] grid built: {puzzle.stats()}")
print("\nAll tests passed.")
