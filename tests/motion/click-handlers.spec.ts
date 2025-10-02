/**
 * Click Handler Tests
 *
 * Tests all interactive click handlers including:
 * - CTA button clicks
 * - Navigation clicks and scroll behavior
 * - Effects panel interactions
 * - Shutter trigger
 */

import { test, expect } from '@playwright/test';

test.describe('Click Handlers - CTA Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('View Work button should trigger capture sequence', async ({ page }) => {
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');
    await expect(viewWorkButton).toBeVisible();

    // Click button
    await viewWorkButton.click();

    // Capture sequence should activate
    const captureSequence = page.locator('[data-testid="capture-sequence"]');
    await expect(captureSequence).toHaveAttribute('data-active', 'true', { timeout: 1000 });
  });

  test('View Work button should navigate to focus section after animation', async ({ page }) => {
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');
    await viewWorkButton.click();

    // Wait for capture sequence (800ms per CaptureSection.tsx line 98)
    await page.waitForTimeout(1000);

    // Should be at focus section
    const focusSection = page.locator('#focus');
    await expect(focusSection).toBeInViewport();
  });

  test('Contact button should scroll to portfolio section', async ({ page }) => {
    const contactButton = page.locator('button:has-text("Contact")').first();
    await expect(contactButton).toBeVisible();

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Click button
    await contactButton.click();

    // Wait for scroll animation
    await page.waitForTimeout(1000);

    // Scroll position should have changed
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThan(initialScroll);

    // Portfolio section should be in viewport
    const portfolioSection = page.locator('#portfolio');
    await expect(portfolioSection).toBeInViewport();
  });

  test('View Work button should show visual feedback on click', async ({ page }) => {
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');

    // Get initial styles
    const initialBox = await viewWorkButton.boundingBox();
    expect(initialBox).toBeTruthy();

    // Click and hold
    await viewWorkButton.click({ delay: 100 });

    // Button should have active state (scale down)
    // This is handled by :active pseudo-class in CSS
    const hasActiveStyle = await viewWorkButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      // Check if any transform is applied
      return computed.transform !== 'none';
    });

    expect(hasActiveStyle).toBe(true);
  });
});

test.describe('Click Handlers - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('clicking Capture nav button should scroll to hero', async ({ page }) => {
    // First scroll away
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // Click Capture nav
    const captureNav = page.locator('nav button:has-text("Capture"), nav a:has-text("Capture")').first();
    await captureNav.click();

    await page.waitForTimeout(1000);

    // Should be at top
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBeLessThan(100);
  });

  test('clicking Focus nav button should scroll to focus section', async ({ page }) => {
    const focusNav = page.locator('nav button:has-text("Focus"), nav a:has-text("Focus")').first();
    await focusNav.click();

    await page.waitForTimeout(1000);

    const focusSection = page.locator('#focus');
    await expect(focusSection).toBeInViewport();
  });

  test('clicking Frame nav button should scroll to frame section', async ({ page }) => {
    const frameNav = page.locator('nav button:has-text("Frame"), nav a:has-text("Frame")').first();
    await frameNav.click();

    await page.waitForTimeout(1000);

    const frameSection = page.locator('#frame');
    await expect(frameSection).toBeInViewport();
  });

  test('clicking Exposure nav button should scroll to exposure section', async ({ page }) => {
    const exposureNav = page.locator('nav button:has-text("Exposure"), nav a:has-text("Exposure")').first();
    await exposureNav.click();

    await page.waitForTimeout(1000);

    const exposureSection = page.locator('#exposure');
    await expect(exposureSection).toBeInViewport();
  });

  test('clicking Develop nav button should scroll to develop section', async ({ page }) => {
    const developNav = page.locator('nav button:has-text("Develop"), nav a:has-text("Develop")').first();
    await developNav.click();

    await page.waitForTimeout(1000);

    const developSection = page.locator('#develop');
    await expect(developSection).toBeInViewport();
  });

  test('clicking Portfolio nav button should scroll to portfolio section', async ({ page }) => {
    const portfolioNav = page.locator('nav button:has-text("Portfolio"), nav a:has-text("Portfolio")').first();
    await portfolioNav.click();

    await page.waitForTimeout(1000);

    const portfolioSection = page.locator('#portfolio');
    await expect(portfolioSection).toBeInViewport();
  });

  test('nav buttons should show active state on click', async ({ page }) => {
    const focusNav = page.locator('nav button:has-text("Focus"), nav a:has-text("Focus")').first();
    await focusNav.click();

    await page.waitForTimeout(1000);

    // Button should have active class or aria-current
    const isActive = await focusNav.evaluate((el) => {
      return (
        el.classList.contains('active') ||
        el.getAttribute('aria-current') === 'true' ||
        el.hasAttribute('data-active')
      );
    });

    expect(isActive).toBe(true);
  });
});

test.describe('Click Handlers - EffectsPanel Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('clicking HUD toggle should open panel', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible();
  });

  test('clicking animation style buttons should update settings', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Click each style and verify
    const styles = ['fade-up', 'slide', 'scale', 'blur-morph', 'clip-reveal'];

    for (const style of styles) {
      const button = page.locator(`button:has-text("${style}"), button[data-value="${style}"]`).first();
      await button.click();
      await page.waitForTimeout(200);

      const settings = await page.evaluate(() => {
        const stored = localStorage.getItem('portfolio-effects');
        return stored ? JSON.parse(stored) : null;
      });

      expect(settings.animationStyle).toBe(style);
    }
  });

  test('clicking speed buttons should update settings', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const speeds = ['fast', 'normal', 'slow', 'off'];

    for (const speed of speeds) {
      const button = page.locator(`button:has-text("${speed}"), button[data-value="${speed}"]`).first();
      await button.click();
      await page.waitForTimeout(200);

      const settings = await page.evaluate(() => {
        const stored = localStorage.getItem('portfolio-effects');
        return stored ? JSON.parse(stored) : null;
      });

      expect(settings.transitionSpeed).toBe(speed);
    }
  });

  test('clicking parallax intensity buttons should update settings', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const intensities = ['subtle', 'normal', 'intense', 'off'];

    for (const intensity of intensities) {
      const button = page.locator(`button:has-text("${intensity}"), button[data-value="${intensity}"]`).first();
      await button.click();
      await page.waitForTimeout(200);

      const settings = await page.evaluate(() => {
        const stored = localStorage.getItem('portfolio-effects');
        return stored ? JSON.parse(stored) : null;
      });

      expect(settings.parallaxIntensity).toBe(intensity);
    }
  });

  test('clicking reset button should restore defaults', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Change some settings
    const slideButton = page.locator('button:has-text("slide"), button[data-value="slide"]').first();
    await slideButton.click();
    await page.waitForTimeout(200);

    // Click reset
    const resetButton = page.locator('button:has-text("reset"), button:has-text("default")').first();
    await resetButton.click();
    await page.waitForTimeout(300);

    // Check defaults restored
    const settings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(settings.animationStyle).toBe('fade-up');
    expect(settings.transitionSpeed).toBe('normal');
    expect(settings.parallaxIntensity).toBe('normal');
    expect(settings.enableGlow).toBe(true);
    expect(settings.enableViewfinder).toBe(true);
  });

  test('clicking effect toggles should update settings', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Get initial viewfinder state
    const initialSettings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    const initialViewfinder = initialSettings.enableViewfinder;

    // Toggle viewfinder
    const viewfinderToggle = page.locator('button:has-text("viewfinder"), input[type="checkbox"][name*="viewfinder"]').first();
    await viewfinderToggle.click();
    await page.waitForTimeout(300);

    // Check state changed
    const newSettings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(newSettings.enableViewfinder).toBe(!initialViewfinder);
  });
});

test.describe('Click Handlers - Development Mode', () => {
  test('shutter trigger button should activate capture sequence in dev mode', async ({ page }) => {
    // Only runs in development mode
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for dev shutter trigger
    const shutterButton = page.locator('[data-testid="shutter-trigger"]');

    // May not exist in production
    const isVisible = await shutterButton.isVisible().catch(() => false);

    if (isVisible) {
      await shutterButton.click();

      // Capture sequence should activate
      const captureSequence = page.locator('[data-testid="capture-sequence"]');
      await expect(captureSequence).toHaveAttribute('data-active', 'true', { timeout: 1000 });
    }
  });
});

test.describe('Click Handlers - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('pressing Enter on focused View Work button should trigger action', async ({ page }) => {
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');
    await viewWorkButton.focus();
    await page.keyboard.press('Enter');

    // Capture sequence should activate
    const captureSequence = page.locator('[data-testid="capture-sequence"]');
    await expect(captureSequence).toHaveAttribute('data-active', 'true', { timeout: 1000 });
  });

  test('pressing Space on focused button should trigger action', async ({ page }) => {
    const viewWorkButton = page.locator('[data-testid="view-work-cta"]');
    await viewWorkButton.focus();
    await page.keyboard.press('Space');

    // Capture sequence should activate
    const captureSequence = page.locator('[data-testid="capture-sequence"]');
    await expect(captureSequence).toHaveAttribute('data-active', 'true', { timeout: 1000 });
  });

  test('Tab navigation should move through interactive elements', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should have focused an element
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A']).toContain(focusedTag);
  });
});
