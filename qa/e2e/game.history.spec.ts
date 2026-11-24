import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

// Regression: history is newest-first (unshift) but save() kept slice(-20) = the OLDEST 20,
// so after 20 solves new results vanished from history and the 14-day calendar on reload.
test('profile history keeps the newest 20 entries', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1');
    const h = Array.from({ length: 20 }, (_, i) => ({ date: '1/1/2020', lang: 'Shona', cx: 'old' + i, secs: 60, clean: true }));
    localStorage.setItem('maneno_v1_profile', JSON.stringify({ history: h, totalSolved: 20 }));
  });
  await startGame(page);
  // @ts-ignore
  await page.evaluate(() => Profile.recordSolve(42, true, 'Shona', 'NEW', 5));
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('maneno_v1_profile')!).history);
  expect(saved.length).toBe(20);
  expect(saved[0].cx).toBe('NEW');
});
