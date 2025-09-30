import { Page, Locator, expect } from '@playwright/test';

/**
 * Canvas Testing Utilities
 *
 * Helper functions for testing the 2D Canvas Layout System
 */

export interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  transitionDuration: number;
  memoryUsage?: number;
}

export class CanvasTestHelper {
  constructor(private page: Page) {}

  /**
   * Initialize canvas for testing
   */
  async initializeCanvas(): Promise<void> {
    // Navigate to canvas mode
    await this.page.goto('/?layout=canvas&test=true');

    // Wait for canvas to be ready
    await this.page.waitForSelector('.lightbox-canvas', { timeout: 10000 });

    // Wait for initial animation to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get the main canvas element
   */
  getCanvas(): Locator {
    return this.page.locator('.lightbox-canvas');
  }

  /**
   * Get canvas position from DOM
   */
  async getCanvasPosition(): Promise<CanvasPosition> {
    return await this.page.evaluate(() => {
      const canvas = document.querySelector('.lightbox-canvas .canvas-content') as HTMLElement;
      if (!canvas) throw new Error('Canvas content not found');

      const transform = canvas.style.transform;
      const translateMatch = transform.match(/translate3d\((-?\d+(?:\.\d+)?)px, (-?\d+(?:\.\d+)?)px, 0\)/);
      const scaleMatch = transform.match(/scale\((\d+(?:\.\d+)?)\)/);

      return {
        x: translateMatch ? -parseFloat(translateMatch[1]) : 0,
        y: translateMatch ? -parseFloat(translateMatch[2]) : 0,
        scale: scaleMatch ? parseFloat(scaleMatch[1]) : 1
      };
    });
  }

  /**
   * Navigate to a specific section
   */
  async navigateToSection(section: string): Promise<void> {
    // Click on the specified section in cursor lens or direct navigation
    await this.page.click(`[data-spatial-section="${section}"]`);

    // Wait for transition to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Perform camera movement and measure performance
   */
  async performCameraMovement(targetPosition: CanvasPosition): Promise<PerformanceMetrics> {
    const startTime = Date.now();

    // Start performance monitoring
    const performancePromise = this.page.evaluate(() => {
      return new Promise<PerformanceMetrics>((resolve) => {
        const startTime = performance.now();
        let frameCount = 0;
        let lastFrame = startTime;
        const frameimes: number[] = [];

        const measureFrame = (currentTime: number) => {
          frameCount++;
          const frameTime = currentTime - lastFrame;
          frameimes.push(frameTime);
          lastFrame = currentTime;

          // Stop measuring after transition should be complete (1 second)
          if (currentTime - startTime < 1000) {
            requestAnimationFrame(measureFrame);
          } else {
            const avgFrameTime = frameimes.reduce((a, b) => a + b, 0) / frameimes.length;
            resolve({
              fps: Math.round(1000 / avgFrameTime),
              frameTime: avgFrameTime,
              transitionDuration: currentTime - startTime
            });
          }
        };

        requestAnimationFrame(measureFrame);
      });
    });

    // Trigger camera movement by updating canvas position
    await this.page.evaluate((position: CanvasPosition) => {
      const event = new CustomEvent('canvas-move', { detail: position });
      document.dispatchEvent(event);
    }, targetPosition);

    // Wait for performance measurement to complete
    const metrics = await performancePromise;

    return metrics;
  }

  /**
   * Test touch gestures (pinch to zoom)
   */
  async performPinchZoom(scale: number): Promise<void> {
    const canvas = this.getCanvas();
    const canvasBounds = await canvas.boundingBox();

    if (!canvasBounds) throw new Error('Canvas not visible');

    const centerX = canvasBounds.x + canvasBounds.width / 2;
    const centerY = canvasBounds.y + canvasBounds.height / 2;
    const distance = 100;

    // Simulate pinch gesture
    await this.page.touchscreen.tap(centerX - distance, centerY);
    await this.page.touchscreen.tap(centerX + distance, centerY);

    // Perform pinch movement
    const newDistance = distance * scale;
    await this.page.mouse.move(centerX - distance, centerY);
    await this.page.mouse.down();
    await this.page.mouse.move(centerX - newDistance, centerY);
    await this.page.mouse.up();
  }

  /**
   * Test pan gesture
   */
  async performPanGesture(deltaX: number, deltaY: number): Promise<void> {
    const canvas = this.getCanvas();
    const canvasBounds = await canvas.boundingBox();

    if (!canvasBounds) throw new Error('Canvas not visible');

    const startX = canvasBounds.x + canvasBounds.width / 2;
    const startY = canvasBounds.y + canvasBounds.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + deltaX, startY + deltaY);
    await this.page.mouse.up();
  }

  /**
   * Wait for canvas transition to complete
   */
  async waitForTransition(): Promise<void> {
    // Wait for any ongoing transitions
    await this.page.waitForFunction(() => {
      const canvas = document.querySelector('.lightbox-canvas') as HTMLElement;
      return !canvas?.classList.contains('canvas-transitioning');
    }, { timeout: 5000 });
  }

  /**
   * Verify canvas accessibility
   */
  async verifyAccessibility(): Promise<void> {
    const canvas = this.getCanvas();

    // Check ARIA attributes
    await expect(canvas).toHaveAttribute('role', 'application');
    await expect(canvas).toHaveAttribute('aria-label');

    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('ArrowRight');
    await this.waitForTransition();
  }

  /**
   * Take visual snapshot of canvas
   */
  async takeCanvasSnapshot(name: string): Promise<void> {
    const canvas = this.getCanvas();
    await expect(canvas).toHaveScreenshot(`${name}.png`);
  }

  /**
   * Verify 60fps performance
   */
  async verify60FPS(): Promise<boolean> {
    const metrics = await this.performCameraMovement({ x: 100, y: 100, scale: 1.2 });
    return metrics.fps >= 55; // Allow 5fps tolerance
  }

  /**
   * Test all camera metaphors
   */
  async testCameraMetaphors(): Promise<Record<string, PerformanceMetrics>> {
    const results: Record<string, PerformanceMetrics> = {};

    // Pan-tilt movement
    results['pan-tilt'] = await this.performCameraMovement({ x: 200, y: 150, scale: 1.0 });
    await this.waitForTransition();

    // Zoom in
    results['zoom-in'] = await this.performCameraMovement({ x: 200, y: 150, scale: 1.5 });
    await this.waitForTransition();

    // Zoom out
    results['zoom-out'] = await this.performCameraMovement({ x: 200, y: 150, scale: 1.0 });
    await this.waitForTransition();

    return results;
  }
}

/**
 * Visual regression helper
 */
export class VisualRegressionHelper {
  constructor(private page: Page) {}

  /**
   * Compare canvas layout with baseline
   */
  async compareCanvasLayout(testName: string): Promise<void> {
    const canvas = this.page.locator('.lightbox-canvas');
    await expect(canvas).toHaveScreenshot(`${testName}-canvas-layout.png`);
  }

  /**
   * Compare specific section positioning
   */
  async compareSectionPositioning(section: string): Promise<void> {
    const sectionElement = this.page.locator(`[data-spatial-section="${section}"]`);
    await expect(sectionElement).toHaveScreenshot(`${section}-positioning.png`);
  }

  /**
   * Compare camera movement states
   */
  async compareCameraStates(movementType: string): Promise<void> {
    await expect(this.page.locator('.lightbox-canvas')).toHaveScreenshot(`camera-${movementType}.png`);
  }
}