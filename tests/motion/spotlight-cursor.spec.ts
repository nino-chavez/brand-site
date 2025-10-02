/**
 * Spotlight Cursor Motion Tests
 *
 * Tests the spotlight cursor effect that follows mouse movement
 * with a radial gradient overlay (purple spotlight).
 */

import { test, expect } from '@playwright/test';

test.describe('Spotlight Cursor Effect', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('spotlight overlay should be present in DOM', async ({ page }) => {
    // Look for spotlight element (radial gradient following cursor)
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Should exist (may be hidden on mobile/reduced motion)
    const exists = await spotlight.count() > 0;
    expect(exists).toBe(true);
  });

  test('spotlight should update position on mouse move', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Move mouse to specific position
    await page.mouse.move(500, 300);
    await page.waitForTimeout(100);

    // Get spotlight style
    const style1 = await spotlight.getAttribute('style');
    expect(style1).toBeTruthy();

    // Move mouse to different position
    await page.mouse.move(800, 600);
    await page.waitForTimeout(100);

    // Get new style
    const style2 = await spotlight.getAttribute('style');
    expect(style2).toBeTruthy();

    // Styles should differ (position changed)
    expect(style1).not.toBe(style2);
  });

  test('spotlight should use radial gradient with purple color', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Move mouse to trigger update
    await page.mouse.move(700, 400);
    await page.waitForTimeout(100);

    const style = await spotlight.getAttribute('style');
    expect(style).toBeTruthy();

    // Should contain radial gradient
    expect(style).toContain('radial-gradient');

    // Should use purple color (139, 92, 246 = #8b5cf6)
    expect(style).toContain('rgba(139, 92, 246');
  });

  test('spotlight should have 600px radius', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    await page.mouse.move(600, 500);
    await page.waitForTimeout(100);

    const style = await spotlight.getAttribute('style');
    expect(style).toBeTruthy();
    expect(style).toContain('600px');
  });

  test('spotlight should update smoothly at 60fps', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Track position updates over time
    const updates = await page.evaluate(async () => {
      const positions: { x: number; y: number; timestamp: number }[] = [];

      // Monitor style changes for 1 second while moving mouse
      const element = document.querySelector('div[style*="radial-gradient"]') as HTMLElement;
      if (!element) return { count: 0, fps: 0 };

      const observer = new MutationObserver(() => {
        const style = element.getAttribute('style') || '';
        const match = style.match(/at (\d+)px (\d+)px/);
        if (match) {
          positions.push({
            x: parseInt(match[1]),
            y: parseInt(match[2]),
            timestamp: performance.now(),
          });
        }
      });

      observer.observe(element, { attributes: true, attributeFilter: ['style'] });

      // Simulate mouse movement
      const startTime = performance.now();
      const duration = 1000;

      while (performance.now() - startTime < duration) {
        const event = new MouseEvent('mousemove', {
          clientX: 500 + Math.random() * 400,
          clientY: 300 + Math.random() * 400,
        });
        window.dispatchEvent(event);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      observer.disconnect();

      // Calculate FPS
      const fps = positions.length / (duration / 1000);

      return { count: positions.length, fps };
    });

    // Should update at ~60fps (allow some variance)
    expect(updates.fps).toBeGreaterThan(30);
    expect(updates.fps).toBeLessThan(80);
  });

  test('spotlight should be pointer-events-none to not block interactions', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    const pointerEvents = await spotlight.evaluate((el) =>
      window.getComputedStyle(el).pointerEvents
    );

    expect(pointerEvents).toBe('none');
  });

  test('spotlight should be fixed positioned to cover viewport', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    const styles = await spotlight.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        right: computed.right,
        bottom: computed.bottom,
      };
    });

    expect(styles.position).toBe('fixed');
    expect(styles.top).toBe('0px');
    expect(styles.left).toBe('0px');
  });

  test('spotlight should have high z-index for visibility', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    const zIndex = await spotlight.evaluate((el) =>
      window.getComputedStyle(el).zIndex
    );

    // Should be z-30 (30 in Tailwind)
    expect(parseInt(zIndex)).toBeGreaterThan(20);
  });
});

test.describe('Spotlight Cursor - Hover Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('spotlight should follow cursor over hero section', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Move mouse over hero
    await page.mouse.move(960, 300); // Center top
    await page.waitForTimeout(100);

    const style = await spotlight.getAttribute('style');
    expect(style).toContain('960px');
    expect(style).toContain('300px');
  });

  test('spotlight should follow cursor over buttons', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');

    // Get button position
    const box = await viewWorkButton.boundingBox();
    expect(box).toBeTruthy();

    // Move mouse over button
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.waitForTimeout(100);

    const style = await spotlight.getAttribute('style');
    expect(style).toBeTruthy();

    // Position should be near button
    const posMatch = style!.match(/at (\d+)px (\d+)px/);
    expect(posMatch).toBeTruthy();

    const spotX = parseInt(posMatch![1]);
    const spotY = parseInt(posMatch![2]);

    expect(spotX).toBeGreaterThan(box!.x - 50);
    expect(spotX).toBeLessThan(box!.x + box!.width + 50);
    expect(spotY).toBeGreaterThan(box!.y - 50);
    expect(spotY).toBeLessThan(box!.y + box!.height + 50);
  });

  test('spotlight should combine with magnetic button effects', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');

    // Move cursor near button
    const box = await viewWorkButton.boundingBox();
    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width / 2 + 30, box!.y + box!.height / 2);
    await page.waitForTimeout(300);

    // Spotlight should be at cursor position
    const spotStyle = await spotlight.getAttribute('style');
    expect(spotStyle).toContain('radial-gradient');

    // Button should have magnetic transform
    const buttonTransform = await viewWorkButton.evaluate((el) =>
      window.getComputedStyle(el).transform
    );
    expect(buttonTransform).not.toBe('none');
    expect(buttonTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  });
});

test.describe('Spotlight Cursor - Reduced Motion', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  test('spotlight should be hidden with prefers-reduced-motion', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // With motion-safe:block and reduced motion, should be hidden
    const isVisible = await spotlight.isVisible();
    expect(isVisible).toBe(false);
  });
});

test.describe('Spotlight Cursor - Mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });

  test('spotlight should be hidden on touch devices', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Should be hidden (class includes "hidden" for mobile)
    const classes = await spotlight.getAttribute('class');
    expect(classes).toContain('hidden');
  });
});

test.describe('Spotlight Cursor - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('spotlight should use transition for smooth animation', async ({ page }) => {
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    const transition = await spotlight.evaluate((el) =>
      window.getComputedStyle(el).transition
    );

    // Should have transition
    expect(transition).not.toBe('none');
    expect(transition).toContain('duration');
  });

  test('spotlight should throttle updates to 60fps', async ({ page }) => {
    // SpotlightCursor uses throttleMs: 16 (60fps) in useMouseTracking
    const spotlight = page.locator('div[style*="radial-gradient"]').first();

    // Rapid mouse movements should be throttled
    const updateCount = await page.evaluate(async () => {
      let updates = 0;
      const element = document.querySelector('div[style*="radial-gradient"]') as HTMLElement;
      if (!element) return 0;

      const observer = new MutationObserver(() => {
        updates++;
      });

      observer.observe(element, { attributes: true, attributeFilter: ['style'] });

      // Send 200 mouse events in 100ms
      const startTime = performance.now();
      for (let i = 0; i < 200; i++) {
        const event = new MouseEvent('mousemove', {
          clientX: 500 + i,
          clientY: 300,
        });
        window.dispatchEvent(event);
      }

      // Wait for throttle to finish
      await new Promise((resolve) => setTimeout(resolve, 100));

      observer.disconnect();

      return updates;
    });

    // Should be throttled to ~6 updates in 100ms (60fps = 16ms throttle)
    expect(updateCount).toBeLessThan(20); // Way less than 200 events sent
    expect(updateCount).toBeGreaterThan(3); // But some updates did happen
  });
});
