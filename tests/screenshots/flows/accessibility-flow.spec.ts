/**
 * Accessibility Flow Screenshot Capture
 *
 * Captures keyboard navigation and focus states to document
 * accessibility features for AI analysis.
 */

import { test, expect } from '@playwright/test';
import { captureFlowStep, setViewport } from '../utils/screenshot-helpers';
import { defaultViewports } from '../config/viewports';

test.describe('Accessibility Flow', () => {
  test('should capture keyboard navigation journey', async ({ page }) => {
    console.log('\n🎬 Capturing Accessibility Flow...\n');

    // Only test desktop viewport for keyboard navigation
    const viewportKey = 'desktop-1920x1080';

    console.log(`\n📱 Viewport: ${viewportKey}`);
    await setViewport(page, viewportKey);

    // Step 1: Initial load with focus
    await page.goto('http://localhost:3000');

    await captureFlowStep(page, 'accessibility', {
      step: 1,
      description: 'Initial page focus',
      action: 'Page loaded, awaiting keyboard input',
      viewportKey,
      analysisHints: {
        focusAreas: [
          'Skip link visibility on focus',
          'Initial focus position',
          'Keyboard navigation hints',
        ],
        expectedBehaviors: [
          'Skip link appears on Tab',
          'Focus indicators visible',
          'Logical tab order',
        ],
      },
    });
    console.log(`  ✓ Step 1: Initial focus`);

    // Step 2: Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    await captureFlowStep(page, 'accessibility', {
      step: 2,
      description: 'First tab focus',
      action: 'Pressed Tab - first interactive element',
      viewportKey,
      analysisHints: {
        focusAreas: [
          'Focus ring visibility',
          'Element highlight clarity',
          'Focus position correctness',
        ],
      },
    });
    console.log(`  ✓ Step 2: First tab`);

    // Step 3: Navigate through several elements
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);
    }

    await captureFlowStep(page, 'accessibility', {
      step: 3,
      description: 'Navigation menu focused',
      action: 'Tabbed through to navigation menu',
      viewportKey,
      analysisHints: {
        focusAreas: [
          'Menu item focus state',
          'Active element clarity',
          'Tab order logic',
        ],
      },
    });
    console.log(`  ✓ Step 3: Navigation focus`);

    // Step 4: Test focus on interactive component
    const interactiveButton = page.locator('button').first();
    if (await interactiveButton.isVisible()) {
      await interactiveButton.focus();
      await page.waitForTimeout(300);

      await captureFlowStep(page, 'accessibility', {
        step: 4,
        description: 'Button focus state',
        action: 'Focused interactive button',
        viewportKey,
        analysisHints: {
          focusAreas: [
            'Button focus indicator',
            'Color contrast in focus state',
            'Label readability',
          ],
        },
      });
      console.log(`  ✓ Step 4: Button focus`);
    }

    // Step 5: Test Escape key behavior
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    await captureFlowStep(page, 'accessibility', {
      step: 5,
      description: 'After Escape key',
      action: 'Pressed Escape key',
      viewportKey,
      analysisHints: {
        focusAreas: [
          'Modal/overlay dismissal',
          'Focus return behavior',
          'State restoration',
        ],
      },
    });
    console.log(`  ✓ Step 5: Escape behavior\n`);

    console.log('✅ Accessibility flow capture complete\n');
  });
});
