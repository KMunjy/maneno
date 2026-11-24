import { test, expect } from '@playwright/test';
import { startGame, serializeBoard } from './helpers';

// PR #2 Letters mode on top of the #3/#4/#5 fixes: one letter per square, valid grids,
// paired-letter highlighting, and a Daily that is the same whatever the player settings.
const letters = (cfg?: object) => async ({ page }: any) => {
  await page.addInitScript((c: any) => {
    localStorage.setItem('maneno_v1_mode', 'letters');
    if (c) localStorage.setItem('maneno_v1_config', JSON.stringify(c));
  }, cfg || null);
};

test('Letters mode: one letter per square, valid grids, pairs highlighted (all languages)', async ({ page }) => {
  await letters()({ page });
  await startGame(page);
  const bad = await page.evaluate(() => {
    const out: string[] = [];
    // @ts-ignore
    for (const L of Object.keys(LANGUAGES)) for (let i = 0; i < 8; i++) {
      // @ts-ignore
      newPuzzle(L);
      // @ts-ignore
      for (const [k, v] of puzzle.cells) if (v.length !== 1) out.push(`${L}: multi-letter square ${k}=${v}`);
      // every run of 2+ squares is exactly one word
      // @ts-ignore
      const P = puzzle.placements, C = puzzle.cells, K = (a: number, b: number) => a + ',' + b;
      for (const dir of ['across', 'down']) for (const [k] of C) {
        const [r, c] = k.split(',').map(Number);
        const prev = dir === 'across' ? K(r, c - 1) : K(r - 1, c), next = dir === 'across' ? K(r, c + 1) : K(r + 1, c);
        if (!C.has(prev) && C.has(next)) {
          let n = 0; while (C.has(dir === 'across' ? K(r, c + n) : K(r + n, c))) n++;
          const m = P.filter((p: any) => p.dir === dir && p.row === r && p.col === c && p.tok.length === n);
          if (m.length !== 1) out.push(`${L}: run ${dir}@${k} len ${n} has ${m.length} words`);
        }
      }
      // every square can be typed on the on-screen keypad
      const keys = new Set([...document.querySelectorAll('#keypad button')].map(b => (b as HTMLElement).dataset.g));
      // @ts-ignore
      for (const v of new Set(C.values())) if (!keys.has(v)) out.push(`${L}: no keypad key for "${v}"`);
      // pair highlighting matches words that contain a multi-letter sound in Sounds mode
      // @ts-ignore
      const full = new Language(LANGUAGES[L].config);
      // @ts-ignore
      const expectPairs = P.some((p: any) => full.tokenize(p.e[0]).some((g: string) => g.length > 1));
      // @ts-ignore
      if (expectPairs && document.querySelectorAll('#board .sq.pr').length === 0) out.push(`${L}: no paired squares highlighted`);
    }
    return out;
  });
  expect(bad, bad.slice(0, 5).join('\n')).toEqual([]);
});

async function lettersDaily(browser: any, cfg: object) {
  const page = await (await browser.newContext()).newPage();
  await letters(cfg)({ page });
  await startGame(page);
  await page.locator('#btnMore').click();
  await page.locator('#btnDaily').click();
  return serializeBoard(page);
}
test('Letters mode: Daily is the same whatever the player settings', async ({ browser }) => {
  const a = await lettersDaily(browser, { complexity: 'intermediate', wordTarget: 8 });
  const b = await lettersDaily(browser, { complexity: 'expert', wordTarget: 12 });
  expect(b).toBe(a);
});

test("Letters mode: Swahili ng'ombe apostrophe square has a keypad key", async ({ page }) => {
  await letters()({ page });
  await startGame(page);
  const ok = await page.evaluate(() => {
    // @ts-ignore
    lang = new Language(Object.assign({}, LANGUAGES.Swahili.config, { atomic_graphemes: [] }));
    // @ts-ignore
    const tok = lang.tokenize("ng'ombe"); puzzle.cells.set('900,0', tok[2]); renderKeypad();
    return [...document.querySelectorAll('#keypad button')].some(b => (b as HTMLElement).dataset.g === "'");
  });
  expect(ok).toBe(true);
});
