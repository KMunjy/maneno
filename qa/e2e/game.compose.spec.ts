import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

// Regression: typing n-k-o on a physical keyboard in Zulu put "nk" into ONE square
// because "nk" is a prefix of the trigraph "nkc"/"nkq"/"nkx" but not a grapheme itself.
for (const word of ['inkomo', 'intaba', 'umuntu']) {
  test(`Zulu physical keyboard: "${word}" fills one grapheme per square`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('maneno_v1_startlang', 'Zulu'));
    await startGame(page);
    const res = await page.evaluate(async (w) => {
      // @ts-ignore
      const tok = lang.tokenize(w), keys = tok.map((_: any, i: number) => '900,' + i);
      // @ts-ignore  — a synthetic across slot is enough to drive composeKey()
      const pl = { e: [w, '', '', '', 'x'], tok, row: 900, col: 0, dir: 'across', num: 99 };
      // @ts-ignore
      keys.forEach((k: string, i: number) => { puzzle.cells.set(k, tok[i]); guesses.set(k, ''); }); puzzle.placements.push(pl);
      // @ts-ignore
      active = { placement: pl, idx: 0 }; pending = '';
      for (const ch of w) document.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true }));
      // @ts-ignore
      return { want: tok, got: keys.map((k: string) => guesses.get(k)) };
    }, word);
    expect(res.got).toEqual(res.want);
  });
}
