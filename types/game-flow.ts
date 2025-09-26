import React from 'react';

/**
 * Game Flow state management types
 * Extracted from monolithic types.ts for better organization
 */

export type GameFlowSection =
    | 'capture'    // Introduction & readiness (Hero)
    | 'focus'      // Attention to detail (About)
    | 'frame'      // Composition & planning (Work)
    | 'exposure'   // Technical execution (Insights)
    | 'develop'    // Process & refinement (Gallery)
    | 'portfolio'; // Results & contact (Contact)

export type TransitionState =
    | 'idle'
    | 'preparing'
    | 'transitioning'
    | 'completing'
    | 'error';

export type InteractionType =
    | 'section_enter'
    | 'section_exit'
    | 'focus_adjust'
    | 'exposure_change'
    | 'shutter_click'
    | 'navigation_click'
    | 'scroll_progress';

export type CameraInteractionType =
    | 'shutter_click'
    | 'focus_adjust'
    | 'exposure_adjust'
    | 'aperture_change';

export type NavigationMethod = 'scroll' | 'click' | 'keyboard' | 'touch' | 'voice';

export interface GameFlowState {
    currentSection: GameFlowSection;
    transitionState: TransitionState;
    scrollProgress: number;
    sectionProgress: Record<GameFlowSection, number>;
    interactionHistory: InteractionEvent[];
    performanceMetrics: PerformanceMetrics;
    cameraState: CameraState;
    error?: GameFlowError;
}

export interface InteractionEvent {
    type: InteractionType;
    section: GameFlowSection;
    timestamp: number;
    data: any;
    performanceImpact: number;
}

export interface PerformanceMetrics {
    loadTime: number;
    frameRate: number;
    memoryUsage: number;
    coreWebVitals: CoreWebVitals;
}

export interface CoreWebVitals {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
}

export interface CameraState {
    focusTarget: FocusTarget | null;
    exposure: ExposureSettings;
    meteringMode: 'center-weighted' | 'spot' | 'matrix';
    focusMode: 'single-point' | 'dynamic' | 'zone';
}

export interface FocusTarget {
    element: HTMLElement;
    priority: 'primary' | 'secondary' | 'background';
    transitionDuration: number;
}

export interface ExposureSettings {
    aperture: number;
    shutterSpeed: number;
    iso: number;
    exposureCompensation: number;
}

export interface GameFlowError {
    type: 'PERFORMANCE_ERROR' | 'INTERACTION_ERROR' | 'CONTENT_ERROR';
    message: string;
    section?: GameFlowSection;
    recoverable: boolean;
    timestamp: number;
}

export type GameFlowAction =
    | { type: 'NAVIGATE_TO_SECTION'; payload: GameFlowSection }
    | { type: 'UPDATE_SCROLL_PROGRESS'; payload: number }
    | { type: 'UPDATE_SECTION_PROGRESS'; payload: { section: GameFlowSection; progress: number } }
    | { type: 'TRANSITION_START'; payload: { from: GameFlowSection; to: GameFlowSection } }
    | { type: 'TRANSITION_COMPLETE'; payload: GameFlowSection }
    | { type: 'INTERACTION_EVENT'; payload: InteractionEvent }
    | { type: 'PERFORMANCE_UPDATE'; payload: Partial<PerformanceMetrics> }
    | { type: 'CAMERA_FOCUS_ADJUST'; payload: FocusTarget }
    | { type: 'CAMERA_EXPOSURE_ADJUST'; payload: Partial<ExposureSettings> }
    | { type: 'ERROR_OCCURRED'; payload: GameFlowError }
    | { type: 'ERROR_RECOVERED'; payload: { section: GameFlowSection } };

export interface GameFlowContextValue {
    state: GameFlowState;
    actions: GameFlowActions;
    performance: PerformanceState;
}

export interface GameFlowActions {
    // Navigation Actions
    navigateToSection: (section: GameFlowSection) => Promise<void>;
    updateScrollProgress: (progress: number) => void;
    updateSectionProgress: (section: GameFlowSection, progress: number) => void;

    // Camera Interactions
    triggerCameraInteraction: (type: CameraInteractionType) => void;
    adjustFocus: (target: FocusTarget) => void;
    adjustExposure: (settings: Partial<ExposureSettings>) => void;

    // Accessibility & Interaction
    handleKeyboardNavigation: (key: string) => void;
    setScreenReaderCallback: (callback: (section: string, description: string) => void) => void;

    // Performance & Error Handling
    optimizePerformance: () => void;
    reportMetrics: () => void;
    recoverFromError: (section: GameFlowSection) => void;
}

export interface PerformanceState {
    isOptimizing: boolean;
    metrics: PerformanceMetrics;
    targets: PerformanceTargets;
}

export interface PerformanceTargets {
    loadTime: number;        // Target: <1000ms
    frameRate: number;       // Target: 60fps
    memoryUsage: number;     // Target: <50MB
    coreWebVitals: {
        lcp: number;         // Target: <2500ms
        fid: number;         // Target: <100ms
        cls: number;         // Target: <0.1
    };
}

export interface GameFlowProviderProps {
    children: React.ReactNode;
    initialSection?: GameFlowSection;
    performanceTracking?: boolean;
    accessibilityMode?: boolean;
    debugMode?: boolean;
}

export interface TransitionConfig {
    duration: number;
    easing: string;
    willChange: string[];
    transform3d: boolean;
    gpuAcceleration: boolean;
}

export type PerformanceMode = 'high' | 'balanced' | 'low' | 'accessible';

export interface ScrollEngineConfig {
    smoothScrollDuration: number;
    sectionSnapThreshold: number;
    performanceThrottling: boolean;
    accessibilityMode: boolean;
}

export interface ScrollEngineCallbacks {
    onSectionEnter: (section: GameFlowSection) => void;
    onSectionExit: (section: GameFlowSection) => void;
    onTransitionStart: (from: GameFlowSection, to: GameFlowSection) => void;
    onTransitionComplete: (section: GameFlowSection) => void;
}