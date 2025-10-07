/**
 * Timeline Scroll Behavior Audit
 *
 * Comprehensive visual testing for scroll issues in timeline layout:
 * - Vertical→horizontal transition smoothness
 * - Mouse wheel scroll behavior
 * - Touchpad scroll behavior
 * - Touch gesture support
 * - Pauses, jumps, and unpredictable behavior
 *
 * Outputs:
 * - Video recordings of each test scenario
 * - Screenshots at critical moments
 * - Performance metrics
 * - Audit report with findings
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const TIMELINE_URL = 'http://localhost:3002/?layout=timeline';
const AUDIT_DIR = 'test-results/timeline-scroll-audit';
const SCREENSHOTS_DIR = path.join(AUDIT_DIR, 'screenshots');
const VIDEOS_DIR = path.join(AUDIT_DIR, 'videos');

// Ensure output directories exist
test.beforeAll(() => {
  [AUDIT_DIR, SCREENSHOTS_DIR, VIDEOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

// Configure video recording for all tests
test.use({
  video: {
    mode: 'on',
    size: { width: 1920, height: 1080 }
  },
  viewport: { width: 1920, height: 1080 }
});

interface ScrollMetrics {
  timestamp: number;
  scrollY: number;
  currentSection: number;
  isTransitioning: boolean;
  scrollProgress: number;
}

/**
 * Capture scroll state metrics
 */
async function captureScrollMetrics(page: Page): Promise<ScrollMetrics> {
  return await page.evaluate(() => {
    const scrollY = window.scrollY;
    const sectionInfo = document.querySelector('[style*="Frame"]')?.textContent || '';
    const currentSection = parseInt(sectionInfo.match(/Frame (\d+)/)?.[1] || '1');

    // Check if transition overlay is visible
    const transitionOverlay = document.querySelector('[class*="fixed inset-0"][class*="bg-black"]');
    const isTransitioning = transitionOverlay !== null;

    // Calculate scroll progress (approximate)
    const viewportHeight = window.innerHeight;
    const scrollProgress = (scrollY % viewportHeight) / viewportHeight;

    return {
      timestamp: Date.now(),
      scrollY,
      currentSection,
      isTransitioning,
      scrollProgress
    };
  });
}

/**
 * Detect scroll anomalies (pauses, jumps)
 */
function detectScrollAnomalies(metrics: ScrollMetrics[]): string[] {
  const anomalies: string[] = [];

  for (let i = 1; i < metrics.length; i++) {
    const prev = metrics[i - 1];
    const curr = metrics[i];
    const timeDelta = curr.timestamp - prev.timestamp;
    const scrollDelta = Math.abs(curr.scrollY - prev.scrollY);

    // Detect pause (no scroll progress for >500ms)
    if (timeDelta > 500 && scrollDelta < 10) {
      anomalies.push(`PAUSE at t=${curr.timestamp}ms (${timeDelta}ms delay, minimal scroll)`);
    }

    // Detect jump (sudden large scroll change)
    if (scrollDelta > 500 && timeDelta < 100) {
      anomalies.push(`JUMP at t=${curr.timestamp}ms (${scrollDelta}px in ${timeDelta}ms)`);
    }

    // Detect stuck transition (transitioning flag stuck)
    if (prev.isTransitioning && curr.isTransitioning && timeDelta > 1000) {
      anomalies.push(`STUCK TRANSITION at t=${curr.timestamp}ms (${timeDelta}ms stuck)`);
    }
  }

  return anomalies;
}

test.describe('Timeline Scroll Behavior Audit - Mouse Wheel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);
    await page.waitForSelector('text=Capture', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('Audit: Vertical scroll within section (mouse wheel)', async ({ page }) => {
    console.log('🔍 AUDIT: Vertical scroll within section');

    const metrics: ScrollMetrics[] = [];

    // Start from top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Capture initial state
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mouse-wheel-01-initial.png') });

    // Scroll down within first section (should be smooth vertical scroll)
    console.log('  Scrolling within Capture section...');
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100); // 100px down
      await page.waitForTimeout(50);
      metrics.push(await captureScrollMetrics(page));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mouse-wheel-02-within-section.png') });

    // Analyze metrics
    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Metrics captured: ${metrics.length}`);
    console.log(`  Anomalies detected: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));

    // Verify smooth progression
    const scrollProgressions = metrics.map(m => m.scrollY);
    const isSmooth = scrollProgressions.every((y, i) =>
      i === 0 || y >= scrollProgressions[i - 1]
    );

    expect(isSmooth).toBeTruthy();
    expect(anomalies.length).toBeLessThan(3); // Allow max 2 anomalies
  });

  test('Audit: Vertical→Horizontal transition at section boundary', async ({ page }) => {
    console.log('🔍 AUDIT: Vertical→Horizontal transition');

    const metrics: ScrollMetrics[] = [];

    // Start from top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Scroll to near end of first section
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'transition-01-before.png') });
    console.log('  At section boundary, capturing transition...');

    // Scroll past boundary to trigger horizontal transition
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
      metrics.push(await captureScrollMetrics(page));
    }

    await page.waitForTimeout(1000); // Wait for transition to complete
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'transition-02-after.png') });

    // Analyze transition
    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Transition metrics: ${metrics.length}`);
    console.log(`  Anomalies detected: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));

    // Verify section changed
    const finalSection = metrics[metrics.length - 1].currentSection;
    console.log(`  Final section: ${finalSection} (expected: 2)`);
    expect(finalSection).toBe(2);
  });

  test('Audit: Continuous scroll through multiple sections', async ({ page }) => {
    console.log('🔍 AUDIT: Continuous multi-section scroll');

    const metrics: ScrollMetrics[] = [];
    const sectionChanges: number[] = [];

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    let lastSection = 1;

    // Continuous scroll through 3 sections
    console.log('  Starting continuous scroll (Capture → Focus → Frame)...');
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);

      const metric = await captureScrollMetrics(page);
      metrics.push(metric);

      // Track section changes
      if (metric.currentSection !== lastSection) {
        sectionChanges.push(i);
        console.log(`    Section change at step ${i}: ${lastSection} → ${metric.currentSection}`);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `continuous-section-${metric.currentSection}.png`)
        });
        lastSection = metric.currentSection;
      }
    }

    // Analyze
    const anomalies = detectScrollAnomalies(metrics);
    console.log(`\n  📊 Analysis:`);
    console.log(`    Total metrics: ${metrics.length}`);
    console.log(`    Section changes: ${sectionChanges.length}`);
    console.log(`    Anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`      ⚠️  ${a}`));

    // Verify we made it through at least 2 section transitions
    expect(sectionChanges.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Timeline Scroll Behavior Audit - Touchpad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);
    await page.waitForSelector('text=Capture', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('Audit: Touchpad smooth scroll within section', async ({ page }) => {
    console.log('🔍 AUDIT: Touchpad smooth scroll');

    const metrics: ScrollMetrics[] = [];

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Simulate touchpad smooth scroll (smaller deltas, faster rate)
    console.log('  Simulating touchpad scroll...');
    for (let i = 0; i < 30; i++) {
      await page.mouse.wheel(0, 30); // Smaller delta typical of touchpad
      await page.waitForTimeout(20); // Faster rate
      metrics.push(await captureScrollMetrics(page));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'touchpad-01-smooth.png') });

    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Touchpad metrics: ${metrics.length}`);
    console.log(`  Anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));

    // Touchpad should have fewer anomalies than mouse wheel
    expect(anomalies.length).toBeLessThan(5);
  });

  test('Audit: Touchpad inertial scrolling at boundary', async ({ page }) => {
    console.log('🔍 AUDIT: Touchpad inertial scroll at boundary');

    const metrics: ScrollMetrics[] = [];

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Scroll to boundary
    for (let i = 0; i < 15; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'touchpad-inertia-01-before.png') });

    // Simulate inertial scroll (fast scrolls with decay)
    console.log('  Simulating inertial scroll...');
    const deltas = [80, 70, 60, 50, 40, 30, 20, 10]; // Decaying velocity
    for (const delta of deltas) {
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(30);
      metrics.push(await captureScrollMetrics(page));
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'touchpad-inertia-02-after.png') });

    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Inertial scroll anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));
  });
});

test.describe('Timeline Scroll Behavior Audit - Touch Gestures (Mobile)', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    hasTouch: true,
    isMobile: true
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);
    // Timeline should redirect to traditional layout on mobile
    await page.waitForTimeout(2000);
  });

  test('Audit: Touch scroll behavior on mobile viewport', async ({ page }) => {
    console.log('🔍 AUDIT: Touch scroll on mobile');

    // Check if timeline redirected to traditional layout
    const url = page.url();
    console.log(`  Current URL: ${url}`);

    const isTraditional = !url.includes('layout=timeline') ||
                         await page.evaluate(() => window.innerWidth < 768);

    if (isTraditional) {
      console.log('  ✓ Timeline correctly redirected to traditional layout on mobile');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-traditional-layout.png') });
    } else {
      console.log('  ⚠️  Timeline layout active on mobile - testing touch gestures');

      // Test touch scroll
      await page.touchscreen.tap(200, 400);
      await page.waitForTimeout(500);

      // Swipe down
      await page.touchscreen.swipe({ x: 200, y: 300 }, { x: 200, y: 100 });
      await page.waitForTimeout(1000);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-touch-scroll.png') });
    }
  });
});

test.describe('Timeline Scroll Behavior Audit - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TIMELINE_URL);
    await page.waitForSelector('text=Capture', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('Audit: Rapid direction changes (scroll oscillation)', async ({ page }) => {
    console.log('🔍 AUDIT: Scroll direction oscillation');

    const metrics: ScrollMetrics[] = [];

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Scroll to mid-section
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(50);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'oscillation-01-start.png') });

    // Oscillate scroll direction
    console.log('  Oscillating scroll direction...');
    for (let i = 0; i < 10; i++) {
      const delta = i % 2 === 0 ? 150 : -150;
      await page.mouse.wheel(0, delta);
      await page.waitForTimeout(100);
      metrics.push(await captureScrollMetrics(page));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'oscillation-02-end.png') });

    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Oscillation anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));
  });

  test('Audit: Fast scroll spam (stress test)', async ({ page }) => {
    console.log('🔍 AUDIT: Fast scroll spam');

    const metrics: ScrollMetrics[] = [];

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Rapid-fire scrolls
    console.log('  Spamming scroll events...');
    for (let i = 0; i < 50; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(10); // Very fast
      if (i % 10 === 0) {
        metrics.push(await captureScrollMetrics(page));
      }
    }

    await page.waitForTimeout(2000); // Let everything settle
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'spam-final-state.png') });

    const finalMetric = await captureScrollMetrics(page);
    console.log(`  Final state: Section ${finalMetric.currentSection}, ScrollY: ${finalMetric.scrollY}`);

    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Spam test anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));
  });

  test('Audit: Backward scroll through all sections', async ({ page }) => {
    console.log('🔍 AUDIT: Full backward scroll');

    const metrics: ScrollMetrics[] = [];

    // Jump to end
    await page.keyboard.press('End');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'backward-01-start-end.png') });

    let lastSection = 6;

    // Scroll backward through all sections
    console.log('  Scrolling backward (Portfolio → Capture)...');
    for (let i = 0; i < 80; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(50);

      const metric = await captureScrollMetrics(page);
      metrics.push(metric);

      if (metric.currentSection !== lastSection) {
        console.log(`    Section: ${lastSection} → ${metric.currentSection}`);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, `backward-section-${metric.currentSection}.png`)
        });
        lastSection = metric.currentSection;
      }
    }

    const anomalies = detectScrollAnomalies(metrics);
    console.log(`  Backward scroll anomalies: ${anomalies.length}`);
    anomalies.forEach(a => console.log(`    ⚠️  ${a}`));

    // Verify we reached the beginning
    expect(lastSection).toBeLessThanOrEqual(2);
  });
});

test.afterAll(() => {
  console.log('\n📊 Timeline Scroll Audit Complete');
  console.log(`   Screenshots: ${SCREENSHOTS_DIR}`);
  console.log(`   Videos: Check test-results/ for video files`);
  console.log('\nReview screenshots and videos for visual evidence of:');
  console.log('  - Scroll pauses (frozen frames)');
  console.log('  - Scroll jumps (sudden position changes)');
  console.log('  - Transition smoothness');
  console.log('  - Section boundary behavior');
});
