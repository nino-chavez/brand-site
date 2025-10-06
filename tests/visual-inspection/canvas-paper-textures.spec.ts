/**
 * Canvas Paper Textures - Visual Inspection
 *
 * Captures screenshots and videos of canvas layout with paper textures
 * for thorough visual assessment of:
 * - Paper texture authenticity (torn, ruled, filmstrip, etc.)
 * - Light table aesthetic
 * - Section variety and consistency
 * - Interactive states (hover, active)
 * - Overall visual appeal
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'test-results', 'canvas-textures');
const CANVAS_URL = 'http://localhost:3003/?layout=canvas';

test.describe('Canvas Paper Textures - Visual Assessment', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to canvas layout
    await page.goto(CANVAS_URL, { waitUntil: 'networkidle' });

    // Wait for canvas to be ready
    await page.waitForSelector('.lightbox-canvas', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow animations to settle
  });

  test('1. Overview - All sections visible on light table', async ({ page }) => {
    // Zoom out to see all sections at once
    await page.evaluate(() => {
      const canvas = document.querySelector('.lightbox-canvas');
      if (canvas) {
        // Simulate zoom out to fit all sections
        (window as any).__canvasActions?.updatePosition({
          x: 2000,
          y: 1500,
          scale: 0.3
        });
      }
    });

    await page.waitForTimeout(1500);

    // Capture full light table view
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-overview-all-sections.png'),
      fullPage: false
    });
  });

  test('2. Capture Section - Torn Notebook Paper', async ({ page }) => {
    // Navigate to Capture section
    await page.click('button[aria-label="Navigate to Capture section"]');
    await page.waitForTimeout(1000);

    // Default view
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02a-capture-default.png'),
      fullPage: false
    });

    // Hover state
    await page.hover('button[aria-label="Navigate to Capture section"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02b-capture-hover.png'),
      fullPage: false
    });

    // Close-up of torn edge (top portion)
    await page.evaluate(() => {
      const section = document.querySelector('.canvas-section-torn');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02c-capture-torn-edge-detail.png'),
      fullPage: false,
      clip: { x: 300, y: 100, width: 800, height: 300 }
    });
  });

  test('3. Focus Section - Scratch Note Paper', async ({ page }) => {
    // Navigate to Focus section
    await page.click('button[aria-label="Navigate to Focus section"]');
    await page.waitForTimeout(1000);

    // Default view
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03a-focus-default.png'),
      fullPage: false
    });

    // Close-up of ruled lines
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03b-focus-ruled-lines-detail.png'),
      fullPage: false,
      clip: { x: 200, y: 200, width: 600, height: 400 }
    });
  });

  test('4. Frame Section - Clean Paper with Corner Fold', async ({ page }) => {
    // Navigate to Frame section
    await page.click('button[aria-label="Navigate to Frame section"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04a-frame-default.png'),
      fullPage: false
    });

    // Close-up of corner fold
    await page.evaluate(() => {
      const section = document.querySelector('.canvas-section-folded');
      if (section) {
        const rect = section.getBoundingClientRect();
        window.scrollTo({
          left: rect.right - 300,
          top: rect.bottom - 300,
          behavior: 'smooth'
        });
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '04b-frame-corner-fold-detail.png'),
      fullPage: false,
      clip: { x: 700, y: 500, width: 400, height: 300 }
    });
  });

  test('5. Exposure Section - Index Card Style', async ({ page }) => {
    // Navigate to Exposure section
    await page.click('button[aria-label="Navigate to Exposure section"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05a-exposure-default.png'),
      fullPage: false
    });

    // Close-up of horizontal lines and margin
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '05b-exposure-lines-margin-detail.png'),
      fullPage: false,
      clip: { x: 150, y: 250, width: 700, height: 400 }
    });
  });

  test('6. Develop Section - Filmstrip with Sprocket Holes', async ({ page }) => {
    // Navigate to Develop section
    await page.click('button[aria-label="Navigate to Develop section"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06a-develop-default.png'),
      fullPage: false
    });

    // Close-up of sprocket holes on left edge
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06b-develop-sprocket-left-detail.png'),
      fullPage: false,
      clip: { x: 50, y: 200, width: 150, height: 400 }
    });

    // Close-up of sprocket holes on right edge
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '06c-develop-sprocket-right-detail.png'),
      fullPage: false,
      clip: { x: 950, y: 200, width: 150, height: 400 }
    });
  });

  test('7. Portfolio Section - Polaroid Style', async ({ page }) => {
    // Navigate to Portfolio section
    await page.click('button[aria-label="Navigate to Portfolio section"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '07a-portfolio-default.png'),
      fullPage: false
    });

    // Close-up of bottom caption area
    await page.evaluate(() => {
      const section = document.querySelector('.canvas-section-polaroid');
      if (section) {
        const rect = section.getBoundingClientRect();
        window.scrollTo({
          left: rect.left + 200,
          top: rect.bottom - 150,
          behavior: 'smooth'
        });
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '07b-portfolio-caption-area-detail.png'),
      fullPage: false,
      clip: { x: 300, y: 550, width: 600, height: 200 }
    });
  });

  test('8. Video - Complete Canvas Navigation Tour', async ({ page, context }) => {
    // Start recording
    await context.tracing.start({ screenshots: true, snapshots: true });

    // Tour through all sections
    const sections = [
      { name: 'Capture', label: 'Navigate to Capture section' },
      { name: 'Focus', label: 'Navigate to Focus section' },
      { name: 'Frame', label: 'Navigate to Frame section' },
      { name: 'Exposure', label: 'Navigate to Exposure section' },
      { name: 'Develop', label: 'Navigate to Develop section' },
      { name: 'Portfolio', label: 'Navigate to Portfolio section' }
    ];

    for (const section of sections) {
      await page.click(`button[aria-label="${section.label}"]`);
      await page.waitForTimeout(2000); // Allow transition to complete

      // Slight hover to show interaction
      await page.hover(`button[aria-label="${section.label}"]`);
      await page.waitForTimeout(500);
    }

    // Pan around canvas
    await page.mouse.move(600, 400);
    await page.mouse.down();
    await page.mouse.move(400, 300, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Stop recording
    await context.tracing.stop({ path: path.join(OUTPUT_DIR, '08-navigation-tour.zip') });
  });

  test('9. Comparison - Side-by-Side Paper Styles', async ({ page }) => {
    // Zoom to fit multiple sections
    await page.evaluate(() => {
      (window as any).__canvasActions?.updatePosition({
        x: 2000,
        y: 1500,
        scale: 0.5
      });
    });
    await page.waitForTimeout(1500);

    // Capture for comparison
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '09-comparison-multiple-styles.png'),
      fullPage: false
    });
  });

  test('10. Light Table Background - Grid and Gradient', async ({ page }) => {
    // Zoom way out to see background
    await page.evaluate(() => {
      (window as any).__canvasActions?.updatePosition({
        x: 2000,
        y: 1500,
        scale: 0.2
      });
    });
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, '10-light-table-background.png'),
      fullPage: false
    });
  });

  test('11. Interactive States - Active vs Inactive', async ({ page }) => {
    // Click Capture (active state)
    await page.click('button[aria-label="Navigate to Capture section"]');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '11a-active-state-capture.png'),
      fullPage: false
    });

    // Click Focus to show Capture inactive
    await page.click('button[aria-label="Navigate to Focus section"]');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '11b-inactive-state-capture.png'),
      fullPage: false
    });
  });

  test('12. Minimap - Spatial Overview', async ({ page }) => {
    // Ensure minimap is visible
    await page.waitForSelector('.canvas-minimap', { timeout: 5000 });

    // Capture minimap with sections
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '12-minimap-overview.png'),
      fullPage: false,
      clip: { x: 0, y: 0, width: 300, height: 300 }
    });
  });
});

test.describe('Canvas Paper Textures - Performance Assessment', () => {
  test('Frame rate during navigation', async ({ page }) => {
    await page.goto(CANVAS_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.lightbox-canvas');

    // Start performance tracing
    await page.evaluate(() => {
      (window as any).frameRates = [];
      let lastTime = performance.now();

      function measureFrame() {
        const now = performance.now();
        const fps = 1000 / (now - lastTime);
        (window as any).frameRates.push(fps);
        lastTime = now;
        requestAnimationFrame(measureFrame);
      }
      requestAnimationFrame(measureFrame);
    });

    // Navigate through sections
    const sections = [
      'Navigate to Capture section',
      'Navigate to Focus section',
      'Navigate to Frame section',
      'Navigate to Exposure section',
      'Navigate to Develop section',
      'Navigate to Portfolio section'
    ];

    for (const section of sections) {
      await page.click(`button[aria-label="${section}"]`);
      await page.waitForTimeout(1500);
    }

    // Get frame rate stats
    const frameRates = await page.evaluate(() => (window as any).frameRates);
    const avgFps = frameRates.reduce((a: number, b: number) => a + b, 0) / frameRates.length;
    const minFps = Math.min(...frameRates);

    console.log(`📊 Performance Metrics:`);
    console.log(`   Average FPS: ${avgFps.toFixed(1)}`);
    console.log(`   Minimum FPS: ${minFps.toFixed(1)}`);
    console.log(`   Frame count: ${frameRates.length}`);

    // Assert smooth performance
    expect(avgFps).toBeGreaterThan(50); // Should maintain 50+ fps
    expect(minFps).toBeGreaterThan(30); // Should never drop below 30fps
  });
});
