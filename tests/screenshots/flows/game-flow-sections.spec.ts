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

      await setViewport(page, viewportKey);
      await page.goto('http://localhost:3000');

      let stepNumber = 1;

      for (const section of sections) {
        const sectionElement = page.locator(`[data-section="${section.dataAttr}"]`).first();

        if (await sectionElement.isVisible()) {
          await sectionElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(800);

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
        }
      }

      console.log('');
    }

    console.log('✅ Game flow sections capture complete\n');
  });
});
