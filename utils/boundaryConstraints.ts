/**
 * Boundary Constraints Utilities
 *
 * Provides boundary validation and constraint enforcement for 2D canvas navigation.
 * Handles viewport bounds checking, position clamping, edge case handling,
 * and collision detection for spatial navigation systems.
 *
 * @fileoverview Boundary constraints and validation utilities
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import type { CanvasPosition, ViewportConstraints } from '../types/canvas';

// ===== BOUNDARY CONSTRAINT TYPES =====

export interface BoundaryLimits {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minScale: number;
  maxScale: number;
}

export interface CollisionBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  radius?: number;
}

export interface ConstraintViolation {
  type: 'position' | 'scale' | 'boundary' | 'collision';
  axis?: 'x' | 'y';
  current: number;
  limit: number;
  severity: 'warning' | 'error';
  message: string;
}

export interface ConstraintValidationResult {
  valid: boolean;
  violations: ConstraintViolation[];
  correctedPosition?: CanvasPosition;
}

export interface ElasticBoundaryOptions {
  enabled: boolean;
  resistance: number; // 0-1, where 1 is maximum resistance
  snapBack: boolean;
  snapBackDuration: number;
}

// ===== CORE CONSTRAINT VALIDATION =====

/**
 * Validate canvas position against boundary constraints
 * Comprehensive validation with detailed violation reporting
 */
export function validateBoundaryConstraints(
  position: CanvasPosition,
  constraints: ViewportConstraints,
  options?: { allowPartialViolations?: boolean; strictMode?: boolean }
): ConstraintValidationResult {
  const violations: ConstraintViolation[] = [];
  const opts = {
    allowPartialViolations: false,
    strictMode: true,
    ...options
  };

  // Validate X position
  if (position.x < constraints.minPosition.x) {
    violations.push({
      type: 'position',
      axis: 'x',
      current: position.x,
      limit: constraints.minPosition.x,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `X position ${position.x} below minimum ${constraints.minPosition.x}`
    });
  }

  if (position.x > constraints.maxPosition.x) {
    violations.push({
      type: 'position',
      axis: 'x',
      current: position.x,
      limit: constraints.maxPosition.x,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `X position ${position.x} exceeds maximum ${constraints.maxPosition.x}`
    });
  }

  // Validate Y position
  if (position.y < constraints.minPosition.y) {
    violations.push({
      type: 'position',
      axis: 'y',
      current: position.y,
      limit: constraints.minPosition.y,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `Y position ${position.y} below minimum ${constraints.minPosition.y}`
    });
  }

  if (position.y > constraints.maxPosition.y) {
    violations.push({
      type: 'position',
      axis: 'y',
      current: position.y,
      limit: constraints.maxPosition.y,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `Y position ${position.y} exceeds maximum ${constraints.maxPosition.y}`
    });
  }

  // Validate scale
  if (position.scale < constraints.minScale) {
    violations.push({
      type: 'scale',
      current: position.scale,
      limit: constraints.minScale,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `Scale ${position.scale} below minimum ${constraints.minScale}`
    });
  }

  if (position.scale > constraints.maxScale) {
    violations.push({
      type: 'scale',
      current: position.scale,
      limit: constraints.maxScale,
      severity: opts.strictMode ? 'error' : 'warning',
      message: `Scale ${position.scale} exceeds maximum ${constraints.maxScale}`
    });
  }

  const valid = opts.allowPartialViolations
    ? violations.filter(v => v.severity === 'error').length === 0
    : violations.length === 0;

  const result: ConstraintValidationResult = {
    valid,
    violations
  };

  // Generate corrected position if there are violations
  if (!valid) {
    result.correctedPosition = clampToConstraints(position, constraints);
  }

  return result;
}

/**
 * Clamp canvas position to boundary constraints
 * Hard constraint enforcement with position clamping
 */
export function clampToConstraints(
  position: CanvasPosition,
  constraints: ViewportConstraints
): CanvasPosition {
  return {
    x: Math.max(
      constraints.minPosition.x,
      Math.min(constraints.maxPosition.x, position.x)
    ),
    y: Math.max(
      constraints.minPosition.y,
      Math.min(constraints.maxPosition.y, position.y)
    ),
    scale: Math.max(
      constraints.minScale,
      Math.min(constraints.maxScale, position.scale)
    )
  };
}

/**
 * Clamp position to legacy boundary limits
 * Backward compatibility with simple boundary objects
 */
export function clampToLegacyBounds(
  position: CanvasPosition,
  bounds: BoundaryLimits
): CanvasPosition {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
    scale: Math.max(bounds.minScale, Math.min(bounds.maxScale, position.scale))
  };
}

// ===== ELASTIC BOUNDARIES =====

/**
 * Apply elastic boundary behavior
 * Allows temporary violation with increasing resistance
 */
export function applyElasticBoundaries(
  position: CanvasPosition,
  constraints: ViewportConstraints,
  options: ElasticBoundaryOptions
): CanvasPosition {
  if (!options.enabled) {
    return clampToConstraints(position, constraints);
  }

  const elasticPosition = { ...position };

  // Apply elastic resistance to X axis
  if (position.x < constraints.minPosition.x) {
    const overflow = constraints.minPosition.x - position.x;
    const resistance = Math.pow(options.resistance, overflow / 100);
    elasticPosition.x = constraints.minPosition.x - overflow * resistance;
  } else if (position.x > constraints.maxPosition.x) {
    const overflow = position.x - constraints.maxPosition.x;
    const resistance = Math.pow(options.resistance, overflow / 100);
    elasticPosition.x = constraints.maxPosition.x + overflow * resistance;
  }

  // Apply elastic resistance to Y axis
  if (position.y < constraints.minPosition.y) {
    const overflow = constraints.minPosition.y - position.y;
    const resistance = Math.pow(options.resistance, overflow / 100);
    elasticPosition.y = constraints.minPosition.y - overflow * resistance;
  } else if (position.y > constraints.maxPosition.y) {
    const overflow = position.y - constraints.maxPosition.y;
    const resistance = Math.pow(options.resistance, overflow / 100);
    elasticPosition.y = constraints.maxPosition.y + overflow * resistance;
  }

  // Scale constraints remain hard (no elastic behavior)
  elasticPosition.scale = Math.max(
    constraints.minScale,
    Math.min(constraints.maxScale, position.scale)
  );

  return elasticPosition;
}

/**
 * Calculate snap-back animation for elastic boundaries
 * Returns animation frames for smooth return to valid bounds
 */
export function calculateSnapBackAnimation(
  currentPosition: CanvasPosition,
  constraints: ViewportConstraints,
  duration: number = 300
): CanvasPosition[] {
  const targetPosition = clampToConstraints(currentPosition, constraints);
  const frames: CanvasPosition[] = [];
  const frameCount = Math.ceil(duration / 16.67); // 60fps

  for (let i = 0; i <= frameCount; i++) {
    const progress = i / frameCount;
    const easing = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

    frames.push({
      x: currentPosition.x + (targetPosition.x - currentPosition.x) * easing,
      y: currentPosition.y + (targetPosition.y - currentPosition.y) * easing,
      scale: currentPosition.scale + (targetPosition.scale - currentPosition.scale) * easing
    });
  }

  return frames;
}

// ===== COLLISION DETECTION =====

/**
 * Check for collision between two positions
 * Supports both rectangular and circular collision bounds
 */
export function checkCollision(
  position1: CanvasPosition,
  bounds1: CollisionBounds,
  position2: CanvasPosition,
  bounds2: CollisionBounds
): boolean {
  // Circular collision detection if radius is specified
  if (bounds1.radius && bounds2.radius) {
    const distance = Math.sqrt(
      Math.pow(position1.x - position2.x, 2) +
      Math.pow(position1.y - position2.y, 2)
    );
    return distance < (bounds1.radius + bounds2.radius);
  }

  // Rectangular collision detection
  const rect1 = {
    left: position1.x + bounds1.left,
    right: position1.x + bounds1.right,
    top: position1.y + bounds1.top,
    bottom: position1.y + bounds1.bottom
  };

  const rect2 = {
    left: position2.x + bounds2.left,
    right: position2.x + bounds2.right,
    top: position2.y + bounds2.top,
    bottom: position2.y + bounds2.bottom
  };

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

/**
 * Resolve collision between positions
 * Calculates separation vector to resolve overlapping positions
 */
export function resolveCollision(
  position1: CanvasPosition,
  bounds1: CollisionBounds,
  position2: CanvasPosition,
  bounds2: CollisionBounds,
  elasticity: number = 0.5
): { position1: CanvasPosition; position2: CanvasPosition } {
  if (!checkCollision(position1, bounds1, position2, bounds2)) {
    return { position1, position2 };
  }

  // Calculate separation vector
  const dx = position2.x - position1.x;
  const dy = position2.y - position1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    // Objects are at same position, separate arbitrarily
    return {
      position1: { ...position1, x: position1.x - 1 },
      position2: { ...position2, x: position2.x + 1 }
    };
  }

  // Calculate minimum separation distance
  const minDistance = (bounds1.radius || 50) + (bounds2.radius || 50);
  const overlap = minDistance - distance;

  if (overlap > 0) {
    const separationX = (dx / distance) * overlap * elasticity;
    const separationY = (dy / distance) * overlap * elasticity;

    return {
      position1: {
        ...position1,
        x: position1.x - separationX / 2,
        y: position1.y - separationY / 2
      },
      position2: {
        ...position2,
        x: position2.x + separationX / 2,
        y: position2.y + separationY / 2
      }
    };
  }

  return { position1, position2 };
}

// ===== VIEWPORT UTILITIES =====

/**
 * Check if position is within viewport
 * Useful for culling and visibility determination
 */
export function isPositionInViewport(
  position: CanvasPosition,
  viewportBounds: CollisionBounds,
  margin: number = 0
): boolean {
  return (
    position.x >= viewportBounds.left - margin &&
    position.x <= viewportBounds.right + margin &&
    position.y >= viewportBounds.top - margin &&
    position.y <= viewportBounds.bottom + margin
  );
}

/**
 * Calculate optimal viewport constraints for canvas size
 * Generates appropriate constraints based on canvas dimensions
 */
export function calculateViewportConstraints(
  canvasWidth: number,
  canvasHeight: number,
  contentBounds: { width: number; height: number },
  padding: number = 50
): ViewportConstraints {
  const halfWidth = canvasWidth / 2;
  const halfHeight = canvasHeight / 2;
  const contentHalfWidth = contentBounds.width / 2;
  const contentHalfHeight = contentBounds.height / 2;

  return {
    minPosition: {
      x: -contentHalfWidth - padding,
      y: -contentHalfHeight - padding,
      scale: 0.1
    },
    maxPosition: {
      x: contentHalfWidth + padding,
      y: contentHalfHeight + padding,
      scale: 0.1
    },
    minScale: 0.1,
    maxScale: 5.0
  };
}

/**
 * Create collision bounds from canvas position and scale
 * Generates appropriate collision bounds for scaled objects
 */
export function createCollisionBounds(
  baseWidth: number,
  baseHeight: number,
  scale: number,
  shape: 'rectangle' | 'circle' = 'rectangle'
): CollisionBounds {
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;

  if (shape === 'circle') {
    return {
      left: -scaledWidth / 2,
      right: scaledWidth / 2,
      top: -scaledHeight / 2,
      bottom: scaledHeight / 2,
      radius: Math.max(scaledWidth, scaledHeight) / 2
    };
  }

  return {
    left: -scaledWidth / 2,
    right: scaledWidth / 2,
    top: -scaledHeight / 2,
    bottom: scaledHeight / 2
  };
}

// ===== ADVANCED CONSTRAINTS =====

/**
 * Apply momentum-based boundary constraints
 * Considers velocity for more natural boundary behavior
 */
export function applyMomentumConstraints(
  position: CanvasPosition,
  velocity: { x: number; y: number },
  constraints: ViewportConstraints,
  damping: number = 0.8
): { position: CanvasPosition; velocity: { x: number; y: number } } {
  const newPosition = { ...position };
  const newVelocity = { ...velocity };

  // Check X boundaries
  if (position.x < constraints.minPosition.x) {
    newPosition.x = constraints.minPosition.x;
    newVelocity.x = -velocity.x * damping; // Bounce with damping
  } else if (position.x > constraints.maxPosition.x) {
    newPosition.x = constraints.maxPosition.x;
    newVelocity.x = -velocity.x * damping;
  }

  // Check Y boundaries
  if (position.y < constraints.minPosition.y) {
    newPosition.y = constraints.minPosition.y;
    newVelocity.y = -velocity.y * damping;
  } else if (position.y > constraints.maxPosition.y) {
    newPosition.y = constraints.maxPosition.y;
    newVelocity.y = -velocity.y * damping;
  }

  // Scale boundaries (no momentum)
  newPosition.scale = Math.max(
    constraints.minScale,
    Math.min(constraints.maxScale, position.scale)
  );

  return { position: newPosition, velocity: newVelocity };
}

/**
 * Create adaptive constraints based on content
 * Dynamically adjusts constraints based on active content
 */
export function createAdaptiveConstraints(
  contentPositions: CanvasPosition[],
  viewportSize: { width: number; height: number },
  adaptationFactor: number = 1.2
): ViewportConstraints {
  if (contentPositions.length === 0) {
    return calculateViewportConstraints(
      viewportSize.width,
      viewportSize.height,
      { width: 1000, height: 800 }
    );
  }

  // Find content bounds
  const minX = Math.min(...contentPositions.map(p => p.x));
  const maxX = Math.max(...contentPositions.map(p => p.x));
  const minY = Math.min(...contentPositions.map(p => p.y));
  const maxY = Math.max(...contentPositions.map(p => p.y));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Apply adaptation factor for comfortable navigation
  const paddingX = contentWidth * adaptationFactor * 0.5;
  const paddingY = contentHeight * adaptationFactor * 0.5;

  return {
    minPosition: {
      x: minX - paddingX,
      y: minY - paddingY,
      scale: 0.1
    },
    maxPosition: {
      x: maxX + paddingX,
      y: maxY + paddingY,
      scale: 0.1
    },
    minScale: 0.3,
    maxScale: 3.0
  };
}

// ===== VALIDATION UTILITIES =====

/**
 * Validate constraint configuration
 * Ensures constraint objects are properly configured
 */
export function validateConstraintConfiguration(
  constraints: ViewportConstraints
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check position constraints
  if (constraints.minPosition.x >= constraints.maxPosition.x) {
    errors.push('Minimum X position must be less than maximum X position');
  }

  if (constraints.minPosition.y >= constraints.maxPosition.y) {
    errors.push('Minimum Y position must be less than maximum Y position');
  }

  // Check scale constraints
  if (constraints.minScale >= constraints.maxScale) {
    errors.push('Minimum scale must be less than maximum scale');
  }

  if (constraints.minScale <= 0) {
    errors.push('Minimum scale must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== LEGACY SUPPORT =====

/**
 * Convert legacy boundary format to modern constraints
 * Maintains backward compatibility with older boundary definitions
 */
export function convertLegacyBoundaries(
  legacyBounds: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    minZoom?: number;
    maxZoom?: number;
  }
): ViewportConstraints {
  return {
    minPosition: {
      x: legacyBounds.left ?? -500,
      y: legacyBounds.top ?? -400,
      scale: 0.1
    },
    maxPosition: {
      x: legacyBounds.right ?? 500,
      y: legacyBounds.bottom ?? 400,
      scale: 0.1
    },
    minScale: legacyBounds.minZoom ?? 0.5,
    maxScale: legacyBounds.maxZoom ?? 2.0
  };
}