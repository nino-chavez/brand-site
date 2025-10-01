/**
 * Screenshot Metadata Generator
 *
 * Generates rich JSON metadata for each screenshot to provide
 * context for AI analysis.
 */

import type { ViewportConfig } from '../config/viewports';
import { captureConfig } from '../config/capture.config';
import type { Page } from '@playwright/test';

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
      playwrightVersion: require('@playwright/test/package.json').version,
      storybookVersion: require('@storybook/react-vite/package.json').version,
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
      playwrightVersion: require('@playwright/test/package.json').version,
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
  const fs = require('fs');
  const path = require('path');

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await fs.promises.mkdir(dir, { recursive: true });

  // Write metadata
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
}
