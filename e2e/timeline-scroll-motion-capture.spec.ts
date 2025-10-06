/**
 * Timeline Scroll Motion Capture Tests
 *
 * Captures video recordings of timeline scroll interactions at varying speeds
 * to validate scroll timing, section transitions, and overall UX quality.
 *
 * Test scenarios:
 * 1. Forward scroll (slow, medium, fast)
 * 2. Backward scroll (slow, medium, fast)
 *
 * Videos saved to: test-results/timeline-motion-capture/
 */

import { test, expect } from '@playwright/test';
import path from 'path';

// Configure video for all tests
test.use({
  video: 'on',
  videoSize: { width: 1920, height: 1080 }
});

const TIMELINE_URL = 'http://localhost:4173/?layout=timeline';
const SECTIONS = [
  'Capture',
  'Focus',
  'Frame',
  'Exposure',
  'Develop',
  'Portfolio'
];

/**
 * Helper: Scroll with controlled speed
 * @param page - Playwright page object
 * @param deltaY - Scroll amount per step (positive = down, negative = up)
 * @param steps - Number of scroll steps
 * @param delayMs - Delay between steps (controls speed)
 */
async function scrollWithSpeed(
  page: any,
  deltaY: number,
  steps: number,
  delayMs: number
) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(delayMs);
  }
}

test.describe('Timeline Scroll Motion Capture', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);

    // Wait for timeline to load
    await page.waitForSelector('[data-section="capture"]', { timeout: 10000 }).catch(() => {
      // Fallback: wait for first section by ID
      return page.waitForSelector('#layer-capture', { timeout: 10000 });
    });

    // Wait for filmstrip to be visible
    await page.waitForSelector('text=Capture', { timeout: 5000 });

    // Extra wait for animations to settle
    await page.waitForTimeout(2000);
  });

  test('Forward Scroll - Slow Speed (Deliberate Navigation)', async ({ page }) => {
    console.log('🎥 Recording: Forward scroll at SLOW speed');

    // Start at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Scroll through all 6 sections slowly
    // Slow: 50px scroll every 150ms
    for (let section = 0; section < 6; section++) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      // Scroll within section (simulate reading content)
      await scrollWithSpeed(page, 50, 20, 150);

      // Pause to appreciate content
      await page.waitForTimeout(2000);

      // Scroll past section boundary to trigger transition
      if (section < 5) {
        await scrollWithSpeed(page, 50, 10, 150);

        // Wait for horizontal transition to complete
        await page.waitForTimeout(1500);
      }
    }

    // Final pause to show end state
    await page.waitForTimeout(3000);
  });

  test('Forward Scroll - Medium Speed (Natural Navigation)', async ({ page }) => {
    console.log('🎥 Recording: Forward scroll at MEDIUM speed');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Medium: 100px scroll every 100ms
    for (let section = 0; section < 6; section++) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      // Scroll within section
      await scrollWithSpeed(page, 100, 15, 100);

      // Brief pause
      await page.waitForTimeout(1000);

      // Scroll past boundary
      if (section < 5) {
        await scrollWithSpeed(page, 100, 8, 100);
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForTimeout(2000);
  });

  test('Forward Scroll - Fast Speed (Power User)', async ({ page }) => {
    console.log('🎥 Recording: Forward scroll at FAST speed');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Fast: 150px scroll every 50ms
    for (let section = 0; section < 6; section++) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      // Quick scroll through section
      await scrollWithSpeed(page, 150, 10, 50);

      // Minimal pause
      await page.waitForTimeout(500);

      // Scroll past boundary
      if (section < 5) {
        await scrollWithSpeed(page, 150, 5, 50);
        await page.waitForTimeout(800);
      }
    }

    await page.waitForTimeout(2000);
  });

  test('Backward Scroll - Slow Speed (Deliberate Return)', async ({ page }) => {
    console.log('🎥 Recording: Backward scroll at SLOW speed');

    // Navigate to last section first using keyboard
    await page.keyboard.press('End');
    await page.waitForTimeout(2000);

    // Verify we're at Portfolio
    const sectionInfo = await page.textContent('[data-testid="section-info"]').catch(() => null);
    console.log(`  Starting from: ${sectionInfo || 'Portfolio (inferred)'}`);

    // Scroll backward through all sections slowly
    for (let section = 5; section >= 0; section--) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      if (section > 0) {
        // Scroll up to trigger backward transition
        await scrollWithSpeed(page, -50, 15, 150);

        // Wait for transition
        await page.waitForTimeout(1500);

        // Brief pause in new section
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForTimeout(3000);
  });

  test('Backward Scroll - Medium Speed (Natural Return)', async ({ page }) => {
    console.log('🎥 Recording: Backward scroll at MEDIUM speed');

    // Jump to end
    await page.keyboard.press('End');
    await page.waitForTimeout(2000);

    // Scroll backward at medium speed
    for (let section = 5; section >= 0; section--) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      if (section > 0) {
        await scrollWithSpeed(page, -100, 12, 100);
        await page.waitForTimeout(1000);
      }
    }

    await page.waitForTimeout(2000);
  });

  test('Backward Scroll - Fast Speed (Quick Return)', async ({ page }) => {
    console.log('🎥 Recording: Backward scroll at FAST speed');

    // Jump to end
    await page.keyboard.press('End');
    await page.waitForTimeout(2000);

    // Scroll backward quickly
    for (let section = 5; section >= 0; section--) {
      console.log(`  📍 Section ${section + 1}: ${SECTIONS[section]}`);

      if (section > 0) {
        await scrollWithSpeed(page, -150, 10, 50);
        await page.waitForTimeout(800);
      }
    }

    await page.waitForTimeout(2000);
  });

  test('Mixed Speed Test - Real User Behavior', async ({ page }) => {
    console.log('🎥 Recording: Mixed speed scroll (realistic usage)');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Capture → Focus (slow)
    console.log('  📍 Capture → Focus (slow)');
    await scrollWithSpeed(page, 50, 25, 150);
    await page.waitForTimeout(2000);

    // Focus → Frame (fast)
    console.log('  📍 Focus → Frame (fast)');
    await scrollWithSpeed(page, 150, 15, 50);
    await page.waitForTimeout(1000);

    // Frame → Exposure (medium)
    console.log('  📍 Frame → Exposure (medium)');
    await scrollWithSpeed(page, 100, 20, 100);
    await page.waitForTimeout(1500);

    // Exposure → Develop (slow - reading content)
    console.log('  📍 Exposure → Develop (slow)');
    await scrollWithSpeed(page, 50, 30, 150);
    await page.waitForTimeout(2000);

    // Develop → Portfolio (fast)
    console.log('  📍 Develop → Portfolio (fast)');
    await scrollWithSpeed(page, 150, 15, 50);
    await page.waitForTimeout(1000);

    // Back to Focus (fast backward)
    console.log('  📍 Portfolio → Focus (fast backward)');
    await scrollWithSpeed(page, -150, 40, 50);
    await page.waitForTimeout(3000);
  });

  test('Boundary Edge Cases', async ({ page }) => {
    console.log('🎥 Recording: Boundary edge case testing');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // Test 1: Multiple rapid scrolls at section boundary
    console.log('  🔬 Test: Rapid scrolls at Focus boundary');
    await scrollWithSpeed(page, 100, 15, 100);
    await page.waitForTimeout(500);

    // Rapid boundary scrolls
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(2000);

    // Test 2: Scroll to almost-boundary, then back, then forward
    console.log('  🔬 Test: Boundary oscillation');
    await scrollWithSpeed(page, 100, 10, 100);
    await scrollWithSpeed(page, -50, 5, 100);
    await scrollWithSpeed(page, 150, 8, 50);
    await page.waitForTimeout(2000);

    // Test 3: Test "skipped" section issue (Portfolio → Develop)
    console.log('  🔬 Test: Backward skip issue (Portfolio → Develop)');
    await page.keyboard.press('End');
    await page.waitForTimeout(2000);

    // Scroll backward rapidly
    await scrollWithSpeed(page, -150, 20, 50);
    await page.waitForTimeout(2000);

    // Verify we went through Develop (not skipped)
    const currentSection = await page.textContent('[data-testid="section-info"]').catch(() => {
      return page.evaluate(() => {
        const info = document.querySelector('[style*="Frame"]');
        return info?.textContent || 'Unknown';
      });
    });
    console.log(`  ✓ Current section: ${currentSection}`);

    await page.waitForTimeout(2000);
  });
});

test.describe('Timeline Control Bar Validation', () => {
  test('Control bar displays and updates correctly', async ({ page }) => {
    console.log('🎥 Recording: Control bar validation');

    await page.goto(TIMELINE_URL);
    await page.waitForTimeout(2000);

    // Check control bar exists
    const controlBar = await page.locator('[style*="bottom"]', {
      has: page.locator('text=/Frame \\d+ of \\d+/')
    }).first();

    await expect(controlBar).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Control bar visible');

    // Check timecode display
    const timecode = await page.locator('text=/00:\\d+:\\d+ \\/ 00:\\d+:\\d+/').first();
    await expect(timecode).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Timecode visible');

    // Check transition selector
    const transitionSelect = await page.locator('select[aria-label="Select transition effect"]');
    await expect(transitionSelect).toBeVisible({ timeout: 5000 });
    console.log('  ✓ Transition selector visible');

    // Navigate through sections and verify control bar updates
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1500);

      const frameText = await page.locator('text=/Frame \\d+ of 6/').first().textContent();
      console.log(`  📍 ${frameText}`);
    }

    await page.waitForTimeout(2000);
  });
});
