import { test, expect } from '@playwright/test';
import { startGame } from './helpers';

const LEVELS = ['learner', 'intermediate', 'experienced', 'expert'];

test.describe('Difficulty dropdown', () => {
  for (const level of LEVELS) {
    test(`"${level}" applies and rebuilds a valid grid`, async ({ page }) => {
      const errors = await startGame(page);
      await page.locator('#btnMore').click();           // Settings lives in the overflow menu
      await page.locator('#btnSettings').click();
      await expect(page.locator('#settingsDrawer')).toBeVisible();
      await page.locator('#cxSelect').selectOption(level);
      await page.locator('#sdApply').click();
      // New grid renders without error
      await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible();
      expect(await page.locator('#board [role="gridcell"]').count()).toBeGreaterThan(4);
      expect(errors, `console errors on ${level}:\n${errors.join('\n')}`).toEqual([]);
    });
  }
});
