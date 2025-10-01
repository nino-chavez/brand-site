/**
 * Screenshot Capture Configuration
 *
 * Central configuration for automated screenshot capture framework.
 */

import { defaultViewports } from './viewports';

export interface CaptureConfig {
  // Output directory for screenshots
  outputDir: string;

  // Storybook server URL
  storybookUrl: string;

  // Default viewports for component capture
  defaultViewports: string[];

  // Screenshot options
  screenshot: {
    fullPage: boolean;
    omitBackground: boolean;
    animations: 'disabled' | 'allow';
    timeout: number;
  };

  // Metadata options
  metadata: {
    includeProps: boolean;
    includeViewport: boolean;
    includeAppContext: boolean;
    includeAnalysisHints: boolean;
  };

  // Performance options
  parallel: {
    enabled: boolean;
    maxWorkers: number;
  };

  // Framework versioning
  version: string;
}

export const captureConfig: CaptureConfig = {
  outputDir: './tests/screenshots/output',

  storybookUrl: 'http://localhost:6006',

  defaultViewports,

  screenshot: {
    fullPage: false,
    omitBackground: false,
    animations: 'disabled',
    timeout: 10000,
  },

  metadata: {
    includeProps: true,
    includeViewport: true,
    includeAppContext: true,
    includeAnalysisHints: true,
  },

  parallel: {
    enabled: true,
    maxWorkers: 4,
  },

  version: '1.0.0',
};
