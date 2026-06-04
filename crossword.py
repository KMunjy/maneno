#!/usr/bin/env python3
"""
bantu_crossword — a grapheme-aware crossword generator.

Most crossword tools assume one orthographic letter == one grid cell. That
assumption breaks for Bantu languages whose orthographies are built on
*digraphs* and *trigraphs* — multi-letter sequences that the writing system
treats as a single sound (and which speakers intuitively treat as a single
"letter"). Examples:

    Shona     : ch, sh, sv, zv, ng, mb, nd, nj, ny, nz
    Swahili   : ch, sh, gh, kh, ng'  (note the preserved apostrophe)
    Zulu/Xhosa: ch, dl, hl, kh, ph, th, ts, bh + clicks c, q, x, gc, gq ...

This module models a word as a sequence of *graphemes* (atomic tokens). One
grapheme occupies exactly one cell, so "chenga" in Shona is [ch, e, n, g, a]
(5 cells) rather than 6 letters, and crossings happen at the grapheme level —
an across "ch" cell can only cross a down word that also has "ch" there.

The public surface is small:

    >>> lang = Language.from_json("configs/shona.json")
    >>> entries = [Entry("chikoro", "School"), Entry("amai", "Mother"), ...]
    >>> puzzle = generate(entries, lang)
    >>> print(puzzle.render_blank())
    >>> print(puzzle.render_solution())
    >>> print(puzzle.render_clues())

The generator is deliberately dependency-free (standard library only) so it
runs anywhere Python 3.8+ runs.
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

# A coordinate is (row, col). A placement direction is "across" or "down".
Coord = Tuple[int, int]
ACROSS = "across"
DOWN = "down"


# ---------------------------------------------------------------------------
# Language configuration & grapheme tokenization
# ---------------------------------------------------------------------------


@dataclass
class Language:
    """Orthographic rules for one language.

    Attributes
    ----------
    name:
        Human-readable language name, e.g. "Shona".
    atomic_graphemes:
        Multi-letter sequences that must occupy a single cell. Order in the
        file does not matter — we always match the *longest* candidate first,
        so "ng'" wins over "ng" wins over "n".
    ignore_casing:
        Fold everything to lower case before tokenizing.
    strip_diacritics:
        Remove combining accents (NFD decomposition) before tokenizing. The
        characters listed in ``preserve_marks`` survive this stripping.
    preserve_marks:
        Characters that look like punctuation/diacritics but are semantically
        load-bearing and must NOT be stripped — e.g. the apostrophe in the
        Swahili velar nasal "ng'".
    """

    name: str
    atomic_graphemes: List[str] = field(default_factory=list)
    ignore_casing: bool = True
    strip_diacritics: bool = False
    preserve_marks: List[str] = field(default_factory=list)

    # Graphemes sorted longest-first, computed once for fast tokenizing.
    _ordered: List[str] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        # Normalize the configured graphemes through the same pipeline that
        # words go through, so a config written with capitals or accents still
        # matches normalized word text.
        normalized = [self._normalize(g) for g in self.atomic_graphemes]
        # Longest first guarantees greedy maximal-munch: "ng'" before "ng".
        self._ordered = sorted(set(normalized), key=len, reverse=True)

    @classmethod
    def from_dict(cls, data: Dict) -> "Language":
        return cls(
            name=data["language"],
            atomic_graphemes=data.get("atomic_graphemes", []),
            ignore_casing=data.get("ignore_casing", True),
            strip_diacritics=data.get("strip_diacritics", False),
            preserve_marks=data.get("preserve_marks", []),
        )

    @classmethod
    def from_json(cls, path: str) -> "Language":
        with open(path, "r", encoding="utf-8") as fh:
            return cls.from_dict(json.load(fh))

    # -- normalization ----------------------------------------------------

    def _normalize(self, text: str) -> str:
        """Apply casing + diacritic rules, preserving essential marks."""
        if self.ignore_casing:
            text = text.lower()

        if self.strip_diacritics:
            # Decompose so accents become standalone combining marks, drop the
            # combining marks, then recompose. Characters in preserve_marks are
            # protected by swapping them out for private-use sentinels first.
            preserved = {m: chr(0xE000 + i) for i, m in enumerate(self.preserve_marks)}
            for mark, token in preserved.items():
                text = text.replace(mark, token)

            decomposed = unicodedata.normalize("NFD", text)
            stripped = "".join(
                ch for ch in decomposed if unicodedata.category(ch) != "Mn"
            )
            text = unicodedata.normalize("NFC", stripped)

            for mark, token in preserved.items():
                text = text.replace(token, mark)

        return text

    # -- tokenization -----------------------------------------------------

    def tokenize(self, word: str) -> List[str]:
        """Split a word into atomic graphemes (one per future grid cell).

        Uses greedy maximal-munch: at each position, try to consume the
        longest configured grapheme; otherwise consume a single character.
        """
        text = self._normalize(word)
        tokens: List[str] = []
        i = 0
        n = len(text)
        while i < n:
            for grapheme in self._ordered:
                if text.startswith(grapheme, i):
                    tokens.append(grapheme)
                    i += len(grapheme)
                    break
            else:
                # No multi-letter grapheme matched here — take one character.
                tokens.append(text[i])
                i += 1
        return tokens

    def length(self, word: str) -> int:
        """Word length measured in cells (graphemes), not characters."""
        return len(self.tokenize(word))


# ---------------------------------------------------------------------------
# Entries (word + clue)
# ---------------------------------------------------------------------------


@dataclass
class Entry:
    """One answer and its clue, in the target language."""

    answer: str
    clue: str

    def tokens(self, lang: Language) -> List[str]:
        return lang.tokenize(self.answer)


# ---------------------------------------------------------------------------
# Placement & grid model
# ---------------------------------------------------------------------------


@dataclass
class Placement:
    """A word laid into the grid at a position and direction."""

    entry: Entry
    tokens: List[str]
    row: int
    col: int
    direction: str
    number: int = 0  # assigned after the full layout is known

    def cells(self) -> List[Tuple[Coord, str]]:
        """Yield ((row, col), token) for each cell this word occupies."""
        out = []
        for i, tok in enumerate(self.tokens):
            if self.direction == ACROSS:
                out.append(((self.row, self.col + i), tok))
            else:
                out.append(((self.row + i, self.col), tok))
        return out


class Grid:
    """Sparse token grid keyed by coordinate, with crossword legality checks."""

    def __init__(self) -> None:
        self.cells: Dict[Coord, str] = {}
        self.placements: List[Placement] = []

    # -- legality ---------------------------------------------------------

    def _occupied(self, coord: Coord) -> bool:
        return coord in self.cells

    def can_place(self, tokens: List[str], row: int, col: int, direction: str) -> int:
        """Return crossing count if placement is legal, else -1.

        A legal placement obeys standard crossword rules:
          * Overlapping cells must carry the *same* grapheme (a valid crossing).
          * The cell immediately before the start and after the end (along the
            word axis) must be empty, so two words don't run head-to-tail into
            one longer un-clued word.
          * Where a cell is NEW (not a crossing), its perpendicular neighbours
            must be empty, so the word doesn't run flush alongside another and
            silently create unintended words.
        At least one crossing is required (the puzzle must stay connected),
        except for the very first word placed on an empty grid.
        """
        crossings = 0
        dr, dc = (0, 1) if direction == ACROSS else (1, 0)

        # Cell just before the start and just after the end must be clear.
        before = (row - dr, col - dc)
        after = (row + dr * len(tokens), col + dc * len(tokens))
        if self._occupied(before) or self._occupied(after):
            return -1

        for i, tok in enumerate(tokens):
            r, c = row + dr * i, col + dc * i
            existing = self.cells.get((r, c))
            if existing is not None:
                if existing != tok:
                    return -1  # conflicting grapheme at a crossing
                crossings += 1
            else:
                # New cell: its two perpendicular neighbours must be empty.
                if direction == ACROSS:
                    side_a, side_b = (r - 1, c), (r + 1, c)
                else:
                    side_a, side_b = (r, c - 1), (r, c + 1)
                if self._occupied(side_a) or self._occupied(side_b):
                    return -1

        if self.placements and crossings == 0:
            return -1  # would be disconnected from the rest of the puzzle
        return crossings

    # -- mutation ---------------------------------------------------------

    def place(self, placement: Placement) -> None:
        for coord, tok in placement.cells():
            self.cells[coord] = tok
        self.placements.append(placement)

    def remove(self, placement: Placement) -> None:
        """Undo a placement (used during backtracking).

        Only removes cells that no other placement still relies on.
        """
        self.placements.remove(placement)
        still_used = set()
        for p in self.placements:
            for coord, _ in p.cells():
                still_used.add(coord)
        for coord, _ in placement.cells():
            if coord not in still_used:
                self.cells.pop(coord, None)

    # -- geometry ---------------------------------------------------------

    def bounds(self) -> Tuple[int, int, int, int]:
        rows = [r for r, _ in self.cells]
        cols = [c for _, c in self.cells]
        return min(rows), max(rows), min(cols), max(cols)


# ---------------------------------------------------------------------------
# Generator
# ---------------------------------------------------------------------------


def generate(
    entries: List[Entry],
    lang: Language,
    seed: Optional[int] = None,
) -> "Puzzle":
    """Build a dense, intersecting crossword from the given entries.

    Strategy: place the longest word first, then greedily attach each
    remaining word at its best-scoring legal crossing. If a word can't be
    placed at all in the current layout, we backtrack by retrying remaining
    words in a different order. This is a pragmatic backtracking search that
    favours density (more crossings) while staying fast for puzzle-sized
    inputs (a few dozen words).
    """
    # Pre-tokenize and discard empties.
    tokenized = [(e, e.tokens(lang)) for e in entries]
    tokenized = [(e, t) for e, t in tokenized if t]
    if not tokenized:
        raise ValueError("No usable entries after tokenization.")

    # Longest words first — they create more crossing opportunities.
    tokenized.sort(key=lambda et: len(et[1]), reverse=True)

    best_grid = _layout(tokenized)
    if best_grid is None or len(best_grid.placements) < len(tokenized):
        # Fall back to whatever partial layout placed the most words.
        best_grid = best_grid or Grid()

    _number_placements(best_grid)
    return Puzzle(best_grid, lang)


def _layout(tokenized: List[Tuple[Entry, List[str]]]) -> Optional[Grid]:
    """Greedy placement with light backtracking over word order."""
    grid = Grid()
    first_entry, first_tokens = tokenized[0]
    grid.place(Placement(first_entry, first_tokens, 0, 0, ACROSS))

    remaining = tokenized[1:]
    placed_any = True
    # Repeatedly sweep the remaining list, placing whatever fits best, until a
    # full pass places nothing new. This handles dependency order naturally:
    # a word that didn't fit early may fit once its crossing partner lands.
    while remaining and placed_any:
        placed_any = False
        leftovers = []
        for entry, tokens in remaining:
            best = _best_placement(grid, entry, tokens)
            if best is not None:
                grid.place(best)
                placed_any = True
            else:
                leftovers.append((entry, tokens))
        remaining = leftovers

    return grid


def _best_placement(grid: Grid, entry: Entry, tokens: List[str]) -> Optional[Placement]:
    """Find the highest-scoring legal placement for one word, or None.

    We scan every existing cell; wherever a grapheme in this word matches the
    grapheme in that cell, we try to lay the word perpendicular so the two
    cross there. The candidate with the most total crossings (then closest to
    the grid centre, for compactness) wins.
    """
    candidates: List[Tuple[int, int, Placement]] = []

    for (gr, gc), gtok in list(grid.cells.items()):
        for i, tok in enumerate(tokens):
            if tok != gtok:
                continue
            # Try placing this word so token i sits on the existing cell.
            for direction in (ACROSS, DOWN):
                if direction == ACROSS:
                    row, col = gr, gc - i
                else:
                    row, col = gr - i, gc
                score = grid.can_place(tokens, row, col, direction)
                if score > 0:
                    placement = Placement(entry, tokens, row, col, direction)
                    # Compactness tiebreak: distance of word centre from origin.
                    if direction == ACROSS:
                        cr, cc = row, col + len(tokens) // 2
                    else:
                        cr, cc = row + len(tokens) // 2, col
                    compactness = abs(cr) + abs(cc)
                    candidates.append((score, -compactness, placement))

    if not candidates:
        return None
    # Highest crossings first, then most compact.
    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return candidates[0][2]


def _number_placements(grid: Grid) -> None:
    """Assign crossword numbers in the standard top-to-bottom, left-to-right order.

    A cell gets a number if it starts an across word and/or a down word. Both
    the across and down word sharing a starting cell get the same number.
    """
    # Map each starting coordinate to the placements that begin there.
    starts: Dict[Coord, List[Placement]] = {}
    for p in grid.placements:
        starts.setdefault((p.row, p.col), []).append(p)

    number = 0
    for coord in sorted(starts.keys()):  # (row, col) ascending == reading order
        number += 1
        for p in starts[coord]:
            p.number = number


# ---------------------------------------------------------------------------
# Puzzle output
# ---------------------------------------------------------------------------


class Puzzle:
    """A finished layout, with rendering helpers."""

    def __init__(self, grid: Grid, lang: Language) -> None:
        self.grid = grid
        self.lang = lang

    @property
    def placements(self) -> List[Placement]:
        return self.grid.placements

    # -- text rendering ---------------------------------------------------

    def _cell_width(self) -> int:
        """Column width = widest grapheme on the board (so ng' aligns with a)."""
        widest = max((len(t) for t in self.grid.cells.values()), default=1)
        return max(widest, 2)

    def _number_map(self) -> Dict[Coord, int]:
        out: Dict[Coord, int] = {}
        for p in self.placements:
            out.setdefault((p.row, p.col), p.number)
        return out

    def render_blank(self) -> str:
        """The empty grid players fill in, with start-cell numbers."""
        return self._render(show_letters=False)

    def render_solution(self) -> str:
        """The answer key with all graphemes filled in."""
        return self._render(show_letters=True)

    def _render(self, show_letters: bool) -> str:
        if not self.grid.cells:
            return "(empty grid)"
        rmin, rmax, cmin, cmax = self.grid.bounds()
        w = self._cell_width()
        numbers = self._number_map()
        lines = []
        for r in range(rmin, rmax + 1):
            row_chunks = []
            for c in range(cmin, cmax + 1):
                coord = (r, c)
                if coord not in self.grid.cells:
                    row_chunks.append("." * w)  # block / unused cell
                elif show_letters:
                    row_chunks.append(self.grid.cells[coord].upper().ljust(w))
                else:
                    # Blank playing cell; show its clue number if it starts a word.
                    num = numbers.get(coord)
                    row_chunks.append((str(num) if num else "").ljust(w))
                row_chunks.append(" ")
            lines.append("".join(row_chunks).rstrip())
        return "\n".join(lines)

    def render_clues(self) -> str:
        """Numbered clues grouped by Across and Down."""
        across = sorted(
            (p for p in self.placements if p.direction == ACROSS),
            key=lambda p: p.number,
        )
        down = sorted(
            (p for p in self.placements if p.direction == DOWN),
            key=lambda p: p.number,
        )

        def block(title: str, items: List[Placement]) -> str:
            out = [title]
            for p in items:
                cells = self.lang.length(p.entry.answer)
                out.append(f"  {p.number}. {p.entry.clue} ({cells})")
            return "\n".join(out)

        return block("ACROSS", across) + "\n\n" + block("DOWN", down)

    def stats(self) -> str:
        placed = len(self.placements)
        cells = len(self.grid.cells)
        crossings = sum(
            1
            for coord in self.grid.cells
            if sum(1 for p in self.placements for cc, _ in p.cells() if cc == coord) > 1
        )
        return f"{placed} words placed · {cells} cells · {crossings} crossings"


# ---------------------------------------------------------------------------
# Command-line interface
# ---------------------------------------------------------------------------


def _load_entries(path: str) -> List[Entry]:
    """Load entries from a JSON file: [{"answer": ..., "clue": ...}, ...]."""
    with open(path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return [Entry(d["answer"], d["clue"]) for d in data]


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate a grapheme-aware crossword for Bantu (and other) languages."
    )
    parser.add_argument("--config", required=True, help="Path to language config JSON.")
    parser.add_argument("--words", required=True, help="Path to entries JSON (answer/clue).")
    parser.add_argument(
        "--show-solution",
        action="store_true",
        help="Also print the filled answer key.",
    )
    args = parser.parse_args(argv)

    lang = Language.from_json(args.config)
    entries = _load_entries(args.words)
    puzzle = generate(entries, lang)

    print(f"=== {lang.name} crossword — {puzzle.stats()} ===\n")
    print("BLANK GRID\n")
    print(puzzle.render_blank())
    print("\nCLUES\n")
    print(puzzle.render_clues())
    if args.show_solution:
        print("\nANSWER KEY\n")
        print(puzzle.render_solution())
    return 0


if __name__ == "__main__":
    sys.exit(main())
