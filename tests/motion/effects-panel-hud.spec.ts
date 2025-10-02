/**
 * EffectsPanel HUD Motion Tests
 *
 * Tests the real-time animation control HUD that allows users to:
 * - Change animation styles (fade-up, slide, scale, blur-morph, clip-reveal)
 * - Adjust transition speed (fast/normal/slow/off)
 * - Modify parallax intensity (subtle/normal/intense/off)
 * - Toggle effects (viewfinder, motion blur, particles, glow)
 */

import { test, expect } from '@playwright/test';

test.describe('EffectsPanel HUD - Real-Time Animation Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('HUD toggle button should be visible in bottom-right corner', async ({ page }) => {
    // Look for camera icon button (📷) in bottom-right
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();

    await expect(hudButton).toBeVisible();

    // Verify position (bottom-right corner)
    const box = await hudButton.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      const viewport = page.viewportSize();
      expect(box.x).toBeGreaterThan(viewport!.width * 0.8); // Right side
      expect(box.y).toBeGreaterThan(viewport!.height * 0.7); // Bottom side
    }
  });

  test('clicking HUD button should open EffectsPanel', async ({ page }) => {
    // Find and click HUD toggle button
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Panel should appear
    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible({ timeout: 1000 });

    // Panel should contain animation controls
    await expect(page.locator('text=/animation style/i')).toBeVisible();
  });

  test('HUD should close when clicking toggle button again', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();

    // Open
    await hudButton.click();
    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible();

    // Close
    await hudButton.click();
    await expect(panel).not.toBeVisible();
  });

  test('HUD should close when pressing Escape key', async ({ page }) => {
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();

    // Open panel
    await hudButton.click();
    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Panel should close
    await expect(panel).not.toBeVisible();
  });

  test('animation style controls should be present', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Check for all 5 animation style options
    const styles = ['fade-up', 'slide', 'scale', 'blur-morph', 'clip-reveal'];

    for (const style of styles) {
      const button = page.locator(`button:has-text("${style}"), button[data-value="${style}"]`).first();
      await expect(button).toBeVisible();
    }
  });

  test('changing animation style should update localStorage', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Click 'slide' animation style
    const slideButton = page.locator('button:has-text("slide"), button[data-value="slide"]').first();
    await slideButton.click();

    // Wait a moment for state update
    await page.waitForTimeout(300);

    // Check localStorage
    const storedSettings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(storedSettings).toBeTruthy();
    expect(storedSettings.animationStyle).toBe('slide');
  });

  test('transition speed controls should be present', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Check for speed options: fast, normal, slow, off
    const speeds = ['fast', 'normal', 'slow', 'off'];

    for (const speed of speeds) {
      const button = page.locator(`button:has-text("${speed}"), button[data-value="${speed}"]`).first();
      await expect(button).toBeVisible();
    }
  });

  test('parallax intensity controls should be present', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Check for parallax options: subtle, normal, intense, off
    const intensities = ['subtle', 'normal', 'intense', 'off'];

    for (const intensity of intensities) {
      const button = page.locator(`button:has-text("${intensity}"), button[data-value="${intensity}"]`).first();
      await expect(button).toBeVisible();
    }
  });

  test('effect toggle switches should be present', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Check for toggle switches/buttons: viewfinder, motion blur, particles, glow
    await expect(page.locator('text=/viewfinder/i')).toBeVisible();
    await expect(page.locator('text=/motion blur/i')).toBeVisible();
    await expect(page.locator('text=/particles/i')).toBeVisible();
    await expect(page.locator('text=/glow/i')).toBeVisible();
  });

  test('reset to defaults button should be present', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Find reset button
    const resetButton = page.locator('button:has-text("reset"), button:has-text("default")').first();
    await expect(resetButton).toBeVisible();
  });

  test('reset button should restore default settings', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Change a setting
    const slideButton = page.locator('button:has-text("slide"), button[data-value="slide"]').first();
    await slideButton.click();
    await page.waitForTimeout(300);

    // Click reset
    const resetButton = page.locator('button:has-text("reset"), button:has-text("default")').first();
    await resetButton.click();
    await page.waitForTimeout(300);

    // Check localStorage restored to defaults
    const storedSettings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(storedSettings.animationStyle).toBe('fade-up'); // Default
  });

  test('HUD settings should persist across page reloads', async ({ page }) => {
    // Open HUD and change setting
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const scaleButton = page.locator('button:has-text("scale"), button[data-value="scale"]').first();
    await scaleButton.click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check localStorage still has setting
    const storedSettings = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored) : null;
    });

    expect(storedSettings.animationStyle).toBe('scale');
  });

  test('toggling viewfinder should show/hide ViewfinderController', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Find viewfinder toggle
    const viewfinderToggle = page.locator('button:has-text("viewfinder"), input[type="checkbox"][name*="viewfinder"]').first();

    // Get initial state
    const initialState = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored).enableViewfinder : true;
    });

    // Toggle it
    await viewfinderToggle.click();
    await page.waitForTimeout(500);

    // Check state changed
    const newState = await page.evaluate(() => {
      const stored = localStorage.getItem('portfolio-effects');
      return stored ? JSON.parse(stored).enableViewfinder : true;
    });

    expect(newState).toBe(!initialState);
  });

  test('HUD should be keyboard accessible with Tab navigation', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.focus();
    await page.keyboard.press('Enter');

    // Panel should open
    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible();

    // Tab should move focus within panel
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');
  });

  test('changing parallax intensity should affect scroll parallax', async ({ page }) => {
    // Open HUD
    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    // Set parallax to 'intense'
    const intenseButton = page.locator('button:has-text("intense"), button[data-value="intense"]').first();
    await intenseButton.click();
    await page.waitForTimeout(300);

    // Close HUD
    await hudButton.click();

    // Scroll page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Check hero background has parallax transform
    const heroBackground = page.locator('#capture .bg-cover, .absolute.bg-cover').first();
    const transform = await heroBackground.evaluate((el) =>
      window.getComputedStyle(el).transform
    );

    // Should have translate3d applied (not identity matrix)
    expect(transform).not.toBe('none');
    expect(transform).not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  });
});

test.describe('EffectsPanel - Mobile Viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('HUD button should be visible on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await expect(hudButton).toBeVisible();
  });

  test('HUD panel should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hudButton = page.locator('button[aria-label*="effects"], button[title*="effects"], button:has-text("📷")').first();
    await hudButton.click();

    const panel = page.locator('[data-testid="effects-panel"], #effects-panel, [role="dialog"]').first();
    await expect(panel).toBeVisible();

    // Panel should fit within viewport
    const box = await panel.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
      expect(box.height).toBeLessThanOrEqual(844);
    }
  });
});
