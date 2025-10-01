/**
 * Motion Test Utilities
 *
 * Helper functions for automated motion testing.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Extract transform matrix values from a CSS transform string
 */
export function parseTransformMatrix(transform: string): {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
} | null {
  if (transform === 'none') {
    return { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 };
  }

  const matrixMatch = transform.match(
    /matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)/
  );

  if (!matrixMatch) return null;

  return {
    scaleX: parseFloat(matrixMatch[1]),
    scaleY: parseFloat(matrixMatch[4]),
    translateX: parseFloat(matrixMatch[5]),
    translateY: parseFloat(matrixMatch[6]),
  };
}

/**
 * Wait for CSS animation/transition to complete
 */
export async function waitForAnimationComplete(
  element: Locator,
  timeout: number = 3000
): Promise<void> {
  await element.evaluate(
    (el, timeoutMs) => {
      return new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Animation did not complete within ${timeoutMs}ms`));
        }, timeoutMs);

        const checkComplete = () => {
          const style = window.getComputedStyle(el);
          const opacity = parseFloat(style.opacity);
          const visibility = style.visibility;

          // Check if element is fully visible and settled
          if (opacity >= 0.99 && visibility === 'visible') {
            clearTimeout(timer);
            resolve();
          } else {
            requestAnimationFrame(checkComplete);
          }
        };

        requestAnimationFrame(checkComplete);
      });
    },
    timeout
  );
}

/**
 * Capture element's position for motion tracking
 */
export async function captureElementPosition(element: Locator): Promise<{
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error('Element has no bounding box');
  }
  return box;
}

/**
 * Check if element has moved from original position
 */
export async function hasElementMoved(
  element: Locator,
  originalPosition: { x: number; y: number },
  threshold: number = 1
): Promise<boolean> {
  const currentPosition = await captureElementPosition(element);
  const deltaX = Math.abs(currentPosition.x - originalPosition.x);
  const deltaY = Math.abs(currentPosition.y - originalPosition.y);

  return deltaX > threshold || deltaY > threshold;
}

/**
 * Perform circular mouse motion around an element
 */
export async function circularMouseMotion(
  page: Page,
  centerX: number,
  centerY: number,
  radius: number,
  steps: number = 60,
  duration: number = 2000
): Promise<void> {
  const delayPerStep = duration / steps;

  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    await page.mouse.move(x, y);
    await page.waitForTimeout(delayPerStep);
  }
}

/**
 * Get active navigation button text
 */
export async function getActiveNavText(page: Page): Promise<string> {
  const activeButton = page.locator('[aria-pressed="true"]');
  await activeButton.waitFor({ state: 'visible' });
  const text = await activeButton.textContent();
  return text?.trim() || '';
}

/**
 * Smooth scroll through all sections with delays
 */
export async function scrollThroughAllSections(
  page: Page,
  sectionIds: string[],
  delayPerSection: number = 1000
): Promise<void> {
  for (const sectionId of sectionIds) {
    const section = page.locator(`#${sectionId}`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(delayPerSection);
  }
}

/**
 * Measure scroll performance (dropped frames)
 */
export async function measureScrollPerformance(
  page: Page,
  scrollAction: () => Promise<void>
): Promise<{
  avgFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number;
  totalFrames: number;
}> {
  // Start performance monitoring
  await page.evaluate(() => {
    (window as any).frameTimestamps = [];
    let lastTimestamp = performance.now();

    const measureFrame = () => {
      const now = performance.now();
      const delta = now - lastTimestamp;
      (window as any).frameTimestamps.push(delta);
      lastTimestamp = now;
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  });

  // Perform scroll action
  await scrollAction();

  // Wait a bit for measurements
  await page.waitForTimeout(100);

  // Get results
  const results = await page.evaluate(() => {
    const timestamps = (window as any).frameTimestamps as number[];
    const avgFrameTime =
      timestamps.reduce((a, b) => a + b, 0) / timestamps.length;
    const maxFrameTime = Math.max(...timestamps);
    const droppedFrames = timestamps.filter((t) => t > 20).length; // >20ms = dropped at 60fps

    return {
      avgFrameTime,
      maxFrameTime,
      droppedFrames,
      totalFrames: timestamps.length,
    };
  });

  return results;
}

/**
 * Check if element has CSS animation or transition applied
 */
export async function hasActiveAnimation(element: Locator): Promise<boolean> {
  const hasAnimation = await element.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return (
      style.animation !== 'none' ||
      style.transition !== 'all 0s ease 0s' // Default transition
    );
  });

  return hasAnimation;
}

/**
 * Get computed style property value
 */
export async function getComputedStyle(
  element: Locator,
  property: string
): Promise<string> {
  return await element.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );
}

/**
 * Capture multi-frame animation sequence
 */
export async function captureAnimationFrames(
  page: Page,
  element: Locator,
  frameCount: number,
  outputDir: string,
  options: {
    frameDuration?: number;
    clip?: { x: number; y: number; width: number; height: number };
  } = {}
): Promise<string[]> {
  const { frameDuration = 33, clip } = options;
  const framePaths: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const framePath = `${outputDir}/frame-${i.toString().padStart(3, '0')}.png`;

    await page.screenshot({
      path: framePath,
      clip,
    });

    framePaths.push(framePath);
    await page.waitForTimeout(frameDuration);
  }

  return framePaths;
}
