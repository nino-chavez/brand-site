/**
 * Browser Compatibility Error Scenarios
 *
 * Tests for common cross-browser issues:
 * - Missing browser APIs
 * - Vendor prefix requirements
 * - Feature detection
 * - Polyfill requirements
 * - Browser-specific bugs
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const browserCompatibilityScenarios: TestScenario[] = [
  {
    name: 'IntersectionObserver Support',
    description: 'Check for IntersectionObserver API support',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          if ('IntersectionObserver' in window) {
            console.log('IntersectionObserver supported');
          } else {
            console.log('IntersectionObserver not supported, using fallback');
          }
        } catch (e) {
          console.error('IntersectionObserver check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'ResizeObserver Support',
    description: 'Check for ResizeObserver API support',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(() => {});
            observer.disconnect();
            console.log('ResizeObserver works');
          }
        } catch (e) {
          console.error('ResizeObserver failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'localStorage Availability',
    description: 'Handle localStorage being unavailable (private browsing)',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          localStorage.removeItem('test');
          console.log('localStorage available');
        } catch (e) {
          console.log('localStorage not available, using memory fallback');
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'CSS.supports Check',
    description: 'Feature detect CSS properties',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const supportsGrid = CSS.supports('display', 'grid');
          const supportsFlex = CSS.supports('display', 'flex');
          console.log('Grid support:', supportsGrid, 'Flex support:', supportsFlex);
        } catch (e) {
          console.log('CSS.supports not available');
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'requestAnimationFrame Support',
    description: 'Check for requestAnimationFrame',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const id = requestAnimationFrame(() => {
            console.log('requestAnimationFrame works');
          });
          cancelAnimationFrame(id);
        } catch (e) {
          console.error('requestAnimationFrame failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Web Animations API',
    description: 'Check for Web Animations API support',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const element = document.body;
          if ('animate' in element) {
            const animation = element.animate(
              [{ opacity: 1 }, { opacity: 0.5 }],
              { duration: 100 }
            );
            animation.cancel();
            console.log('Web Animations API supported');
          }
        } catch (e) {
          console.log('Web Animations API not supported');
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Clipboard API Support',
    description: 'Check for Clipboard API availability',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          if (navigator.clipboard) {
            console.log('Clipboard API available');
          } else {
            console.log('Clipboard API not available, using fallback');
          }
        } catch (e) {
          console.error('Clipboard check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Touch Events Support',
    description: 'Detect touch event support',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
          console.log('Touch support:', hasTouch);
        } catch (e) {
          console.error('Touch detection failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Pointer Events Support',
    description: 'Check for Pointer Events API',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const hasPointerEvents = 'onpointerdown' in window;
          console.log('Pointer Events support:', hasPointerEvents);
        } catch (e) {
          console.error('Pointer Events check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Service Worker Support',
    description: 'Check for Service Worker availability',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          if ('serviceWorker' in navigator) {
            console.log('Service Worker supported');
          } else {
            console.log('Service Worker not supported');
          }
        } catch (e) {
          console.error('Service Worker check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'WebGL Support',
    description: 'Check for WebGL context availability',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          console.log('WebGL support:', !!gl);
        } catch (e) {
          console.log('WebGL not supported');
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  },

  {
    name: 'Passive Event Listeners',
    description: 'Check for passive event listener support',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        try {
          let supportsPassive = false;
          try {
            const opts = Object.defineProperty({}, 'passive', {
              get: function() {
                supportsPassive = true;
                return true;
              }
            });
            window.addEventListener('test' as any, null as any, opts);
          } catch (e) {}
          console.log('Passive listeners support:', supportsPassive);
        } catch (e) {
          console.error('Passive listener check failed:', e);
        }
      });

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 5000
  }
];
