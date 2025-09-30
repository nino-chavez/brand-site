import { test, expect } from '@playwright/test';
import { CanvasTestHelper, VisualRegressionHelper } from '../utils/canvas-helpers';

/**
 * Canvas System Core Functionality Tests
 *
 * Tests the fundamental 2D Canvas Layout System functionality:
 * - Canvas initialization and rendering
 * - Spatial positioning and transforms
 * - Camera movement system
 * - Performance validation
 */

test.describe('Canvas System Core', () => {
  let canvasHelper: CanvasTestHelper;
  let visualHelper: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    visualHelper = new VisualRegressionHelper(page);
    await canvasHelper.initializeCanvas();
  });

  test('should initialize canvas system correctly', async ({ page }) => {
    // Verify canvas element exists and is visible
    const canvas = canvasHelper.getCanvas();
    await expect(canvas).toBeVisible();

    // Verify canvas has correct attributes
    await expect(canvas).toHaveAttribute('role', 'application');
    await expect(canvas).toHaveAttribute('aria-label');

    // Verify canvas content container exists
    const canvasContent = page.locator('[data-testid="lightbox-canvas"] .canvas-content');
    await expect(canvasContent).toBeVisible();

    // Take baseline screenshot
    await visualHelper.compareCanvasLayout('initial-load');
  });

  test('should render all 6 spatial sections', async ({ page }) => {
    // Verify all workflow sections are present
    const sections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    for (const section of sections) {
      const sectionElement = page.locator(`[data-spatial-section="${section}"], [data-section="${section}"]`);
      await expect(sectionElement).toBeVisible();
    }

    // Take screenshot of complete spatial layout
    await visualHelper.compareCanvasLayout('all-sections');
  });

  test('should have correct initial canvas position', async () => {
    const position = await canvasHelper.getCanvasPosition();

    // Verify default position (center)
    expect(position.x).toBeCloseTo(0, 1);
    expect(position.y).toBeCloseTo(0, 1);
    expect(position.scale).toBeCloseTo(1.0, 1);
  });

  test('should perform smooth camera movements', async () => {
    // Test pan-tilt movement
    const targetPosition = { x: 200, y: 150, scale: 1.0 };
    const metrics = await canvasHelper.performCameraMovement(targetPosition);

    // Verify performance requirements
    expect(metrics.fps).toBeGreaterThanOrEqual(55); // 60fps with 5fps tolerance
    expect(metrics.transitionDuration).toBeLessThanOrEqual(1000); // Within 1 second
    expect(metrics.frameTime).toBeLessThanOrEqual(20); // Max 20ms per frame

    // Verify final position
    await canvasHelper.waitForTransition();
    const finalPosition = await canvasHelper.getCanvasPosition();
    expect(finalPosition.x).toBeCloseTo(targetPosition.x, 5);
    expect(finalPosition.y).toBeCloseTo(targetPosition.y, 5);
  });

  test('should maintain 60fps during all camera metaphors', async () => {
    const results = await canvasHelper.testCameraMetaphors();

    // Verify each camera metaphor meets performance requirements
    Object.entries(results).forEach(([metaphor, metrics]) => {
      expect(metrics.fps, `${metaphor} should maintain 60fps`).toBeGreaterThanOrEqual(55);
      expect(metrics.frameTime, `${metaphor} frame time should be <= 20ms`).toBeLessThanOrEqual(20);
      expect(metrics.transitionDuration, `${metaphor} should complete within 1s`).toBeLessThanOrEqual(1000);
    });

    console.log('Camera metaphor performance results:', results);
  });

  test('should handle zoom operations correctly', async () => {
    // Test zoom in
    const zoomInPosition = { x: 0, y: 0, scale: 1.5 };
    await canvasHelper.performCameraMovement(zoomInPosition);
    await canvasHelper.waitForTransition();

    let position = await canvasHelper.getCanvasPosition();
    expect(position.scale).toBeCloseTo(1.5, 1);

    // Take screenshot at zoomed state
    await visualHelper.compareCanvasLayout('zoomed-in');

    // Test zoom out
    const zoomOutPosition = { x: 0, y: 0, scale: 0.8 };
    await canvasHelper.performCameraMovement(zoomOutPosition);
    await canvasHelper.waitForTransition();

    position = await canvasHelper.getCanvasPosition();
    expect(position.scale).toBeCloseTo(0.8, 1);

    // Take screenshot at zoomed out state
    await visualHelper.compareCanvasLayout('zoomed-out');
  });

  test('should respect canvas boundary constraints', async () => {
    // Test movement beyond boundaries
    const extremePosition = { x: 1000, y: 1000, scale: 0.1 };
    await canvasHelper.performCameraMovement(extremePosition);
    await canvasHelper.waitForTransition();

    const position = await canvasHelper.getCanvasPosition();

    // Verify constraints are enforced
    expect(position.x).toBeLessThanOrEqual(600); // Max boundary
    expect(position.x).toBeGreaterThanOrEqual(-600); // Min boundary
    expect(position.y).toBeLessThanOrEqual(400);
    expect(position.y).toBeGreaterThanOrEqual(-400);
    expect(position.scale).toBeGreaterThanOrEqual(0.5); // Min scale
    expect(position.scale).toBeLessThanOrEqual(3.0); // Max scale
  });

  test('should handle rapid camera movements without performance degradation', async ({ page }) => {
    const movements = [
      { x: 100, y: 50, scale: 1.2 },
      { x: -150, y: 100, scale: 0.8 },
      { x: 200, y: -80, scale: 1.5 },
      { x: 0, y: 0, scale: 1.0 }
    ];

    const results = [];

    for (const movement of movements) {
      const metrics = await canvasHelper.performCameraMovement(movement);
      results.push(metrics);
      // Small delay between movements to simulate rapid navigation
      await page.waitForTimeout(100);
    }

    // Verify all movements maintained good performance
    results.forEach((metrics, index) => {
      expect(metrics.fps, `Movement ${index + 1} should maintain 60fps`).toBeGreaterThanOrEqual(50);
    });

    // Verify no memory leaks or performance degradation
    const avgFPS = results.reduce((sum, m) => sum + m.fps, 0) / results.length;
    expect(avgFPS).toBeGreaterThanOrEqual(55);
  });

  test('should maintain visual consistency across viewport sizes', async ({ page }) => {
    // Test at different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1024, height: 768 },  // Tablet landscape
      { width: 768, height: 1024 },  // Tablet portrait
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to adjust

      // Verify canvas remains functional
      const canvas = canvasHelper.getCanvas();
      await expect(canvas).toBeVisible();

      // Test basic movement
      await canvasHelper.performCameraMovement({ x: 100, y: 100, scale: 1.1 });
      await canvasHelper.waitForTransition();

      // Take screenshot for visual regression
      await visualHelper.compareCanvasLayout(`viewport-${viewport.width}x${viewport.height}`);
    }
  });

  test('should work with hardware acceleration disabled', async ({ page }) => {
    // Disable GPU acceleration
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          transform-style: flat !important;
          -webkit-transform-style: flat !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Test basic functionality
    const metrics = await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.2 });

    // Should still work, but might have lower performance
    expect(metrics.fps).toBeGreaterThanOrEqual(30); // Lower threshold for software rendering
    expect(metrics.transitionDuration).toBeLessThanOrEqual(1500); // Allow more time
  });
});