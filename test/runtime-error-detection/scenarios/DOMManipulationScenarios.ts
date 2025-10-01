/**
 * DOM Manipulation Error Scenarios
 *
 * Tests for common DOM-related errors:
 * - querySelector returning null
 * - Event listener on non-existent elements
 * - Manipulating unmounted elements
 * - classList operations on null
 * - Style manipulation errors
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const domManipulationScenarios: TestScenario[] = [
  {
    name: 'querySelector Null Safety',
    description: 'Handle querySelector returning null',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('.nonexistent-class');
          element?.classList.add('test');
          console.log('querySelector null handled correctly');
        } catch (e) {
          console.error('querySelector null handling failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Event Listener on Null Element',
    description: 'Adding event listeners to null elements',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const button = document.querySelector('.nonexistent-button');
          button?.addEventListener('click', () => {
            console.log('Click handled');
          });
          console.log('Event listener null check passed');
        } catch (e) {
          console.error('Event listener failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'classList Operations',
    description: 'classList operations on potentially null elements',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('body');
          element?.classList.add('test-class');
          element?.classList.remove('test-class');
          element?.classList.toggle('test-class');
          console.log('classList operations passed');
        } catch (e) {
          console.error('classList operations failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Style Manipulation',
    description: 'Style property access on null elements',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('.test-element');
          if (element instanceof HTMLElement) {
            element.style.display = 'none';
            element.style.opacity = '0.5';
          }
          console.log('Style manipulation passed');
        } catch (e) {
          console.error('Style manipulation failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'getAttribute on Null',
    description: 'Getting attributes from potentially null elements',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('[data-test]');
          const value = element?.getAttribute('data-test');
          console.log('getAttribute test:', value);
        } catch (e) {
          console.error('getAttribute failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'textContent Assignment',
    description: 'Setting textContent on potentially null elements',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('#content');
          if (element) {
            element.textContent = 'Test content';
          }
          console.log('textContent assignment passed');
        } catch (e) {
          console.error('textContent assignment failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'parentNode Access',
    description: 'Accessing parentNode which might be null',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.querySelector('button');
          const parent = element?.parentNode;
          console.log('parentNode access:', parent?.nodeName);
        } catch (e) {
          console.error('parentNode access failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'children Collection',
    description: 'Accessing children collection',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const container = document.querySelector('#root');
          const childCount = container?.children.length || 0;
          console.log('Children count:', childCount);
        } catch (e) {
          console.error('children access failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'removeChild on Null',
    description: 'Removing child from potentially null parent',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const parent = document.querySelector('.container');
          const child = document.createElement('div');
          parent?.appendChild(child);
          parent?.removeChild(child);
          console.log('removeChild passed');
        } catch (e) {
          console.error('removeChild failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'insertBefore Null Reference',
    description: 'insertBefore with null reference node',
    category: 'null-safety',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const parent = document.querySelector('body');
          const newElement = document.createElement('div');
          const reference = null;
          parent?.insertBefore(newElement, reference);
          parent?.removeChild(newElement);
          console.log('insertBefore null reference passed');
        } catch (e) {
          console.error('insertBefore failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  }
];
