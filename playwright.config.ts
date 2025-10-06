import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Canvas System Testing
 *
 * Optimized for visual testing of 2D Canvas Layout System with:
 * - Cross-browser compatibility validation
 * - Mobile device testing
 * - Performance monitoring
 * - Visual regression testing
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/',

  /* CRITICAL: Sequential execution for memory isolation */
  /* Parallel execution causes memory leaks to accumulate across browser contexts */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers to prevent memory overload - max 4 concurrent processes */
  workers: process.env.CI ? 1 : 4,

  /* Stop after 10 failures to prevent runaway test execution */
  maxFailures: 10,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3002',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'on',

    /* Record video on failure */
    video: 'on',

    /* Extended timeout for canvas operations */
    actionTimeout: 10000,
    navigationTimeout: 30000,

    /* Browser context isolation to prevent memory leaks */
    contextOptions: {
      reducedMotion: 'no-preference',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure hardware acceleration is enabled for canvas testing
        launchOptions: {
          args: [
            '--enable-gpu',
            '--enable-hardware-acceleration',
            '--disable-dev-shm-usage', // Prevent shared memory issues
            '--no-sandbox', // Required for CI environments
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports for touch gesture validation */
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Enable touch events for mobile testing
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },

    /* Test against tablet viewports */
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },
  ],

  /* Global test configuration */
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Visual testing configuration */
  expect: {
    // Threshold for visual comparisons (0-1, where 1 is perfect match)
    threshold: 0.1,
    // Maximum allowed pixel difference for visual comparisons
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 },
  },
});