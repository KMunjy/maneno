import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

// Regression: "Word count 8" produced ~16 words, and Zulu Learner (max 4 squares) silently
// fell back to 6-9 square words when a category had fewer than 4 short words.
test('word count setting is an upper bound', async ({ page }) => {
  await startGame(page);
  const over = await page.evaluate(() => {
    const out: string[] = [];
    // @ts-ignore
    for (const L of Object.keys(LANGUAGES)) { const lg = new Language(LANGUAGES[L].config);
      for (const wt of [4, 8, 12]) for (let i = 0; i < 10; i++) {
        // @ts-ignore
        const p = generateBest(LANGUAGES[L].words, lg, wt, 99, 14, 777 + i, 0);
        if (p.placements.length > wt) out.push(`${L} wt${wt}: ${p.placements.length}`);
      } }
    return out;
  });
  expect(over).toEqual([]);
});
test('Zulu Learner keeps words within 4 squares in every category', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('maneno_v1_startlang', 'Zulu'); localStorage.setItem('maneno_v1_config', JSON.stringify({ complexity: 'learner' })); });
  await startGame(page);
  const tooLong = await page.evaluate(() => {
    const out: string[] = [];
    // @ts-ignore
    for (const [cat] of CATEGORIES) { activeCat = cat; newPuzzle('Zulu');
      // @ts-ignore
      for (const p of puzzle.placements) if (p.tok.length > 4) out.push(`${cat}: ${p.e[0]}`); }
    return out;
  });
  expect(tooLong).toEqual([]);
});
