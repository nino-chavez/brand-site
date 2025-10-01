/**
 * Context Provider Test Scenarios
 *
 * Tests for missing providers, incorrect nesting, and provider-related errors
 */

import type { Page } from 'playwright';
import type { TestScenario } from '../runner/PlaywrightRunner';

export const contextProviderScenarios: TestScenario[] = [
  {
    name: 'Traditional Mode - CanvasState Access',
    description: 'Test CursorLens component in traditional mode without CanvasStateProvider',
    category: 'context',
    async execute(page: Page) {
      // Navigate to traditional mode (default)
      await page.goto('http://localhost:3000');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Wait for CursorLens to mount
      await page.waitForTimeout(2000);

      // Check if any critical errors occurred
      const errors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      // Log errors for debugging
      console.log(`    Found ${errors.length} errors in traditional mode`);
    },
    expectedErrors: [], // Should have NO errors after our fix
    maxDuration: 10000
  },

  {
    name: 'Canvas Mode - CanvasState Access',
    description: 'Test CursorLens component in canvas mode with CanvasStateProvider',
    category: 'context',
    async execute(page: Page) {
      // Navigate to canvas mode
      await page.goto('http://localhost:3000?layout=canvas');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Wait for Canvas to initialize
      await page.waitForTimeout(3000);

      // Check if any critical errors occurred
      const errors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      console.log(`    Found ${errors.length} errors in canvas mode`);
    },
    expectedErrors: [], // Should have NO errors
    maxDuration: 15000
  },

  {
    name: 'Mode Switch - Traditional to Canvas',
    description: 'Test switching from traditional to canvas mode',
    category: 'context',
    async execute(page: Page) {
      // Start in traditional mode
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Click canvas mode button (development mode only)
      const canvasButton = page.locator('button:has-text("Canvas")');
      if (await canvasButton.isVisible()) {
        await canvasButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }

      const errors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      console.log(`    Found ${errors.length} errors during mode switch`);
    },
    expectedErrors: [],
    maxDuration: 15000
  },

  {
    name: 'CursorLens Null Safety',
    description: 'Test CursorLens handles null canvas context gracefully',
    category: 'context',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Try to activate cursor lens
      await page.mouse.move(640, 360);
      await page.waitForTimeout(1000); // Wait for activation delay

      // Move cursor around
      await page.mouse.move(800, 400);
      await page.waitForTimeout(500);
      await page.mouse.move(400, 300);
      await page.waitForTimeout(500);

      const errors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      console.log(`    Found ${errors.length} errors during cursor interaction`);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'Multiple Context Providers',
    description: 'Test all context providers work together',
    category: 'integration',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Check if all providers are working
      const providerStatus = await page.evaluate(() => {
        try {
          // This will be injected by the error capture
          return {
            hasErrors: ((window as any).__RUNTIME_ERRORS__ || []).length > 0,
            url: window.location.href
          };
        } catch (e) {
          return { hasErrors: true, error: String(e) };
        }
      });

      console.log(`    Provider status:`, providerStatus);
    },
    expectedErrors: [],
    maxDuration: 10000
  },

  {
    name: 'UnifiedGameFlow Context',
    description: 'Test UnifiedGameFlow context is available',
    category: 'context',
    async execute(page: Page) {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // Try to navigate between sections (uses GameFlow context)
      const sections = ['capture', 'setup', 'action'];
      for (const section of sections) {
        // Try to find navigation elements
        await page.waitForTimeout(500);
      }

      const errors = await page.evaluate(() => {
        return (window as any).__RUNTIME_ERRORS__ || [];
      });

      console.log(`    Found ${errors.length} errors during GameFlow navigation`);
    },
    expectedErrors: [],
    maxDuration: 15000
  }
];
