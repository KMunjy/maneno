import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

const prof = (page: any) => page.evaluate(() => JSON.parse(localStorage.getItem('maneno_v1_profile') || '{}'));

test('Reveal puzzle does not count as a solve or extend the daily streak', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maneno_v1_config', JSON.stringify({ complexity: 'expert' })));
  await startGame(page);
  await page.locator('#btnMore').click();
  await page.locator('#btnDaily').click();
  // @ts-ignore
  await page.evaluate(async () => { revealPuzzle(); await new Promise(r => setTimeout(r, 200)); });
  const p = await prof(page);
  expect(p.totalSolved || 0).toBe(0);
  expect(p.dayStreak || 0).toBe(0);
});

test('Learn mode study phase (answers shown) never records a clean solve', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maneno_v1_config', JSON.stringify({ complexity: 'learner', learnMode: true, timerMode: 'off' })));
  await startGame(page);
  // @ts-ignore
  await page.evaluate(async () => { const pl = puzzle.placements[0]; active = { placement: pl, idx: 0 }; typeGrapheme(pl.tok[0]); await new Promise(r => setTimeout(r, 200)); });
  const p = await prof(page);
  expect(p.cleanSolves || 0).toBe(0);
  await expect(page.locator('#winModal')).toBeHidden();
});

test('Clear after a hint does not make the solve clean again', async ({ page }) => {
  await startGame(page);
  // @ts-ignore
  await page.evaluate(() => { active = { placement: puzzle.placements[0], idx: 0 }; revealLetter(); });
  await page.locator('#btnMore').click();
  await page.locator('#btnClear').click();
  // @ts-ignore
  expect(await page.evaluate(() => cleanSolve)).toBe(false);
});
