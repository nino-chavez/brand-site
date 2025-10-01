import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Screenshot Capture
 *
 * Specialized configuration for automated screenshot capture framework.
 * Optimized for stable, reproducible screenshots across multiple viewports.
 */
export default defineConfig({
  testDir: './tests/screenshots',
  outputDir: './tests/screenshots/output/.playwright',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for consistency */
  workers: process.env.CI ? 1 : 4,

  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/screenshots/output/.playwright-report' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL - not used for component capture but useful for flows */
    baseURL: 'http://localhost:3000',

    /* Collect trace on failure */
    trace: 'on-first-retry',

    /* Disable screenshot and video in test config (we handle this manually) */
    screenshot: 'off',
    video: 'off',

    /* Extended timeouts for component loading */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Disable animations globally for stable screenshots */
    reducedMotion: 'reduce',
  },

  /* Single project for screenshot capture - viewports handled in code */
  projects: [
    {
      name: 'chromium-screenshots',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure consistent rendering
        deviceScaleFactor: 2,
        // Disable hardware acceleration for consistent rendering
        launchOptions: {
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
          ],
        },
      },
    },
  ],

  /* Web servers for different capture modes */
  webServer: [
    // Main app server (for flow capture)
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120000,
    },
    // Storybook server (for component capture)
    {
      command: 'npm run storybook',
      url: 'http://localhost:6006',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],

  /* Global timeout for entire test suite */
  timeout: 120000,
});
