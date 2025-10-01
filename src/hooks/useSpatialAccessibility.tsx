/**
 * Spatial Accessibility Hook
 *
 * Extended accessibility system for 2D Canvas Layout System with comprehensive spatial navigation,
 * screen reader support, and WCAG AAA compliance for photographer's lightbox interface.
 *
 * @fileoverview Spatial accessibility manager for canvas navigation
 * @version 1.0.0
 * @since Task 13 - Accessibility Enhancement and Validation
 */

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useAccessibility } from './useAccessibility';
import type { PhotoWorkflowSection } from '../types/cursor-lens';
import type { CanvasPosition } from '../types/canvas';

// Spatial accessibility configuration
interface SpatialAccessibilityConfig {
  enableSpatialNavigation: boolean;
  enableCameraControls: boolean;
  enableSpatialAnnouncements: boolean;
  enableDirectionalHints: boolean;
  debugMode: boolean;
  keyboardShortcuts: {
    panSpeed: number;
    zoomSpeed: number;
    enableCustomShortcuts: boolean;
  };
}

// Spatial navigation state
interface SpatialNavigationState {
  currentSection: PhotoWorkflowSection | null;
  canvasPosition: CanvasPosition;
  spatialRelationships: SpatialRelationshipMap;
  navigationHistory: PhotoWorkflowSection[];
  isNavigating: boolean;
  lastDirection: SpatialDirection | null;
}

// Spatial direction types
type SpatialDirection = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';

// Spatial relationships between sections
interface SpatialRelationshipMap {
  [key: string]: {
    north?: PhotoWorkflowSection;
    south?: PhotoWorkflowSection;
    east?: PhotoWorkflowSection;
    west?: PhotoWorkflowSection;
    northeast?: PhotoWorkflowSection;
    northwest?: PhotoWorkflowSection;
    southeast?: PhotoWorkflowSection;
    southwest?: PhotoWorkflowSection;
    distance: number;
    description: string;
    position: { gridX: number; gridY: number };
  };
}

// Section spatial descriptions for screen readers
const SPATIAL_SECTION_DESCRIPTIONS: Record<PhotoWorkflowSection, string> = {
  'hero': 'Center position - Main introduction and navigation hub. Use arrow keys to explore sections in all directions.',
  'about': 'Upper left position - Professional background and expertise. Navigate east to creative work or south to main center.',
  'creative': 'Upper right position - Creative portfolio and visual work. Navigate west to about section or south to professional.',
  'professional': 'Lower right position - Technical skills and projects. Navigate north to creative work or west to thought leadership.',
  'thought-leadership': 'Lower left position - Articles and insights. Navigate east to professional or north to about section.',
  'ai-github': 'Far right position - AI and development projects. Navigate west to reach other sections.',
  'contact': 'Lower center position - Contact information and collaboration. Navigate up to return to main hub.'
};

// Spatial grid layout (3x2 default)
const SPATIAL_GRID_LAYOUT: SpatialRelationshipMap = {
  'hero': {
    north: 'about',
    south: 'contact',
    east: 'creative',
    west: 'about',
    northeast: 'creative',
    northwest: 'about',
    southeast: 'professional',
    southwest: 'thought-leadership',
    distance: 0,
    description: 'Central navigation hub with all sections accessible',
    position: { gridX: 1, gridY: 1 }
  },
  'about': {
    south: 'hero',
    east: 'creative',
    southeast: 'professional',
    southwest: 'thought-leadership',
    distance: 1,
    description: 'Upper left section - Professional background',
    position: { gridX: 0, gridY: 0 }
  },
  'creative': {
    south: 'professional',
    west: 'about',
    southwest: 'hero',
    east: 'ai-github',
    distance: 1,
    description: 'Upper right section - Creative portfolio',
    position: { gridX: 2, gridY: 0 }
  },
  'professional': {
    north: 'creative',
    west: 'thought-leadership',
    northwest: 'hero',
    distance: 1,
    description: 'Lower right section - Technical expertise',
    position: { gridX: 2, gridY: 2 }
  },
  'thought-leadership': {
    north: 'about',
    east: 'professional',
    northeast: 'creative',
    distance: 1,
    description: 'Lower left section - Insights and articles',
    position: { gridX: 0, gridY: 2 }
  },
  'ai-github': {
    west: 'creative',
    southwest: 'professional',
    distance: 2,
    description: 'Far right section - AI and development projects',
    position: { gridX: 3, gridY: 0 }
  },
  'contact': {
    north: 'hero',
    northeast: 'creative',
    northwest: 'about',
    distance: 1,
    description: 'Lower center section - Contact and collaboration',
    position: { gridX: 1, gridY: 2 }
  }
};

// Keyboard shortcuts for spatial navigation
const SPATIAL_KEYBOARD_SHORTCUTS: Record<string, string> = {
  'ArrowUp': 'Move camera north (up)',
  'ArrowDown': 'Move camera south (down)',
  'ArrowLeft': 'Move camera west (left)',
  'ArrowRight': 'Move camera east (right)',
  'w': 'Navigate to north section',
  's': 'Navigate to south section',
  'a': 'Navigate to west section',
  'd': 'Navigate to east section',
  '+': 'Zoom in on current section',
  '=': 'Zoom in on current section',
  '-': 'Zoom out from current section',
  '0': 'Reset camera to center position',
  'h': 'Return to hero (home) section',
  'Escape': 'Exit spatial navigation mode',
  'Tab': 'Navigate to next focusable section',
  'Shift+Tab': 'Navigate to previous focusable section',
  'Enter': 'Activate current section',
  'Space': 'Activate current section'
};

// Default configuration
const DEFAULT_SPATIAL_CONFIG: SpatialAccessibilityConfig = {
  enableSpatialNavigation: true,
  enableCameraControls: true,
  enableSpatialAnnouncements: true,
  enableDirectionalHints: true,
  debugMode: false,
  keyboardShortcuts: {
    panSpeed: 100, // pixels per keypress
    zoomSpeed: 0.1, // scale increment
    enableCustomShortcuts: true
  }
};

/**
 * Spatial Accessibility Manager
 * Extends base accessibility with spatial navigation capabilities
 */
class SpatialAccessibilityManager {
  private config: SpatialAccessibilityConfig;
  private navigationState: SpatialNavigationState;
  private spatialLiveRegion: HTMLElement | null = null;
  private navigationCallbacks: {
    onSectionChange?: (section: PhotoWorkflowSection) => void;
    onCanvasMove?: (position: CanvasPosition) => void;
    onZoom?: (scale: number) => void;
  } = {};

  constructor(config: SpatialAccessibilityConfig) {
    this.config = config;
    this.navigationState = {
      currentSection: 'hero',
      canvasPosition: { x: 0, y: 0, scale: 1 },
      spatialRelationships: SPATIAL_GRID_LAYOUT,
      navigationHistory: [],
      isNavigating: false,
      lastDirection: null
    };

    this.setupSpatialAccessibility();
  }

  private setupSpatialAccessibility(): void {
    this.createSpatialLiveRegion();
    this.setupSpatialKeyboardNavigation();
    this.setupSpatialFocusManagement();

    if (this.config.debugMode) {
      console.log('Spatial accessibility initialized:', this.config);
      console.log('Spatial relationships:', this.navigationState.spatialRelationships);
    }
  }

  private createSpatialLiveRegion(): void {
    if (!this.config.enableSpatialAnnouncements) return;

    this.spatialLiveRegion = document.createElement('div');
    this.spatialLiveRegion.id = 'spatial-navigation-announcements';
    this.spatialLiveRegion.setAttribute('aria-live', 'polite');
    this.spatialLiveRegion.setAttribute('aria-atomic', 'true');
    this.spatialLiveRegion.setAttribute('aria-label', 'Spatial navigation announcements');
    this.spatialLiveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;

    document.body.appendChild(this.spatialLiveRegion);
  }

  private setupSpatialKeyboardNavigation(): void {
    if (!this.config.enableSpatialNavigation) return;

    document.addEventListener('keydown', this.handleSpatialKeyNavigation.bind(this));
  }

  private setupSpatialFocusManagement(): void {
    // Enhanced focus management for spatial sections
    document.addEventListener('focusin', this.handleSpatialFocusIn.bind(this));
  }

  private handleSpatialKeyNavigation(event: KeyboardEvent): void {
    const { key, altKey, ctrlKey, metaKey, shiftKey } = event;

    // Skip if modifiers pressed (except Shift for Shift+Tab)
    if (altKey || ctrlKey || metaKey || (shiftKey && key !== 'Tab')) {
      return;
    }

    // Skip if focus is in form elements
    if (this.isFormElement(event.target as Element)) {
      return;
    }

    const handled = this.processSpatialNavigation(key, shiftKey);

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  private processSpatialNavigation(key: string, shiftKey: boolean): boolean {
    const currentSection = this.navigationState.currentSection;
    if (!currentSection) return false;

    switch (key) {
      // Directional section navigation (WASD)
      case 'w':
      case 'W':
        this.navigateDirection('north');
        return true;

      case 's':
      case 'S':
        this.navigateDirection('south');
        return true;

      case 'a':
      case 'A':
        this.navigateDirection('west');
        return true;

      case 'd':
      case 'D':
        this.navigateDirection('east');
        return true;

      // Arrow key camera movement
      case 'ArrowUp':
        this.moveCameraDelta(0, -this.config.keyboardShortcuts.panSpeed);
        return true;

      case 'ArrowDown':
        this.moveCameraDelta(0, this.config.keyboardShortcuts.panSpeed);
        return true;

      case 'ArrowLeft':
        this.moveCameraDelta(-this.config.keyboardShortcuts.panSpeed, 0);
        return true;

      case 'ArrowRight':
        this.moveCameraDelta(this.config.keyboardShortcuts.panSpeed, 0);
        return true;

      // Zoom controls
      case '+':
      case '=':
        this.zoomCamera(this.config.keyboardShortcuts.zoomSpeed);
        return true;

      case '-':
        this.zoomCamera(-this.config.keyboardShortcuts.zoomSpeed);
        return true;

      case '0':
        this.resetCamera();
        return true;

      // Navigation shortcuts
      case 'h':
      case 'H':
        this.navigateToSection('hero');
        return true;

      case 'Escape':
        this.exitSpatialNavigation();
        return true;

      case 'Tab':
        this.navigateToNextSection(!shiftKey);
        return true;

      case 'Enter':
      case ' ':
        this.activateCurrentSection();
        return true;
    }

    return false;
  }

  private navigateDirection(direction: SpatialDirection): void {
    const currentSection = this.navigationState.currentSection;
    if (!currentSection) return;

    const relationships = this.navigationState.spatialRelationships[currentSection];
    const targetSection = relationships?.[direction];

    if (targetSection) {
      this.navigateToSection(targetSection, direction);
    } else {
      this.announceSpatial(`No section ${direction} of ${currentSection}. Try a different direction.`);
    }
  }

  private navigateToSection(section: PhotoWorkflowSection, direction?: SpatialDirection): void {
    const previousSection = this.navigationState.currentSection;

    // Update navigation state
    this.navigationState.currentSection = section;
    this.navigationState.lastDirection = direction || null;

    if (previousSection && previousSection !== section) {
      this.navigationState.navigationHistory.push(previousSection);
    }

    // Get section description
    const sectionDescription = SPATIAL_SECTION_DESCRIPTIONS[section];
    const relationships = this.navigationState.spatialRelationships[section];

    // Create spatial context announcement
    const directionText = direction ? ` moving ${direction}` : '';
    const availableDirections = this.getAvailableDirections(section);
    const contextText = availableDirections.length > 0
      ? ` Available directions: ${availableDirections.join(', ')}`
      : '';

    this.announceSpatial(
      `Navigated to ${section} section${directionText}. ${sectionDescription}${contextText}`
    );

    // Trigger section change callback
    if (this.navigationCallbacks.onSectionChange) {
      this.navigationCallbacks.onSectionChange(section);
    }

    // Update canvas position if needed
    if (relationships && this.navigationCallbacks.onCanvasMove) {
      const canvasPosition = this.calculateCanvasPosition(section);
      this.navigationCallbacks.onCanvasMove(canvasPosition);
    }
  }

  private moveCameraDelta(deltaX: number, deltaY: number): void {
    const currentPosition = this.navigationState.canvasPosition;
    const newPosition: CanvasPosition = {
      x: currentPosition.x + deltaX,
      y: currentPosition.y + deltaY,
      scale: currentPosition.scale
    };

    this.navigationState.canvasPosition = newPosition;

    if (this.navigationCallbacks.onCanvasMove) {
      this.navigationCallbacks.onCanvasMove(newPosition);
    }

    this.announceSpatial(`Camera moved to position ${Math.round(newPosition.x)}, ${Math.round(newPosition.y)}`);
  }

  private zoomCamera(deltaScale: number): void {
    const currentPosition = this.navigationState.canvasPosition;
    const newScale = Math.max(0.5, Math.min(3.0, currentPosition.scale + deltaScale));

    if (newScale !== currentPosition.scale) {
      const newPosition: CanvasPosition = {
        ...currentPosition,
        scale: newScale
      };

      this.navigationState.canvasPosition = newPosition;

      if (this.navigationCallbacks.onZoom) {
        this.navigationCallbacks.onZoom(newScale);
      }

      if (this.navigationCallbacks.onCanvasMove) {
        this.navigationCallbacks.onCanvasMove(newPosition);
      }

      const zoomPercent = Math.round(newScale * 100);
      this.announceSpatial(`Zoom level: ${zoomPercent}%`);
    }
  }

  private resetCamera(): void {
    const resetPosition: CanvasPosition = { x: 0, y: 0, scale: 1 };
    this.navigationState.canvasPosition = resetPosition;

    if (this.navigationCallbacks.onCanvasMove) {
      this.navigationCallbacks.onCanvasMove(resetPosition);
    }

    this.announceSpatial('Camera reset to center position at 100% zoom');
  }

  private navigateToNextSection(forward: boolean): void {
    const sections: PhotoWorkflowSection[] = ['hero', 'about', 'creative', 'professional', 'thought-leadership', 'ai-github', 'contact'];
    const currentIndex = sections.indexOf(this.navigationState.currentSection || 'hero');

    let nextIndex: number;
    if (forward) {
      nextIndex = (currentIndex + 1) % sections.length;
    } else {
      nextIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
    }

    this.navigateToSection(sections[nextIndex]);
  }

  private activateCurrentSection(): void {
    const currentSection = this.navigationState.currentSection;
    if (!currentSection) return;

    this.announceSpatial(`Activating ${currentSection} section`);

    // Focus the section element
    const sectionElement = document.querySelector(`[data-section="${currentSection}"]`) as HTMLElement;
    if (sectionElement) {
      sectionElement.focus();
    }
  }

  private exitSpatialNavigation(): void {
    this.announceSpatial('Exited spatial navigation mode');

    // Return to normal navigation
    if (this.navigationCallbacks.onSectionChange) {
      this.navigationCallbacks.onSectionChange('hero');
    }
  }

  private calculateCanvasPosition(section: PhotoWorkflowSection): CanvasPosition {
    const relationships = this.navigationState.spatialRelationships[section];
    if (!relationships) {
      return { x: 0, y: 0, scale: 1 };
    }

    // Convert grid position to canvas coordinates
    const gridX = relationships.position.gridX;
    const gridY = relationships.position.gridY;

    // Assuming 400x300 units per grid cell
    const x = (gridX - 1) * 400; // Center grid is 1,1
    const y = (gridY - 1) * 300;

    return { x, y, scale: 1 };
  }

  private getAvailableDirections(section: PhotoWorkflowSection): string[] {
    const relationships = this.navigationState.spatialRelationships[section];
    if (!relationships) return [];

    const directions: string[] = [];
    const directionMap = {
      north: 'north',
      south: 'south',
      east: 'east',
      west: 'west',
      northeast: 'northeast',
      northwest: 'northwest',
      southeast: 'southeast',
      southwest: 'southwest'
    };

    Object.entries(directionMap).forEach(([key, label]) => {
      if (relationships[key as SpatialDirection]) {
        directions.push(label);
      }
    });

    return directions;
  }

  private handleSpatialFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    const sectionElement = target.closest('[data-section]') as HTMLElement;

    if (sectionElement) {
      const section = sectionElement.getAttribute('data-section') as PhotoWorkflowSection;
      if (section && section !== this.navigationState.currentSection) {
        this.navigateToSection(section);
      }
    }
  }

  private announceSpatial(message: string): void {
    if (!this.config.enableSpatialAnnouncements || !this.spatialLiveRegion) return;

    this.spatialLiveRegion.textContent = message;

    if (this.config.debugMode) {
      console.log('[Spatial A11y]', message);
    }
  }

  private isFormElement(element: Element): boolean {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
    return formTags.includes(element.tagName) ||
           element.hasAttribute('contenteditable') ||
           element.closest('[contenteditable="true"]') !== null;
  }

  // Public API methods
  public setNavigationCallbacks(callbacks: {
    onSectionChange?: (section: PhotoWorkflowSection) => void;
    onCanvasMove?: (position: CanvasPosition) => void;
    onZoom?: (scale: number) => void;
  }): void {
    this.navigationCallbacks = callbacks;
  }

  public updateCanvasPosition(position: CanvasPosition): void {
    this.navigationState.canvasPosition = position;
  }

  public updateCurrentSection(section: PhotoWorkflowSection): void {
    if (section !== this.navigationState.currentSection) {
      this.navigateToSection(section);
    }
  }

  public getSpatialRelationships(): SpatialRelationshipMap {
    return this.navigationState.spatialRelationships;
  }

  public getCurrentNavigationState(): SpatialNavigationState {
    return { ...this.navigationState };
  }

  public announceCustomMessage(message: string): void {
    this.announceSpatial(message);
  }

  public destroy(): void {
    if (this.spatialLiveRegion) {
      document.body.removeChild(this.spatialLiveRegion);
      this.spatialLiveRegion = null;
    }

    document.removeEventListener('keydown', this.handleSpatialKeyNavigation.bind(this));
    document.removeEventListener('focusin', this.handleSpatialFocusIn.bind(this));
  }
}

/**
 * useSpatialAccessibility Hook
 * Provides spatial accessibility management for 2D canvas navigation
 */
export function useSpatialAccessibility(config: Partial<SpatialAccessibilityConfig> = {}) {
  const fullConfig = { ...DEFAULT_SPATIAL_CONFIG, ...config };
  const managerRef = useRef<SpatialAccessibilityManager>();
  const [navigationState, setNavigationState] = useState<SpatialNavigationState>();

  // Initialize base accessibility system
  const baseAccessibility = useAccessibility({
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    announceChanges: true,
    debugMode: fullConfig.debugMode
  });

  // Initialize spatial accessibility manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new SpatialAccessibilityManager(fullConfig);
      setNavigationState(managerRef.current.getCurrentNavigationState());
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = undefined;
      }
    };
  }, []);

  // Update state periodically - only when values actually change
  const lastNavigationStateRef = useRef<string>('');
  useEffect(() => {
    const interval = setInterval(() => {
      if (managerRef.current) {
        const newState = managerRef.current.getCurrentNavigationState();
        // Only update if the state has actually changed (use JSON comparison)
        const newStateStr = JSON.stringify(newState);
        if (newStateStr !== lastNavigationStateRef.current) {
          lastNavigationStateRef.current = newStateStr;
          setNavigationState(newState);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const setNavigationCallbacks = useCallback((callbacks: {
    onSectionChange?: (section: PhotoWorkflowSection) => void;
    onCanvasMove?: (position: CanvasPosition) => void;
    onZoom?: (scale: number) => void;
  }) => {
    if (managerRef.current) {
      managerRef.current.setNavigationCallbacks(callbacks);
    }
  }, []);

  const updateCanvasPosition = useCallback((position: CanvasPosition) => {
    if (managerRef.current) {
      managerRef.current.updateCanvasPosition(position);
    }
  }, []);

  const updateCurrentSection = useCallback((section: PhotoWorkflowSection) => {
    if (managerRef.current) {
      managerRef.current.updateCurrentSection(section);
    }
  }, []);

  const announce = useCallback((message: string) => {
    if (managerRef.current) {
      managerRef.current.announceCustomMessage(message);
    }
  }, []);

  const spatialRelationships = useMemo(() =>
    managerRef.current?.getSpatialRelationships(), [navigationState]);

  return useMemo(() => ({
    // Base accessibility features
    ...baseAccessibility,

    // Spatial accessibility features
    navigationState,
    spatialRelationships,
    keyboardShortcuts: SPATIAL_KEYBOARD_SHORTCUTS,
    sectionDescriptions: SPATIAL_SECTION_DESCRIPTIONS,

    // Control methods
    setNavigationCallbacks,
    updateCanvasPosition,
    updateCurrentSection,
    announce,

    // Configuration
    config: fullConfig
  }), [baseAccessibility, navigationState, spatialRelationships, setNavigationCallbacks, updateCanvasPosition, updateCurrentSection, announce, fullConfig]);
}

export type {
  SpatialAccessibilityConfig,
  SpatialNavigationState,
  SpatialDirection,
  SpatialRelationshipMap
};

export { SPATIAL_KEYBOARD_SHORTCUTS, SPATIAL_SECTION_DESCRIPTIONS };