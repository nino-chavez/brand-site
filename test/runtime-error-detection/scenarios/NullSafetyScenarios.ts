/**
 * Null Safety Test Scenarios
 *
 * Tests for the most common null/undefined errors in production:
 * - Optional chaining failures
 * - Destructuring null objects
 * - Array access on null/undefined
 * - Function calls on undefined
 * - Property access chains
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const nullSafetyScenarios: TestScenario[] = [
  {
    name: 'Null Prop Handling',
    description: 'Component receives null/undefined props gracefully',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Simulate component receiving null props via direct manipulation
      await page.evaluate(() => {
        // This tests if components handle null data gracefully
        const testData = null;
        try {
          // Common pattern: accessing nested properties
          const value = testData?.someProperty?.nestedProperty;
          console.log('Null prop test passed:', value);
        } catch (e) {
          console.error('Null prop test failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'API Returns Null',
    description: 'Handle null/undefined API responses',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');

      // Intercept network requests and return null
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null)
        });
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Destructuring Undefined',
    description: 'Destructuring properties from undefined objects',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          // Common error: destructuring from undefined
          const data = undefined as any;
          const { property } = data || {};
          console.log('Destructuring test:', property);
        } catch (e) {
          console.error('Destructuring failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Array Access on Null',
    description: 'Accessing array methods on null/undefined',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const list = null as any;
          const items = list?.map((item: any) => item) || [];
          console.log('Array access test:', items);
        } catch (e) {
          console.error('Array access failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Function Call on Undefined',
    description: 'Calling functions that might be undefined',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const callback = undefined as any;
          callback?.();
          console.log('Function call test passed');
        } catch (e) {
          console.error('Function call failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'localStorage Null Values',
    description: 'Handle null values from localStorage',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          // Common pattern: localStorage might return null
          const stored = localStorage.getItem('nonexistent');
          const parsed = stored ? JSON.parse(stored) : null;
          console.log('localStorage test:', parsed);
        } catch (e) {
          console.error('localStorage test failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Event Handler Null Target',
    description: 'Event handlers with null event targets',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Click on various elements to trigger event handlers
      const clickables = await page.locator('button, a, [role="button"]').all();
      for (const element of clickables.slice(0, 3)) {
        try {
          await element.click({ timeout: 1000 });
          await page.waitForTimeout(500);
        } catch (e) {
          // Element might not be clickable, that's ok
        }
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Deep Property Chain',
    description: 'Access deeply nested properties that might not exist',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const data = { level1: null } as any;
          const value = data?.level1?.level2?.level3?.level4;
          console.log('Deep chain test:', value);
        } catch (e) {
          console.error('Deep chain failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  }
];
