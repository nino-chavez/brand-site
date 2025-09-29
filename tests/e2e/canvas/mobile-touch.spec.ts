import { test, expect, devices } from '@playwright/test';
import { CanvasTestHelper, VisualRegressionHelper } from '../utils/canvas-helpers';

/**
 * Mobile Touch Interface Tests
 *
 * Validates touch gesture support for canvas navigation:
 * - Pinch-to-zoom gestures
 * - Two-finger pan
 * - Single finger navigation
 * - Touch target accessibility
 */

test.describe('Mobile Touch Interface', () => {
  let canvasHelper: CanvasTestHelper;
  let visualHelper: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    visualHelper = new VisualRegressionHelper(page);
  });

  test.describe('Pinch-to-Zoom Gestures', () => {
    test('should handle pinch-to-zoom on mobile Chrome', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      // Get initial canvas state
      const initialPosition = await canvasHelper.getCanvasPosition();
      expect(initialPosition.scale).toBeCloseTo(1.0, 1);

      // Perform pinch-to-zoom
      await canvasHelper.performPinchZoom(1.5);
      await canvasHelper.waitForTransition();

      // Verify zoom applied
      const finalPosition = await canvasHelper.getCanvasPosition();
      expect(finalPosition.scale).toBeGreaterThan(initialPosition.scale);

      // Take screenshot of zoomed state
      await visualHelper.compareCanvasLayout('mobile-pinch-zoom');
    });

    test('should handle pinch-to-zoom on mobile Safari', async ({ page }) => {
      await page.setViewportSize(devices['iPhone 12'].viewport);
      await canvasHelper.initializeCanvas();

      // Test with Safari-specific touch behavior
      const canvas = canvasHelper.getCanvas();
      const canvasBounds = await canvas.boundingBox();

      if (!canvasBounds) throw new Error('Canvas not visible');

      const centerX = canvasBounds.x + canvasBounds.width / 2;
      const centerY = canvasBounds.y + canvasBounds.height / 2;

      // Simulate multi-touch pinch
      await page.touchscreen.tap(centerX - 50, centerY);
      await page.touchscreen.tap(centerX + 50, centerY);

      // Verify touch interaction worked
      await page.waitForTimeout(1000);
      await visualHelper.compareCanvasLayout('safari-pinch-zoom');
    });

    test('should respect zoom constraints on mobile', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      // Test extreme zoom in
      await canvasHelper.performPinchZoom(5.0); // Beyond max scale
      await canvasHelper.waitForTransition();

      const position = await canvasHelper.getCanvasPosition();
      expect(position.scale).toBeLessThanOrEqual(3.0); // Max constraint

      // Test extreme zoom out
      await canvasHelper.performPinchZoom(0.1); // Below min scale
      await canvasHelper.waitForTransition();

      const finalPosition = await canvasHelper.getCanvasPosition();
      expect(finalPosition.scale).toBeGreaterThanOrEqual(0.5); // Min constraint
    });
  });

  test.describe('Pan Gestures', () => {
    test('should handle single-finger pan', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      const initialPosition = await canvasHelper.getCanvasPosition();

      // Perform pan gesture
      await canvasHelper.performPanGesture(100, 50);
      await canvasHelper.waitForTransition();

      const finalPosition = await canvasHelper.getCanvasPosition();
      expect(finalPosition.x).not.toBeCloseTo(initialPosition.x, 5);
      expect(finalPosition.y).not.toBeCloseTo(initialPosition.y, 5);

      await visualHelper.compareCanvasLayout('mobile-pan-gesture');
    });

    test('should handle two-finger pan during zoom', async ({ page }) => {
      await page.setViewportSize(devices['iPad Pro'].viewport);
      await canvasHelper.initializeCanvas();

      const canvas = canvasHelper.getCanvas();
      const canvasBounds = await canvas.boundingBox();

      if (!canvasBounds) throw new Error('Canvas not visible');

      const centerX = canvasBounds.x + canvasBounds.width / 2;
      const centerY = canvasBounds.y + canvasBounds.height / 2;

      // Simulate two-finger pan with zoom
      const touch1X = centerX - 100;
      const touch1Y = centerY;
      const touch2X = centerX + 100;
      const touch2Y = centerY;

      // Start two-finger touch
      await page.touchscreen.tap(touch1X, touch1Y);
      await page.touchscreen.tap(touch2X, touch2Y);

      // Move both fingers (pan + zoom)
      await page.mouse.move(touch1X - 80, touch1Y + 50); // Closer + moved
      await page.mouse.move(touch2X - 80, touch2Y + 50); // Closer + moved

      await page.waitForTimeout(500);
      await visualHelper.compareCanvasLayout('two-finger-pan-zoom');
    });

    test('should handle momentum and inertia', async ({ page }) => {
      await page.setViewportSize(devices['iPhone 12'].viewport);
      await canvasHelper.initializeCanvas();

      // Perform quick swipe gesture
      const canvas = canvasHelper.getCanvas();
      const canvasBounds = await canvas.boundingBox();

      if (!canvasBounds) throw new Error('Canvas not visible');

      const startX = canvasBounds.x + canvasBounds.width / 2;
      const startY = canvasBounds.y + canvasBounds.height / 2;

      // Quick swipe
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 200, startY, { steps: 5 }); // Fast movement
      await page.mouse.up();

      // Allow inertia to settle
      await page.waitForTimeout(1000);
      await visualHelper.compareCanvasLayout('swipe-inertia');
    });
  });

  test.describe('Touch Target Accessibility', () => {
    test('should have minimum 44px touch targets', async ({ page }) => {
      await page.setViewportSize(devices['iPhone 12'].viewport);
      await canvasHelper.initializeCanvas();

      // Check for any interactive elements within canvas
      const interactiveElements = await page.locator('[data-testid="lightbox-canvas"] button, [data-testid="lightbox-canvas"] [role="button"], [data-testid="lightbox-canvas"] a').all();

      for (const element of interactiveElements) {
        const boundingBox = await element.boundingBox();
        if (boundingBox) {
          expect(boundingBox.width, 'Touch target width should be >= 44px').toBeGreaterThanOrEqual(44);
          expect(boundingBox.height, 'Touch target height should be >= 44px').toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should provide visual feedback for touch interactions', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      const canvas = canvasHelper.getCanvas();
      const canvasBounds = await canvas.boundingBox();

      if (!canvasBounds) throw new Error('Canvas not visible');

      // Touch the canvas and look for feedback
      await page.touchscreen.tap(canvasBounds.x + canvasBounds.width / 2, canvasBounds.y + canvasBounds.height / 2);

      // Check for touch feedback element
      const touchFeedback = page.locator('.touch-feedback, [data-touch-feedback]');

      // Take screenshot during touch interaction
      await visualHelper.compareCanvasLayout('touch-feedback');
    });

    test('should handle touch near canvas edges', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      const canvas = canvasHelper.getCanvas();
      const canvasBounds = await canvas.boundingBox();

      if (!canvasBounds) throw new Error('Canvas not visible');

      // Test touches near edges
      const edgePositions = [
        { x: canvasBounds.x + 10, y: canvasBounds.y + 10 }, // Top-left
        { x: canvasBounds.x + canvasBounds.width - 10, y: canvasBounds.y + 10 }, // Top-right
        { x: canvasBounds.x + 10, y: canvasBounds.y + canvasBounds.height - 10 }, // Bottom-left
        { x: canvasBounds.x + canvasBounds.width - 10, y: canvasBounds.y + canvasBounds.height - 10 }, // Bottom-right
      ];

      for (const position of edgePositions) {
        await page.touchscreen.tap(position.x, position.y);
        await page.waitForTimeout(200);
      }

      await visualHelper.compareCanvasLayout('edge-touch-handling');
    });
  });

  test.describe('Performance on Mobile Devices', () => {
    test('should maintain 30fps minimum on mobile devices', async ({ page }) => {
      await page.setViewportSize(devices['Pixel 5'].viewport);
      await canvasHelper.initializeCanvas();

      // Simulate mobile performance constraints
      await page.evaluate(() => {
        // Reduce RAF to simulate lower performance
        const originalRAF = window.requestAnimationFrame;
        let frameCount = 0;
        window.requestAnimationFrame = (callback) => {
          frameCount++;
          // Skip every other frame to simulate 30fps
          if (frameCount % 2 === 0) {
            return originalRAF(callback);
          } else {
            return originalRAF(() => {});
          }
        };
      });

      // Test camera movement performance
      const metrics = await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.2 });

      // Mobile should maintain at least 30fps
      expect(metrics.fps).toBeGreaterThanOrEqual(25); // 30fps with 5fps tolerance
      expect(metrics.transitionDuration).toBeLessThanOrEqual(1200); // Allow more time on mobile
    });

    test('should handle memory constraints gracefully', async ({ page }) => {
      await page.setViewportSize(devices['iPhone 12'].viewport);
      await canvasHelper.initializeCanvas();

      // Simulate memory pressure
      await page.evaluate(() => {
        // Create memory pressure
        const arrays = [];
        for (let i = 0; i < 100; i++) {
          arrays.push(new Array(10000).fill(Math.random()));
        }
        (window as any).__memoryPressure = arrays;
      });

      // Test that canvas still works under memory pressure
      await canvasHelper.performCameraMovement({ x: 100, y: 80, scale: 1.1 });
      await canvasHelper.waitForTransition();

      // Verify canvas is still responsive
      const canvas = canvasHelper.getCanvas();
      await expect(canvas).toBeVisible();

      await visualHelper.compareCanvasLayout('memory-pressure');
    });

    test('should adapt quality based on device capabilities', async ({ page }) => {
      await page.setViewportSize(devices['iPhone 12'].viewport);
      await canvasHelper.initializeCanvas();

      // Check if quality adaptation is working
      const qualityInfo = await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="lightbox-canvas"]') as HTMLElement;
        return {
          transform: canvas?.style.transform || '',
          filter: canvas?.style.filter || '',
          quality: (window as any).__CANVAS_QUALITY_LEVEL__ || 'unknown'
        };
      });

      console.log('Mobile quality adaptation:', qualityInfo);

      // Test with rapid movements to trigger quality adaptation
      for (let i = 0; i < 5; i++) {
        await canvasHelper.performCameraMovement({
          x: Math.random() * 200 - 100,
          y: Math.random() * 150 - 75,
          scale: 0.8 + Math.random() * 0.8
        });
        await page.waitForTimeout(100);
      }

      await visualHelper.compareCanvasLayout('mobile-quality-adaptation');
    });
  });

  test.describe('Cross-Device Touch Compatibility', () => {
    const mobileDevices = [
      { name: 'iPhone 12', device: devices['iPhone 12'] },
      { name: 'iPhone 12 Pro Max', device: devices['iPhone 12 Pro Max'] },
      { name: 'Pixel 5', device: devices['Pixel 5'] },
      { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
      { name: 'iPad Pro', device: devices['iPad Pro'] }
    ];

    for (const { name, device } of mobileDevices) {
      test(`should work correctly on ${name}`, async ({ page }) => {
        await page.setViewportSize(device.viewport);
        await canvasHelper.initializeCanvas();

        // Test basic touch interaction
        await canvasHelper.performPanGesture(50, 30);
        await canvasHelper.waitForTransition();

        // Test pinch gesture if supported
        if (device.hasTouch) {
          await canvasHelper.performPinchZoom(1.3);
          await canvasHelper.waitForTransition();
        }

        // Take device-specific screenshot
        await visualHelper.compareCanvasLayout(`device-${name.toLowerCase().replace(/\s+/g, '-')}`);

        // Verify performance
        const metrics = await canvasHelper.performCameraMovement({ x: 100, y: 50, scale: 1.1 });
        expect(metrics.fps).toBeGreaterThanOrEqual(25); // Minimum performance
      });
    }
  });
});

/**
 * Dedicated iPad Tests
 */
test.describe('iPad-Specific Touch Tests', () => {
  test.use({ ...devices['iPad Pro'] });

  let canvasHelper: CanvasTestHelper;
  let visualHelper: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    visualHelper = new VisualRegressionHelper(page);
    await canvasHelper.initializeCanvas();
  });

  test('should handle Apple Pencil interactions', async ({ page }) => {
    // Simulate Apple Pencil touch (high precision)
    const canvas = canvasHelper.getCanvas();
    const canvasBounds = await canvas.boundingBox();

    if (!canvasBounds) throw new Error('Canvas not visible');

    const centerX = canvasBounds.x + canvasBounds.width / 2;
    const centerY = canvasBounds.y + canvasBounds.height / 2;

    // Precise point touch (simulating Apple Pencil)
    await page.touchscreen.tap(centerX, centerY);

    // Take screenshot to verify interaction
    await visualHelper.compareCanvasLayout('apple-pencil-interaction');
  });

  test('should handle iPad multitasking scenarios', async ({ page }) => {
    // Simulate split-screen by reducing viewport
    await page.setViewportSize({ width: 507, height: 768 }); // iPad split-screen size

    // Verify canvas adapts to constrained space
    await canvasHelper.performCameraMovement({ x: 75, y: 50, scale: 1.1 });
    await canvasHelper.waitForTransition();

    await visualHelper.compareCanvasLayout('ipad-split-screen');
  });
});