import { test, expect } from '@playwright/test';
import { startGame, solveAll } from './helpers';

test.describe('Core solve loop → win screen', () => {
  test('solving every cell fires the win modal with share + stats', async ({ page }) => {
    await startGame(page);
    const won = await solveAll(page);
    expect(won, 'allSolved() did not return true after filling solution').toBe(true);
    // Win modal appears
    await expect(page.locator('#winModal')).toBeVisible();
    await expect(page.locator('#winTitle')).toBeVisible();
    // Share + stats wired
    await expect(page.locator('#winShare')).toBeVisible();
    await expect(page.locator('#winTime')).toBeVisible();
    await expect(page.locator('#winWords')).toBeVisible();
  });

  test('unhappy: wrong entries do NOT trigger a win', async ({ page }) => {
    await startGame(page);
    // Put a deliberately wrong guess in every cell; win must not fire.
    const won = await page.evaluate(() => {
      // @ts-ignore
      if (typeof puzzle === 'undefined') return true;
      // @ts-ignore
      puzzle.cells.forEach((_v: string, k: string) => guesses.set(k, 'zz'));
      // @ts-ignore
      schedRender();
      // @ts-ignore
      return allSolved();
    });
    expect(won).toBe(false);
    await expect(page.locator('#winModal')).toBeHidden();
  });
});
