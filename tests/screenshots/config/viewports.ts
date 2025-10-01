/**
 * Viewport Configuration for Screenshot Capture
 *
 * Defines standard viewports for multi-device screenshot capture.
 * These align with common device breakpoints and testing requirements.
 */

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  label: string;
  device: 'desktop' | 'tablet' | 'mobile';
}

export const viewports: Record<string, ViewportConfig> = {
  'desktop-1920x1080': {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2,
    label: 'Desktop FHD',
    device: 'desktop',
  },
  'desktop-1440x900': {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    label: 'Desktop Laptop',
    device: 'desktop',
  },
  'tablet-768x1024': {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    label: 'iPad Portrait',
    device: 'tablet',
  },
  'tablet-1024x768': {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    label: 'iPad Landscape',
    device: 'tablet',
  },
  'mobile-375x667': {
    width: 375,
    height: 667,
    deviceScaleFactor: 3,
    label: 'iPhone SE',
    device: 'mobile',
  },
  'mobile-390x844': {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    label: 'iPhone 12 Pro',
    device: 'mobile',
  },
  'mobile-414x896': {
    width: 414,
    height: 896,
    deviceScaleFactor: 3,
    label: 'iPhone 11 Pro Max',
    device: 'mobile',
  },
};

export const defaultViewports = [
  'desktop-1920x1080',
  'tablet-768x1024',
  'mobile-390x844',
];

export function getViewport(key: string): ViewportConfig {
  const viewport = viewports[key];
  if (!viewport) {
    throw new Error(`Viewport "${key}" not found. Available: ${Object.keys(viewports).join(', ')}`);
  }
  return viewport;
}

export function getViewportsByDevice(device: 'desktop' | 'tablet' | 'mobile'): ViewportConfig[] {
  return Object.values(viewports).filter((v) => v.device === device);
}
