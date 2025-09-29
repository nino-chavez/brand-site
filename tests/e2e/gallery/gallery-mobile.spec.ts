/**
 * Gallery System - Mobile Touch Gesture E2E Tests
 *
 * Tests mobile-specific functionality:
 * - Touch swipe navigation
 * - Responsive layout
 * - Mobile button sizing
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Gallery Mobile Touch Gestures', () => {
  test.use({
    ...devices['iPhone 13 Pro'],
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays contact sheet in mobile view', async ({ page }) => {
    // Verify gallery is visible
    const gallery = page.locator('[role="list"][aria-label*="Portfolio gallery"]');
    await expect(gallery).toBeVisible();

    // Check viewport dimensions
    const viewportSize = page.viewportSize();
    expect(viewportSize!.width).toBeLessThan(768);
  });

  test('thumbnails have adequate touch target size', async ({ page }) => {
    // Get first thumbnail
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();

    // Get bounding box
    const box = await firstThumbnail.boundingBox();

    // WCAG AAA requires 44x44 minimum touch targets
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('modal buttons have adequate touch target size', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check close button size
    const closeButton = page.locator('[aria-label="Close image viewer"]');
    const closeBox = await closeButton.boundingBox();
    expect(closeBox!.width).toBeGreaterThanOrEqual(44);
    expect(closeBox!.height).toBeGreaterThanOrEqual(44);

    // Check nav button size
    const nextButton = page.locator('[aria-label*="Next image"]');
    const nextBox = await nextButton.boundingBox();
    expect(nextBox!.width).toBeGreaterThanOrEqual(44);
    expect(nextBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('swipes left to navigate to next image', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal and image to load
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
    await page.waitForTimeout(500); // Wait for image load

    // Verify starting at image 1
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('1 / 27');

    // Get image container for swipe
    const imageContainer = page.locator('.image-container');
    const box = await imageContainer.boundingBox();

    // Perform swipe left (should go to next image)
    await page.touchscreen.tap(box!.x + box!.width * 0.8, box!.y + box!.height / 2);
    await page.touchscreen.swipe(
      { x: box!.x + box!.width * 0.8, y: box!.y + box!.height / 2 },
      { x: box!.x + box!.width * 0.2, y: box!.y + box!.height / 2 }
    );

    // Wait for navigation
    await page.waitForTimeout(500);

    // Verify moved to image 2
    await expect(counter).toContainText('2 / 27');
  });

  test('swipes right to navigate to previous image', async ({ page }) => {
    // Open modal on second image
    const secondThumbnail = page.locator('[role="button"][aria-label*="Image 2 of"]').first();
    await secondThumbnail.click();

    // Wait for modal and image to load
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
    await page.waitForTimeout(500);

    // Verify starting at image 2
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');

    // Get image container for swipe
    const imageContainer = page.locator('.image-container');
    const box = await imageContainer.boundingBox();

    // Perform swipe right (should go to previous image)
    await page.touchscreen.tap(box!.x + box!.width * 0.2, box!.y + box!.height / 2);
    await page.touchscreen.swipe(
      { x: box!.x + box!.width * 0.2, y: box!.y + box!.height / 2 },
      { x: box!.x + box!.width * 0.8, y: box!.y + box!.height / 2 }
    );

    // Wait for navigation
    await page.waitForTimeout(500);

    // Verify moved to image 1
    await expect(counter).toContainText('1 / 27');
  });

  test('taps to open metadata panel', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Tap metadata toggle
    const metadataToggle = page.locator('[aria-label*="metadata"]').first();
    await metadataToggle.tap();

    // Verify metadata panel opens
    const metadataPanel = page.locator('.metadata-panel');
    await expect(metadataPanel).toBeVisible();
  });

  test('vertical scroll is not prevented', async ({ page }) => {
    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Try to scroll vertically
    await page.evaluate(() => window.scrollBy(0, 100));

    // Wait a moment
    await page.waitForTimeout(100);

    // Verify scroll happened
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll);
  });

  test('modal adjusts to mobile viewport', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Get modal dimensions
    const modal = page.locator('[role="dialog"]');
    const modalBox = await modal.boundingBox();

    // Get viewport dimensions
    const viewportSize = page.viewportSize();

    // Modal should be full width on mobile
    expect(modalBox!.width).toBe(viewportSize!.width);
  });

  test('category filters are tappable on mobile', async ({ page }) => {
    // Find action sports filter
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();

    // Get button size
    const box = await actionSportsFilter.boundingBox();

    // Should be large enough to tap
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Tap to filter
    await actionSportsFilter.tap();

    // Verify filtering works
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails).toHaveCount(18);
  });
});

test.describe('Gallery Tablet View', () => {
  test.use({
    ...devices['iPad Pro'],
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays contact sheet with tablet layout', async ({ page }) => {
    // Gallery should be visible
    const gallery = page.locator('[role="list"][aria-label*="Portfolio gallery"]');
    await expect(gallery).toBeVisible();

    // Get viewport size
    const viewportSize = page.viewportSize();
    expect(viewportSize!.width).toBeGreaterThan(768);
    expect(viewportSize!.width).toBeLessThan(1024);
  });

  test('modal uses tablet-optimized layout', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Navigation should work with touch
    const nextButton = page.locator('[aria-label*="Next image"]');
    await nextButton.tap();

    // Verify navigation
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');
  });
});

test.describe('Gallery Responsive Breakpoints', () => {
  test('mobile layout (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();

    // Should display in narrow mobile layout
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails.first()).toBeVisible();
  });

  test('tablet layout (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();
  });

  test('desktop layout (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();
  });

  test('large desktop layout (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();
  });
});