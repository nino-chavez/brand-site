/**
 * AI-Friendly Filename Generator
 *
 * Generates descriptive, self-documenting filenames optimized for
 * AI consumption and pattern recognition.
 *
 * Pattern: {ComponentName}_{variant}_{viewport}_{state?}.{ext}
 */

import type { ViewportConfig } from '../config/viewports';

export interface FilenameComponents {
  componentName: string;
  variant: string;
  viewport: string;
  state?: string;
  extension: 'png' | 'json';
}

export function generateFilename(components: FilenameComponents): string {
  const { componentName, variant, viewport, state, extension } = components;

  const parts = [
    sanitizeComponentName(componentName),
    sanitizeVariant(variant),
    viewport,
  ];

  if (state) {
    parts.push(state);
  }

  return `${parts.join('_')}.${extension}`;
}

export function generateComponentFilename(
  componentName: string,
  variant: string,
  viewportKey: string,
  extension: 'png' | 'json'
): string {
  return generateFilename({
    componentName,
    variant,
    viewport: viewportKey,
    extension,
  });
}

export function generateFlowFilename(
  flowName: string,
  stepNumber: number,
  stepDescription: string,
  viewportKey: string,
  extension: 'png' | 'json'
): string {
  const paddedStep = String(stepNumber).padStart(2, '0');
  const sanitizedDesc = sanitizeVariant(stepDescription);

  return `${paddedStep}_${sanitizedDesc}_${viewportKey}.${extension}`;
}

export function generateStateFilename(
  componentName: string,
  variant: string,
  viewportKey: string,
  state: string,
  extension: 'png' | 'json'
): string {
  return generateFilename({
    componentName,
    variant,
    viewport: viewportKey,
    state,
    extension,
  });
}

/**
 * Sanitizes component name for filename usage
 * - Preserves PascalCase
 * - Removes special characters
 */
function sanitizeComponentName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Sanitizes variant/description for filename usage
 * - Converts to camelCase
 * - Removes special characters
 */
function sanitizeVariant(variant: string): string {
  return variant
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Parses a filename back into its components
 * Useful for analysis and reporting
 */
export function parseFilename(filename: string): Partial<FilenameComponents> {
  const withoutExt = filename.replace(/\.(png|json)$/, '');
  const parts = withoutExt.split('_');

  if (parts.length < 3) {
    return {};
  }

  const [componentName, variant, viewport, state] = parts;

  return {
    componentName,
    variant,
    viewport,
    state,
    extension: filename.endsWith('.png') ? 'png' : 'json',
  };
}
