import { test, expect } from '@playwright/test';
import { startGame, serializeBoard } from './helpers';

test.describe('Daily puzzle — deterministic', () => {
  test('the Daily grid is identical across reloads (same for everyone)', async ({ page }) => {
    await startGame(page);
    await page.locator('#btnMore').click();
    await page.locator('#btnDaily').click();
    const first = await serializeBoard(page);
    expect(first.length).toBeGreaterThan(0);

    // Reload, re-enter Daily — must reproduce the same grid (seeded by date).
    await page.reload();
    if (await page.locator('#obStart').isVisible().catch(() => false)) await page.locator('#obStart').click();
    await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible();
    await page.locator('#btnMore').click();
    await page.locator('#btnDaily').click();
    const second = await serializeBoard(page);

    expect(second).toBe(first);
  });
});
