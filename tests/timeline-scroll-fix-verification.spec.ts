/**
 * Timeline Scroll Fix Verification
 *
 * Quick tests to verify scroll transitions now work with the carousel model fix
 */

import { test, expect } from '@playwright/test';

const TIMELINE_URL = 'http://localhost:3002/?layout=timeline';

test.describe('Timeline Scroll Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);
    await page.waitForSelector('text=Capture', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('Section transitions work via mouse wheel', async ({ page }) => {
    console.log('🔍 Testing mouse wheel scroll transitions...');

    // Get initial section
    const initialSection = await page.textContent('[style*="Frame"]');
    console.log(`  Initial: ${initialSection}`);

    // Scroll down within section to reach bottom
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    // Try to trigger transition
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(1000);

    // Check if section changed
    const finalSection = await page.textContent('[style*="Frame"]');
    console.log(`  Final: ${finalSection}`);

    // Extract frame numbers
    const initialFrame = parseInt(initialSection?.match(/Frame (\d+)/)?.[1] || '1');
    const finalFrame = parseInt(finalSection?.match(/Frame (\d+)/)?.[1] || '1');

    console.log(`  Transition: Frame ${initialFrame} → Frame ${finalFrame}`);
    expect(finalFrame).toBeGreaterThan(initialFrame);
  });

  test('Scroll progress updates correctly', async ({ page }) => {
    console.log('🔍 Testing scroll progress tracking...');

    // Scroll down and check progress
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);

    const progress = await page.textContent('[style*="Frame"] ~ div');
    console.log(`  Progress indicator: ${progress}`);

    // Should show percentage or scroll hint
    expect(progress).toMatch(/\d+%|Scroll|down/);
  });

  test('Keyboard navigation still works', async ({ page }) => {
    console.log('🔍 Testing keyboard navigation...');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    const section = await page.textContent('[style*="Frame"]');
    console.log(`  After →: ${section}`);

    expect(section).toContain('Frame 2');
  });
});
