import { test, expect } from '@playwright/test';
import { CanvasTestHelper, VisualRegressionHelper } from '../utils/canvas-helpers';

/**
 * Visual Regression Tests for Canvas System
 *
 * Ensures visual consistency across:
 * - Spatial section layouts
 * - Camera movement states
 * - Browser environments
 * - Viewport sizes
 */

test.describe('Canvas Visual Regression', () => {
  let canvasHelper: CanvasTestHelper;
  let visualHelper: VisualRegressionHelper;

  test.beforeEach(async ({ page }) => {
    canvasHelper = new CanvasTestHelper(page);
    visualHelper = new VisualRegressionHelper(page);
    await canvasHelper.initializeCanvas();
  });

  test.describe('Spatial Layout Consistency', () => {
    test('should maintain consistent spatial section positioning', async ({ page }) => {
      const sections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

      for (const section of sections) {
        // Navigate to each section
        const sectionElement = page.locator(`[data-section="${section}"], [data-spatial-section="${section}"]`).first();

        if (await sectionElement.isVisible()) {
          // Take screenshot of section positioning
          await visualHelper.compareSectionPositioning(section);

          // Small delay between sections
          await page.waitForTimeout(200);
        }
      }
    });

    test('should maintain 3x2 grid layout structure', async ({ page }) => {
      // Take full canvas layout screenshot
      await visualHelper.compareCanvasLayout('3x2-grid-layout');

      // Verify grid structure with debug overlay if available
      const debugMode = await page.evaluate(() => {
        const url = new URL(window.location.href);
        return url.searchParams.get('debug') === 'true';
      });

      if (!debugMode) {
        // Enable debug mode to show grid
        await page.goto('/?layout=canvas&test=true&debug=true');
        await canvasHelper.waitForTransition();
        await visualHelper.compareCanvasLayout('3x2-grid-debug');
      }
    });

    test('should render sections at correct scale factors', async () => {
      const scaleFactors = [0.8, 1.0, 1.2, 1.5];

      for (const scale of scaleFactors) {
        await canvasHelper.performCameraMovement({ x: 0, y: 0, scale });
        await canvasHelper.waitForTransition();
        await visualHelper.compareCanvasLayout(`scale-${scale.toString().replace('.', '-')}`);
      }
    });
  });

  test.describe('Camera Movement States', () => {
    test('should capture camera movement keyframes', async () => {
      const movements = [
        { name: 'pan-left', position: { x: -200, y: 0, scale: 1.0 } },
        { name: 'pan-right', position: { x: 200, y: 0, scale: 1.0 } },
        { name: 'pan-up', position: { x: 0, y: -150, scale: 1.0 } },
        { name: 'pan-down', position: { x: 0, y: 150, scale: 1.0 } },
        { name: 'zoom-in', position: { x: 0, y: 0, scale: 1.8 } },
        { name: 'zoom-out', position: { x: 0, y: 0, scale: 0.6 } },
        { name: 'diagonal', position: { x: 150, y: 100, scale: 1.3 } },
      ];

      for (const movement of movements) {
        await canvasHelper.performCameraMovement(movement.position);
        await canvasHelper.waitForTransition();
        await visualHelper.compareCameraStates(movement.name);
      }
    });

    test('should maintain visual quality during transitions', async ({ page }) => {
      // Start transition and capture intermediate state
      const transitionPromise = canvasHelper.performCameraMovement({ x: 300, y: 200, scale: 1.4 });

      // Capture mid-transition state (after 50% completion)
      await page.waitForTimeout(400); // Assuming 800ms transition
      await visualHelper.compareCameraStates('mid-transition');

      // Wait for completion
      await transitionPromise;
      await canvasHelper.waitForTransition();
      await visualHelper.compareCameraStates('transition-complete');
    });
  });

  test.describe('Cross-Browser Visual Consistency', () => {
    test('should render consistently across browsers', async ({ page, browserName }) => {
      // Take browser-specific screenshots
      await visualHelper.compareCanvasLayout(`browser-${browserName}-initial`);

      // Test with different camera positions
      await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.2 });
      await canvasHelper.waitForTransition();
      await visualHelper.compareCanvasLayout(`browser-${browserName}-moved`);

      // Test with zoom
      await canvasHelper.performCameraMovement({ x: 0, y: 0, scale: 1.6 });
      await canvasHelper.waitForTransition();
      await visualHelper.compareCanvasLayout(`browser-${browserName}-zoomed`);
    });

    test('should handle CSS transform differences', async ({ page, browserName }) => {
      // Test transform rendering consistency
      const transformTests = [
        { name: 'translate3d', position: { x: 200, y: 150, scale: 1.0 } },
        { name: 'scale', position: { x: 0, y: 0, scale: 1.5 } },
        { name: 'combined', position: { x: 100, y: 80, scale: 1.3 } }
      ];

      for (const transformTest of transformTests) {
        await canvasHelper.performCameraMovement(transformTest.position);
        await canvasHelper.waitForTransition();
        await visualHelper.compareCanvasLayout(`transform-${transformTest.name}-${browserName}`);
      }
    });
  });

  test.describe('Responsive Visual Tests', () => {
    test('should adapt visual layout to viewport changes', async ({ page }) => {
      const breakpoints = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'ultrawide', width: 2560, height: 1440 }
      ];

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await page.waitForTimeout(500); // Allow layout adjustment

        // Take screenshot at this viewport
        await visualHelper.compareCanvasLayout(`responsive-${breakpoint.name}`);

        // Test basic interaction at this size
        await canvasHelper.performCameraMovement({ x: 50, y: 30, scale: 1.1 });
        await canvasHelper.waitForTransition();
        await visualHelper.compareCanvasLayout(`responsive-${breakpoint.name}-interaction`);
      }
    });

    test('should maintain aspect ratios across devices', async ({ page }) => {
      const aspectRatios = [
        { name: '16-9', width: 1600, height: 900 },
        { name: '4-3', width: 1024, height: 768 },
        { name: '21-9', width: 2100, height: 900 },
        { name: '9-16', width: 375, height: 667 } // Mobile portrait
      ];

      for (const ratio of aspectRatios) {
        await page.setViewportSize({ width: ratio.width, height: ratio.height });
        await page.waitForTimeout(500);

        // Verify canvas maintains proper proportions
        await visualHelper.compareCanvasLayout(`aspect-${ratio.name}`);
      }
    });
  });

  test.describe('Accessibility Visual States', () => {
    test('should show proper focus indicators', async ({ page }) => {
      // Test keyboard navigation focus states
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await visualHelper.compareCanvasLayout('focus-indicator');

      // Test aria-current visual state
      await page.keyboard.press('Enter');
      await canvasHelper.waitForTransition();
      await visualHelper.compareCanvasLayout('aria-current-state');
    });

    test('should respect reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Test movement with reduced motion
      await canvasHelper.performCameraMovement({ x: 200, y: 150, scale: 1.2 });
      await canvasHelper.waitForTransition();
      await visualHelper.compareCanvasLayout('reduced-motion');
    });

    test('should maintain contrast ratios', async ({ page }) => {
      // Test high contrast mode if supported
      await page.emulateMedia({ forcedColors: 'active' });
      await page.waitForTimeout(500);
      await visualHelper.compareCanvasLayout('high-contrast');
    });
  });

  test.describe('Performance Visual Impact', () => {
    test('should maintain visual quality under performance constraints', async ({ page }) => {
      // Simulate low-end device by throttling
      await page.evaluate(() => {
        // Simulate performance degradation
        (window as any).__SIMULATE_LOW_PERFORMANCE__ = true;
      });

      await page.reload();
      await canvasHelper.initializeCanvas();

      // Test visual quality with performance mode
      await canvasHelper.performCameraMovement({ x: 150, y: 100, scale: 1.3 });
      await canvasHelper.waitForTransition();
      await visualHelper.compareCanvasLayout('performance-optimized');
    });

    test('should show quality degradation gracefully', async ({ page }) => {
      // Force quality reduction
      await page.evaluate(() => {
        const canvas = document.querySelector('[data-testid="lightbox-canvas"]') as HTMLElement;
        if (canvas) {
          canvas.style.imageRendering = 'pixelated';
          canvas.style.filter = 'blur(0.5px)';
        }
      });

      await visualHelper.compareCanvasLayout('quality-degraded');
    });
  });
});