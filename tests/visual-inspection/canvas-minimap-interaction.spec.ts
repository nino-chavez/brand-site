/**
 * Canvas Minimap & Zoom Interaction - Motion Capture Test
 *
 * Comprehensive UX validation test that captures user interactions at varying speeds:
 * - Minimap navigation at different zoom levels
 * - Click and drag canvas panning
 * - Zoom in/out controls interaction
 * - Combination of navigation methods
 *
 * Goal: Validate that the canvas experience feels smooth and responsive like Miro/Lucidchart
 */

import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CANVAS_URL = 'http://localhost:3003/?layout=canvas';
const MOTION_DIR = join(__dirname, '../../test-results/canvas-motion-captures');

test.describe('Canvas Minimap & Zoom Interaction - Motion Capture', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(CANVAS_URL, { waitUntil: 'networkidle' });

    // Dismiss onboarding modal if present
    const startButton = page.locator('text=Start Exploring');
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    await page.waitForSelector('.lightbox-canvas', { timeout: 10000 });
    await page.waitForTimeout(1500); // Let canvas settle
  });

  test('Scenario 1: Slow, deliberate minimap navigation at 100% zoom', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    const video = await page.video();

    // Start at default zoom (100%)
    await page.waitForTimeout(1000);

    // Slowly click different sections via minimap
    const minimap = page.locator('.minimap-container');
    await expect(minimap).toBeVisible();

    console.log('[TEST] Slow minimap navigation - clicking sections deliberately');

    // Click capture (center) - slow
    await page.mouse.click(150, 320); // Approximate minimap center
    await page.waitForTimeout(2000);

    // Click focus (left) - slow
    await page.mouse.click(50, 320);
    await page.waitForTimeout(2000);

    // Click frame (right) - slow
    await page.mouse.click(250, 320);
    await page.waitForTimeout(2000);

    // Click exposure (top) - slow
    await page.mouse.click(150, 220);
    await page.waitForTimeout(2000);

    // Click develop (bottom) - slow
    await page.mouse.click(150, 420);
    await page.waitForTimeout(2000);

    // Return to center
    await page.mouse.click(150, 320);
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-1-slow-minimap.zip') });

    if (video) {
      const path = await video.path();
      console.log('[VIDEO] Scenario 1 saved to:', path);
    }
  });

  test('Scenario 2: Fast minimap clicking at 100% zoom', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Fast minimap navigation - rapid section switching');

    // Rapid clicking through sections
    await page.mouse.click(150, 320); // center
    await page.waitForTimeout(500);

    await page.mouse.click(50, 320); // left
    await page.waitForTimeout(500);

    await page.mouse.click(250, 320); // right
    await page.waitForTimeout(500);

    await page.mouse.click(150, 220); // top
    await page.waitForTimeout(500);

    await page.mouse.click(150, 420); // bottom
    await page.waitForTimeout(500);

    await page.mouse.click(250, 420); // bottom-right
    await page.waitForTimeout(500);

    // Rapid back and forth
    await page.mouse.click(50, 320);
    await page.waitForTimeout(300);
    await page.mouse.click(250, 320);
    await page.waitForTimeout(300);
    await page.mouse.click(50, 320);
    await page.waitForTimeout(300);
    await page.mouse.click(250, 320);
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-2-fast-minimap.zip') });
  });

  test('Scenario 3: Zoom in, then minimap navigation', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Zoom in 2x, then navigate with minimap');

    // Click zoom in button twice
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    await zoomIn.click();
    await page.waitForTimeout(500);
    await zoomIn.click();
    await page.waitForTimeout(1000);

    // Now navigate with minimap at 144% zoom (1.2 * 1.2)
    await page.mouse.click(50, 320); // focus section
    await page.waitForTimeout(1500);

    await page.mouse.click(250, 320); // frame section
    await page.waitForTimeout(1500);

    await page.mouse.click(150, 220); // exposure section
    await page.waitForTimeout(1500);

    await page.mouse.click(150, 320); // back to center
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-3-zoom-in-minimap.zip') });
  });

  test('Scenario 4: Zoom out, then minimap navigation', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Zoom out 2x, then navigate with minimap');

    // Click zoom out button twice
    const zoomOut = page.locator('button[aria-label="Zoom out"]');
    await zoomOut.click();
    await page.waitForTimeout(500);
    await zoomOut.click();
    await page.waitForTimeout(1000);

    // Navigate with minimap at ~69% zoom (1/1.2 * 1/1.2)
    await page.mouse.click(50, 320);
    await page.waitForTimeout(1500);

    await page.mouse.click(250, 320);
    await page.waitForTimeout(1500);

    await page.mouse.click(150, 420);
    await page.waitForTimeout(1500);

    await page.mouse.click(150, 320);
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-4-zoom-out-minimap.zip') });
  });

  test('Scenario 5: Slow canvas drag panning', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Slow drag panning - deliberate movements');

    // Get canvas element
    const canvas = page.locator('.lightbox-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Slow drag to the right
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY, { steps: 20 }); // 20 steps = slow
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Slow drag to the left
    await page.mouse.down();
    await page.mouse.move(centerX - 200, centerY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Slow drag down
    await page.mouse.down();
    await page.mouse.move(centerX, centerY + 150, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Slow drag up
    await page.mouse.down();
    await page.mouse.move(centerX, centerY - 150, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-5-slow-drag.zip') });
  });

  test('Scenario 6: Fast canvas drag panning', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Fast drag panning - quick movements');

    const canvas = page.locator('.lightbox-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Fast drag to the right
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 300, centerY, { steps: 3 }); // 3 steps = fast
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Fast drag to the left
    await page.mouse.down();
    await page.mouse.move(centerX - 300, centerY, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Fast diagonal drag
    await page.mouse.down();
    await page.mouse.move(centerX + 200, centerY + 200, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Fast drag back
    await page.mouse.down();
    await page.mouse.move(centerX - 200, centerY - 200, { steps: 3 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-6-fast-drag.zip') });
  });

  test('Scenario 7: Mixed interaction - zoom, drag, minimap', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Mixed interaction - realistic usage pattern');

    const canvas = page.locator('.lightbox-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Start: click minimap to go to focus section
    await page.mouse.click(50, 320);
    await page.waitForTimeout(1500);

    // Zoom in to see details
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    await zoomIn.click();
    await page.waitForTimeout(1000);

    // Drag around a bit
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 100, centerY + 50, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Use minimap to jump to frame section
    await page.mouse.click(250, 320);
    await page.waitForTimeout(1500);

    // Zoom out
    const zoomOut = page.locator('button[aria-label="Zoom out"]');
    await zoomOut.click();
    await page.waitForTimeout(500);
    await zoomOut.click();
    await page.waitForTimeout(1000);

    // Drag to explore
    await page.mouse.down();
    await page.mouse.move(centerX - 150, centerY, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Reset zoom
    const resetZoom = page.locator('button[aria-label="Reset zoom"]');
    await resetZoom.click();
    await page.waitForTimeout(1000);

    // Return to center via minimap
    await page.mouse.click(150, 320);
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-7-mixed.zip') });
  });

  test('Scenario 8: Extreme zoom in + drag', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Extreme zoom in - test performance at max zoom');

    const canvas = page.locator('.lightbox-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Zoom in to max (3.0x is max in SCALE_LIMITS)
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    for (let i = 0; i < 8; i++) {
      await zoomIn.click();
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1000);

    // Try dragging at max zoom
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX + 100, centerY + 100, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Navigate with minimap at max zoom
    await page.mouse.click(250, 320);
    await page.waitForTimeout(1500);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-8-extreme-zoom.zip') });
  });

  test('Scenario 9: Rapid zoom in/out cycling', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Rapid zoom cycling - test zoom control responsiveness');

    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    const zoomOut = page.locator('button[aria-label="Zoom out"]');

    // Rapid zoom in
    await zoomIn.click();
    await page.waitForTimeout(200);
    await zoomIn.click();
    await page.waitForTimeout(200);
    await zoomIn.click();
    await page.waitForTimeout(500);

    // Rapid zoom out
    await zoomOut.click();
    await page.waitForTimeout(200);
    await zoomOut.click();
    await page.waitForTimeout(200);
    await zoomOut.click();
    await page.waitForTimeout(500);

    // Rapid cycling
    await zoomIn.click();
    await page.waitForTimeout(150);
    await zoomOut.click();
    await page.waitForTimeout(150);
    await zoomIn.click();
    await page.waitForTimeout(150);
    await zoomOut.click();
    await page.waitForTimeout(150);
    await zoomIn.click();
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-9-rapid-zoom.zip') });
  });

  test('Scenario 10: Complete workflow - realistic user session', async ({ page, context }) => {
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('[TEST] Complete workflow - simulating real user exploration');

    const canvas = page.locator('.lightbox-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // User lands on canvas, looks around with minimap
    await page.waitForTimeout(1000);

    // Explore sections via minimap
    await page.mouse.click(50, 320); // focus
    await page.waitForTimeout(2000);

    // Zoom in to read content
    const zoomIn = page.locator('button[aria-label="Zoom in"]');
    await zoomIn.click();
    await page.waitForTimeout(1000);

    // Drag to see more of the section
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 100, centerY - 50, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Jump to projects section
    await page.mouse.click(250, 320);
    await page.waitForTimeout(2000);

    // Drag around to explore projects
    await page.mouse.down();
    await page.mouse.move(centerX, centerY + 100, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(800);

    // Check out gallery
    await page.mouse.click(150, 420);
    await page.waitForTimeout(2000);

    // Zoom out to see full view
    const zoomOut = page.locator('button[aria-label="Zoom out"]');
    await zoomOut.click();
    await page.waitForTimeout(500);
    await zoomOut.click();
    await page.waitForTimeout(1000);

    // Navigate back to center
    await page.mouse.click(150, 320);
    await page.waitForTimeout(1500);

    // Reset to default view
    const resetZoom = page.locator('button[aria-label="Reset zoom"]');
    await resetZoom.click();
    await page.waitForTimeout(1000);

    await context.tracing.stop({ path: join(MOTION_DIR, 'scenario-10-complete-workflow.zip') });
  });
});
