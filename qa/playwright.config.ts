import { defineConfig, devices } from '@playwright/test';

// Serves the parent dir (the static PWA) on :4599 and runs specs against play.html.
// Keeping the harness in qa/ leaves the app root dependency-free (GitHub Pages serves it as-is).
const PORT = 4599;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
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
  ],
});
