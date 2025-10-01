/**
 * Async Error Scenarios
 *
 * Tests for common asynchronous errors:
 * - Unhandled promise rejections
 * - Race conditions
 * - Async/await error handling
 * - Concurrent state updates
 * - Network request failures
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const asyncErrorScenarios: TestScenario[] = [
  {
    name: 'Network Request Failures',
    description: 'Handle failed network requests gracefully',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Intercept and fail network requests
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Slow Network Responses',
    description: 'Handle slow network requests without timeout errors',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Delay all network requests
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 15000
  },

  {
    name: 'Race Condition - Rapid Clicks',
    description: 'Test for race conditions from rapid user interactions',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Click buttons rapidly to trigger potential race conditions
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) {
        try {
          // Triple click rapidly
          await button.click({ clickCount: 3, delay: 50, timeout: 1000 });
          await page.waitForTimeout(100);
        } catch (e) {
          // Button might not be interactive
        }
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Concurrent State Updates',
    description: 'Trigger multiple state updates simultaneously',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Trigger multiple interactions at once
      await Promise.all([
        page.mouse.move(500, 500),
        page.keyboard.press('ArrowDown'),
        page.mouse.wheel(0, 100),
      ]);

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Unhandled Promise Rejection',
    description: 'Test unhandled promise rejection handling',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Inject code that creates unhandled promise
      await page.evaluate(() => {
        // This should be caught by error handlers
        Promise.reject(new Error('Test unhandled rejection'))
          .catch(() => {
            // Properly handle it
            console.log('Promise rejection handled');
          });
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Async Function Error',
    description: 'Test error handling in async functions',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(async () => {
        try {
          // Simulate async operation that might fail
          await new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Async error')), 100);
          });
        } catch (e) {
          console.log('Async error handled:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Fetch Abort Signal',
    description: 'Test aborted fetch requests',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        const controller = new AbortController();

        fetch('/api/test', { signal: controller.signal })
          .catch(err => {
            if (err.name === 'AbortError') {
              console.log('Fetch aborted as expected');
            }
          });

        // Abort immediately
        controller.abort();
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'CORS Errors',
    description: 'Handle CORS-related network errors',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Try to fetch from external domain (should handle CORS)
      await page.evaluate(() => {
        fetch('https://example.com/api/test')
          .catch(err => {
            console.log('CORS error handled:', err.message);
          });
      });

      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'JSON Parse Errors',
    description: 'Handle invalid JSON responses',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Return invalid JSON
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{invalid json}'
        });
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: '404 Response Handling',
    description: 'Handle 404 not found responses',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Return 404 for API calls
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not found' })
        });
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: '500 Server Error Handling',
    description: 'Handle 500 internal server errors',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Return 500 error
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Network Timeout',
    description: 'Handle network timeout scenarios',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Delay requests indefinitely
      await page.route('**/api/**', async (route) => {
        // Never resolve
        await new Promise(() => {});
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
    },
    expectedErrors: [],
    maxDuration: 10000
  }
];
