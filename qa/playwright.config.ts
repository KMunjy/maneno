import { defineConfig, devices } from '@playwright/test';

// Serves the parent dir (the static PWA) on :4599 and runs specs against play.html.
// Keeping the harness in qa/ leaves the app root dependency-free (GitHub Pages serves it as-is).
const PORT = 4599;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: { baseURL: `http://localhost:${PORT}/`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    cwd: '..',
    url: `http://localhost:${PORT}/play.html`,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile',  use: { ...devices['Pixel 5'] } },
    // Store screenshots: mobile layout at exactly 1290×2796 (App Store 6.7" / Play phone).
    { name: 'store', use: { browserName: 'chromium', viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3, isMobile: true, hasTouch: true } },
    // Post-deploy smoke against the LIVE GitHub Pages site (note trailing slash → /maneno/ subpath).
    { name: 'live', use: { ...devices['Desktop Chrome'], baseURL: 'https://kmunjy.github.io/maneno/' } },
  ],
});
