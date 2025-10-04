/**
 * Game Flow Sections Screenshot Capture
 *
 * Documents all photography workflow sections (Capture, Focus, Frame, etc.)
 * showing the progression through the creative process.
 */

import { test } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Game Flow Sections', () => {
  test('should capture all photography workflow sections', async ({ page }) => {
    // Increase timeout for multi-section capture (Chromium: 29s, Firefox/WebKit: 32-47s)
    test.setTimeout(60000); // 30s → 60s

    console.log('\n🎬 Capturing Game Flow Sections...\n');

    const sections = [
      { name: 'capture', description: 'Capture phase', dataAttr: 'capture' },
      { name: 'focus', description: 'Focus phase', dataAttr: 'focus' },
      { name: 'frame', description: 'Frame phase', dataAttr: 'frame' },
      { name: 'exposure', description: 'Exposure phase', dataAttr: 'exposure' },
      { name: 'develop', description: 'Develop phase', dataAttr: 'develop' },
      { name: 'portfolio', description: 'Portfolio showcase', dataAttr: 'portfolio' },
    ];

    for (const viewportKey of defaultViewports) {
      console.log(`\n📱 Viewport: ${viewportKey}`);

      // Add navigation detection
      page.on('framenavigated', (frame) => {
        if (frame === page.mainFrame()) {
          console.log(`  🔄 Page navigation detected: ${frame.url()}`);
        }
      });

      await setViewport(page, viewportKey);
      // Use production build (port 3002) instead of dev server to avoid HMR navigation issues
      const testUrl = process.env.TEST_URL || 'http://localhost:3002';
      await page.goto(testUrl, { waitUntil: 'domcontentloaded' });

      // Wait for initial page load, animations, and ensure no navigation occurs
      await page.waitForLoadState('load');
      await page.waitForTimeout(2000);

      let stepNumber = 1;

      for (const section of sections) {
        try {
          const sectionElement = page.locator(`[data-section="${section.dataAttr}"]`).first();

          // Wait for element to be attached and visible with retry
          await sectionElement.waitFor({ state: 'attached', timeout: 5000 });

          // Check if visible before scrolling
          const isVisible = await sectionElement.isVisible();

          if (isVisible) {
            // Scroll with retry logic
            let scrollAttempts = 0;
            const maxAttempts = 3;

            while (scrollAttempts < maxAttempts) {
              try {
                await sectionElement.scrollIntoViewIfNeeded({ timeout: 10000 });
                // Wait for scroll animation and content load
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(800);
                break;
              } catch (scrollError) {
                scrollAttempts++;
                if (scrollAttempts >= maxAttempts) {
                  console.log(`  ⚠️  Failed to scroll to ${section.name} after ${maxAttempts} attempts - skipping`);
                  continue;
                }
                // Wait before retry
                await page.waitForTimeout(500);
              }
            }

            await captureFlowStep(page, 'game-flow', {
              step: stepNumber,
              description: section.description,
              action: `Scrolled to ${section.name} section`,
              viewportKey,
              analysisHints: {
                focusAreas: [
                  'Section layout and composition',
                  'Content hierarchy',
                  'Visual effects and transitions',
                  'Photography metaphor consistency',
                ],
                expectedBehaviors: [
                  'Section fully visible',
                  'Content properly aligned',
                  'Effects render smoothly',
                ],
              },
            });

            console.log(`  ✓ Step ${stepNumber}: ${section.description}`);
            stepNumber++;
          } else {
            console.log(`  ⚠️  Section ${section.name} not visible - skipping`);
          }
        } catch (error) {
          console.log(`  ⚠️  Error with section ${section.name}: ${error.message} - skipping`);
          // Continue to next section instead of failing
          continue;
        }
      }

      console.log('');
    }

    console.log('✅ Game flow sections capture complete\n');
  });
});
