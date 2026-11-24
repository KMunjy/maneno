import { test, expect } from '@playwright/test';
import { startGame, serializeBoard } from './helpers';

// Regression: the Daily grid depended on the player's difficulty, word count and category,
// so two players sharing "Daily #N" were solving different puzzles.
async function dailyFor(page: any, cfg: object) {
  await page.addInitScript((c: any) => localStorage.setItem('maneno_v1_config', JSON.stringify(c)), cfg);
  await startGame(page);
  await page.locator('#btnMore').click();
  await page.locator('#btnDaily').click();
  return serializeBoard(page);
}
test('Daily grid is the same whatever the player settings', async ({ browser }) => {
  const a = await dailyFor(await (await browser.newContext()).newPage(), { complexity: 'intermediate', wordTarget: 8 });
  const b = await dailyFor(await (await browser.newContext()).newPage(), { complexity: 'expert', wordTarget: 12 });
  const c = await dailyFor(await (await browser.newContext()).newPage(), { complexity: 'learner', wordTarget: 4 });
  expect(b).toBe(a);
  expect(c).toBe(a);
});
