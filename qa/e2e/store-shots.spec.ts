import { test, expect } from '@playwright/test';
import { startGame, solveAll } from './helpers';
import * as fs from 'fs';

// Curated store screenshots at 1290×2796 (the `store` project supplies the device metrics).
// Conversion-ordered per MARKETING.md ASO. Each frame is a full-viewport shot → exact store spec.
// Run: npx playwright test store-shots.spec.ts --project=store

const DIR = 'store-shots';
const clear = async (page: any) => {
  for (const s of ['#sdClose', '#winClose', '#profileClose', '#aboutClose'])
    await page.locator(s).click({ timeout: 1000 }).catch(() => {});
  await page.keyboard.press('Escape').catch(() => {});
};

test.beforeAll(() => fs.mkdirSync(DIR, { recursive: true }));
test.describe.configure({ mode: 'serial', timeout: 60_000 });

test('store-1 — the grapheme grid (hero)', async ({ page }) => {
  await startGame(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/01-grid.png` });
});

test('store-2 — win celebration', async ({ page }) => {
  await startGame(page);
  expect(await solveAll(page)).toBe(true);
  await expect(page.locator('#winModal')).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${DIR}/02-win.png` });
});

test('store-3 — Learn Mode', async ({ page }) => {
  await startGame(page);
  await page.locator('#btnMore').click();
  await page.locator('#btnSettings').click();
  const toggle = page.locator('label.sd-toggle:has(#cbLearnMode)');
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  await page.locator('#sdApply').click();
  await page.locator('#board [role="gridcell"]').first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/03-learn.png` });
});

test('store-4 — three languages (Zulu shown)', async ({ page }) => {
  await startGame(page);
  await clear(page);
  await page.locator('#lang').selectOption('Zulu'); // value; label is "Zulu (Beta)"
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/04-zulu.png` });
});

test('store-5 — streak & achievements', async ({ page }) => {
  await startGame(page);
  await solveAll(page);            // populate stats so the profile isn't empty
  await clear(page);
  await page.locator('#btnProfile').click();
  await expect(page.locator('#profileModal')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/05-streak.png` });
});
