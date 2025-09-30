/**
 * Gallery System - Performance E2E Tests
 *
 * Tests performance targets:
 * - Gallery load time <500ms
 * - Modal open time <300ms
 * - Navigation time <200ms
 * - Image loading optimization
 * - Lazy loading behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Gallery Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('gallery loads within performance budget (500ms)', async ({ page }) => {
    // Measure time to render gallery
    const startTime = Date.now();

    // Wait for gallery to be visible
    const gallery = page.locator('[role="list"][aria-label*="Portfolio gallery"]');
    await expect(gallery).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Should load within 500ms
    expect(loadTime).toBeLessThan(500);
  });

  test('modal opens within performance budget (300ms)', async ({ page }) => {
    // Ensure gallery is loaded
    await page.waitForSelector('[role="list"]');

    // Measure modal open time
    const startTime = Date.now();

    // Click thumbnail
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal to be visible
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    const openTime = Date.now() - startTime;

    // Should open within 300ms
    expect(openTime).toBeLessThan(300);
  });

  test('image navigation is fast (<200ms)', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal and initial image load
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
    await page.waitForTimeout(500);

    // Measure navigation time
    const startTime = Date.now();

    // Navigate to next image
    await page.keyboard.press('ArrowRight');

    // Wait for counter to update
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');

    const navTime = Date.now() - startTime;

    // Should navigate within 200ms
    expect(navTime).toBeLessThan(200);
  });

  test('lazy loading works - only visible thumbnails load initially', async ({ page }) => {
    // Get all thumbnails
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    const count = await thumbnails.count();
    expect(count).toBe(27);

    // Count loaded images
    const loadedImages = page.locator('.gallery-thumbnail img').filter({
      has: page.locator('img[src]:not([src=""])')
    });

    // Not all 27 should be loaded initially
    const loadedCount = await loadedImages.count();

    // Expect significantly fewer than 27 images loaded (lazy loading)
    expect(loadedCount).toBeLessThan(count);
  });

  test('scrolling triggers lazy load of additional images', async ({ page }) => {
    // Count initially loaded images
    const initialLoadedImages = page.locator('.gallery-thumbnail.loaded');
    const initialCount = await initialLoadedImages.count();

    // Scroll down to load more images
    await page.evaluate(() => window.scrollBy(0, 1000));

    // Wait for intersection observer to trigger
    await page.waitForTimeout(500);

    // Count loaded images after scroll
    const afterScrollLoadedImages = page.locator('.gallery-thumbnail.loaded');
    const afterScrollCount = await afterScrollLoadedImages.count();

    // More images should be loaded
    expect(afterScrollCount).toBeGreaterThan(initialCount);
  });

  test('adjacent images preload for smooth navigation', async ({ page }) => {
    // Open modal on image 10
    const tenthThumbnail = page.locator('[role="button"][aria-label*="Image 10 of"]').first();
    await tenthThumbnail.click();

    // Wait for modal and image load
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
    await page.waitForTimeout(500);

    // Navigate immediately (preloading should make this fast)
    const startTime = Date.now();

    await page.keyboard.press('ArrowRight');

    // Wait for counter to update
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('11 / 27');

    const navTime = Date.now() - startTime;

    // Should be very fast due to preloading
    expect(navTime).toBeLessThan(150);
  });

  test('category filtering is instant', async ({ page }) => {
    // Wait for gallery
    await page.waitForSelector('[role="list"]');

    // Measure filter time
    const startTime = Date.now();

    // Click action sports filter
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();
    await actionSportsFilter.click();

    // Wait for filtered results
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails).toHaveCount(18);

    const filterTime = Date.now() - startTime;

    // Should be instant (<100ms)
    expect(filterTime).toBeLessThan(100);
  });

  test('modal close is fast', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Measure close time
    const startTime = Date.now();

    // Close modal
    await page.keyboard.press('Escape');

    // Wait for modal to be hidden
    await expect(modal).not.toBeVisible();

    const closeTime = Date.now() - startTime;

    // Should close quickly (<200ms)
    expect(closeTime).toBeLessThan(200);
  });

  test('metadata panel toggle is smooth', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Measure metadata toggle time
    const startTime = Date.now();

    // Toggle metadata
    await page.keyboard.press('m');

    // Wait for panel to appear
    const metadataPanel = page.locator('.metadata-panel');
    await expect(metadataPanel).toBeVisible();

    const toggleTime = Date.now() - startTime;

    // Should be instant (<100ms)
    expect(toggleTime).toBeLessThan(100);
  });

  test('no layout shift during image load', async ({ page }) => {
    // Track layout shifts
    await page.evaluate(() => {
      (window as any).layoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).layoutShifts.push(entry);
        }
      }).observe({ entryTypes: ['layout-shift'] });
    });

    // Load gallery
    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();

    // Wait for images to load
    await page.waitForTimeout(2000);

    // Check layout shifts
    const layoutShifts = await page.evaluate(() => {
      const shifts = (window as any).layoutShifts || [];
      return shifts.reduce((sum: number, entry: any) => {
        // Only count shifts without recent user input
        if (!entry.hadRecentInput) {
          return sum + entry.value;
        }
        return sum;
      }, 0);
    });

    // Cumulative Layout Shift should be low (<0.1 for good)
    expect(layoutShifts).toBeLessThan(0.1);
  });

  test('memory does not leak when opening/closing modal multiple times', async ({ page }) => {
    // Get initial memory (if available)
    const getMemoryUsage = async () => {
      try {
        const metrics = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        return metrics;
      } catch {
        return 0;
      }
    };

    const initialMemory = await getMemoryUsage();

    // Open and close modal 5 times
    for (let i = 0; i < 5; i++) {
      const thumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
      await thumbnail.click();

      await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
      await page.keyboard.press('Escape');

      await page.waitForTimeout(200);
    }

    // Force garbage collection (if available)
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(1000);

    const finalMemory = await getMemoryUsage();

    // Memory should not grow significantly (allow 50MB variance)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
      expect(memoryIncrease).toBeLessThan(50);
    }
  });

  test('WebP format is used for modern browsers', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check if WebP is being used
    const imageSource = await page.locator('[role="dialog"] picture source[type="image/webp"]').getAttribute('srcset');

    // WebP source should exist
    expect(imageSource).toBeTruthy();
    expect(imageSource).toContain('.webp');
  });

  test('JPEG fallback exists for compatibility', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check if JPEG fallback exists
    const imageElement = await page.locator('[role="dialog"] img');
    const src = await imageElement.getAttribute('src');

    // JPEG fallback should exist
    expect(src).toBeTruthy();
    expect(src).toMatch(/\.(jpg|jpeg)$/);
  });

  test('thumbnail images are appropriately sized', async ({ page }) => {
    // Check first thumbnail image size
    const firstThumbnail = page.locator('.gallery-thumbnail img').first();

    // Wait for image to be visible
    await expect(firstThumbnail).toBeVisible();

    // Get natural dimensions
    const dimensions = await firstThumbnail.evaluate((img: HTMLImageElement) => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));

    // Thumbnails should be reasonably sized (300x200 target)
    expect(dimensions.naturalWidth).toBeLessThan(400);
    expect(dimensions.naturalHeight).toBeLessThan(300);
  });

  test('full images are high quality but optimized', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal and image load
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');
    await page.waitForTimeout(1000);

    // Get full image dimensions
    const fullImage = page.locator('[role="dialog"] img').first();
    const dimensions = await fullImage.evaluate((img: HTMLImageElement) => ({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));

    // Full images should be high quality (1920x1280 target)
    expect(dimensions.naturalWidth).toBeGreaterThan(1200);
    expect(dimensions.naturalHeight).toBeGreaterThan(800);

    // But not excessive
    expect(dimensions.naturalWidth).toBeLessThan(2400);
    expect(dimensions.naturalHeight).toBeLessThan(1800);
  });
});