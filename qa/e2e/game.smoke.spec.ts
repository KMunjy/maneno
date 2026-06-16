import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

test.describe('Smoke — render & no console errors', () => {
  test('grid + clues render cleanly on load', async ({ page }) => {
    const errors = await startGame(page);
    // Board has real cells
    const cells = page.locator('#board [role="gridcell"]');
    expect(await cells.count()).toBeGreaterThan(4);
    // At least one across or down clue is listed
    const clues = page.locator('#acrossClues .ci, #downClues .ci');
    expect(await clues.count()).toBeGreaterThan(0);
    // No runtime console errors during boot
    expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('core controls are present', async ({ page }) => {
    await startGame(page);
    await expect(page.locator('#btnNew')).toBeVisible();
    await expect(page.locator('#btnCheck')).toBeVisible();
    await expect(page.locator('#lang')).toBeVisible();
  });
});
