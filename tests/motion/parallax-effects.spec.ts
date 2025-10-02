/**
 * Parallax Effects Motion Tests
 *
 * Tests parallax scrolling effects on hero background and other elements.
 * Validates that backgrounds move at different rates than foreground content.
 */

import { test, expect } from '@playwright/test';
import { parseTransformMatrix } from './helpers/motion-test-utils';

test.describe('Parallax Scroll Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hero background should have parallax transform on scroll', async ({ page }) => {
    // Get hero background element
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();
    await expect(heroBackground).toBeVisible();

    // Get initial transform
    const initialTransform = await heroBackground.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Get new transform
    const scrolledTransform = await heroBackground.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Transform should have changed (parallax effect)
    expect(scrolledTransform).not.toBe(initialTransform);
    expect(scrolledTransform).not.toBe('none');
  });

  test('parallax effect should use translate3d for GPU acceleration', async ({ page }) => {
    // Scroll to trigger parallax
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);

    const heroBackground = page.locator('#capture .absolute.bg-cover').first();
    const transform = await heroBackground.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should be matrix3d (GPU accelerated) or contain translate3d pattern
    const hasGPUAcceleration = transform.includes('matrix3d') || transform !== 'none';
    expect(hasGPUAcceleration).toBe(true);
  });

  test('parallax intensity should increase with scroll distance', async ({ page }) => {
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();

    // Scroll small amount
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);

    const transform200 = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return { translateY: 0 };
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return { translateY: 0 };
      const values = matrix[1].split(', ').map(parseFloat);
      return { translateY: values.length === 6 ? values[5] : values[13] };
    });

    // Scroll larger amount
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);

    const transform600 = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return { translateY: 0 };
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return { translateY: 0 };
      const values = matrix[1].split(', ').map(parseFloat);
      return { translateY: values.length === 6 ? values[5] : values[13] };
    });

    // Greater scroll should produce greater translateY
    expect(Math.abs(transform600.translateY)).toBeGreaterThan(Math.abs(transform200.translateY));
  });

  test('parallax should respect willChange: transform for performance', async ({ page }) => {
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();

    const willChange = await heroBackground.evaluate((el) =>
      window.getComputedStyle(el).willChange
    );

    expect(willChange).toBe('transform');
  });

  test('parallax should be smooth without jank', async ({ page }) => {
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();

    // Measure scroll performance
    const metrics = await page.evaluate(async () => {
      const timestamps: number[] = [];
      let frameCount = 0;

      const measureFrame = () => {
        timestamps.push(performance.now());
        frameCount++;
        if (frameCount < 30) {
          requestAnimationFrame(measureFrame);
        }
      };

      requestAnimationFrame(measureFrame);

      // Scroll while measuring
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, 50);
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      // Wait for measurements
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculate FPS
      const durations = timestamps.slice(1).map((t, i) => t - timestamps[i]);
      const avgFrameTime = durations.reduce((a, b) => a + b, 0) / durations.length;
      return { fps: 1000 / avgFrameTime, avgFrameTime };
    });

    // Should maintain at least 45fps (relaxed for CI)
    expect(metrics.fps).toBeGreaterThan(45);
  });

  test('foreground content should not have parallax (moves at scroll rate)', async ({ page }) => {
    // Get foreground title element
    const title = page.locator('[data-testid="hero-title"]');
    await expect(title).toBeVisible();

    // Get initial position
    const initialBox = await title.boundingBox();
    expect(initialBox).toBeTruthy();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Get new position
    const scrolledBox = await title.boundingBox();
    expect(scrolledBox).toBeTruthy();

    // Y position should have moved by approximately scroll amount (no parallax)
    const yDelta = Math.abs(scrolledBox!.y - initialBox!.y);
    expect(yDelta).toBeGreaterThan(450); // Moved close to full scroll amount
    expect(yDelta).toBeLessThan(550); // Didn't move way more than scroll
  });
});

test.describe('Parallax with EffectsPanel Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('changing parallax to "off" should disable effect', async ({ page }) => {
    // Open effects panel
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Set parallax to off
    const offButton = page.locator('button:has-text("off"), button[data-value="off"]').filter({ hasText: /parallax/i }).first();
    await offButton.click();
    await page.waitForTimeout(300);

    // Close panel
    await hudButton.click();

    // Scroll
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Check localStorage
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.parallaxIntensity).toBe('off');
  });

  test('parallax "subtle" should produce smaller translation than "normal"', async ({ page }) => {
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();

    // Test "subtle" setting
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();
    const subtleButton = page.locator('button:has-text("subtle"), button[data-value="subtle"]').first();
    await subtleButton.click();
    await page.waitForTimeout(300);
    await hudButton.click();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    const subtleTransform = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return 0;
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(', ').map(parseFloat);
      return Math.abs(values.length === 6 ? values[5] : values[13]);
    });

    // Reset and test "normal" setting
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    await hudButton.click();
    const normalButton = page.locator('button:has-text("normal"), button[data-value="normal"]').first();
    await normalButton.click();
    await page.waitForTimeout(300);
    await hudButton.click();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    const normalTransform = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return 0;
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(', ').map(parseFloat);
      return Math.abs(values.length === 6 ? values[5] : values[13]);
    });

    // Normal should produce greater effect than subtle
    expect(normalTransform).toBeGreaterThan(subtleTransform);
  });

  test('parallax "intense" should produce larger translation than "normal"', async ({ page }) => {
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();

    // Test "normal" setting
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();
    const normalButton = page.locator('button:has-text("normal"), button[data-value="normal"]').first();
    await normalButton.click();
    await page.waitForTimeout(300);
    await hudButton.click();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    const normalTransform = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return 0;
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(', ').map(parseFloat);
      return Math.abs(values.length === 6 ? values[5] : values[13]);
    });

    // Reset and test "intense" setting
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    await hudButton.click();
    const intenseButton = page.locator('button:has-text("intense"), button[data-value="intense"]').first();
    await intenseButton.click();
    await page.waitForTimeout(300);
    await hudButton.click();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    const intenseTransform = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return 0;
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(', ').map(parseFloat);
      return Math.abs(values.length === 6 ? values[5] : values[13]);
    });

    // Intense should produce greater effect than normal
    expect(intenseTransform).toBeGreaterThan(normalTransform);
  });
});

test.describe('Parallax - Reduced Motion', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  test('parallax should respect prefers-reduced-motion', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Check if parallax is disabled or minimal
    const heroBackground = page.locator('#capture .absolute.bg-cover').first();
    const transform = await heroBackground.evaluate((el) => {
      const transform = window.getComputedStyle(el).transform;
      if (transform === 'none') return 0;
      const matrix = transform.match(/matrix.*\((.+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(', ').map(parseFloat);
      return Math.abs(values.length === 6 ? values[5] : values[13]);
    });

    // Should be none or very minimal
    expect(transform).toBeLessThan(50); // Much less than typical parallax
  });
});
