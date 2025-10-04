/**
 * Gallery Interaction Flow Screenshot Capture
 *
 * Documents the complete gallery experience including modal,
 * navigation, metadata panel, and touch gestures.
 */

import { test } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Gallery Flow', () => {
  test('should capture gallery interaction journey', async ({ page }) => {
    console.log('\n🎬 Capturing Gallery Flow...\n');

    for (const viewportKey of defaultViewports) {
      console.log(`\n📱 Viewport: ${viewportKey}`);

      await setViewport(page, viewportKey);

      // Step 1: Navigate to gallery section
      const testUrl = process.env.TEST_URL || 'http://localhost:3002';
      await page.goto(testUrl);
      const gallerySection = page.locator('[data-section="portfolio"]').first();
      if (await gallerySection.isVisible()) {
        await gallerySection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'gallery', {
          step: 1,
          description: 'Gallery section view',
          action: 'Scrolled to gallery/portfolio section',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Gallery grid layout',
              'Thumbnail quality and sizing',
              'Category filter visibility',
            ],
            expectedBehaviors: [
              'Contact sheet grid visible',
              'Images load progressively',
              'Category filters accessible',
            ],
          },
        });
        console.log(`  ✓ Step 1: Gallery section`);
      }

      // Step 2: Click first gallery image
      const firstImage = page.locator('[data-testid="gallery-thumbnail"]').first();
      if (await firstImage.isVisible()) {
        await firstImage.click();
        await page.waitForTimeout(800);

        await captureFlowStep(page, 'gallery', {
          step: 2,
          description: 'Modal opened',
          action: 'Clicked first gallery image',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Modal backdrop and blur',
              'Image display quality',
              'Navigation controls',
            ],
          },
        });
        console.log(`  ✓ Step 2: Modal open`);
      }

      // Step 3: Check metadata panel
      const metadataToggle = page.locator('[data-testid="metadata-toggle"]').first();
      if (await metadataToggle.isVisible()) {
        await metadataToggle.click();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'gallery', {
          step: 3,
          description: 'Metadata panel open',
          action: 'Opened metadata panel',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Metadata panel layout',
              'EXIF data display',
              'Panel animation',
            ],
          },
        });
        console.log(`  ✓ Step 3: Metadata panel`);
      }

      // Step 4: Navigate to next image
      const nextButton = page.locator('[data-testid="next-image"]').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(600);

        await captureFlowStep(page, 'gallery', {
          step: 4,
          description: 'Next image',
          action: 'Navigated to next image',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Image transition smoothness',
              'Updated metadata',
              'Navigation state',
            ],
          },
        });
        console.log(`  ✓ Step 4: Next image`);
      }

      // Step 5: Close modal
      const closeButton = page.locator('[data-testid="close-modal"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'gallery', {
          step: 5,
          description: 'Modal closed',
          action: 'Closed gallery modal',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Return to gallery grid',
              'Focus restoration',
              'Close animation',
            ],
          },
        });
        console.log(`  ✓ Step 5: Modal closed\n`);
      }
    }

    console.log('✅ Gallery flow capture complete\n');
  });
});
