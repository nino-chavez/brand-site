/**
 * Navigation Flow Screenshot Capture
 *
 * Captures user's journey through main site navigation,
 * documenting section transitions and scroll behavior.
 */

import { test, expect } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Navigation Flow', () => {
  test('should capture complete navigation journey', async ({ page }) => {
    console.log('\n🎬 Capturing Navigation Flow...\n');

    for (const viewportKey of defaultViewports) {
      console.log(`\n📱 Viewport: ${viewportKey}`);

      await setViewport(page, viewportKey);

      // Step 1: Initial page load
      const testUrl = process.env.TEST_URL || 'http://localhost:3002';
      await page.goto(testUrl);
      await captureFlowStep(page, 'navigation', {
        step: 1,
        description: 'Initial page load',
        action: 'Navigated to home page',
        viewportKey,
        appContext: {
          layoutMode: 'traditional',
          performanceMode: 'balanced',
        },
        analysisHints: {
          focusAreas: [
            'Hero section visibility',
            'Navigation menu clarity',
            'Call-to-action prominence',
          ],
          expectedBehaviors: [
            'Hero section fully visible',
            'Navigation accessible',
            'Loading state handled gracefully',
          ],
        },
      });
      console.log(`  ✓ Step 1: Initial load`);

      // Step 2: Scroll to About section
      const aboutSection = page.locator('[data-section="about"]').first();
      if (await aboutSection.isVisible()) {
        await aboutSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'navigation', {
          step: 2,
          description: 'About section',
          action: 'Scrolled to About section',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Content readability',
              'Section transition smoothness',
            ],
          },
        });
        console.log(`  ✓ Step 2: About section`);
      }

      // Step 3: Scroll to Work section
      const workSection = page.locator('[data-section="work"]').first();
      if (await workSection.isVisible()) {
        await workSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'navigation', {
          step: 3,
          description: 'Work section',
          action: 'Scrolled to Work section',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Project card layout',
              'Image loading performance',
            ],
          },
        });
        console.log(`  ✓ Step 3: Work section`);
      }

      // Step 4: Scroll to Gallery section
      const gallerySection = page.locator('[data-section="gallery"]').first();
      if (await gallerySection.isVisible()) {
        await gallerySection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'navigation', {
          step: 4,
          description: 'Gallery section',
          action: 'Scrolled to Gallery section',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Gallery grid layout',
              'Thumbnail quality',
            ],
          },
        });
        console.log(`  ✓ Step 4: Gallery section`);
      }

      // Step 5: Scroll to Contact section
      const contactSection = page.locator('[data-section="contact"]').first();
      if (await contactSection.isVisible()) {
        await contactSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await captureFlowStep(page, 'navigation', {
          step: 5,
          description: 'Contact section',
          action: 'Scrolled to Contact section',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Contact form accessibility',
              'Form field clarity',
            ],
          },
        });
        console.log(`  ✓ Step 5: Contact section`);
      }

      // Step 6: Scroll back to top
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(800);

      await captureFlowStep(page, 'navigation', {
        step: 6,
        description: 'Return to top',
        action: 'Scrolled back to top',
        viewportKey,
        analysisHints: {
          focusAreas: [
            'Scroll-to-top behavior',
            'Navigation state after scroll',
          ],
        },
      });
      console.log(`  ✓ Step 6: Return to top\n`);
    }

    console.log('✅ Navigation flow capture complete\n');
  });
});
