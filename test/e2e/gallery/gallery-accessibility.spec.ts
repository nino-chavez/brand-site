/**
 * Gallery System - Accessibility E2E Tests
 *
 * Tests accessibility features:
 * - Keyboard navigation
 * - Screen reader support (ARIA labels)
 * - Focus management
 * - High contrast support
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Gallery Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('passes axe accessibility audit on contact sheet', async ({ page }) => {
    // Run axe on the page
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('passes axe accessibility audit on modal', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Run axe on the modal
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Expect no violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('thumbnails have proper ARIA labels', async ({ page }) => {
    // Check first thumbnail
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    const ariaLabel = await firstThumbnail.getAttribute('aria-label');

    // Verify label format
    expect(ariaLabel).toContain('Image 1 of 27');
    expect(ariaLabel).toContain('Press Enter to view full size');
  });

  test('thumbnails are keyboard accessible', async ({ page }) => {
    // Tab to first thumbnail
    await page.keyboard.press('Tab');

    // Find focused element
    const focusedElement = page.locator(':focus');

    // Verify it's a thumbnail
    const ariaLabel = await focusedElement.getAttribute('aria-label');
    expect(ariaLabel).toContain('Image');

    // Press Enter to open
    await page.keyboard.press('Enter');

    // Verify modal opens
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();
  });

  test('thumbnails respond to Space key', async ({ page }) => {
    // Tab to first thumbnail
    await page.keyboard.press('Tab');

    // Press Space to open
    await page.keyboard.press('Space');

    // Verify modal opens
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();
  });

  test('modal has proper ARIA attributes', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Check ARIA attributes
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-label', 'Image viewer');
  });

  test('navigation buttons have descriptive ARIA labels', async ({ page }) => {
    // Open modal on middle image
    const middleThumbnail = page.locator('[role="button"][aria-label*="Image 10 of"]').first();
    await middleThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check previous button label
    const prevButton = page.locator('[aria-label*="Previous image"]');
    const prevLabel = await prevButton.getAttribute('aria-label');
    expect(prevLabel).toContain('Previous image');
    expect(prevLabel).toMatch(/\d+ of \d+/);

    // Check next button label
    const nextButton = page.locator('[aria-label*="Next image"]');
    const nextLabel = await nextButton.getAttribute('aria-label');
    expect(nextLabel).toContain('Next image');
    expect(nextLabel).toMatch(/\d+ of \d+/);
  });

  test('close button has proper ARIA label', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check close button
    const closeButton = page.locator('[aria-label="Close image viewer"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveAttribute('aria-label', 'Close image viewer');
  });

  test('metadata toggle has proper ARIA states', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Find metadata toggle
    const metadataToggle = page.locator('[aria-label*="metadata"]').first();

    // Check initial state (closed)
    await expect(metadataToggle).toHaveAttribute('aria-pressed', 'false');

    // Click to open
    await metadataToggle.click();

    // Check open state
    await expect(metadataToggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('screen reader announcements for image changes', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Check for live region
    const liveRegion = page.locator('[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeAttached();

    // Navigate to next image
    await page.keyboard.press('ArrowRight');

    // The announcement should update (we can't directly test screen reader behavior,
    // but we can verify the live region exists and updates)
    await page.waitForTimeout(100); // Brief wait for state update
    const announcement = await liveRegion.textContent();
    expect(announcement).toContain('Viewing image');
  });

  test('category filters have proper ARIA labels', async ({ page }) => {
    // Find all filter button
    const allFilter = page.locator('[aria-label*="Show all"]').first();
    const allLabel = await allFilter.getAttribute('aria-label');
    expect(allLabel).toContain('Show all');
    expect(allLabel).toMatch(/\d+ images/);

    // Find action sports filter
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();
    const actionLabel = await actionSportsFilter.getAttribute('aria-label');
    expect(actionLabel).toContain('action sports images');
    expect(actionLabel).toMatch(/\d+/);
  });

  test('category filters have proper ARIA pressed states', async ({ page }) => {
    // All filter should be pressed initially
    const allFilter = page.locator('[aria-label*="Show all"]').first();
    await expect(allFilter).toHaveAttribute('aria-pressed', 'true');

    // Other filters should not be pressed
    const actionSportsFilter = page.locator('[aria-label*="action sports images"]').first();
    await expect(actionSportsFilter).toHaveAttribute('aria-pressed', 'false');

    // Click action sports filter
    await actionSportsFilter.click();

    // Now action sports should be pressed
    await expect(actionSportsFilter).toHaveAttribute('aria-pressed', 'true');

    // And all filter should not be pressed
    await expect(allFilter).toHaveAttribute('aria-pressed', 'false');
  });

  test('filter toolbar has proper role', async ({ page }) => {
    // Find filter bar
    const filterBar = page.locator('[role="toolbar"][aria-label="Filter gallery by category"]');
    await expect(filterBar).toBeVisible();
    await expect(filterBar).toHaveAttribute('role', 'toolbar');
  });

  test('gallery list has proper role and label', async ({ page }) => {
    // Find gallery grid
    const gallery = page.locator('[role="list"]');
    await expect(gallery).toBeVisible();

    const ariaLabel = await gallery.getAttribute('aria-label');
    expect(ariaLabel).toContain('Portfolio gallery');
    expect(ariaLabel).toContain('images');
  });

  test('focus returns to thumbnail after closing modal', async ({ page }) => {
    // Click specific thumbnail
    const targetThumbnail = page.locator('[role="button"][aria-label*="Image 5 of"]').first();
    await targetThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Close modal with Escape
    await page.keyboard.press('Escape');

    // Focus should return to the thumbnail that opened the modal
    const focusedElement = page.locator(':focus');
    const ariaLabel = await focusedElement.getAttribute('aria-label');
    expect(ariaLabel).toContain('Image');
  });

  test('modal is focus trapped', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Modal should have focus
    const focusedElement = page.locator(':focus');
    const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('div'); // Modal container

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Should still be within modal
    const stillFocusedElement = page.locator(':focus');
    const isInsideModal = await stillFocusedElement.evaluate((el) => {
      return !!el.closest('[role="dialog"]');
    });
    expect(isInsideModal).toBe(true);
  });

  test('images have proper alt text', async ({ page }) => {
    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Wait for modal
    await page.waitForSelector('[role="dialog"][aria-label="Image viewer"]');

    // Find the image
    const image = page.locator('[role="dialog"] img').first();
    const altText = await image.getAttribute('alt');

    // Alt text should be descriptive
    expect(altText).toBeTruthy();
    expect(altText!.length).toBeGreaterThan(10);
  });

  test('reduced motion preference is respected', async ({ page, context }) => {
    // Set reduced motion preference
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      });
    });

    // Reload page with preference
    await page.reload();

    // Open modal
    const firstThumbnail = page.locator('[role="button"][aria-label*="Image 1 of"]').first();
    await firstThumbnail.click();

    // Modal should still open and function
    const modal = page.locator('[role="dialog"][aria-label="Image viewer"]');
    await expect(modal).toBeVisible();

    // Navigate (should work without animations)
    await page.keyboard.press('ArrowRight');

    const counter = page.locator('.image-counter');
    await expect(counter).toContainText('2 / 27');
  });
});