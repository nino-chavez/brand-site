/**
 * Spatial Positioning Utilities
 *
 * Provides spatial section positioning algorithms and grid layout systems
 * for 2D canvas navigation. Handles responsive scaling, layout optimization,
 * and dynamic arrangement of photography workflow sections.
 *
 * @fileoverview Spatial positioning and grid layout utilities
 * @version 1.0.0
 * @since Task 9 - Unit Testing for Canvas System
 */

import type { CanvasPosition, SpatialCoordinates, PhotoWorkflowSection } from '../types/canvas';
import type { GameFlowSection } from '../types';

// ===== SPATIAL POSITIONING TYPES =====

export interface GridLayout {
  width: number;
  height: number;
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  padding: number;
}

export interface SpatialSection {
  section: PhotoWorkflowSection | GameFlowSection;
  position: CanvasPosition;
  gridCoordinates: SpatialCoordinates;
  priority: number;
  isVisible: boolean;
}

export interface LayoutConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatio?: number;
  responsive: boolean;
}

export interface PositioningOptions {
  layout: 'grid' | 'organic' | 'spiral' | 'cluster';
  alignment: 'center' | 'top-left' | 'bottom-right';
  spacing: number;
  scale: number;
  responsive: boolean;
}

// ===== GRID LAYOUT MANAGEMENT =====

/**
 * Create optimized grid layout for photography workflow sections
 * Supports 2x3, 3x2, and adaptive layouts based on viewport
 */
export function createGridLayout(
  viewportWidth: number,
  viewportHeight: number,
  sectionCount: number = 6,
  padding: number = 20
): GridLayout {
  // Determine optimal grid dimensions
  let rows: number, cols: number;

  if (viewportWidth > viewportHeight) {
    // Landscape: prefer 3x2 layout
    cols = Math.ceil(Math.sqrt(sectionCount * (viewportWidth / viewportHeight)));
    rows = Math.ceil(sectionCount / cols);
  } else {
    // Portrait: prefer 2x3 layout
    rows = Math.ceil(Math.sqrt(sectionCount * (viewportHeight / viewportWidth)));
    cols = Math.ceil(sectionCount / rows);
  }

  const cellWidth = (viewportWidth - padding * (cols + 1)) / cols;
  const cellHeight = (viewportHeight - padding * (rows + 1)) / rows;

  return {
    width: viewportWidth,
    height: viewportHeight,
    rows,
    cols,
    cellWidth,
    cellHeight,
    padding
  };
}

/**
 * Calculate grid position from spatial coordinates
 * Converts grid coordinates to canvas position
 */
export function gridToCanvasPosition(
  gridCoordinates: SpatialCoordinates,
  layout: GridLayout,
  alignment: 'center' | 'top-left' | 'bottom-right' = 'center'
): CanvasPosition {
  const baseX = layout.padding + gridCoordinates.gridX * (layout.cellWidth + layout.padding);
  const baseY = layout.padding + gridCoordinates.gridY * (layout.cellHeight + layout.padding);

  let x: number, y: number;

  switch (alignment) {
    case 'center':
      x = baseX + layout.cellWidth / 2 + (gridCoordinates.offsetX || 0);
      y = baseY + layout.cellHeight / 2 + (gridCoordinates.offsetY || 0);
      break;
    case 'top-left':
      x = baseX + (gridCoordinates.offsetX || 0);
      y = baseY + (gridCoordinates.offsetY || 0);
      break;
    case 'bottom-right':
      x = baseX + layout.cellWidth + (gridCoordinates.offsetX || 0);
      y = baseY + layout.cellHeight + (gridCoordinates.offsetY || 0);
      break;
  }

  return {
    x: x - layout.width / 2, // Center on viewport
    y: y - layout.height / 2,
    scale: 1.0
  };
}

/**
 * Convert canvas position to grid coordinates
 * Reverse mapping for spatial navigation
 */
export function canvasToGridPosition(
  position: CanvasPosition,
  layout: GridLayout
): SpatialCoordinates {
  // Adjust for viewport centering
  const adjustedX = position.x + layout.width / 2;
  const adjustedY = position.y + layout.height / 2;

  const gridX = Math.floor((adjustedX - layout.padding) / (layout.cellWidth + layout.padding));
  const gridY = Math.floor((adjustedY - layout.padding) / (layout.cellHeight + layout.padding));

  const cellStartX = layout.padding + gridX * (layout.cellWidth + layout.padding);
  const cellStartY = layout.padding + gridY * (layout.cellHeight + layout.padding);

  return {
    gridX: Math.max(0, Math.min(layout.cols - 1, gridX)),
    gridY: Math.max(0, Math.min(layout.rows - 1, gridY)),
    offsetX: adjustedX - cellStartX - layout.cellWidth / 2,
    offsetY: adjustedY - cellStartY - layout.cellHeight / 2
  };
}

// ===== SECTION POSITIONING =====

/**
 * Calculate optimal positions for photography workflow sections
 * Arranges sections in strategic spatial layout
 */
export function calculateSectionPositions(
  sections: (PhotoWorkflowSection | GameFlowSection)[],
  layout: GridLayout,
  options: PositioningOptions
): SpatialSection[] {
  const spatialSections: SpatialSection[] = [];

  // Section priority mapping for optimal placement
  const priorityMap: Record<string, number> = {
    capture: 1,    // Hero section - highest priority
    creative: 2,   // About section
    professional: 3,
    'thought-leadership': 4,
    'ai-github': 5,
    contact: 6,
    // Legacy GameFlow sections
    focus: 2,
    frame: 3,
    exposure: 4,
    develop: 5,
    portfolio: 6
  };

  sections.forEach((section, index) => {
    const priority = priorityMap[section] || index + 1;
    const gridCoordinates = calculateOptimalGridPosition(index, layout, options);
    const position = gridToCanvasPosition(gridCoordinates, layout, options.alignment);

    spatialSections.push({
      section,
      position: {
        ...position,
        scale: options.scale
      },
      gridCoordinates,
      priority,
      isVisible: true
    });
  });

  // Sort by priority for optimal rendering order
  return spatialSections.sort((a, b) => a.priority - b.priority);
}

/**
 * Calculate optimal grid position based on layout algorithm
 * Supports different positioning strategies
 */
export function calculateOptimalGridPosition(
  index: number,
  layout: GridLayout,
  options: PositioningOptions
): SpatialCoordinates {
  switch (options.layout) {
    case 'grid':
      return calculateGridPosition(index, layout);
    case 'organic':
      return calculateOrganicPosition(index, layout, options.spacing);
    case 'spiral':
      return calculateSpiralPosition(index, layout);
    case 'cluster':
      return calculateClusterPosition(index, layout, options.spacing);
    default:
      return calculateGridPosition(index, layout);
  }
}

/**
 * Calculate standard grid position
 * Simple row-by-row or column-by-column placement
 */
function calculateGridPosition(index: number, layout: GridLayout): SpatialCoordinates {
  return {
    gridX: index % layout.cols,
    gridY: Math.floor(index / layout.cols),
    offsetX: 0,
    offsetY: 0
  };
}

/**
 * Calculate organic position with natural spacing variations
 * Creates more visually interesting layouts
 */
function calculateOrganicPosition(
  index: number,
  layout: GridLayout,
  spacing: number
): SpatialCoordinates {
  const base = calculateGridPosition(index, layout);

  // Add organic variations based on index
  const variation = Math.sin(index * 2.1) * spacing;
  const rotationOffset = Math.cos(index * 1.7) * spacing;

  return {
    gridX: base.gridX,
    gridY: base.gridY,
    offsetX: variation,
    offsetY: rotationOffset
  };
}

/**
 * Calculate spiral position for dramatic layout
 * Creates spiral arrangement from center outward
 */
function calculateSpiralPosition(index: number, layout: GridLayout): SpatialCoordinates {
  const centerX = Math.floor(layout.cols / 2);
  const centerY = Math.floor(layout.rows / 2);

  if (index === 0) {
    return { gridX: centerX, gridY: centerY, offsetX: 0, offsetY: 0 };
  }

  // Calculate spiral position
  const angle = index * 2.3; // Golden angle approximation
  const radius = Math.sqrt(index) * 0.8;

  const x = centerX + Math.cos(angle) * radius;
  const y = centerY + Math.sin(angle) * radius;

  return {
    gridX: Math.max(0, Math.min(layout.cols - 1, Math.round(x))),
    gridY: Math.max(0, Math.min(layout.rows - 1, Math.round(y))),
    offsetX: (x - Math.round(x)) * layout.cellWidth * 0.5,
    offsetY: (y - Math.round(y)) * layout.cellHeight * 0.5
  };
}

/**
 * Calculate cluster position for grouped content
 * Creates natural groupings of related sections
 */
function calculateClusterPosition(
  index: number,
  layout: GridLayout,
  spacing: number
): SpatialCoordinates {
  // Group sections into clusters of 2-3
  const clusterSize = Math.random() > 0.5 ? 2 : 3;
  const clusterIndex = Math.floor(index / clusterSize);
  const positionInCluster = index % clusterSize;

  const base = calculateGridPosition(clusterIndex, layout);

  // Add cluster offset
  const clusterOffsetX = (positionInCluster % 2) * spacing - spacing / 2;
  const clusterOffsetY = Math.floor(positionInCluster / 2) * spacing - spacing / 2;

  return {
    gridX: base.gridX,
    gridY: base.gridY,
    offsetX: clusterOffsetX,
    offsetY: clusterOffsetY
  };
}

// ===== RESPONSIVE POSITIONING =====

/**
 * Adapt layout for different viewport sizes
 * Maintains optimal spacing and readability across devices
 */
export function adaptLayoutForViewport(
  sections: SpatialSection[],
  viewportWidth: number,
  viewportHeight: number,
  constraints: LayoutConstraints
): SpatialSection[] {
  if (!constraints.responsive) {
    return sections;
  }

  const scaleFactor = calculateResponsiveScale(
    viewportWidth,
    viewportHeight,
    constraints
  );

  const newLayout = createGridLayout(viewportWidth, viewportHeight, sections.length);

  return sections.map(section => ({
    ...section,
    position: {
      ...section.position,
      x: section.position.x * scaleFactor,
      y: section.position.y * scaleFactor,
      scale: section.position.scale * scaleFactor
    }
  }));
}

/**
 * Calculate responsive scale factor
 * Ensures content remains readable and accessible
 */
function calculateResponsiveScale(
  width: number,
  height: number,
  constraints: LayoutConstraints
): number {
  const widthScale = Math.max(
    constraints.minWidth / width,
    Math.min(constraints.maxWidth / width, 1)
  );

  const heightScale = Math.max(
    constraints.minHeight / height,
    Math.min(constraints.maxHeight / height, 1)
  );

  let scale = Math.min(widthScale, heightScale);

  // Apply aspect ratio constraints if specified
  if (constraints.aspectRatio) {
    const currentRatio = width / height;
    if (currentRatio !== constraints.aspectRatio) {
      scale *= Math.min(currentRatio / constraints.aspectRatio, constraints.aspectRatio / currentRatio);
    }
  }

  return Math.max(0.5, Math.min(2.0, scale)); // Clamp between 0.5x and 2x
}

// ===== POSITIONING OPTIMIZATION =====

/**
 * Optimize section positions to prevent overlaps
 * Adjusts positions to maintain visual hierarchy
 */
export function optimizeSectionPositions(
  sections: SpatialSection[],
  layout: GridLayout,
  minDistance: number = 50
): SpatialSection[] {
  const optimized = [...sections];

  // Sort by priority to preserve important positioning
  optimized.sort((a, b) => a.priority - b.priority);

  for (let i = 1; i < optimized.length; i++) {
    const current = optimized[i];

    for (let j = 0; j < i; j++) {
      const other = optimized[j];
      const distance = calculateDistance(current.position, other.position);

      if (distance < minDistance) {
        // Adjust position to maintain minimum distance
        const angle = Math.atan2(
          current.position.y - other.position.y,
          current.position.x - other.position.x
        );

        current.position.x = other.position.x + Math.cos(angle) * minDistance;
        current.position.y = other.position.y + Math.sin(angle) * minDistance;
      }
    }
  }

  return optimized;
}

/**
 * Calculate distance between two canvas positions
 * Euclidean distance calculation for spatial analysis
 */
function calculateDistance(pos1: CanvasPosition, pos2: CanvasPosition): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) +
    Math.pow(pos1.y - pos2.y, 2)
  );
}

/**
 * Find nearest section to a given position
 * Useful for spatial navigation and selection
 */
export function findNearestSection(
  position: CanvasPosition,
  sections: SpatialSection[],
  maxDistance: number = Infinity
): SpatialSection | null {
  let nearest: SpatialSection | null = null;
  let minDistance = maxDistance;

  for (const section of sections) {
    if (!section.isVisible) continue;

    const distance = calculateDistance(position, section.position);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = section;
    }
  }

  return nearest;
}

/**
 * Get sections within a specific area
 * Useful for viewport culling and area-based interactions
 */
export function getSectionsInArea(
  sections: SpatialSection[],
  topLeft: CanvasPosition,
  bottomRight: CanvasPosition
): SpatialSection[] {
  return sections.filter(section => {
    const pos = section.position;
    return pos.x >= topLeft.x &&
           pos.x <= bottomRight.x &&
           pos.y >= topLeft.y &&
           pos.y <= bottomRight.y &&
           section.isVisible;
  });
}

// ===== VALIDATION =====

/**
 * Validate spatial positioning configuration
 * Ensures positioning options are valid and achievable
 */
export function validatePositioning(
  sections: SpatialSection[],
  layout: GridLayout,
  constraints: LayoutConstraints
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if all sections fit in layout
  const totalCells = layout.rows * layout.cols;
  if (sections.length > totalCells) {
    errors.push(`${sections.length} sections exceed grid capacity of ${totalCells} cells`);
  }

  // Check constraint compliance
  if (layout.width < constraints.minWidth) {
    errors.push(`Layout width ${layout.width} below minimum ${constraints.minWidth}`);
  }

  if (layout.height < constraints.minHeight) {
    errors.push(`Layout height ${layout.height} below minimum ${constraints.minHeight}`);
  }

  // Check for duplicate positions
  const positions = new Set();
  for (const section of sections) {
    const key = `${section.gridCoordinates.gridX}-${section.gridCoordinates.gridY}`;
    if (positions.has(key)) {
      errors.push(`Duplicate position detected at grid ${key}`);
    }
    positions.add(key);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ===== LEGACY SUPPORT =====

/**
 * Convert legacy section arrangement to spatial layout
 * Maintains backward compatibility with existing configurations
 */
export function convertLegacyLayout(
  legacySections: string[],
  viewportWidth: number,
  viewportHeight: number
): SpatialSection[] {
  const layout = createGridLayout(viewportWidth, viewportHeight, legacySections.length);
  const options: PositioningOptions = {
    layout: 'grid',
    alignment: 'center',
    spacing: 20,
    scale: 1.0,
    responsive: true
  };

  return calculateSectionPositions(legacySections as PhotoWorkflowSection[], layout, options);
}