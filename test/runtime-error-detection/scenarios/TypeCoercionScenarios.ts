/**
 * Type Coercion Error Scenarios
 *
 * Tests for common JavaScript type-related errors:
 * - Type coercion failures
 * - NaN operations
 * - String/Number conversions
 * - Array vs Object confusion
 * - typeof checks
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const typeCoercionScenarios: TestScenario[] = [
  {
    name: 'NaN Handling',
    description: 'Handle NaN values in calculations',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const value = parseInt('not a number');
          const result = isNaN(value) ? 0 : value;
          console.log('NaN handling:', result);
        } catch (e) {
          console.error('NaN handling failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'String to Number Conversion',
    description: 'Handle string to number conversion edge cases',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const testCases = ['123', '123.45', '', 'abc', null, undefined];
          testCases.forEach(test => {
            const num = Number(test);
            const safe = isNaN(num) ? 0 : num;
            console.log(`Converted ${test} to ${safe}`);
          });
        } catch (e) {
          console.error('String to number conversion failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Array.isArray Check',
    description: 'Properly check if value is an array',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const testCases = [[], {}, null, undefined, 'string', 123];
          testCases.forEach(test => {
            if (Array.isArray(test)) {
              console.log('Is array:', test);
            } else {
              console.log('Not array:', typeof test);
            }
          });
        } catch (e) {
          console.error('Array.isArray check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'typeof Null Bug',
    description: 'Handle typeof null === "object" edge case',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const value = null;
          const isObject = typeof value === 'object' && value !== null;
          console.log('Null typeof check:', isObject);
        } catch (e) {
          console.error('typeof null check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Infinity Handling',
    description: 'Handle Infinity and -Infinity values',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const value = 1 / 0;
          const safe = isFinite(value) ? value : 0;
          console.log('Infinity handling:', safe);
        } catch (e) {
          console.error('Infinity handling failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'JSON.parse Error',
    description: 'Handle JSON.parse failures',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const testCases = ['{"valid": true}', '{invalid}', '', 'null'];
          testCases.forEach(test => {
            try {
              const parsed = JSON.parse(test);
              console.log('Parsed:', parsed);
            } catch (e) {
              console.log('Parse failed for:', test);
            }
          });
        } catch (e) {
          console.error('JSON.parse test failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Boolean Coercion',
    description: 'Handle falsy value coercion',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const falsyValues = [false, 0, '', null, undefined, NaN];
          falsyValues.forEach(value => {
            const bool = Boolean(value);
            console.log(`${value} coerces to ${bool}`);
          });
        } catch (e) {
          console.error('Boolean coercion failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Object Property Type',
    description: 'Check object property types safely',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const obj: any = { num: 123, str: 'test', bool: true, nil: null };
          Object.keys(obj).forEach(key => {
            const type = typeof obj[key];
            console.log(`${key} is ${type}`);
          });
        } catch (e) {
          console.error('Property type check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Date Parse Errors',
    description: 'Handle invalid date parsing',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const testDates = ['2025-01-01', 'invalid', '', null];
          testDates.forEach(test => {
            const date = new Date(test as any);
            const valid = !isNaN(date.getTime());
            console.log(`Date ${test} is ${valid ? 'valid' : 'invalid'}`);
          });
        } catch (e) {
          console.error('Date parse failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Number.isInteger Check',
    description: 'Safely check if value is an integer',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const testCases = [1, 1.5, '1', null, undefined, NaN, Infinity];
          testCases.forEach(test => {
            const isInt = Number.isInteger(test);
            console.log(`${test} is integer: ${isInt}`);
          });
        } catch (e) {
          console.error('isInteger check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  }
];
