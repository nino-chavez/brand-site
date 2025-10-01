/**
 * Screenshot Capture Helper Utilities
 *
 * Reusable utilities for capturing screenshots with consistent behavior.
 */

import type { Page } from '@playwright/test';
import { captureConfig } from '../config/capture.config';
import { getViewport, type ViewportConfig } from '../config/viewports';
import {
  generateComponentFilename,
  generateFlowFilename,
  generateStateFilename,
} from './filename-generator';
import {
  generateComponentMetadata,
  generateFlowMetadata,
  saveMetadata,
  type ScreenshotMetadata,
} from './metadata-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures output directory exists
 */
export async function ensureOutputDir(subdir?: string): Promise<string> {
  const dir = subdir
    ? path.join(captureConfig.outputDir, subdir)
    : captureConfig.outputDir;

  await fs.promises.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Captures a component screenshot with metadata
 */
export async function captureComponent(
  page: Page,
  config: {
    componentName: string;
    variant: string;
    viewportKey: string;
    storyId?: string;
    storyArgs?: Record<string, any>;
    outputSubdir?: string;
    analysisHints?: ScreenshotMetadata['analysisHints'];
  }
): Promise<{ pngPath: string; jsonPath: string }> {
  const viewport = getViewport(config.viewportKey);
  const outputDir = await ensureOutputDir(config.outputSubdir);

  // Generate filenames
  const pngFilename = generateComponentFilename(
    config.componentName,
    config.variant,
    config.viewportKey,
    'png'
  );
  const jsonFilename = generateComponentFilename(
    config.componentName,
    config.variant,
    config.viewportKey,
    'json'
  );

  const pngPath = path.join(outputDir, pngFilename);
  const jsonPath = path.join(outputDir, jsonFilename);

  // Wait for page to stabilize
  await stabilizePage(page);

  // Capture screenshot
  await page.screenshot({
    path: pngPath,
    fullPage: captureConfig.screenshot.fullPage,
    omitBackground: captureConfig.screenshot.omitBackground,
  });

  // Generate and save metadata
  const metadata = await generateComponentMetadata(page, {
    filename: pngFilename,
    componentName: config.componentName,
    variant: config.variant,
    viewport,
    storyId: config.storyId,
    storyArgs: config.storyArgs,
    analysisHints: config.analysisHints,
  });

  await saveMetadata(metadata, jsonPath);

  return { pngPath, jsonPath };
}

/**
 * Captures a user flow step screenshot with metadata
 */
export async function captureFlowStep(
  page: Page,
  flowName: string,
  config: {
    step: number;
    description: string;
    action: string;
    viewportKey: string;
    outputSubdir?: string;
    appContext?: ScreenshotMetadata['appContext'];
    analysisHints?: ScreenshotMetadata['analysisHints'];
  }
): Promise<{ pngPath: string; jsonPath: string }> {
  const viewport = getViewport(config.viewportKey);
  const outputDir = await ensureOutputDir(config.outputSubdir || `flows/${flowName}`);

  // Generate filenames
  const pngFilename = generateFlowFilename(
    flowName,
    config.step,
    config.description,
    config.viewportKey,
    'png'
  );
  const jsonFilename = generateFlowFilename(
    flowName,
    config.step,
    config.description,
    config.viewportKey,
    'json'
  );

  const pngPath = path.join(outputDir, pngFilename);
  const jsonPath = path.join(outputDir, jsonFilename);

  // Wait for page to stabilize
  await stabilizePage(page);

  // Capture screenshot
  await page.screenshot({
    path: pngPath,
    fullPage: captureConfig.screenshot.fullPage,
    omitBackground: captureConfig.screenshot.omitBackground,
  });

  // Generate and save metadata
  const metadata = await generateFlowMetadata(page, {
    filename: pngFilename,
    flowName,
    stepNumber: config.step,
    stepDescription: config.description,
    action: config.action,
    viewport,
    appContext: config.appContext,
    analysisHints: config.analysisHints,
  });

  await saveMetadata(metadata, jsonPath);

  return { pngPath, jsonPath };
}

/**
 * Captures an interactive state screenshot (hover, focus, etc.)
 */
export async function captureInteractiveState(
  page: Page,
  config: {
    componentName: string;
    variant: string;
    viewportKey: string;
    state: 'hover' | 'focus' | 'active';
    selector: string;
    outputSubdir?: string;
    storyId?: string;
    analysisHints?: ScreenshotMetadata['analysisHints'];
  }
): Promise<{ pngPath: string; jsonPath: string }> {
  const viewport = getViewport(config.viewportKey);
  const outputDir = await ensureOutputDir(config.outputSubdir);

  // Generate filenames
  const pngFilename = generateStateFilename(
    config.componentName,
    config.variant,
    config.viewportKey,
    config.state,
    'png'
  );
  const jsonFilename = generateStateFilename(
    config.componentName,
    config.variant,
    config.viewportKey,
    config.state,
    'json'
  );

  const pngPath = path.join(outputDir, pngFilename);
  const jsonPath = path.join(outputDir, jsonFilename);

  // Trigger interactive state
  const element = page.locator(config.selector);

  switch (config.state) {
    case 'hover':
      await element.hover();
      break;
    case 'focus':
      await element.focus();
      break;
    case 'active':
      await element.dispatchEvent('mousedown');
      break;
  }

  // Wait for visual changes to complete
  await page.waitForTimeout(300);

  // Capture screenshot
  await page.screenshot({
    path: pngPath,
    fullPage: captureConfig.screenshot.fullPage,
    omitBackground: captureConfig.screenshot.omitBackground,
  });

  // Generate and save metadata
  const metadata = await generateComponentMetadata(page, {
    filename: pngFilename,
    componentName: config.componentName,
    variant: config.variant,
    viewport,
    storyId: config.storyId,
    analysisHints: config.analysisHints,
  });

  // Add interaction state info
  metadata.interactionState = {
    type: config.state,
    target: config.selector,
    action: `Applied ${config.state} state to ${config.selector}`,
  };

  await saveMetadata(metadata, jsonPath);

  return { pngPath, jsonPath };
}

/**
 * Stabilizes page before screenshot capture
 * - Waits for network idle
 * - Disables animations if configured
 * - Waits for fonts to load
 */
export async function stabilizePage(page: Page): Promise<void> {
  // Wait for network idle
  await page.waitForLoadState('networkidle');

  // Disable animations if configured
  if (captureConfig.screenshot.animations === 'disabled') {
    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  }

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);

  // Additional settling time
  await page.waitForTimeout(500);
}

/**
 * Sets viewport for page
 */
export async function setViewport(
  page: Page,
  viewportKey: string
): Promise<void> {
  const viewport = getViewport(viewportKey);
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
}

/**
 * Formats file size for logging
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Gets file size
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.promises.stat(filePath);
  return stats.size;
}

/**
 * Logs screenshot capture result
 */
export async function logCapture(
  componentName: string,
  variant: string,
  viewportKey: string,
  pngPath: string
): Promise<void> {
  const size = await getFileSize(pngPath);
  console.log(
    `  ✓ ${componentName} [${variant}] @ ${viewportKey} (${formatFileSize(size)})`
  );
}
