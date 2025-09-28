/**
 * AccessibilityController Component
 *
 * Extracted keyboard navigation and screen reader integration logic from LightboxCanvas.
 * Implements keyboard event handlers with spatial awareness and Command pattern for
 * navigation actions with WCAG 2.1 AA compliance.
 *
 * @fileoverview Isolated accessibility logic with Command pattern
 * @version 1.0.0
 * @since Task 1 - Component Enhancement and Optimization
 */

import { useEffect, useCallback } from 'react';
import type { CanvasPosition } from '../types/canvas';

/**
 * Navigation command types
 */
export type NavigationCommand = 'move-left' | 'move-right' | 'move-up' | 'move-down' | 'zoom-in' | 'zoom-out' | 'reset-view';

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /** Enable keyboard spatial navigation */
  keyboardSpatialNav: boolean;
  /** Movement distance per key press */
  moveDistance: number;
  /** Zoom factor per key press */
  zoomFactor: number;
  /** Enable screen reader announcements */
  enableAnnouncements: boolean;
  /** Enable spatial context descriptions */
  enableSpatialContext: boolean;
  /** Response time requirement (ms) */
  maxResponseTime: number;
}

/**
 * Props for AccessibilityController component
 */
export interface AccessibilityControllerProps {
  /** Current canvas position */
  currentPosition: CanvasPosition;
  /** Accessibility configuration */
  config: AccessibilityConfig;
  /** Callback for position changes */
  onPositionChange: (position: CanvasPosition) => void;
  /** Callback for announcements */
  onAnnouncement?: (message: string) => void;
  /** Active section for context */
  activeSection?: string;
  /** Available sections for navigation */
  sections?: string[];
  /** Enable debug mode */
  debugMode?: boolean;
}

/**
 * Navigation bounds for validation
 */
const NAVIGATION_BOUNDS = {
  minX: -600,
  maxX: 600,
  minY: -400,
  maxY: 400,
  minScale: 0.5,
  maxScale: 3.0,
};

/**
 * Section spatial context descriptions
 */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  capture: 'Hero section - Camera capture area, top center of lightbox',
  focus: 'About section - Focus area, top left of lightbox',
  frame: 'Creative section - Framing area, top right of lightbox',
  exposure: 'Professional section - Exposure area, bottom center of lightbox',
  develop: 'Thought Leadership section - Development area, bottom left of lightbox',
  portfolio: 'Contact section - Portfolio area, bottom right of lightbox',
};

/**
 * AccessibilityController - Isolated keyboard navigation and screen reader integration
 *
 * Responsibilities:
 * - Keyboard navigation and screen reader integration
 * - Command pattern for navigation actions
 * - <100ms response time for keyboard interactions
 * - Arrow key navigation, screen reader announcements, WCAG 2.1 AA compliance
 */
export const AccessibilityController: React.FC<AccessibilityControllerProps> = ({
  currentPosition,
  config,
  onPositionChange,
  onAnnouncement,
  activeSection,
  sections,
  debugMode = false,
}) => {
  /**
   * Validate position within bounds
   */
  const validatePosition = useCallback((position: CanvasPosition): CanvasPosition => {
    return {
      x: Math.max(NAVIGATION_BOUNDS.minX, Math.min(NAVIGATION_BOUNDS.maxX, position.x)),
      y: Math.max(NAVIGATION_BOUNDS.minY, Math.min(NAVIGATION_BOUNDS.maxY, position.y)),
      scale: Math.max(NAVIGATION_BOUNDS.minScale, Math.min(NAVIGATION_BOUNDS.maxScale, position.scale)),
    };
  }, []);

  /**
   * Execute navigation command
   */
  const executeCommand = useCallback((command: NavigationCommand) => {
    const startTime = performance.now();

    let newPosition: CanvasPosition;

    switch (command) {
      case 'move-left':
        newPosition = { ...currentPosition, x: currentPosition.x - config.moveDistance };
        break;
      case 'move-right':
        newPosition = { ...currentPosition, x: currentPosition.x + config.moveDistance };
        break;
      case 'move-up':
        newPosition = { ...currentPosition, y: currentPosition.y - config.moveDistance };
        break;
      case 'move-down':
        newPosition = { ...currentPosition, y: currentPosition.y + config.moveDistance };
        break;
      case 'zoom-in':
        newPosition = { ...currentPosition, scale: currentPosition.scale * config.zoomFactor };
        break;
      case 'zoom-out':
        newPosition = { ...currentPosition, scale: currentPosition.scale / config.zoomFactor };
        break;
      case 'reset-view':
        newPosition = { x: 0, y: 0, scale: 1.0 };
        break;
      default:
        return;
    }

    // Validate bounds
    const validatedPosition = validatePosition(newPosition);

    // Update position
    onPositionChange(validatedPosition);

    // Performance validation
    const responseTime = performance.now() - startTime;
    if (debugMode && responseTime > config.maxResponseTime) {
      console.warn(`Accessibility response time exceeded: ${responseTime.toFixed(2)}ms > ${config.maxResponseTime}ms`);
    }

    // Announce movement if enabled
    if (config.enableAnnouncements && onAnnouncement) {
      announceMovement(command, validatedPosition);
    }
  }, [currentPosition, config, onPositionChange, onAnnouncement, validatePosition, debugMode]);

  /**
   * Announce movement for screen readers
   */
  const announceMovement = useCallback((command: NavigationCommand, position: CanvasPosition) => {
    if (!onAnnouncement) return;

    let message = '';

    switch (command) {
      case 'move-left':
        message = 'Moved left';
        break;
      case 'move-right':
        message = 'Moved right';
        break;
      case 'move-up':
        message = 'Moved up';
        break;
      case 'move-down':
        message = 'Moved down';
        break;
      case 'zoom-in':
        message = `Zoomed in to ${(position.scale * 100).toFixed(0)}%`;
        break;
      case 'zoom-out':
        message = `Zoomed out to ${(position.scale * 100).toFixed(0)}%`;
        break;
      case 'reset-view':
        message = 'Reset to center view';
        break;
    }

    // Add spatial context if enabled
    if (config.enableSpatialContext && activeSection) {
      const sectionDescription = SECTION_DESCRIPTIONS[activeSection];
      if (sectionDescription) {
        message += `. Currently viewing ${sectionDescription}`;
      }
    }

    onAnnouncement(message);
  }, [onAnnouncement, config.enableSpatialContext, activeSection]);

  /**
   * Announce section change
   */
  const announceSection = useCallback((section: string) => {
    if (!config.enableAnnouncements || !onAnnouncement) return;

    const description = SECTION_DESCRIPTIONS[section];
    if (description) {
      onAnnouncement(`Navigated to ${description}`);
    } else {
      onAnnouncement(`Navigated to ${section} section`);
    }
  }, [config.enableAnnouncements, onAnnouncement]);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.keyboardSpatialNav) return;

    let command: NavigationCommand | null = null;

    // Navigation keys
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        command = 'move-left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        command = 'move-right';
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        command = 'move-up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        command = 'move-down';
        break;
      case '+':
      case '=':
      case 'z':
      case 'Z':
        command = event.shiftKey ? 'zoom-out' : 'zoom-in';
        break;
      case '-':
      case '_':
        command = 'zoom-out';
        break;
      case '0':
      case 'Home':
        command = 'reset-view';
        break;
    }

    if (command) {
      event.preventDefault();
      executeCommand(command);
    }

    // Section navigation shortcuts
    if (event.key >= '1' && event.key <= '6' && sections) {
      const sectionIndex = parseInt(event.key) - 1;
      if (sectionIndex < sections.length) {
        const section = sections[sectionIndex];
        announceSection(section);
      }
    }
  }, [config.keyboardSpatialNav, executeCommand, sections, announceSection]);

  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    if (!config.keyboardSpatialNav) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config.keyboardSpatialNav, handleKeyDown]);

  /**
   * Announce active section changes
   */
  useEffect(() => {
    if (activeSection && config.enableAnnouncements) {
      announceSection(activeSection);
    }
  }, [activeSection, config.enableAnnouncements, announceSection]);

  /**
   * Set up ARIA live region for announcements
   */
  useEffect(() => {
    if (!config.enableAnnouncements) return;

    // Ensure ARIA live region exists
    let liveRegion = document.getElementById('canvas-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'canvas-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.top = 'auto';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    return () => {
      // Clean up on unmount
      const existingRegion = document.getElementById('canvas-live-region');
      if (existingRegion) {
        existingRegion.remove();
      }
    };
  }, [config.enableAnnouncements]);

  /**
   * Update ARIA live region with announcements
   */
  const updateLiveRegion = useCallback((message: string) => {
    const liveRegion = document.getElementById('canvas-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, []);

  /**
   * Handle announcement updates
   */
  useEffect(() => {
    if (onAnnouncement) {
      // Override the announcement callback to also update live region
      const originalCallback = onAnnouncement;
      const enhancedCallback = (message: string) => {
        originalCallback(message);
        updateLiveRegion(message);
      };
    }
  }, [onAnnouncement, updateLiveRegion]);

  // AccessibilityController is a logic-only component with no visual output
  // except for the ARIA live region which is invisible
  return null;
};

export default AccessibilityController;