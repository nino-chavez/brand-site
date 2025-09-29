/**
 * Gallery System - Basic Functionality E2E Tests
 *
 * Tests core gallery functionality:
 * - Contact sheet displays all images
 * - Modal opens and closes
 * - Image navigation works
 * - Category filtering works
 */

import { test, expect } from '@playwright/test';

test.describe('Gallery Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be ready
    await page.waitForLoadState('domcontentloaded');
  });

  test('displays contact sheet with 27 images', async ({ page }) => {
    // Find the gallery component
    const gallery = page.locator('[role="list"][aria-label*="Portfolio gallery"]');
    await expect(gallery).toBeVisible();

    // Count thumbnail buttons
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails).toHaveCount(27);
  });

  test('opens modal when clicking thumbnail', async ({ page }) => {
    // Click first thumbnail
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Verify modal is open
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Verify image counter shows
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('1 / 27');
  });

  test('closes modal with close button', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal to be visible
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Click close button
    const closeButton = page.locator('[aria-label="Close image viewer"]');
    await closeButton.click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('closes modal with Escape key', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal to be visible
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('navigates to next image with arrow key', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Verify starting at image 1
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('1 / 27');

    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Verify moved to image 2
    await expect(counter).toContainText('2 / 27');
  });

  test('navigates to previous image with arrow key', async ({ page }) => {
    // Open modal on second image
    const secondThumbnail = page.locator('[role="button"][aria-label*="Image 2 of"]').first();
    await secondThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Verify starting at image 2
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');

    // Press left arrow
    await page.keyboard.press('ArrowLeft');

    // Verify moved to image 1
    await expect(counter).toContainText('1 / 27');
  });

  test('navigates with next button', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Click next button
    const nextButton = page.locator('[aria-label*="Next image"]');
    await nextButton.click();

    // Verify moved to image 2
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');
  });

  test('navigates with previous button', async ({ page }) => {
    // Open modal on second image
    const secondThumbnail = page.locator('[role="button"][aria-label*="Image 2 of"]').first();
    await secondThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Click previous button
    const prevButton = page.locator('[aria-label*="Previous image"]');
    await prevButton.click();

    // Verify moved to image 1
    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('1 / 27');
  });

  test('does not show previous button on first image', async ({ page }) => {
    // Open modal on first image
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Verify previous button does not exist
    const prevButton = page.locator('[aria-label*="Previous image"]');
    await expect(prevButton).not.toBeVisible();
  });

  test('does not show next button on last image', async ({ page }) => {
    // Open modal on last image (27)
    const lastThumbnail = page.locator('[role="button"][aria-label*="Image 27 of"]').first();
    await lastThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Verify next button does not exist
    const nextButton = page.locator('[aria-label*="Next image"]');
    await expect(nextButton).not.toBeVisible();
  });

  test('toggles metadata panel with button', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Click metadata toggle
    const metadataToggle = page.locator('[aria-label*="metadata"]').first();
    await metadataToggle.click();

    // Verify metadata panel is visible
    const metadataPanel = page.locator('.metadata-panel');
    await expect(metadataPanel).toBeVisible();

    // Click again to close
    await metadataToggle.click();

    // Verify metadata panel is hidden
    await expect(metadataPanel).not.toBeVisible();
  });

  test('toggles metadata panel with M key', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Press M key
    await page.keyboard.press('m');

    // Verify metadata panel is visible
    const metadataPanel = page.locator('.metadata-panel');
    await expect(metadataPanel).toBeVisible();

    // Press M again
    await page.keyboard.press('M');

    // Verify metadata panel is hidden
    await expect(metadataPanel).not.toBeVisible();
  });

  test('filters images by category', async ({ page }) => {
    // Find filter buttons
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();

    // Click action sports filter
    await actionSportsFilter.click();

    // Count visible thumbnails (should be 18)
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails).toHaveCount(18);
  });

  test('shows all images when clicking "All" filter', async ({ page }) => {
    // Click action sports filter first
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();
    await actionSportsFilter.click();

    // Click "All" filter
    const allFilter = page.locator('[aria-label*="Show all"]').first();
    await allFilter.click();

    // Verify all 27 images are shown
    const thumbnails = page.locator('[role="button"][aria-label*="Image"]');
    await expect(thumbnails).toHaveCount(27);
  });
});