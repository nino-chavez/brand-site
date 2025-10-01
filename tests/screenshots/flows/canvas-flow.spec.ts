/**
 * Canvas Layout Flow Screenshot Capture
 *
 * Captures the canvas layout mode experience,
 * documenting 3D navigation and spatial interactions.
 */

import { test, expect } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Canvas Layout Flow', () => {
  test('should capture canvas mode interactions', async ({ page }) => {
    console.log('\n🎬 Capturing Canvas Flow...\n');

    for (const viewportKey of defaultViewports) {
      console.log(`\n📱 Viewport: ${viewportKey}`);

      await setViewport(page, viewportKey);

      // Step 1: Load canvas mode
      await page.goto('http://localhost:3000?layout=canvas');
      await page.waitForTimeout(2000); // Allow canvas to initialize

      await captureFlowStep(page, 'canvas', {
        step: 1,
        description: 'Canvas mode initial load',
        action: 'Loaded page with layout=canvas parameter',
        viewportKey,
        appContext: {
          layoutMode: 'canvas',
          performanceMode: 'balanced',
          urlParams: { layout: 'canvas' },
        },
        analysisHints: {
          focusAreas: [
            'Canvas initialization',
            'Loading state visibility',
            '3D rendering quality',
          ],
          expectedBehaviors: [
            'Canvas renders without errors',
            'Loading indicator visible',
            'Smooth transition to interactive state',
          ],
        },
      });
      console.log(`  ✓ Step 1: Canvas load`);

      // Step 2: Wait for canvas to be fully interactive
      await page.waitForTimeout(1500);

      await captureFlowStep(page, 'canvas', {
        step: 2,
        description: 'Canvas fully loaded',
        action: 'Canvas system ready for interaction',
        viewportKey,
        appContext: {
          layoutMode: 'canvas',
          performanceMode: 'balanced',
        },
        analysisHints: {
          focusAreas: [
            'Camera controls visibility',
            'Content card layout',
            'Navigation indicators',
          ],
        },
      });
      console.log(`  ✓ Step 2: Canvas ready`);

      // Step 3: Check camera controls (if visible)
      const cameraControls = page.locator('[data-testid="camera-controls"]').first();
      if (await cameraControls.isVisible()) {
        await captureFlowStep(page, 'canvas', {
          step: 3,
          description: 'Camera controls visible',
          action: 'Camera controls rendered',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Control button clarity',
              'Icon visibility',
              'Accessible labels',
            ],
          },
        });
        console.log(`  ✓ Step 3: Camera controls`);
      }

      // Step 4: Canvas mode indicator
      const modeIndicator = page.locator('text=CANVAS MODE').first();
      if (await modeIndicator.isVisible()) {
        await captureFlowStep(page, 'canvas', {
          step: 4,
          description: 'Canvas mode indicator',
          action: 'Mode indicator visible in UI',
          viewportKey,
          analysisHints: {
            focusAreas: [
              'Indicator positioning',
              'Visual clarity',
              'User awareness',
            ],
          },
        });
        console.log(`  ✓ Step 4: Mode indicator\n`);
      }
    }

    console.log('✅ Canvas flow capture complete\n');
  });
});
