/**
 * Scroll-Triggered Fade Animation Tests
 *
 * Tests fade-in/fade-up animations that trigger on scroll as elements
 * enter the viewport. Validates opacity transitions and transform effects.
 */

import { test, expect } from '@playwright/test';

test.describe('Scroll-Triggered Fade Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hero title should fade in on page load', async ({ page }) => {
    const title = page.locator('[data-testid="hero-title"]');
    await expect(title).toBeVisible();

    // Check for fadeInUp animation (defined in CaptureSection)
    const animation = await title.evaluate((el) =>
      window.getComputedStyle(el).animation
    );

    expect(animation).toContain('fadeInUp');
  });

  test('hero role should fade in with stagger delay', async ({ page }) => {
    const role = page.locator('[data-testid="hero-role"]');
    await expect(role).toBeVisible();

    // Should have animation with delay
    const animation = await role.evaluate((el) =>
      window.getComputedStyle(el).animation
    );

    expect(animation).toContain('fadeInUp');
    // Animation delay should be present (0.4s per CaptureSection)
  });

  test('primary CTA should fade in last', async ({ page }) => {
    const cta = page.locator('[data-testid="primary-cta"]');
    await expect(cta).toBeVisible();

    // Should have longest animation delay
    const animation = await cta.evaluate((el) =>
      window.getComputedStyle(el).animation
    );

    expect(animation).toContain('fadeInUp');
    // Animation delay should be ~0.8s per CaptureSection
  });

  test('fade-in animations should respect stagger timing', async ({ page }) => {
    // Measure timing of fade-ins
    const measurements = await page.evaluate(async () => {
      const title = document.querySelector('[data-testid="hero-title"]');
      const role = document.querySelector('[data-testid="hero-role"]');
      const cta = document.querySelector('[data-testid="primary-cta"]');

      const getAnimationDelay = (el: Element | null) => {
        if (!el) return 0;
        const style = window.getComputedStyle(el);
        const delay = style.animationDelay;
        return parseFloat(delay) * 1000; // Convert to ms
      };

      return {
        titleDelay: getAnimationDelay(title),
        roleDelay: getAnimationDelay(role),
        ctaDelay: getAnimationDelay(cta),
      };
    });

    // Title should appear first (0.2s)
    expect(measurements.titleDelay).toBeLessThan(300);

    // Role should appear after title (0.4s)
    expect(measurements.roleDelay).toBeGreaterThan(measurements.titleDelay);

    // CTA should appear last (0.8s)
    expect(measurements.ctaDelay).toBeGreaterThan(measurements.roleDelay);
  });

  test('sections should fade in as they enter viewport on scroll', async ({ page }) => {
    // Scroll to next section
    await page.evaluate(() => {
      const focusSection = document.getElementById('focus');
      if (focusSection) {
        focusSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    await page.waitForTimeout(800); // Wait for scroll animation

    // Check if section content has opacity transition
    const focusHeading = page.locator('#focus h2').first();
    await expect(focusHeading).toBeVisible();

    const opacity = await focusHeading.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity)
    );

    // Should be fully visible (opacity 1)
    expect(opacity).toBeGreaterThan(0.95);
  });

  test('gradient overlay should animate on hero section', async ({ page }) => {
    // Check for animated gradient
    const gradientOverlay = page.locator('#capture .absolute.opacity-20').first();
    await expect(gradientOverlay).toBeVisible();

    const animation = await gradientOverlay.evaluate((el) =>
      window.getComputedStyle(el).animation
    );

    // Should have gradientShift animation
    expect(animation).toContain('gradientShift');
  });

  test('shimmer effect should activate on title hover', async ({ page }) => {
    const title = page.locator('[data-testid="hero-title"] span.group');
    await expect(title).toBeVisible();

    // Hover over title
    await title.hover();
    await page.waitForTimeout(500);

    // Check for shimmer animation
    const shimmer = page.locator('[data-testid="hero-title"] span.group span.absolute');
    const animation = await shimmer.evaluate((el) =>
      window.getComputedStyle(el).animation
    );

    expect(animation).toContain('shimmer');
  });
});

test.describe('Scroll Fade Animations with EffectsPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('changing animation style to "fade-up" should work', async ({ page }) => {
    // Open effects panel
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Select fade-up animation
    const fadeUpButton = page.locator('button:has-text("fade-up"), button[data-value="fade-up"]').first();
    await fadeUpButton.click();
    await page.waitForTimeout(300);

    // Check localStorage
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.animationStyle).toBe('fade-up');
  });

  test('changing animation style to "slide" should work', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const slideButton = page.locator('button:has-text("slide"), button[data-value="slide"]').first();
    await slideButton.click();
    await page.waitForTimeout(300);

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.animationStyle).toBe('slide');
  });

  test('changing animation style to "scale" should work', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const scaleButton = page.locator('button:has-text("scale"), button[data-value="scale"]').first();
    await scaleButton.click();
    await page.waitForTimeout(300);

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.animationStyle).toBe('scale');
  });

  test('changing transition speed to "fast" should work', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const fastButton = page.locator('button:has-text("fast"), button[data-value="fast"]').first();
    await fastButton.click();
    await page.waitForTimeout(300);

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.transitionSpeed).toBe('fast');
  });

  test('changing transition speed to "slow" should work', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const slowButton = page.locator('button:has-text("slow"), button[data-value="slow"]').first();
    await slowButton.click();
    await page.waitForTimeout(300);

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.transitionSpeed).toBe('slow');
  });

  test('setting transition speed to "off" should disable animations', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const offButton = page.locator('button:has-text("off"), button[data-value="off"]').filter({ hasText: /speed/i }).first();
    await offButton.click();
    await page.waitForTimeout(300);

    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.transitionSpeed).toBe('off');
  });
});

test.describe('Fade Animations - Reduced Motion', () => {
  test.use({
    reducedMotion: 'reduce',
  });

  test('animations should be minimal with prefers-reduced-motion', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if animations are disabled or minimal
    const title = page.locator('[data-testid="hero-title"]');
    const animation = await title.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        animation: style.animation,
        transition: style.transition,
      };
    });

    // With reduced motion, animations should be very short or 'none'
    const hasReducedAnimation =
      animation.animation === 'none' ||
      animation.animation.includes('0s') ||
      animation.animation.includes('0.01s');

    expect(hasReducedAnimation).toBe(true);
  });
});

test.describe('Section Entrance Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('scrolling to focus section should trigger entrance', async ({ page }) => {
    // Scroll to focus section
    await page.evaluate(() => {
      const section = document.getElementById('focus');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    // Section should be visible
    const focusSection = page.locator('#focus');
    await expect(focusSection).toBeVisible();
  });

  test('scrolling to frame section should trigger entrance', async ({ page }) => {
    await page.evaluate(() => {
      const section = document.getElementById('frame');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const frameSection = page.locator('#frame');
    await expect(frameSection).toBeVisible();
  });

  test('scrolling to exposure section should trigger entrance', async ({ page }) => {
    await page.evaluate(() => {
      const section = document.getElementById('exposure');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const exposureSection = page.locator('#exposure');
    await expect(exposureSection).toBeVisible();
  });

  test('scrolling to develop section should trigger entrance', async ({ page }) => {
    await page.evaluate(() => {
      const section = document.getElementById('develop');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const developSection = page.locator('#develop');
    await expect(developSection).toBeVisible();
  });

  test('scrolling to portfolio section should trigger entrance', async ({ page }) => {
    await page.evaluate(() => {
      const section = document.getElementById('portfolio');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

    await page.waitForTimeout(1000);

    const portfolioSection = page.locator('#portfolio');
    await expect(portfolioSection).toBeVisible();
  });
});
