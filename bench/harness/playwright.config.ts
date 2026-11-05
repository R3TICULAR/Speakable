/**
 * Playwright + Guidepup config for benchmark ground-truth capture.
 *
 * Drives a real screen reader over an ISOLATED, Playwright-launched browser so
 * capture reads page content only (never the operator's browser chrome). This
 * is the v2 capture path; see .kiro/specs/accuracy-benchmark/playwright-integration.md.
 *
 * Dev-only. `bench/` is excluded from the published npm package (`files: dist`).
 *
 *   VoiceOver (macOS):  npx playwright test -c bench/harness/playwright.config.ts --project=webkit
 *   NVDA (Windows):     npx playwright test -c bench/harness/playwright.config.ts --project=chromium
 */
import { devices } from '@playwright/test';
import { withGuidepup } from '@guidepup/playwright';

export default withGuidepup({
  testDir: '.',
  testMatch: /capture\.spec\.ts$/,
  // Screen-reader capture is inherently serial and slow; keep it deterministic.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reportSlowTests: null,
  // Generous: a full-corpus capture walks every case through a real SR.
  timeout: 10 * 60 * 1000,
  projects: [
    // VoiceOver is driven over WebKit/Safari on macOS.
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // NVDA is driven over Chromium on Windows.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
