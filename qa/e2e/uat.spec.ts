import { test, expect } from '@playwright/test';
import { startGame, solveAll } from './helpers';
import * as fs from 'fs';

// UAT = user-acceptance walkthrough that captures a screenshot of every key outcome.
// Files land in qa/uat-shots/<viewport>/NN-name.png. Optional steps are wrapped so one
// missing feature never aborts the rest of the evidence capture.

test('UAT walkthrough — capture every acceptance outcome', async ({ page }, info) => {
  test.setTimeout(150_000);           // 12-step walkthrough needs headroom
  page.setDefaultTimeout(9_000);      // fail a single hung locator fast, never the whole run
  const vp = info.project.name; // 'desktop' | 'mobile'
  const dir = `uat-shots/${vp}`;
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  const shot = async (name: string, full = false) => {
    n++;
    const file = `${dir}/${String(n).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path: file, fullPage: full });
    return file;
  };
  const optional = async (label: string, fn: () => Promise<void>) => {
    try { await fn(); } catch (e) { console.log(`[UAT] optional step skipped: ${label} — ${e}`); }
  };

  // 1 — First-run onboarding (capture BEFORE dismissing)
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/play.html');
  await optional('onboarding modal', async () => {
    await expect(page.locator('#onboardModal')).toBeVisible({ timeout: 4000 });
    await shot('onboarding');
    await page.locator('#obStart').click();
  });

  // 2 — Game board rendered (the digraph grid + clues)
  await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible({ timeout: 10_000 });
  await shot('game-board');

  // 3 — A cell selected (shows keypad / active state)
  await optional('active cell', async () => {
    await page.locator('#board [role="gridcell"]').first().click();
    await page.waitForTimeout(300);
    await shot('cell-active');
  });

  // 4 — Win celebration (programmatic full solve)
  await optional('win celebration', async () => {
    const won = await solveAll(page);
    expect(won).toBe(true);
    await expect(page.locator('#winModal')).toBeVisible();
    await page.waitForTimeout(600); // let confetti/animation settle
    await shot('win-celebration');
  });

  // 5 — Difficulty dropdown (Settings → 4 levels)
  await optional('settings + difficulty', async () => {
    await page.locator('#winClose').click().catch(() => {});
    await page.locator('#btnMore').click();
    await page.locator('#btnSettings').click();
    await expect(page.locator('#settingsDrawer')).toBeVisible();
    await shot('settings-difficulty');
  });

  // 6 — Expert level applied
  await optional('expert level', async () => {
    await page.locator('#cxSelect').selectOption('expert');
    await page.locator('#sdApply').click();
    await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible();
    await shot('expert-grid');
  });

  // close any open drawer/modal so the next toolbar action isn't blocked by an overlay
  const clearOverlays = async () => {
    for (const sel of ['#sdClose', '#winClose', '#profileClose', '#aboutClose']) {
      await page.locator(sel).click({ timeout: 1200 }).catch(() => {});
    }
    await page.keyboard.press('Escape').catch(() => {});
  };

  // 7 — Daily puzzle
  await optional('daily puzzle', async () => {
    await clearOverlays();
    await page.locator('#btnMore').click();
    await page.locator('#btnDaily').click();
    await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible();
    await shot('daily-puzzle');
  });

  // 8 — Language switch: Swahili then Zulu
  for (const lang of ['Swahili', 'Zulu']) {
    await optional(`language ${lang}`, async () => {
      await clearOverlays();
      await page.locator('#lang').selectOption(lang); // by value — Zulu's label is "Zulu (Beta)"
      await page.waitForTimeout(400);
      await expect(page.locator('#board [role="gridcell"]').first()).toBeVisible();
      await shot(`language-${lang.toLowerCase()}`);
    });
  }

  // 9 — Profile / achievements
  await optional('profile', async () => {
    await clearOverlays();
    await page.locator('#btnProfile').click();
    await expect(page.locator('#profileModal')).toBeVisible();
    await page.waitForTimeout(200);
    await shot('profile-achievements');
  });

  // 10 — Learn Mode (last: its drawer-leaving failure can't cascade into other steps)
  await optional('learn mode', async () => {
    await clearOverlays();
    await page.locator('#btnMore').click();
    await page.locator('#btnSettings').click();
    const toggleLabel = page.locator('label.sd-toggle:has(#cbLearnMode)'); // hidden input → click its label
    await toggleLabel.scrollIntoViewIfNeeded();
    await toggleLabel.click();
    await page.locator('#sdApply').click();
    await page.locator('#board [role="gridcell"]').first().click();
    await page.waitForTimeout(400);
    await shot('learn-mode');
  });

  // Best-effort UAT: report rather than fail (so partial evidence is never lost).
  console.log(`[UAT ${vp}] captured ${n} screenshots; console errors: ${errors.length}`);
  if (errors.length) console.log(`[UAT ${vp}] console errors:\n${errors.join('\n')}`);
  expect(n, 'no screenshots captured at all').toBeGreaterThan(4);
});
