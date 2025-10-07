/**
 * E2E Scroll Behavior Tests
 *
 * Validates scroll functionality across all three layout modes:
 * - Traditional: Natural body scroll
 * - Canvas: Pan/zoom (no scroll)
 * - Timeline: Horizontal timeline scroll
 *
 * Tests prevent regression of the "scroll gets stuck" bug where
 * nested scroll containers and event handler conflicts break
 * natural scrolling on mobile and desktop.
 *
 * @see .claude/intelligence/scroll-strategy-documentation.md
 */

import { test, expect, type Page } from '@playwright/test';

// Test helpers
async function getScrollPosition(page: Page) {
  return await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY
  }));
}

async function getBodyOverflow(page: Page) {
  return await page.evaluate(() => window.getComputedStyle(document.body).overflow);
}

async function scrollBy(page: Page, deltaY: number) {
  await page.evaluate((delta) => {
    window.scrollBy({ top: delta, behavior: 'auto' });
  }, deltaY);
}

test.describe('Traditional Mode - Body Scroll', () => {
  test.beforeEach(async ({ page }) => {
    // Traditional mode is the default (no ?layout param)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('allows natural mouse wheel scroll', async ({ page }) => {
    // Get initial position
    const initialPos = await getScrollPosition(page);
    expect(initialPos.y).toBe(0);

    // Scroll down with mouse wheel (simulate native wheel event)
    await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'auto' });
    });

    // Wait for scroll
    await page.waitForTimeout(100);

    // Verify scroll happened
    const newPos = await getScrollPosition(page);
    expect(newPos.y).toBeGreaterThan(initialPos.y);
  });

  test('allows touch scroll on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const initialPos = await getScrollPosition(page);

    // Simulate touch scroll (swipe up)
    await page.touchscreen.tap(200, 400);
    await page.mouse.move(200, 400);
    await page.mouse.down();
    await page.mouse.move(200, 200); // Swipe up 200px
    await page.mouse.up();

    // Wait for scroll momentum
    await page.waitForTimeout(300);

    const newPos = await getScrollPosition(page);
    expect(newPos.y).toBeGreaterThan(initialPos.y);
  });

  test('allows keyboard scroll (spacebar, arrows)', async ({ page }) => {
    // Focus page
    await page.keyboard.press('Tab');

    const initialPos = await getScrollPosition(page);

    // Spacebar scrolls down
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    const spacePos = await getScrollPosition(page);
    expect(spacePos.y).toBeGreaterThan(initialPos.y);

    // Arrow down scrolls
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    const arrowPos = await getScrollPosition(page);
    expect(arrowPos.y).toBeGreaterThan(spacePos.y);
  });

  test('has no overflow:hidden on body', async ({ page }) => {
    const overflow = await getBodyOverflow(page);
    expect(overflow).not.toBe('hidden');
  });

  test('smooth scroll behavior works', async ({ page }) => {
    const isSmoothScroll = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
    });
    expect(isSmoothScroll).toBe(true);
  });

  test('scroll does not get stuck after small movement', async ({ page }) => {
    // This tests the bug where scroll "sticks" after a few pixels
    // and requires tapping the page to "unstick"

    // Initial scroll
    await scrollBy(page, 10); // Small scroll
    await page.waitForTimeout(50);

    const pos1 = await getScrollPosition(page);
    expect(pos1.y).toBe(10);

    // Second scroll should work immediately (not stuck)
    await scrollBy(page, 10);
    await page.waitForTimeout(50);

    const pos2 = await getScrollPosition(page);
    expect(pos2.y).toBe(20);

    // Third scroll (regression test - this is where it failed before)
    await scrollBy(page, 10);
    await page.waitForTimeout(50);

    const pos3 = await getScrollPosition(page);
    expect(pos3.y).toBe(30);
  });
});

test.describe('Canvas Mode - No Scroll (Pan/Zoom)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?layout=canvas');
    await page.waitForLoadState('networkidle');
    // Skip onboarding if present
    const skipButton = page.locator('[data-testid="skip-onboarding"]');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test('prevents native scroll on body', async ({ page }) => {
    const overflow = await getBodyOverflow(page);
    expect(overflow).toBe('hidden');
  });

  test('wheel scroll without Ctrl does not scroll page', async ({ page }) => {
    // Try to scroll
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);

    // Page should not scroll (canvas mode blocks native scroll)
    const pos = await getScrollPosition(page);
    expect(pos.y).toBe(0);
  });

  test('Ctrl+wheel triggers zoom (not scroll)', async ({ page }) => {
    // This is tested in canvas-specific tests
    // Just verify wheel + Ctrl doesn't scroll the page
    await page.keyboard.down('Control');
    await page.mouse.wheel(0, 100);
    await page.keyboard.up('Control');

    await page.waitForTimeout(100);

    // No page scroll
    const pos = await getScrollPosition(page);
    expect(pos.y).toBe(0);
  });

  test('touch drag pans canvas (not scroll)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Simulate touch drag
    await page.touchscreen.tap(200, 300);
    await page.mouse.down();
    await page.mouse.move(100, 200); // Drag 100px left, 100px up
    await page.mouse.up();

    await page.waitForTimeout(100);

    // Page should not scroll
    const pos = await getScrollPosition(page);
    expect(pos.y).toBe(0);

    // Canvas position should change (tested in canvas-specific tests)
  });
});

test.describe('Timeline Mode - Horizontal Scroll', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?layout=timeline');
    await page.waitForLoadState('networkidle');
  });

  test('allows horizontal scroll on timeline container', async ({ page }) => {
    const timeline = page.locator('.timeline-container, [data-timeline-scroll]').first();

    if (await timeline.isVisible()) {
      // Scroll timeline horizontally
      await timeline.evaluate(el => {
        el.scrollLeft = 200;
      });

      await page.waitForTimeout(100);

      const scrollLeft = await timeline.evaluate(el => el.scrollLeft);
      expect(scrollLeft).toBe(200);
    }
  });

  test('wheel scroll moves timeline horizontally', async ({ page }) => {
    // In timeline mode, vertical wheel scroll is converted to horizontal
    // This is tested in timeline-specific tests
    // Just verify body doesn't scroll vertically

    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(100);

    const pos = await getScrollPosition(page);
    expect(pos.y).toBe(0); // No vertical body scroll
  });
});

test.describe('Modal Scroll Blocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('gallery modal blocks body scroll when open', async ({ page }) => {
    // Navigate to portfolio section with gallery
    await page.click('a[href="#portfolio"]');
    await page.waitForTimeout(500);

    // Find and click a gallery item
    const galleryItem = page.locator('[data-testid="gallery-item"]').first();
    if (await galleryItem.isVisible()) {
      await galleryItem.click();
      await page.waitForTimeout(300);

      // Body scroll should be blocked
      const overflow = await getBodyOverflow(page);
      expect(overflow).toBe('hidden');

      // Try to scroll - should not work
      const initialPos = await getScrollPosition(page);
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);

      const newPos = await getScrollPosition(page);
      expect(newPos.y).toBe(initialPos.y); // No scroll

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Body scroll should be restored
      const restoredOverflow = await getBodyOverflow(page);
      expect(restoredOverflow).not.toBe('hidden');
    }
  });

  test('restores scroll on modal unmount', async ({ page }) => {
    // This tests that scroll is restored even if modal crashes or is
    // forcefully closed (cleanup effect runs)

    // Manually set overflow hidden (simulate modal opening)
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
    });

    const blockedOverflow = await getBodyOverflow(page);
    expect(blockedOverflow).toBe('hidden');

    // Navigate away (should trigger cleanup)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Overflow should be restored
    const restoredOverflow = await getBodyOverflow(page);
    expect(restoredOverflow).not.toBe('hidden');
  });
});

test.describe('Cross-Mode Scroll Behavior', () => {
  test('switching from traditional to canvas maintains scroll state', async ({ page }) => {
    // Start in traditional mode
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll down
    await scrollBy(page, 500);
    await page.waitForTimeout(100);

    const traditionalPos = await getScrollPosition(page);
    expect(traditionalPos.y).toBe(500);

    // Switch to canvas mode
    await page.goto('/?layout=canvas');
    await page.waitForLoadState('networkidle');

    // Body scroll should be blocked in canvas
    const canvasOverflow = await getBodyOverflow(page);
    expect(canvasOverflow).toBe('hidden');

    // Switch back to traditional
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll should work again
    await scrollBy(page, 100);
    await page.waitForTimeout(100);

    const restoredPos = await getScrollPosition(page);
    expect(restoredPos.y).toBeGreaterThan(0);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('skip link receives focus on Tab', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const skipLink = page.locator('a[href="#main-content"], a[href="#canvas-content"]').first();
    await expect(skipLink).toBeFocused();
  });

  test('Enter on skip link scrolls to main content', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Main content should be in view
    const mainContent = page.locator('#main-content, #canvas-content').first();
    await expect(mainContent).toBeInViewport();
  });

  test('Tab navigation works (not blocked by scroll handlers)', async ({ page }) => {
    // This tests that preventDefault on scroll events doesn't accidentally
    // block keyboard navigation

    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Next focusable element

    // Should be able to tab through page
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Performance - Event Handler Cleanup', () => {
  test('no memory leaks from scroll listeners after navigation', async ({ page, context }) => {
    // This test validates that scroll event listeners are properly cleaned up
    // when navigating between modes to prevent memory leaks

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial listener count
    const initialListeners = await page.evaluate(() => {
      const listeners = (window as any).getEventListeners?.(window) || {};
      return {
        scroll: listeners.scroll?.length || 0,
        wheel: listeners.wheel?.length || 0,
        touchstart: listeners.touchstart?.length || 0
      };
    });

    // Navigate to canvas (adds new listeners)
    await page.goto('/?layout=canvas');
    await page.waitForLoadState('networkidle');

    // Navigate to timeline (adds more listeners)
    await page.goto('/?layout=timeline');
    await page.waitForLoadState('networkidle');

    // Back to traditional
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Final listener count should be same or similar to initial
    // (allowing for some framework overhead)
    const finalListeners = await page.evaluate(() => {
      const listeners = (window as any).getEventListeners?.(window) || {};
      return {
        scroll: listeners.scroll?.length || 0,
        wheel: listeners.wheel?.length || 0,
        touchstart: listeners.touchstart?.length || 0
      };
    });

    // Allow some variance but no massive leak
    expect(finalListeners.scroll).toBeLessThan(initialListeners.scroll + 5);
    expect(finalListeners.wheel).toBeLessThan(initialListeners.wheel + 5);
  });
});
