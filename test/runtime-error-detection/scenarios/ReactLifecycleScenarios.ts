/**
 * React Lifecycle Error Scenarios
 *
 * Tests for common React-specific errors:
 * - setState on unmounted components
 * - Missing key props in lists
 * - Invalid hook calls
 * - Memory leaks from event listeners
 * - Stale closures in useEffect
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const reactLifecycleScenarios: TestScenario[] = [
  {
    name: 'Rapid Navigation - Unmount Cleanup',
    description: 'Rapidly navigate to trigger unmount scenarios',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Rapidly switch between sections to trigger mount/unmount
      for (let i = 0; i < 5; i++) {
        // Try to find navigation buttons
        const buttons = await page.locator('button, a[href]').all();
        if (buttons.length > 0) {
          const randomButton = buttons[Math.floor(Math.random() * Math.min(3, buttons.length))];
          try {
            await randomButton.click({ timeout: 1000 });
            await page.waitForTimeout(300);
          } catch (e) {
            // Button might not be clickable
          }
        }
        await page.waitForTimeout(200);
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 15000
  },

  {
    name: 'Scroll Performance - useEffect Cleanup',
    description: 'Test scroll event listener cleanup',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Rapid scrolling to test event listener cleanup
      for (let i = 0; i < 10; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(100);
        await page.mouse.wheel(0, -500);
        await page.waitForTimeout(100);
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'Resize Event Cleanup',
    description: 'Test window resize listener cleanup',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Change viewport size multiple times
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(500);
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(500);

      // Navigate away to trigger cleanup
      await page.goto('http://localhost:3000?test=resize');
      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Mouse Event Cleanup',
    description: 'Test mouse event listener cleanup',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Move mouse rapidly
      for (let i = 0; i < 20; i++) {
        await page.mouse.move(Math.random() * 1000, Math.random() * 700);
        await page.waitForTimeout(50);
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Async setState After Unmount',
    description: 'Trigger async operations that might set state after unmount',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Navigate quickly to potentially trigger setState on unmounted component
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForTimeout(100); // Don't wait for full load
      await page.goto('http://localhost:3000'); // Navigate away quickly
      await page.waitForTimeout(2000); // Wait for potential async operations
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'useEffect Dependency Array',
    description: 'Test for stale closures in useEffect',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Interact with UI to trigger state changes
      try {
        await page.click('body', { timeout: 2000 });
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(500);
      } catch (e) {
        // Some interactions might not be available, that's ok
        console.log('    Some interactions not available');
      }
    },
    expectedErrors: [],
    maxDuration: 6000
  },

  {
    name: 'Conditional Hook Calls',
    description: 'Ensure hooks are not called conditionally',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Change layout mode (might trigger different hook paths)
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForLoadState('networkidle');
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'Memory Leak - Interval Cleanup',
    description: 'Test setInterval/setTimeout cleanup',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Stay on page long enough for intervals to run
      await page.waitForTimeout(3000);

      // Navigate away to trigger cleanup
      await page.goto('http://localhost:3000?test=interval');
      await page.waitForTimeout(1000);

      // Check for memory leaks (intervals should be cleared)
      const activeIntervals = await page.evaluate(() => {
        // Can't directly check intervals, but can check for console errors
        return (window as any).__RUNTIME_ERRORS__?.length || 0;
      });

      console.log(`    Active errors: ${activeIntervals}`);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'Focus Event Cleanup',
    description: 'Test focus/blur event listener cleanup',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Focus on various elements
      const focusable = await page.locator('button, input, a, [tabindex]').all();
      for (const element of focusable.slice(0, 5)) {
        try {
          await element.focus({ timeout: 500 });
          await page.waitForTimeout(200);
        } catch (e) {
          // Element might not be focusable
        }
      }

      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 8000
  },

  {
    name: 'Infinite Loop Detection - useEffect Dependencies',
    description: 'Detect maximum update depth exceeded errors from circular dependencies',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Try both layout modes to detect infinite loops
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Check for infinite loop errors
      const infiniteLoopErrors = await page.evaluate(() => {
        const errors = (window as any).__RUNTIME_ERRORS__ || [];
        return errors.filter((e: any) =>
          e.message?.toLowerCase().includes('maximum update depth') ||
          e.message?.toLowerCase().includes('too many re-renders')
        );
      });

      if (infiniteLoopErrors.length > 0) {
        console.log(`    ⚠️  CRITICAL: Detected ${infiniteLoopErrors.length} infinite loop errors`);
        console.log(`    First error: ${infiniteLoopErrors[0]?.message}`);
      }

      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'Canvas Mode Activation - Cursor Lens Interaction',
    description: 'Test canvas mode cursor lens activation for infinite loops and missing cursor position',
    category: 'hooks',
    async execute(page: Page) {
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Move mouse to center of screen
      await page.mouse.move(600, 400);
      await page.waitForTimeout(200);

      // Try click-and-hold activation (300ms)
      await page.mouse.down();
      await page.waitForTimeout(350);
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Check for cursor lens errors
      const lensErrors = await page.evaluate(() => {
        const errors = (window as any).__RUNTIME_ERRORS__ || [];
        return errors.filter((e: any) =>
          e.message?.toLowerCase().includes('cursor') ||
          e.message?.toLowerCase().includes('lens') ||
          e.message?.toLowerCase().includes('maximum update') ||
          e.message?.toLowerCase().includes('position')
        );
      });

      if (lensErrors.length > 0) {
        console.log(`    ⚠️  Found ${lensErrors.length} cursor lens related errors`);
        lensErrors.slice(0, 3).forEach((err: any, i: number) => {
          console.log(`    ${i + 1}. ${err.message}`);
        });
      } else {
        console.log(`    ✓ Canvas mode activation successful, no errors detected`);
      }
    },
    expectedErrors: [],
    maxDuration: 8000
  }
];
