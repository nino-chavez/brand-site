/**
 * Canvas Smoke Tests - CRITICAL PATH
 *
 * These tests MUST pass before any canvas changes can be committed.
 * They catch catastrophic failures like blank canvas, broken navigation, etc.
 *
 * Run: npm run test:smoke:canvas
 *
 * @fileoverview Level 1 smoke tests - blocking quality gate
 * @priority P0 - Blocks commits if failing
 */

import { test, expect } from '@playwright/test';

test.describe('Canvas Smoke Tests - CRITICAL PATH', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to canvas layout
    await page.goto('http://localhost:3000/?layout=canvas');

    // Wait for canvas to initialize
    await page.waitForSelector('.lightbox-canvas', { timeout: 5000 });
  });

  /**
   * SMOKE TEST #1: Canvas shows content on initial load
   *
   * Catches: Blank canvas bugs, rendering failures, positioning errors
   * Would have caught: Current blank canvas bug (targetX = -2000px)
   */
  test('Canvas renders with content visible (NOT BLANK)', async ({ page }) => {
    // CRITICAL: Canvas content must be visible
    const canvasContent = await page.locator('.canvas-content').isVisible();
    expect(canvasContent).toBe(true);

    // CRITICAL: At least one section must be visible
    const visibleSections = await page.locator('[data-section]').count();
    expect(visibleSections).toBeGreaterThan(0);

    // CRITICAL: Hero section should be in viewport initially
    const heroSection = page.locator('[data-section="capture"]');
    const heroBounds = await heroSection.boundingBox();

    expect(heroBounds).not.toBeNull();
    expect(heroBounds!.x).toBeGreaterThan(-1000); // Not completely off-screen left
    expect(heroBounds!.x).toBeLessThan(window.innerWidth + 500); // Not completely off-screen right

    // Visual regression: Take screenshot
    await expect(page).toHaveScreenshot('canvas-initial-load.png', {
      maxDiffPixels: 100
    });

    console.log('✅ SMOKE TEST #1 PASSED: Canvas shows content on load');
  });

  /**
   * SMOKE TEST #2: Clicking section navigation shows that section (NOT BLANK)
   *
   * Catches: Navigation bugs, position calculation errors, state management failures
   * Would have caught: Current blank canvas bug when clicking "About"
   */
  test('Clicking section navigation shows that section content', async ({ page }) => {
    // Initial state: Hero visible
    const initialHero = await page.locator('[data-section="capture"]').boundingBox();
    expect(initialHero).not.toBeNull();

    // Click "About" section in minimap or nav
    // Try multiple selectors to find the About button
    const aboutButton = page.locator('button:has-text("About"), a:has-text("About"), [aria-label*="About"]').first();
    await aboutButton.click();

    // Wait for transition
    await page.waitForTimeout(1000);

    // CRITICAL: About section content must be visible (not blank)
    const aboutSection = page.locator('[data-section="focus"]');
    const aboutVisible = await aboutSection.isVisible();
    expect(aboutVisible).toBe(true);

    const aboutBounds = await aboutSection.boundingBox();
    expect(aboutBounds).not.toBeNull();

    // Section must be in viewport (NOT off-screen causing blank canvas)
    expect(aboutBounds!.x).toBeGreaterThan(-500); // Allow some margin but not -2000px
    expect(aboutBounds!.x).toBeLessThan(window.innerWidth + 500);
    expect(aboutBounds!.y).toBeGreaterThan(-500);
    expect(aboutBounds!.y).toBeLessThan(window.innerHeight + 500);

    // Verify canvas position changed (transform applied)
    const canvasTransform = await page.locator('.canvas-content').evaluate(
      el => window.getComputedStyle(el).transform
    );
    expect(canvasTransform).not.toBe('none');
    expect(canvasTransform).not.toBe('matrix(1, 0, 0, 1, 0, 0)'); // Not identity matrix

    // Visual regression: About section should be visible
    await expect(page).toHaveScreenshot('canvas-about-section.png', {
      maxDiffPixels: 100
    });

    console.log('✅ SMOKE TEST #2 PASSED: Section navigation shows content');
  });

  /**
   * SMOKE TEST #3: Pan interaction moves canvas smoothly (no jitter, no blank)
   *
   * Catches: Pan smoothness bugs, position jumping, blank canvas after pan
   * Would have caught: Previous jitter and momentum bugs
   */
  test('Pan interaction moves canvas smoothly without jitter', async ({ page }) => {
    // Expose canvas position to page context
    await page.addScriptTag({
      content: `
        window.__canvasPosition = { x: 0, y: 0, scale: 1 };
        const observer = new MutationObserver(() => {
          const canvas = document.querySelector('.canvas-content');
          if (canvas) {
            const transform = window.getComputedStyle(canvas).transform;
            const match = transform.match(/matrix\\((.+)\\)/);
            if (match) {
              const values = match[1].split(', ');
              window.__canvasPosition = {
                x: parseFloat(values[4]) || 0,
                y: parseFloat(values[5]) || 0,
                scale: parseFloat(values[0]) || 1
              };
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      `
    });

    // Record initial position
    const initialPos = await page.evaluate(() => window.__canvasPosition);

    // Perform drag (50px movement - should exceed threshold)
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(450, 450);
    await page.mouse.up();

    // Wait for pan to settle
    await page.waitForTimeout(100);

    // Position MUST change
    const newPos = await page.evaluate(() => window.__canvasPosition);

    expect(Math.abs(newPos.x - initialPos.x)).toBeGreaterThan(10); // Significant movement
    expect(Math.abs(newPos.y - initialPos.y)).toBeGreaterThan(10);

    // CRITICAL: Content must still be visible after pan (not blank)
    const contentVisible = await page.locator('.canvas-content').isVisible();
    expect(contentVisible).toBe(true);

    // At least one section should still be in viewport
    const sections = page.locator('[data-section]');
    const sectionCount = await sections.count();
    let atLeastOneVisible = false;

    for (let i = 0; i < sectionCount; i++) {
      const bounds = await sections.nth(i).boundingBox();
      if (bounds &&
          bounds.x > -bounds.width &&
          bounds.x < window.innerWidth &&
          bounds.y > -bounds.height &&
          bounds.y < window.innerHeight) {
        atLeastOneVisible = true;
        break;
      }
    }

    expect(atLeastOneVisible).toBe(true);

    console.log('✅ SMOKE TEST #3 PASSED: Pan works smoothly');
  });

  /**
   * SMOKE TEST #4: Text selection works without triggering pan
   *
   * Catches: Text selection conflicts, drag threshold bugs
   * Would have caught: Previous text selection vs pan conflicts
   */
  test('Text selection works without triggering unwanted pan', async ({ page }) => {
    // Find a paragraph with text
    const paragraph = page.locator('p').first();
    await paragraph.waitFor({ state: 'visible' });

    // Record initial canvas position
    const initialTransform = await page.locator('.canvas-content').evaluate(
      el => window.getComputedStyle(el).transform
    );

    // Triple-click paragraph to select text
    await paragraph.click({ clickCount: 3 });

    // Wait for selection
    await page.waitForTimeout(200);

    // Text MUST be selected
    const selectedText = await page.evaluate(() =>
      window.getSelection()?.toString()
    );
    expect(selectedText).toBeTruthy();
    expect(selectedText!.length).toBeGreaterThan(10);

    // Canvas position SHOULD NOT change significantly
    const afterTransform = await page.locator('.canvas-content').evaluate(
      el => window.getComputedStyle(el).transform
    );

    // Transforms should be identical (no pan triggered)
    expect(afterTransform).toBe(initialTransform);

    console.log('✅ SMOKE TEST #4 PASSED: Text selection works correctly');
  });

  /**
   * SMOKE TEST #5: All 6 sections are rendered and accessible
   *
   * Catches: Missing sections, rendering failures, layout bugs
   */
  test('All 6 portfolio sections are rendered', async ({ page }) => {
    const expectedSections = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

    for (const sectionId of expectedSections) {
      const section = page.locator(`[data-section="${sectionId}"]`);
      const exists = await section.count();

      expect(exists).toBeGreaterThan(0);
      console.log(`✅ Section '${sectionId}' rendered`);
    }

    console.log('✅ SMOKE TEST #5 PASSED: All sections rendered');
  });
});

/**
 * USAGE:
 *
 * Run smoke tests:
 *   npm run test:smoke:canvas
 *
 * Run smoke tests in CI:
 *   npx playwright test test/smoke/canvas-critical-path.test.ts --reporter=list
 *
 * Update screenshots:
 *   npx playwright test test/smoke/canvas-critical-path.test.ts --update-snapshots
 */
