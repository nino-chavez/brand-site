/**
 * Timeline Layout - Mobile UX Testing Suite
 *
 * Tests mobile-specific interactions, touch gestures, responsive layout,
 * and UI state management on iPhone 13 viewport.
 */

import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'], video: 'on' });

const DEVICE_NAME = 'iPhone-13';

test.describe('Timeline Mobile UX - iPhone 13', () => {

  test('01 - Initial load and responsive layout', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Capture initial state
    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-01-initial-load.png`,
      fullPage: true
    });

    // Check no horizontal overflow
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 0;

    console.log(`📱 Document width: ${documentWidth}px, Viewport: ${viewportWidth}px`);
    expect(documentWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('02 - Control bar visibility and touch targets', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check transport controls exist and are visible
    const prevButton = page.locator('button[aria-label="Previous frame"]');
    const playButton = page.locator('button[aria-label*="Play"]').or(page.locator('button[aria-label*="Pause"]'));
    const nextButton = page.locator('button[aria-label="Next frame"]');

    await expect(prevButton).toBeVisible({ timeout: 10000 });
    await expect(playButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    // Check button sizes (minimum touch target)
    const playBox = await playButton.boundingBox();
    if (playBox) {
      console.log(`▶️ Play button size: ${playBox.width.toFixed(1)}x${playBox.height.toFixed(1)}px`);
      expect(playBox.height).toBeGreaterThanOrEqual(30);
    }

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-02-control-bar.png`
    });
  });

  test('03 - Touch scroll navigation', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const viewport = page.viewportSize();
    if (!viewport) return;

    // Scroll down within first section
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 120);
      await page.waitForTimeout(250);
    }

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-03-scrolled-section.png`,
      fullPage: true
    });

    // Continue scrolling to trigger transition
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(200);
    }

    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-04-section-transition.png`,
      fullPage: true
    });
  });

  test('04 - Transport controls functionality', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Test next frame
    const nextButton = page.locator('button[aria-label="Next frame"]');
    await nextButton.click();
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-05-next-frame.png`,
      fullPage: true
    });

    // Test previous frame
    const prevButton = page.locator('button[aria-label="Previous frame"]');
    await prevButton.click();
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-06-prev-frame.png`,
      fullPage: true
    });
  });

  test('05 - Timeline ruler tap interaction', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find timeline ruler track (look for the clickable timeline track)
    const timelineTrack = page.locator('div[style*="cursor: pointer"]').filter({
      has: page.locator('div[style*="rgba(139, 92, 246"]')
    }).first();

    const trackBox = await timelineTrack.boundingBox().catch(() => null);

    if (trackBox) {
      console.log(`📏 Timeline ruler: ${trackBox.width.toFixed(1)}x${trackBox.height.toFixed(1)}px`);

      // Tap at 66% position (should jump to section 4)
      await page.mouse.click(
        trackBox.x + trackBox.width * 0.66,
        trackBox.y + trackBox.height / 2
      );

      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `test-results/mobile/${DEVICE_NAME}-07-ruler-scrub.png`,
        fullPage: true
      });
    } else {
      console.log('⚠️ Timeline ruler not found or not interactable');
    }
  });

  test('06 - Filmstrip navigation', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check if filmstrip is visible
    const filmstripArrows = page.locator('button').filter({ hasText: /◄|►/ });
    const arrowsVisible = await filmstripArrows.count() > 0;

    console.log(`🎞️ Filmstrip arrows visible: ${arrowsVisible}`);

    if (arrowsVisible) {
      // Try clicking right arrow (next section)
      const rightArrow = filmstripArrows.last();
      await rightArrow.click().catch(() => console.log('Could not click arrow'));
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: `test-results/mobile/${DEVICE_NAME}-08-filmstrip-nav.png`,
        fullPage: true
      });
    }
  });

  test('07 - Scroll threshold indicator', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Scroll to 70%+ to trigger threshold indicator
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(150);
    }

    await page.waitForTimeout(800);

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-09-threshold-indicator.png`,
      fullPage: true
    });

    // Check for purple gradient line
    const thresholdLine = page.locator('div').filter({
      has: page.locator('[style*="rgba(139, 92, 246, 0.6)"]')
    });

    const lineVisible = await thresholdLine.isVisible().catch(() => false);
    console.log(`↕️ Threshold indicator visible: ${lineVisible}`);
  });

  test('08 - Tap response time', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const startTime = Date.now();
    const nextButton = page.locator('button[aria-label="Next frame"]');
    await nextButton.click();
    const tapDelay = Date.now() - startTime;

    console.log(`⏱️ Tap response time: ${tapDelay}ms`);

    if (tapDelay > 300) {
      console.log('⚠️ WARNING: Slow tap response detected');
    }

    expect(tapDelay).toBeLessThan(500);
  });

  test('09 - No context menu on mobile', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const viewport = page.viewportSize();
    if (!viewport) return;

    // Long-press simulation (context menu trigger on desktop)
    await page.touchscreen.tap(viewport.width / 2, viewport.height / 2);
    await page.waitForTimeout(1000);

    // Context menu should NOT appear
    const contextMenu = page.locator('div').filter({ hasText: /Navigation.*Shortcuts/i });
    const menuVisible = await contextMenu.isVisible().catch(() => false);

    console.log(`📱 Context menu visible (should be false): ${menuVisible}`);
    expect(menuVisible).toBe(false);
  });

  test('10 - Timecode visibility on small screen', async ({ page }) => {
    await page.goto('http://localhost:3004/?layout=timeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check timecode display
    const timecode = page.locator('div').filter({ hasText: /\d{2}:\d{2}:\d{2}:\d{2}/ }).first();
    const timecodeVisible = await timecode.isVisible().catch(() => false);

    console.log(`🕐 Timecode visible: ${timecodeVisible}`);

    if (timecodeVisible) {
      const timecodeBox = await timecode.boundingBox();
      if (timecodeBox) {
        console.log(`📊 Timecode size: ${timecodeBox.width.toFixed(1)}x${timecodeBox.height.toFixed(1)}px`);
      }
    }

    await page.screenshot({
      path: `test-results/mobile/${DEVICE_NAME}-10-timecode-visibility.png`
    });
  });
});
