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

test('Reveal, then Clear, then retyping still does not record a solve or streak', async ({ page }) => {
  await startGame(page);
  await page.locator('#btnMore').click();
  await page.locator('#btnDaily').click();
  // @ts-ignore
  await page.evaluate(async () => { revealPuzzle(); await new Promise(r => setTimeout(r, 150)); });
  await page.locator('#btnMore').click();
  await page.locator('#btnClear').click();
  // @ts-ignore
  await page.evaluate(async () => { puzzle.cells.forEach((v: string, k: string) => guesses.set(k, v)); schedRender(); await new Promise(r => setTimeout(r, 200)); });
  const p = await prof(page);
  expect(p.totalSolved || 0).toBe(0);
  expect(p.dayStreak || 0).toBe(0);
});

test('Expert: Reveal puzzle is refused once the 1-hint budget is used', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maneno_v1_config', JSON.stringify({ complexity: 'expert' })));
  await startGame(page);
  const res = await page.evaluate(async () => {
    // @ts-ignore
    active = { placement: puzzle.placements[0], idx: 0 }; revealLetter();
    // @ts-ignore
    revealPuzzle(); const status = document.getElementById('statusMsg')!.textContent; // read before the pending re-render rewrites it
    await new Promise(r => setTimeout(r, 150));
    // @ts-ignore
    return { hintsUsed, gaveUp, empty: [...guesses.values()].filter((v: string) => !v).length, status };
  });
  expect(res.hintsUsed).toBe(1);
  expect(res.gaveUp).toBe(false);
  expect(res.empty).toBeGreaterThan(0);
  expect(res.status).toContain('No hints left');
});

test('Expert: countdown timeout still reveals the puzzle after the hint budget is used', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('maneno_v1_config', JSON.stringify({ complexity: 'expert', timerMode: 'down', countdownMins: 1 })));
  await startGame(page);
  const res = await page.evaluate(async () => {
    // @ts-ignore
    active = { placement: puzzle.placements[0], idx: 0 }; revealLetter(); timerSec = 1;
    await new Promise(r => setTimeout(r, 2500));
    // @ts-ignore
    return { gameOver, empty: [...guesses.values()].filter((v: string) => !v).length };
  });
  expect(res.gameOver).toBe(true);
  expect(res.empty).toBe(0);
  expect((await prof(page)).totalSolved || 0).toBe(0);
});
