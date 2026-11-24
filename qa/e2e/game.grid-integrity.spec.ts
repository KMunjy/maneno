import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

// Regression: a word must never be placed inside (or overlapping) another word in the
// same direction, e.g. "ina" inside "china". Every run of 2+ white cells in a row/column
// must be exactly one clued word, and numbers must follow reading order.
test('every generated grid is a valid crossword (all languages x difficulties)', async ({ page }) => {
  await startGame(page);
  const bad = await page.evaluate(() => {
    const out: string[] = [];
    // @ts-ignore
    for (const L of Object.keys(LANGUAGES)) for (const cx of Object.keys(COMPLEXITY_RULES)) {
      // @ts-ignore
      const lg = new Language(LANGUAGES[L].config), r = COMPLEXITY_RULES[cx];
      for (let i = 0; i < 25; i++) {
        // @ts-ignore
        const p = generateBest(LANGUAGES[L].words, lg, 8, r.maxLen, 14, 20260000 + i, r.minLen || 0);
        const K = (a: number, b: number) => a + ',' + b, runs: any[] = [];
        const ks = [...p.cells.keys()].map((k: string) => k.split(',').map(Number));
        const r0 = Math.min(...ks.map(x => x[0])), r1 = Math.max(...ks.map(x => x[0]));
        const c0 = Math.min(...ks.map(x => x[1])), c1 = Math.max(...ks.map(x => x[1]));
        for (const dir of ['across', 'down']) {
          const [A0, A1, B0, B1] = dir === 'across' ? [r0, r1, c0, c1] : [c0, c1, r0, r1];
          for (let a = A0; a <= A1; a++) { let s: number | null = null;
            for (let b = B0; b <= B1 + 1; b++) { const k = dir === 'across' ? K(a, b) : K(b, a);
              if (b <= B1 && p.cells.has(k)) { if (s === null) s = b; }
              else { if (s !== null && b - s >= 2) runs.push({ dir, r: dir === 'across' ? a : s, c: dir === 'across' ? s : a, len: b - s }); s = null; } } }
        }
        for (const run of runs) {
          const m = p.placements.filter((x: any) => x.dir === run.dir && x.row === run.r && x.col === run.c && x.tok.length === run.len);
          if (m.length !== 1) out.push(`${L}/${cx}/${i}: unclued or overlapping run ${run.dir}@${run.r},${run.c}`);
        }
        if (runs.length !== p.placements.length) out.push(`${L}/${cx}/${i}: ${p.placements.length} placements vs ${runs.length} runs`);
      }
    }
    return out;
  });
  expect(bad, bad.slice(0, 5).join('\n')).toEqual([]);
});
