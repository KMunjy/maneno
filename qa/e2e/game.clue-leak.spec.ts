import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

// Regression: 219 of 800 clues (Shona 97, Swahili 121, Zulu 1) contain the answer word itself,
// e.g. MOMBE -> "Mombe inodya uswa". Clues must never show their own answer.
test('no clue shown in the clue lists contains its own answer', async ({ page }) => {
  await startGame(page);
  for (const L of ['Shona', 'Swahili', 'Zulu']) {
    await page.selectOption('#lang', L);
    const leaks = await page.evaluate(() => {
      const out: string[] = [];
      // @ts-ignore
      for (const p of puzzle.placements) {
        const el = document.querySelector(`.ci[data-n="${p.num}"][data-d="${p.dir}"]`);
        const text = (el?.firstElementChild?.nextElementSibling?.childNodes[0]?.textContent || '').toLowerCase();
        if (text.split(/[^a-z']+/).includes(p.e[0].toLowerCase())) out.push(p.e[0] + ': ' + text);
      }
      return out;
    });
    expect(leaks, L).toEqual([]);
  }
});
