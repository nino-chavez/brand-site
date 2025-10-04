/**
 * Screenshot Metadata Generator
 *
 * Generates rich JSON metadata for each screenshot to provide
 * context for AI analysis.
 */

import type { ViewportConfig } from '../config/viewports';
import { captureConfig } from '../config/capture.config';
import type { Page } from '@playwright/test';
import { readFile } from 'fs/promises';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

// Load package versions dynamically to avoid CommonJS require() in ESM
async function getPackageVersion(packageName: string): Promise<string> {
  try {
    const packageJsonPath = join(process.cwd(), 'node_modules', packageName, 'package.json');
    const content = await readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

export interface ScreenshotMetadata {
  // Identification
  filename: string;
  componentName: string;
  storyId?: string;
  variant: string;

  // Viewport Context
  viewport: {
    device: 'desktop' | 'tablet' | 'mobile';
    width: number;
    height: number;
    devicePixelRatio: number;
    userAgent?: string;
  };

  // Component Context
  props?: Record<string, any>;
  storyArgs?: Record<string, any>;

  // Interaction Context
  interactionState?: {
    type: 'hover' | 'focus' | 'active' | 'scroll' | 'none';
    target?: string;
    action?: string;
  };

  // Application State
  appContext?: {
    layoutMode?: 'traditional' | 'canvas';
    performanceMode?: 'low' | 'balanced' | 'high';
    debugMode?: boolean;
    urlParams?: Record<string, string>;
  };

  // Capture Metadata
  capture: {
    timestamp: string;
    frameworkVersion: string;
    playwrightVersion: string;
    storybookVersion?: string;
    browser: string;
    platform: string;
  };

  // AI Analysis Hints
  analysisHints?: {
    focusAreas?: string[];
    expectedBehaviors?: string[];
    knownIssues?: string[];
  };
}

export async function generateComponentMetadata(
  page: Page,
  config: {
    filename: string;
    componentName: string;
    variant: string;
    viewport: ViewportConfig;
    storyId?: string;
    storyArgs?: Record<string, any>;
    analysisHints?: ScreenshotMetadata['analysisHints'];
  }
): Promise<ScreenshotMetadata> {
  const browserInfo = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  }));

  return {
    filename: config.filename,
    componentName: config.componentName,
    storyId: config.storyId,
    variant: config.variant,

    viewport: {
      device: config.viewport.device,
      width: config.viewport.width,
      height: config.viewport.height,
      devicePixelRatio: config.viewport.deviceScaleFactor,
      userAgent: browserInfo.userAgent,
    },

    storyArgs: config.storyArgs,

    capture: {
      timestamp: new Date().toISOString(),
      frameworkVersion: captureConfig.version,
      playwrightVersion: await getPackageVersion('@playwright/test'),
      storybookVersion: await getPackageVersion('@storybook/react-vite'),
      browser: page.context().browser()?.browserType().name() || 'unknown',
      platform: browserInfo.platform,
    },

    analysisHints: config.analysisHints,
  };
}

export async function generateFlowMetadata(
  page: Page,
  config: {
    filename: string;
    flowName: string;
    stepNumber: number;
    stepDescription: string;
    action: string;
    viewport: ViewportConfig;
    appContext?: ScreenshotMetadata['appContext'];
    analysisHints?: ScreenshotMetadata['analysisHints'];
  }
): Promise<ScreenshotMetadata> {
  const browserInfo = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  }));

  return {
    filename: config.filename,
    componentName: config.flowName,
    variant: `step-${config.stepNumber}`,

    viewport: {
      device: config.viewport.device,
      width: config.viewport.width,
      height: config.viewport.height,
      devicePixelRatio: config.viewport.deviceScaleFactor,
      userAgent: browserInfo.userAgent,
    },

    interactionState: {
      type: 'none',
      action: config.action,
    },

    appContext: config.appContext,

    capture: {
      timestamp: new Date().toISOString(),
      frameworkVersion: captureConfig.version,
      playwrightVersion: await getPackageVersion('@playwright/test'),
      browser: page.context().browser()?.browserType().name() || 'unknown',
      platform: browserInfo.platform,
    },

    analysisHints: config.analysisHints,
  };
}

export async function saveMetadata(
  metadata: ScreenshotMetadata,
  outputPath: string
): Promise<void> {
  // Ensure directory exists
  const dir = dirname(outputPath);
  await mkdir(dir, { recursive: true });

  // Write metadata
  await writeFile(
    outputPath,
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
}
