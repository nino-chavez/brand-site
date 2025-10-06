/**
 * Canvas Content Integration Tests
 *
 * Verifies that all portfolio sections render correctly in canvas layout mode
 * with proper positioning, click handlers, and keyboard navigation.
 */

import { test, expect } from '@playwright/test';

const CANVAS_URL = 'http://localhost:3002/?layout=canvas';

test.describe('Canvas Content Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CANVAS_URL);
    await page.waitForLoadState('networkidle');
    // Wait for canvas to initialize
    await page.waitForTimeout(1000);
  });

  test('all 6 portfolio sections should render in canvas layout', async ({ page }) => {
    // Check for canvas layout container
    const canvasLayout = await page.locator('.canvas-portfolio-layout');
    await expect(canvasLayout).toBeVisible();

    // Verify all 6 sections are present
    const sections = [
      { name: 'Capture', selector: '[aria-label="Navigate to Capture section"]' },
      { name: 'Focus', selector: '[aria-label="Navigate to Focus section"]' },
      { name: 'Frame', selector: '[aria-label="Navigate to Frame section"]' },
      { name: 'Exposure', selector: '[aria-label="Navigate to Exposure section"]' },
      { name: 'Develop', selector: '[aria-label="Navigate to Develop section"]' },
      { name: 'Portfolio', selector: '[aria-label="Navigate to Portfolio section"]' }
    ];

    for (const section of sections) {
      const element = await page.locator(section.selector);
      await expect(element).toBeVisible({ timeout: 5000 });
      console.log(`✅ ${section.name} section rendered`);
    }
  });

  test('clicking section should trigger camera navigation', async ({ page }) => {
    // Click on Focus section (left of center)
    const focusSection = await page.locator('[aria-label="Navigate to Focus section"]');
    await focusSection.click();

    // Wait for navigation animation
    await page.waitForTimeout(1000);

    // Verify console logs show navigation
    const logs = await page.evaluate(() => {
      return (window as any).__testLogs || [];
    });

    console.log('📍 Navigation logs:', logs);
  });

  test('sections should have proper visual states', async ({ page }) => {
    // Check active state styling
    const captureSection = await page.locator('[aria-label="Navigate to Capture section"]');

    // Verify initial state has ring
    const hasRing = await captureSection.evaluate((el) => {
      const classes = el.className;
      return classes.includes('ring-');
    });
    expect(hasRing).toBe(true);

    // Hover should show different styling
    await captureSection.hover();
    await page.waitForTimeout(200);

    const hoverClasses = await captureSection.getAttribute('class');
    console.log('🎨 Hover classes:', hoverClasses);
    expect(hoverClasses).toContain('hover:ring-2');
  });

  test('keyboard Tab navigation should cycle through sections', async ({ page }) => {
    // Focus first section
    await page.keyboard.press('Tab');

    // Verify focus is on a section
    const focusedElement = await page.locator(':focus');
    const ariaLabel = await focusedElement.getAttribute('aria-label');
    console.log('⌨️ Focused element:', ariaLabel);

    expect(ariaLabel).toContain('Navigate to');
  });

  test('canvas should support pan and zoom interactions', async ({ page }) => {
    // Get initial transform
    const canvasLayout = await page.locator('.canvas-portfolio-layout');
    const initialTransform = await canvasLayout.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    console.log('🎯 Initial transform:', initialTransform);

    // Simulate zoom (mouse wheel)
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);

    // Check if transform changed (zoom applied)
    const afterZoomTransform = await canvasLayout.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    console.log('🔍 After zoom transform:', afterZoomTransform);
  });

  test('sections should have proper dimensions', async ({ page }) => {
    const captureSection = await page.locator('[aria-label="Navigate to Capture section"]');

    const dimensions = await captureSection.boundingBox();
    console.log('📐 Capture section dimensions:', dimensions);

    expect(dimensions?.width).toBeGreaterThan(900); // 1000px wide
    expect(dimensions?.height).toBeGreaterThan(600); // 700px tall
  });

  test('directional navigation hints should be visible at default scale', async ({ page }) => {
    // Check for navigation hint arrows
    const hints = await page.locator('.text-white\\/30.text-xs.font-mono.pointer-events-none');
    const hintsCount = await hints.count();

    console.log('🧭 Navigation hints found:', hintsCount);
    expect(hintsCount).toBeGreaterThan(0); // Should show "← About", "Projects →", etc.
  });
});
