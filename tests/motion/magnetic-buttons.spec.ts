/**
 * Magnetic Button Motion Tests
 *
 * Automated tests for magnetic button hover effects.
 * Tests transform properties, timing, and visual behavior.
 */

import { test, expect } from '@playwright/test';

test.describe('Magnetic Button Effects', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('View Work button should have magnetic effect on hover', async ({ page }) => {
    const button = page.getByTestId('view-work-cta');

    // Wait for button to be ready
    await button.waitFor({ state: 'visible' });

    // Get initial transform (should be none or identity matrix)
    const initialTransform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    expect(initialTransform).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);

    // Get button position
    const box = await button.boundingBox();
    expect(box).not.toBeNull();

    // Move cursor within magnetic radius (60-80px from button)
    const targetX = box!.x + box!.width + 70;
    const targetY = box!.y + box!.height / 2;

    await page.mouse.move(targetX, targetY);

    // Wait for magnetic effect to apply
    await page.waitForTimeout(150);

    // Get new transform
    const activeTransform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should have translate applied (not identity matrix)
    expect(activeTransform).not.toBe('none');
    expect(activeTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');

    // Extract translate values from matrix
    const matrixMatch = activeTransform.match(/matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)/);
    expect(matrixMatch).not.toBeNull();

    const translateX = parseFloat(matrixMatch![5]);
    const translateY = parseFloat(matrixMatch![6]);

    // Button should have moved toward cursor (positive X, some Y movement)
    expect(translateX).toBeGreaterThan(5);
    expect(translateX).toBeLessThan(50);
    expect(Math.abs(translateY)).toBeLessThan(20);

    // Move cursor away (outside magnetic radius)
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);

    // Button should return to original position
    const resetTransform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    expect(resetTransform).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  });

  test('Contact button should have magnetic effect on hover', async ({ page }) => {
    const button = page.locator('[data-testid="view-work-cta"]').locator('..').locator('button').nth(1);

    await button.waitFor({ state: 'visible' });

    const box = await button.boundingBox();
    expect(box).not.toBeNull();

    // Hover within magnetic radius
    await page.mouse.move(box!.x - 60, box!.y + box!.height / 2);
    await page.waitForTimeout(150);

    const activeTransform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should have magnetic pull applied
    expect(activeTransform).not.toBe('none');

    const matrixMatch = activeTransform.match(/matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)/);
    if (matrixMatch) {
      const translateX = parseFloat(matrixMatch[5]);

      // Should move left (negative X) toward cursor
      expect(translateX).toBeLessThan(-5);
      expect(translateX).toBeGreaterThan(-50);
    }
  });

  test('magnetic effect should not apply outside radius', async ({ page }) => {
    const button = page.getByTestId('view-work-cta');
    await button.waitFor({ state: 'visible' });

    const box = await button.boundingBox();

    // Move cursor far from button (outside magnetic radius)
    await page.mouse.move(box!.x + box!.width + 200, box!.y);
    await page.waitForTimeout(200);

    const transform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should not have magnetic effect applied
    expect(transform).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  });

  test('magnetic effect should scale button on hover', async ({ page }) => {
    const button = page.getByTestId('view-work-cta');
    await button.waitFor({ state: 'visible' });

    const box = await button.boundingBox();

    // Hover within magnetic radius
    await page.mouse.move(box!.x + box!.width + 70, box!.y + box!.height / 2);
    await page.waitForTimeout(150);

    const transform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Check for scale in transform matrix (scale(1.05) applied by magnetic hook)
    const matrixMatch = transform.match(/matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)/);

    if (matrixMatch) {
      const scaleX = parseFloat(matrixMatch[1]);
      const scaleY = parseFloat(matrixMatch[4]);

      // Should have scale applied (approximately 1.05)
      expect(scaleX).toBeGreaterThan(1.02);
      expect(scaleY).toBeGreaterThan(1.02);
    }
  });

  test('magnetic effect should respect reduced motion preference', async ({ page, context }) => {
    // Set reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });
    });

    await page.goto('/');
    const button = page.getByTestId('view-work-cta');
    await button.waitFor({ state: 'visible' });

    const box = await button.boundingBox();

    // Try to trigger magnetic effect
    await page.mouse.move(box!.x + box!.width + 70, box!.y + box!.height / 2);
    await page.waitForTimeout(200);

    const transform = await button.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Magnetic effect should be disabled with reduced motion
    expect(transform).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  });
});
