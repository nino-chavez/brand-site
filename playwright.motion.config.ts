/**
 * Playwright Motion Testing Configuration
 *
 * Specialized config for motion and animation testing with video recording.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/motion',
  fullyParallel: false, // Run sequentially for consistent video recording
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for video recording consistency

  reporter: [
    ['html', { outputFolder: 'playwright-report-motion' }],
    ['list'],
    ['json', { outputFile: 'test-results/motion-results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3000?test=true', // Skip loading screen in tests
    trace: 'retain-on-failure',
    video: 'on', // Always record video for motion tests
    screenshot: 'on',

    // Slower animations for better video capture
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // High quality video settings
        video: {
          mode: 'on',
          size: { width: 1920, height: 1080 },
        },
      },
    },

    // Optional: Test motion on mobile viewport
    {
      name: 'mobile-motion',
      use: {
        ...devices['iPhone 13'],
        // Mobile video recording
        video: {
          mode: 'on',
          size: { width: 390, height: 844 },
        },
      },
    },
  ],

  // Make sure dev server is running
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
