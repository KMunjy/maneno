import { test, expect } from '@playwright/test';
import { startGame, solveAll } from './helpers';

test.describe('Share fallback + native-bridge inertness (the iOS-bridge diff)', () => {
  test('web Share path: navigator.share receives the Maneno result text', async ({ page }) => {
    // Stub navigator.share BEFORE app code runs; capture the payload.
    await page.addInitScript(() => {
      (window as any).__shared = null;
      (navigator as any).share = (data: any) => { (window as any).__shared = data; return Promise.resolve(); };
    });
    await startGame(page);
    await solveAll(page);
    await expect(page.locator('#winShare')).toBeVisible();
    await page.locator('#winShare').click();
    const shared = await page.evaluate(() => (window as any).__shared);
    expect(shared, 'navigator.share was not called').not.toBeNull();
    expect(shared.title).toBe('Maneno');
    expect(String(shared.text)).toContain('Maneno');
  });

  test('the Capacitor bridge is inert in a browser (no window.Capacitor)', async ({ page }) => {
    await startGame(page);
    const hasCap = await page.evaluate(() => typeof (window as any).Capacitor !== 'undefined');
    expect(hasCap, 'window.Capacitor should be undefined on web → native branch never taken').toBe(false);
  });

  test('clipboard fallback when no share API: a toast confirms', async ({ page }) => {
    await page.addInitScript(() => {
      // No navigator.share; clipboard succeeds. navigator.clipboard is a read-only getter,
      // so override via defineProperty (plain assignment is silently ignored).
      try { delete (navigator as any).share; } catch {}
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.resolve() },
      });
    });
    await startGame(page);
    await solveAll(page);
    await page.locator('#winShare').click();
    await expect(page.locator('#toast')).toContainText(/copied/i, { timeout: 4000 });
  });
});
