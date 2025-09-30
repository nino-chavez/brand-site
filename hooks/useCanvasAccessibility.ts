/**
 * useCanvasAccessibility Hook
 *
 * Extracted accessibility logic from LightboxCanvas including keyboard navigation
 * and spatial accessibility integration.
 *
 * @fileoverview Accessibility custom hook for canvas
 * @version 1.0.0
 * @since Task 1 - useEffect Optimization
 */

import { useEffect, useCallback } from 'react';
import { useSpatialAccessibility } from './useSpatialAccessibility';
import type { CanvasPosition } from '../types/canvas';
import type { PhotoWorkflowSection } from '../types/cursor-lens';

export interface UseCanvasAccessibilityOptions {
  enabled: boolean;
  currentPosition: CanvasPosition;
  activeSection: string;
  debugMode?: boolean;
  onCanvasMove: (position: CanvasPosition, movement: string) => void;
  onSectionChange?: (section: string) => void;
}

/**
 * Custom hook for canvas accessibility features
 */
export const useCanvasAccessibility = (options: UseCanvasAccessibilityOptions) => {
  const {
    enabled,
    currentPosition,
    activeSection,
    debugMode = false,
    onCanvasMove,
    onSectionChange
  } = options;

  // Spatial accessibility hook
  const spatialAccessibility = useSpatialAccessibility({
    enableSpatialNavigation: true,
    enableCameraControls: true,
    enableSpatialAnnouncements: true,
    enableDirectionalHints: true,
    debugMode,
    keyboardShortcuts: {
      panSpeed: 100,
      zoomSpeed: 0.1,
      enableCustomShortcuts: true
    }
  });

  // Keyboard navigation
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const moveDistance = 50;
      let newPosition: CanvasPosition | null = null;

      switch (event.key) {
        case 'ArrowLeft':
          newPosition = { ...currentPosition, x: currentPosition.x - moveDistance };
          break;
        case 'ArrowRight':
          newPosition = { ...currentPosition, x: currentPosition.x + moveDistance };
          break;
        case 'ArrowUp':
          newPosition = { ...currentPosition, y: currentPosition.y - moveDistance };
          break;
        case 'ArrowDown':
          newPosition = { ...currentPosition, y: currentPosition.y + moveDistance };
          break;
        case '+':
        case '=':
          newPosition = { ...currentPosition, scale: Math.min(3.0, currentPosition.scale * 1.1) };
          break;
        case '-':
          newPosition = { ...currentPosition, scale: Math.max(0.5, currentPosition.scale * 0.9) };
          break;
      }

      if (newPosition) {
        event.preventDefault();
        onCanvasMove(newPosition, 'pan-tilt');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, currentPosition, onCanvasMove]);

  // Spatial accessibility integration
  useEffect(() => {
    spatialAccessibility.setNavigationCallbacks({
      onSectionChange: (section: PhotoWorkflowSection) => {
        // Map photo workflow sections to canvas sections
        const sectionMapping: Record<PhotoWorkflowSection, string> = {
          'hero': 'capture',
          'about': 'focus',
          'creative': 'frame',
          'professional': 'exposure',
          'thought-leadership': 'develop',
          'ai-github': 'frame',
          'contact': 'portfolio'
        };

        const canvasSection = sectionMapping[section];
        if (canvasSection) {
          onSectionChange?.(canvasSection);
        }

        // Announce section change
        spatialAccessibility.announce(`Navigated to ${section} section`);
      },

      onCanvasMove: (position: CanvasPosition) => {
        onCanvasMove(position, 'pan-tilt');
      },

      onZoom: (scale: number) => {
        const newPosition = { ...currentPosition, scale };
        onCanvasMove(newPosition, 'zoom-in');
      }
    });

    // Update spatial accessibility with current state
    spatialAccessibility.updateCanvasPosition(currentPosition);

    // Map current canvas section to photo workflow section
    const reverseSectionMapping: Record<string, PhotoWorkflowSection> = {
      'capture': 'hero',
      'focus': 'about',
      'frame': 'creative',
      'exposure': 'professional',
      'develop': 'thought-leadership',
      'portfolio': 'contact'
    };

    const photoSection = reverseSectionMapping[activeSection] || 'hero';
    spatialAccessibility.updateCurrentSection(photoSection);

  }, [spatialAccessibility, currentPosition, activeSection, onCanvasMove, onSectionChange]);

  return spatialAccessibility;
};