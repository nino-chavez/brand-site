/**
 * useRadialMenu Hook
 *
 * Menu positioning logic with viewport constraint handling for CursorLens component.
 * Supports 6-section clockwise arrangement with intelligent repositioning algorithms.
 *
 * @fileoverview Phase 1: Setup and Foundation - Task 6: Menu positioning logic
 * @version 1.0.0
 * @since 2025-09-26
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  RadialMenuHook,
  CursorPosition,
  MenuPosition,
  MenuItemPosition,
  ViewportDimensions,
  PhotoWorkflowSection,
  ConstraintReason,
  EdgeProximityResult,
  ViewportEdge
} from '../types/cursor-lens';

// Menu configuration constants
const DEFAULT_MENU_RADIUS = 60; // 60px radius for section positioning
const DEFAULT_EDGE_CLEARANCE = 40; // 40px minimum clearance from viewport edges
const SECTION_RADIUS = 20; // Individual section button radius

// Section arrangement in clockwise order starting at 12 o'clock
const SECTIONS_CLOCKWISE: PhotoWorkflowSection[] = [
  'capture',   // 12 o'clock (0°)
  'focus',     // 2 o'clock (60°)
  'frame',     // 4 o'clock (120°)
  'exposure',  // 6 o'clock (180°)
  'develop',   // 8 o'clock (240°)
  'portfolio'  // 10 o'clock (300°)
];

// Section priority for constrained spaces (1 = highest priority)
const SECTION_PRIORITIES: Record<PhotoWorkflowSection, number> = {
  'exposure': 1,   // Core technical execution - highest priority
  'frame': 2,      // Composition - second priority
  'capture': 3,    // Introduction - third priority
  'develop': 4,    // Process - fourth priority
  'focus': 5,      // Detail - fifth priority
  'portfolio': 6   // Results - lowest priority
};

/**
 * Calculate angle in radians for clockwise section arrangement
 * 0° = 12 o'clock, 60° increments clockwise
 */
function getSectionAngle(section: PhotoWorkflowSection): number {
  const index = SECTIONS_CLOCKWISE.indexOf(section);
  if (index === -1) return 0;

  // Convert to radians: 0° = -π/2 (12 o'clock), increment by π/3 (60°)
  return (-Math.PI / 2) + (index * Math.PI / 3);
}

/**
 * Calculate position coordinates from center, radius, and angle
 */
function calculatePositionFromAngle(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  };
}

/**
 * Detect edge proximity and calculate repositioning needs
 */
function detectEdgeProximity(
  position: CursorPosition,
  menuRadius: number,
  viewport: ViewportDimensions
): EdgeProximityResult {
  const clearance = viewport.edgeClearance || DEFAULT_EDGE_CLEARANCE;
  const requiredSpace = menuRadius + SECTION_RADIUS + clearance;

  // Calculate distances to each edge
  const distanceToLeft = position.x;
  const distanceToRight = viewport.width - position.x;
  const distanceToTop = position.y;
  const distanceToBottom = viewport.height - position.y;

  // Find nearest edge and minimum distance
  const edges: Array<{ edge: ViewportEdge; distance: number }> = [
    { edge: 'left', distance: distanceToLeft },
    { edge: 'right', distance: distanceToRight },
    { edge: 'top', distance: distanceToTop },
    { edge: 'bottom', distance: distanceToBottom }
  ];

  const nearest = edges.reduce((min, current) =>
    current.distance < min.distance ? current : min
  );

  const needsRepositioning = nearest.distance < requiredSpace;

  let suggestedPosition: { x: number; y: number } | undefined;

  if (needsRepositioning) {
    // Calculate suggested repositioning
    let newX = position.x;
    let newY = position.y;

    // Adjust for horizontal constraints
    if (distanceToLeft < requiredSpace) {
      newX = requiredSpace;
    } else if (distanceToRight < requiredSpace) {
      newX = viewport.width - requiredSpace;
    }

    // Adjust for vertical constraints
    if (distanceToTop < requiredSpace) {
      newY = requiredSpace;
    } else if (distanceToBottom < requiredSpace) {
      newY = viewport.height - requiredSpace;
    }

    suggestedPosition = { x: newX, y: newY };
  }

  return {
    nearestEdge: nearest.edge,
    distance: nearest.distance,
    needsRepositioning,
    suggestedPosition
  };
}

/**
 * Determine constraint reason based on position
 */
function getConstraintReason(
  originalPos: CursorPosition,
  finalPos: { x: number; y: number },
  viewport: ViewportDimensions
): ConstraintReason {
  const clearance = viewport.edgeClearance || DEFAULT_EDGE_CLEARANCE;
  const menuSpace = DEFAULT_MENU_RADIUS + SECTION_RADIUS + clearance;

  const leftConstrained = originalPos.x < menuSpace;
  const rightConstrained = originalPos.x > viewport.width - menuSpace;
  const topConstrained = originalPos.y < menuSpace;
  const bottomConstrained = originalPos.y > viewport.height - menuSpace;

  // Check for corner constraints first
  if (leftConstrained && topConstrained) return 'corner-top-left';
  if (rightConstrained && topConstrained) return 'corner-top-right';
  if (leftConstrained && bottomConstrained) return 'corner-bottom-left';
  if (rightConstrained && bottomConstrained) return 'corner-bottom-right';

  // Check for edge constraints
  if (leftConstrained) return 'edge-left';
  if (rightConstrained) return 'edge-right';
  if (topConstrained) return 'edge-top';
  if (bottomConstrained) return 'edge-bottom';

  // Default fallback (shouldn't reach here if repositioning logic is correct)
  return 'edge-left';
}

/**
 * Filter sections based on available space in constrained environments
 */
function filterSectionsForConstraints(
  menuPos: MenuPosition,
  viewport: ViewportDimensions
): PhotoWorkflowSection[] {
  const clearance = viewport.edgeClearance || DEFAULT_EDGE_CLEARANCE;
  const availableWidth = viewport.width - (2 * clearance);
  const availableHeight = viewport.height - (2 * clearance);
  const minimumSpaceRequired = (DEFAULT_MENU_RADIUS + SECTION_RADIUS) * 2;

  // If we have enough space for all sections, return all
  if (availableWidth >= minimumSpaceRequired && availableHeight >= minimumSpaceRequired) {
    return SECTIONS_CLOCKWISE;
  }

  // Otherwise, prioritize sections
  const sortedSections = SECTIONS_CLOCKWISE.sort((a, b) =>
    SECTION_PRIORITIES[a] - SECTION_PRIORITIES[b]
  );

  // Determine how many sections we can fit
  const spaceRatio = Math.min(availableWidth, availableHeight) / minimumSpaceRequired;
  const maxSections = Math.max(3, Math.floor(spaceRatio * 6)); // Minimum 3 sections

  return sortedSections.slice(0, maxSections);
}

/**
 * Radial menu positioning hook with viewport constraint handling
 *
 * Features:
 * - 6-section clockwise arrangement (12, 2, 4, 6, 8, 10 o'clock)
 * - Intelligent repositioning for viewport edges
 * - 40px minimum clearance requirements
 * - Section prioritization for constrained spaces
 * - Smooth repositioning with performance optimization
 *
 * @returns RadialMenuHook interface with positioning state and controls
 */
export const useRadialMenu = (): RadialMenuHook => {
  // State management
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    center: { x: 0, y: 0 },
    radius: DEFAULT_MENU_RADIUS,
    repositioned: false
  });

  const [isRepositioned, setIsRepositioned] = useState(false);

  // Calculate item positions based on current menu position
  const itemPositions = useMemo((): MenuItemPosition[] => {
    const { center, radius } = menuPosition;

    return SECTIONS_CLOCKWISE.map((section) => {
      const angle = getSectionAngle(section);
      const coordinates = calculatePositionFromAngle(center.x, center.y, radius, angle);

      return {
        section,
        angle,
        coordinates,
        isVisible: true, // Will be updated by filtering logic if needed
        priority: SECTION_PRIORITIES[section]
      };
    });
  }, [menuPosition]);

  // Reposition menu based on cursor position and viewport constraints
  const repositionMenu = useCallback((
    cursorPos: CursorPosition,
    viewportSize: ViewportDimensions
  ) => {
    const edgeProximity = detectEdgeProximity(cursorPos, DEFAULT_MENU_RADIUS, viewportSize);

    let finalPosition = { x: cursorPos.x, y: cursorPos.y };
    let repositioned = false;
    let constraintReason: ConstraintReason | undefined;

    // Apply repositioning if needed
    if (edgeProximity.needsRepositioning && edgeProximity.suggestedPosition) {
      finalPosition = edgeProximity.suggestedPosition;
      repositioned = true;
      constraintReason = getConstraintReason(cursorPos, finalPosition, viewportSize);
    }

    // Filter sections for constrained spaces
    const availableSections = filterSectionsForConstraints(
      { center: finalPosition, radius: DEFAULT_MENU_RADIUS, repositioned },
      viewportSize
    );

    // Update menu position
    const newMenuPosition: MenuPosition = {
      center: finalPosition,
      radius: DEFAULT_MENU_RADIUS,
      repositioned,
      constraintReason,
      originalCursorPosition: repositioned ? { x: cursorPos.x, y: cursorPos.y } : undefined
    };

    setMenuPosition(newMenuPosition);
    setIsRepositioned(repositioned);
  }, []);

  // Reset menu to default positioning
  const resetMenu = useCallback(() => {
    setMenuPosition({
      center: { x: 0, y: 0 },
      radius: DEFAULT_MENU_RADIUS,
      repositioned: false
    });
    setIsRepositioned(false);
  }, []);

  return {
    menuPosition,
    itemPositions,
    isRepositioned,
    repositionMenu,
    resetMenu
  };
};

export default useRadialMenu;