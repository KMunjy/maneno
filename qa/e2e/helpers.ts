import { Page, expect } from '@playwright/test';

/** Load play.html, dismiss first-run onboarding, wait for the grid to render. */
export async function startGame(page: Page) {
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/play.html');
  // First run shows the onboarding modal; dismiss it if present.
  const start = page.locator('#obStart');
  if (await start.isVisible().catch(() => false)) await start.click();
  await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible({ timeout: 10_000 });
  return errors;
}

/** Serialize the current grid (per-cell key + letter) so two states can be compared. */
export async function serializeBoard(page: Page): Promise<string> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('#board [role="gridcell"]'))
      .map(c => (c.getAttribute('data-k') || '') + ':' + (c.querySelector('.lv')?.textContent || ''))
      .join('|')
  );
}

/** Fill every cell with the correct grapheme from page state and fire the win check. */
export async function solveAll(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    // puzzle.cells (key->answer) and guesses are top-level bindings in play.html's classic script;
    // they resolve by bare name in this global-scope eval. onWin/allSolved are window functions.
    // @ts-ignore
    if (typeof puzzle === 'undefined' || !puzzle?.cells) return false;
    // @ts-ignore
    puzzle.cells.forEach((v: string, k: string) => guesses.set(k, v));
    // @ts-ignore
    schedRender();
    // @ts-ignore
    if (allSolved()) { onWin(); return true; }
    return false;
  });
}
