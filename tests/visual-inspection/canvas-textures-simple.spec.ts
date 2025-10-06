/**
 * Canvas Paper Textures - Simple Visual Inspection
 *
 * Simplified test to capture clean screenshots of paper textures
 */

import { test } from '@playwright/test';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'test-results', 'canvas-textures');
const CANVAS_URL = 'http://localhost:3003/?layout=canvas';

test.describe('Canvas Paper Textures - Simple Assessment', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to canvas layout
    await page.goto(CANVAS_URL, { waitUntil: 'networkidle' });

    // Dismiss onboarding modal
    const startButton = page.locator('text=Start Exploring');
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    // Wait for canvas to be ready
    await page.waitForSelector('.lightbox-canvas', { timeout: 10000 });
    await page.waitForTimeout(1500);
  });

  test('Canvas paper textures overview', async ({ page }) => {
    // Zoom out to see multiple sections
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-600px, -400px, 0) scale(0.4)';
      }
    });

    await page.waitForTimeout(1500);

    // Full canvas view
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'canvas-overview.png'),
      fullPage: false
    });

    // Zoom to medium for better detail
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-600px, -400px, 0) scale(0.6)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'canvas-medium-zoom.png'),
      fullPage: false
    });

    // Focus on center section (Capture - torn notebook)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-600px, -400px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'capture-torn-notebook.png'),
      fullPage: false
    });

    // Pan to left section (Focus - scratch notes)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(800px, -400px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'focus-scratch-notes.png'),
      fullPage: false
    });

    // Pan to right section (Frame - corner fold)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-2000px, -400px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'frame-corner-fold.png'),
      fullPage: false
    });

    // Pan to top section (Exposure - index card)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-600px, 600px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'exposure-index-card.png'),
      fullPage: false
    });

    // Pan to bottom section (Develop - filmstrip)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-600px, -1500px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'develop-filmstrip.png'),
      fullPage: false
    });

    // Pan to bottom-right section (Portfolio - polaroid)
    await page.evaluate(() => {
      const canvasContent = document.querySelector('.canvas-content');
      if (canvasContent) {
        (canvasContent as HTMLElement).style.transform = 'translate3d(-2200px, -1500px, 0) scale(1.0)';
      }
    });

    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'portfolio-polaroid.png'),
      fullPage: false
    });
  });
});
