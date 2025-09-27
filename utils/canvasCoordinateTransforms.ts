/**
 * Canvas Coordinate Transformation Utilities
 *
 * Provides coordinate transformation functions between traditional scroll navigation
 * and 2D canvas spatial navigation, maintaining backward compatibility while enabling
 * sophisticated spatial navigation experiences.
 *
 * @fileoverview Canvas coordinate transformation utilities
 * @version 1.0.0
 * @since Task 2 - Canvas State Management Extension
 */

import type { GameFlowSection } from '../types';

// ===== COORDINATE TRANSFORMATION TYPES =====

/**
 * Canvas position with scale factor
 */
interface CanvasPosition {
  x: number;
  y: number;
  scale: number;
}

/**
 * Section mapping for spatial layout
 */
interface SectionSpatialMapping {
  section: GameFlowSection;
  canvasPosition: CanvasPosition;
  scrollPosition: number;
}

// ===== SECTION SPATIAL MAPPING =====

/**
 * Default spatial mapping for 6 photography workflow sections
 * Maps sections to both canvas coordinates and equivalent scroll positions
 */
const DEFAULT_SECTION_MAPPING: SectionSpatialMapping[] = [
  {
    section: 'capture',
    canvasPosition: { x: 0, y: -100, scale: 1.0 },      // Top center (Hero)
    scrollPosition: 0
  },
  {
    section: 'focus',
    canvasPosition: { x: 200, y: -100, scale: 1.0 },    // Top right (About)
    scrollPosition: 20
  },
  {
    section: 'frame',
    canvasPosition: { x: 200, y: 100, scale: 1.0 },     // Bottom right (Creative)
    scrollPosition: 40
  },
  {
    section: 'exposure',
    canvasPosition: { x: 0, y: 100, scale: 1.0 },       // Bottom center (Professional)
    scrollPosition: 60
  },
  {
    section: 'develop',
    canvasPosition: { x: -200, y: 100, scale: 1.0 },    // Bottom left (Thought Leadership)
    scrollPosition: 80
  },
  {
    section: 'portfolio',
    canvasPosition: { x: -200, y: -100, scale: 1.0 },   // Top left (Contact)
    scrollPosition: 100
  }
];

// ===== CORE TRANSFORMATION FUNCTIONS =====

/**
 * Convert scroll position to canvas coordinates
 * Maintains smooth mapping between linear scroll and spatial navigation
 *
 * @param scrollPosition - Scroll progress as percentage (0-100)
 * @param sectionHeight - Height of each section in pixels (optional, for fine-tuning)
 * @returns Canvas position corresponding to scroll position
 */
export function scrollToCanvas(scrollPosition: number, sectionHeight: number = 1000): CanvasPosition {
  // Normalize scroll position to 0-100 range
  const normalizedScroll = Math.max(0, Math.min(100, scrollPosition));

  // Find the closest section mappings for interpolation
  const currentSectionIndex = Math.floor(normalizedScroll / 20); // 6 sections = 20% each
  const nextSectionIndex = Math.min(currentSectionIndex + 1, DEFAULT_SECTION_MAPPING.length - 1);

  const currentSection = DEFAULT_SECTION_MAPPING[currentSectionIndex];
  const nextSection = DEFAULT_SECTION_MAPPING[nextSectionIndex];

  // Calculate interpolation factor within current section
  const sectionProgress = (normalizedScroll % 20) / 20;

  // Interpolate between current and next section positions
  return {
    x: currentSection.canvasPosition.x + (nextSection.canvasPosition.x - currentSection.canvasPosition.x) * sectionProgress,
    y: currentSection.canvasPosition.y + (nextSection.canvasPosition.y - currentSection.canvasPosition.y) * sectionProgress,
    scale: currentSection.canvasPosition.scale + (nextSection.canvasPosition.scale - currentSection.canvasPosition.scale) * sectionProgress
  };
}

/**
 * Convert canvas coordinates to scroll position
 * Enables reverse mapping from spatial navigation back to traditional scroll
 *
 * @param canvasPosition - Canvas position with x, y, and scale
 * @param sectionHeight - Height of each section in pixels (optional, for fine-tuning)
 * @returns Scroll progress as percentage (0-100)
 */
export function canvasToScroll(canvasPosition: CanvasPosition, sectionHeight: number = 1000): number {
  let closestDistance = Infinity;
  let closestScrollPosition = 0;

  // Find the closest section mapping
  for (const mapping of DEFAULT_SECTION_MAPPING) {
    const distance = Math.sqrt(
      Math.pow(canvasPosition.x - mapping.canvasPosition.x, 2) +
      Math.pow(canvasPosition.y - mapping.canvasPosition.y, 2) +
      Math.pow((canvasPosition.scale - mapping.canvasPosition.scale) * 100, 2) // Scale distance factor
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestScrollPosition = mapping.scrollPosition;
    }
  }

  return Math.max(0, Math.min(100, closestScrollPosition));
}

/**
 * Get canvas position for specific section
 * Direct mapping from section to canvas coordinates
 *
 * @param section - GameFlow section identifier
 * @returns Canvas position for the section
 */
export function getSectionCanvasPosition(section: GameFlowSection): CanvasPosition {
  const mapping = DEFAULT_SECTION_MAPPING.find(m => m.section === section);
  return mapping ? mapping.canvasPosition : { x: 0, y: 0, scale: 1.0 };
}

/**
 * Get scroll position for specific section
 * Direct mapping from section to scroll coordinates
 *
 * @param section - GameFlow section identifier
 * @returns Scroll position for the section (0-100)
 */
export function getSectionScrollPosition(section: GameFlowSection): number {
  const mapping = DEFAULT_SECTION_MAPPING.find(m => m.section === section);
  return mapping ? mapping.scrollPosition : 0;
}

/**
 * Get section from canvas position
 * Reverse lookup to find which section corresponds to canvas coordinates
 *
 * @param canvasPosition - Canvas position with x, y, and scale
 * @param tolerance - Distance tolerance for matching (default: 50)
 * @returns GameFlow section or null if no close match
 */
export function getSectionFromCanvasPosition(canvasPosition: CanvasPosition, tolerance: number = 50): GameFlowSection | null {
  let closestDistance = Infinity;
  let closestSection: GameFlowSection | null = null;

  for (const mapping of DEFAULT_SECTION_MAPPING) {
    const distance = Math.sqrt(
      Math.pow(canvasPosition.x - mapping.canvasPosition.x, 2) +
      Math.pow(canvasPosition.y - mapping.canvasPosition.y, 2)
    );

    if (distance < tolerance && distance < closestDistance) {
      closestDistance = distance;
      closestSection = mapping.section;
    }
  }

  return closestSection;
}

/**
 * Calculate smooth transition path between canvas positions
 * Generates intermediate positions for smooth camera movements
 *
 * @param from - Starting canvas position
 * @param to - Target canvas position
 * @param steps - Number of intermediate steps (default: 60 for 60fps)
 * @param easing - Easing function type ('linear', 'ease-in', 'ease-out', 'ease-in-out')
 * @returns Array of intermediate canvas positions
 */
export function calculateTransitionPath(
  from: CanvasPosition,
  to: CanvasPosition,
  steps: number = 60,
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-out'
): CanvasPosition[] {
  const path: CanvasPosition[] = [];

  // Easing functions
  const easingFunctions = {
    linear: (t: number) => t,
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };

  const easingFunction = easingFunctions[easing];

  for (let i = 0; i <= steps; i++) {
    const progress = easingFunction(i / steps);

    path.push({
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
      scale: from.scale + (to.scale - from.scale) * progress
    });
  }

  return path;
}

/**
 * Validate canvas position within bounds
 * Ensures canvas position stays within reasonable spatial limits
 *
 * @param position - Canvas position to validate
 * @param bounds - Optional bounds (default: reasonable spatial limits)
 * @returns Clamped canvas position within bounds
 */
export function validateCanvasPosition(
  position: CanvasPosition,
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minScale: number;
    maxScale: number;
  } = {
    minX: -300,
    maxX: 300,
    minY: -200,
    maxY: 200,
    minScale: 0.5,
    maxScale: 3.0
  }
): CanvasPosition {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
    scale: Math.max(bounds.minScale, Math.min(bounds.maxScale, position.scale))
  };
}

/**
 * Calculate camera movement duration based on distance
 * Provides dynamic timing for camera movements based on spatial distance
 *
 * @param from - Starting canvas position
 * @param to - Target canvas position
 * @param baseTime - Base movement time in milliseconds (default: 600)
 * @param maxTime - Maximum movement time in milliseconds (default: 1200)
 * @returns Calculated movement duration in milliseconds
 */
export function calculateMovementDuration(
  from: CanvasPosition,
  to: CanvasPosition,
  baseTime: number = 600,
  maxTime: number = 1200
): number {
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) +
    Math.pow(to.y - from.y, 2) +
    Math.pow((to.scale - from.scale) * 200, 2) // Scale change impact
  );

  // Normalize distance to 0-1 range (assuming max reasonable distance of ~500)
  const normalizedDistance = Math.min(distance / 500, 1);

  // Calculate duration with easing
  const duration = baseTime + (maxTime - baseTime) * normalizedDistance;

  return Math.round(duration);
}

// ===== BACKWARD COMPATIBILITY HELPERS =====

/**
 * Legacy scroll handler that updates canvas position
 * Maintains compatibility with existing scroll-based navigation
 *
 * @param scrollProgress - Current scroll progress (0-100)
 * @param updateCanvasPosition - Canvas position update function from context
 */
export function handleScrollToCanvasSync(
  scrollProgress: number,
  updateCanvasPosition: (position: CanvasPosition) => void
): void {
  const canvasPosition = scrollToCanvas(scrollProgress);
  updateCanvasPosition(canvasPosition);
}

/**
 * Canvas position handler that updates scroll progress
 * Maintains compatibility with existing scroll-based components
 *
 * @param canvasPosition - Current canvas position
 * @param updateScrollProgress - Scroll progress update function from context
 */
export function handleCanvasToScrollSync(
  canvasPosition: CanvasPosition,
  updateScrollProgress: (progress: number) => void
): void {
  const scrollProgress = canvasToScroll(canvasPosition);
  updateScrollProgress(scrollProgress);
}