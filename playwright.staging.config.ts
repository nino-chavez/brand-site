import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Staging Environment Testing
 *
 * Tests against deployed staging environment at https://nino-chavez.netlify.app
 * - No local dev server required
 * - Tests real production build
 * - Validates deployment configuration
 * - Verifies CDN and hosting behavior
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/staging/',

  /* CRITICAL: Sequential execution for memory isolation */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry staging tests more aggressively due to network variability */
  retries: process.env.CI ? 3 : 1,

  /* Limit workers to prevent overwhelming staging server */
  workers: process.env.CI ? 1 : 2,

  /* Stop after 10 failures to prevent runaway test execution */
  maxFailures: 10,

  /* Reporter to use. */
  reporter: [
    ['html', { outputFolder: 'playwright-report-staging' }],
    ['json', { outputFile: 'test-results/staging/results.json' }],
    ['list']
  ],

  /* Shared settings for all the projects below. */
  use: {
    /* Base URL for staging environment */
    baseURL: 'https://nino-chavez.netlify.app',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'on',

    /* Record video on failure */
    video: 'on',

    /* Extended timeout for network operations */
    actionTimeout: 15000,
    navigationTimeout: 45000,

    /* Browser context isolation to prevent memory leaks */
    contextOptions: {
      reducedMotion: 'no-preference',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'staging-chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-gpu',
            '--enable-hardware-acceleration',
            '--disable-dev-shm-usage',
            '--no-sandbox',
          ]
        }
      },
    },

    {
      name: 'staging-firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'staging-webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'staging-mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'staging-mobile-safari',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },

    /* Test against tablet viewports */
    {
      name: 'staging-ipad',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },
  ],

  /* Global test configuration */
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  /* NO webServer for staging - tests against deployed site */

  /* Visual testing configuration - slightly more lenient for staging due to CDN variations */
  expect: {
    threshold: 0.15,
    toHaveScreenshot: { threshold: 0.25 },
    toMatchSnapshot: { threshold: 0.25 },
  },
});
