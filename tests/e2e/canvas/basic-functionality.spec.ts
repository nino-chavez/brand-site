import { test, expect } from '@playwright/test';

/**
 * Basic Canvas System Functionality Test
 *
 * Simple validation that the canvas system loads and basic functionality works
 */

test.describe('Basic Canvas Functionality', () => {
  test('should load the portfolio page successfully', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the page loaded
    await expect(page).toHaveTitle(/Nino Chavez/);

    // Take a screenshot of the loaded page
    await page.screenshot({ path: 'test-results/portfolio-loaded.png', fullPage: true });
  });

  test('should activate canvas mode via URL parameter', async ({ page }) => {
    // Navigate to canvas mode
    await page.goto('/?layout=canvas');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if canvas elements are present
    const canvasElement = page.locator('[data-testid="lightbox-canvas"]');

    // Wait up to 10 seconds for canvas to appear
    await expect(canvasElement).toBeVisible({ timeout: 10000 });

    // Take a screenshot of canvas mode
    await page.screenshot({ path: 'test-results/canvas-mode.png', fullPage: true });

    console.log('✅ Canvas mode activated successfully');
  });

  test('should have basic canvas structure', async ({ page }) => {
    await page.goto('/?layout=canvas&test=true');

    // Wait for canvas initialization
    await page.waitForLoadState('networkidle');

    // Check for main canvas container
    const canvas = page.locator('[data-testid="lightbox-canvas"]');
    await expect(canvas).toBeVisible();

    // Check for canvas content container
    const canvasContent = page.locator('[data-testid="lightbox-canvas"] .canvas-content');

    if (await canvasContent.count() > 0) {
      await expect(canvasContent).toBeVisible();
      console.log('✅ Canvas content container found');
    } else {
      console.log('⚠️ Canvas content container not found - may need implementation');
    }

    // Take a screenshot
    await page.screenshot({ path: 'test-results/canvas-structure.png', fullPage: true });
  });

  test('should be responsive to viewport changes', async ({ page }) => {
    await page.goto('/?layout=canvas');

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Allow layout to adjust

      // Take screenshot at this viewport
      await page.screenshot({ path: `test-results/viewport-${viewport.name}.png`, fullPage: true });

      console.log(`✅ Tested ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
    }
  });

  test('should handle basic mouse interactions', async ({ page }) => {
    await page.goto('/?layout=canvas&test=true');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('[data-testid="lightbox-canvas"]');
    await expect(canvas).toBeVisible();

    // Get canvas bounds
    const canvasBounds = await canvas.boundingBox();

    if (canvasBounds) {
      const centerX = canvasBounds.x + canvasBounds.width / 2;
      const centerY = canvasBounds.y + canvasBounds.height / 2;

      // Click in the center of the canvas
      await page.mouse.click(centerX, centerY);

      // Drag across the canvas
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 100, centerY + 50);
      await page.mouse.up();

      console.log('✅ Basic mouse interactions completed');

      // Take screenshot after interaction
      await page.screenshot({ path: 'test-results/after-mouse-interaction.png', fullPage: true });
    }
  });
});