import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import type {
    GameFlowState,
    GameFlowAction,
    GameFlowContextValue,
    GameFlowProviderProps,
    GameFlowSection,
    GameFlowActions,
    InteractionEvent,
    CameraInteractionType,
    FocusTarget,
    ExposureSettings,
    PerformanceState,
    PerformanceTargets
} from '../types';

// Safe performance timing utility
function getTimestamp(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

// Performance monitoring utility
class PerformanceMonitor {
    private frameCount = 0;
    private lastFrameTime = 0;
    private frameRateHistory: number[] = [];

    trackFrameRate(): number {
        const now = getTimestamp();
        if (this.lastFrameTime) {
            const delta = now - this.lastFrameTime;
            const fps = Math.round(1000 / delta);
            this.frameRateHistory.push(fps);
            if (this.frameRateHistory.length > 60) {
                this.frameRateHistory.shift();
            }
        }
        this.lastFrameTime = now;
        this.frameCount++;

        return this.getAverageFrameRate();
    }

    getAverageFrameRate(): number {
        if (this.frameRateHistory.length === 0) return 60;
        const sum = this.frameRateHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.frameRateHistory.length);
    }

    async trackCoreWebVitals() {
        try {
            // LCP - Largest Contentful Paint
            const lcp = await this.getLCP();

            // FID - First Input Delay (approximated)
            const fid = await this.getFID();

            // CLS - Cumulative Layout Shift
            const cls = await this.getCLS();

            return { lcp, fid, cls };
        } catch (error) {
            console.warn('Core Web Vitals tracking failed:', error);
            return { lcp: 0, fid: 0, cls: 0 };
        }
    }

    private getLCP(): Promise<number> {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                    observer.disconnect();
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });

                // Timeout fallback
                setTimeout(() => resolve(0), 5000);
            } else {
                resolve(0);
            }
        });
    }

    private getFID(): Promise<number> {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    if (entries.length > 0) {
                        resolve(entries[0].processingStart - entries[0].startTime);
                    }
                    observer.disconnect();
                });
                observer.observe({ entryTypes: ['first-input'] });

                // Timeout fallback
                setTimeout(() => resolve(0), 5000);
            } else {
                resolve(0);
            }
        });
    }

    private getCLS(): Promise<number> {
        return new Promise((resolve) => {
            if ('PerformanceObserver' in window) {
                let cls = 0;
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    for (const entry of entries) {
                        if (!(entry as any).hadRecentInput) {
                            cls += (entry as any).value;
                        }
                    }
                });
                observer.observe({ entryTypes: ['layout-shift'] });

                setTimeout(() => {
                    observer.disconnect();
                    resolve(cls);
                }, 5000);
            } else {
                resolve(0);
            }
        });
    }
}

// Initial state factory
const createInitialState = (initialSection: GameFlowSection = 'capture'): GameFlowState => ({
    currentSection: initialSection,
    transitionState: 'idle',
    scrollProgress: 0,
    sectionProgress: {
        capture: 0,
        focus: 0,
        frame: 0,
        exposure: 0,
        develop: 0,
        portfolio: 0
    },
    interactionHistory: [],
    performanceMetrics: {
        loadTime: 0,
        frameRate: 60,
        memoryUsage: 0,
        coreWebVitals: {
            lcp: 0,
            fid: 0,
            cls: 0
        }
    },
    cameraState: {
        focusTarget: null,
        exposure: {
            aperture: 4,
            shutterSpeed: 125,
            iso: 400,
            exposureCompensation: 0
        },
        meteringMode: 'center-weighted',
        focusMode: 'single-point'
    }
});

// Game Flow Reducer
export function gameFlowReducer(state: GameFlowState, action: GameFlowAction): GameFlowState {
    switch (action.type) {
        case 'NAVIGATE_TO_SECTION':
            return {
                ...state,
                currentSection: action.payload,
                transitionState: 'idle'
            };

        case 'UPDATE_SCROLL_PROGRESS':
            return {
                ...state,
                scrollProgress: Math.max(0, Math.min(1, action.payload))
            };

        case 'UPDATE_SECTION_PROGRESS':
            return {
                ...state,
                sectionProgress: {
                    ...state.sectionProgress,
                    [action.payload.section]: Math.max(0, Math.min(1, action.payload.progress))
                }
            };

        case 'TRANSITION_START':
            return {
                ...state,
                transitionState: 'transitioning'
            };

        case 'TRANSITION_COMPLETE':
            return {
                ...state,
                currentSection: action.payload,
                transitionState: 'idle'
            };

        case 'INTERACTION_EVENT':
            return {
                ...state,
                interactionHistory: [
                    action.payload,
                    ...state.interactionHistory.slice(0, 49) // Keep last 50 interactions
                ]
            };

        case 'PERFORMANCE_UPDATE':
            return {
                ...state,
                performanceMetrics: {
                    ...state.performanceMetrics,
                    ...action.payload
                }
            };

        case 'CAMERA_FOCUS_ADJUST':
            return {
                ...state,
                cameraState: {
                    ...state.cameraState,
                    focusTarget: action.payload
                }
            };

        case 'CAMERA_EXPOSURE_ADJUST':
            return {
                ...state,
                cameraState: {
                    ...state.cameraState,
                    exposure: {
                        ...state.cameraState.exposure,
                        ...action.payload
                    }
                }
            };

        case 'ERROR_OCCURRED':
            return {
                ...state,
                error: action.payload,
                transitionState: 'error'
            };

        case 'ERROR_RECOVERED':
            return {
                ...state,
                error: undefined,
                transitionState: 'idle'
            };

        default:
            return state;
    }
}

// Game Flow Context
const GameFlowContext = createContext<GameFlowContextValue>({} as GameFlowContextValue);

// Game Flow Provider Component
export function GameFlowProvider({
    children,
    initialSection = 'capture',
    performanceTracking = true,
    accessibilityMode = false,
    debugMode = false
}: GameFlowProviderProps) {
    const [state, dispatch] = useReducer(gameFlowReducer, createInitialState(initialSection));

    const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

    // Screen reader callback for accessibility
    const [screenReaderCallback, setScreenReaderCallback] = React.useState<
        ((section: string, description: string) => void) | null
    >(null);

    // Performance targets
    const performanceTargets: PerformanceTargets = useMemo(() => ({
        loadTime: 1000,
        frameRate: 60,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        coreWebVitals: {
            lcp: 2500,
            fid: 100,
            cls: 0.1
        }
    }), []);

    // Performance state
    const performanceState: PerformanceState = useMemo(() => ({
        isOptimizing: false,
        metrics: state.performanceMetrics,
        targets: performanceTargets
    }), [state.performanceMetrics, performanceTargets]);

    // Actions implementation
    const actions: GameFlowActions = useMemo(() => ({
        navigateToSection: async (section: GameFlowSection) => {
            try {
                dispatch({ type: 'TRANSITION_START', payload: { from: state.currentSection, to: section } });

                // Performance tracking
                const startTime = getTimestamp();

                // Simulate navigation delay (replace with actual scroll/transition logic)
                await new Promise(resolve => setTimeout(resolve, 300));

                const endTime = getTimestamp();
                const loadTime = endTime - startTime;

                dispatch({ type: 'TRANSITION_COMPLETE', payload: section });
                dispatch({ type: 'PERFORMANCE_UPDATE', payload: { loadTime } });

                // Track interaction
                const interactionEvent: InteractionEvent = {
                    type: 'navigation_click',
                    section,
                    timestamp: Date.now(),
                    data: { method: 'programmatic' },
                    performanceImpact: loadTime
                };
                dispatch({ type: 'INTERACTION_EVENT', payload: interactionEvent });

                // Accessibility announcement
                if (accessibilityMode && screenReaderCallback) {
                    const sectionDescriptions = {
                        capture: 'Introduction and readiness section',
                        focus: 'About and expertise section',
                        frame: 'Projects and work portfolio section',
                        exposure: 'Technical insights and articles section',
                        develop: 'Gallery and visual work section',
                        portfolio: 'Contact and collaboration section'
                    };
                    screenReaderCallback(section, sectionDescriptions[section]);
                }

            } catch (error) {
                dispatch({
                    type: 'ERROR_OCCURRED',
                    payload: {
                        type: 'INTERACTION_ERROR',
                        message: `Navigation to ${section} failed: ${error}`,
                        section,
                        recoverable: true,
                        timestamp: Date.now()
                    }
                });
                throw error;
            }
        },

        updateScrollProgress: (progress: number) => {
            dispatch({ type: 'UPDATE_SCROLL_PROGRESS', payload: progress });

            // Track scroll interaction
            const interactionEvent: InteractionEvent = {
                type: 'scroll_progress',
                section: state.currentSection,
                timestamp: Date.now(),
                data: { progress },
                performanceImpact: 0
            };
            dispatch({ type: 'INTERACTION_EVENT', payload: interactionEvent });
        },

        updateSectionProgress: (section: GameFlowSection, progress: number) => {
            dispatch({ type: 'UPDATE_SECTION_PROGRESS', payload: { section, progress } });
        },

        triggerCameraInteraction: (type: CameraInteractionType) => {
            const interactionEvent: InteractionEvent = {
                type: type as any,
                section: state.currentSection,
                timestamp: Date.now(),
                data: { cameraInteraction: type },
                performanceImpact: 1
            };
            dispatch({ type: 'INTERACTION_EVENT', payload: interactionEvent });
        },

        adjustFocus: (target: FocusTarget) => {
            dispatch({ type: 'CAMERA_FOCUS_ADJUST', payload: target });

            const interactionEvent: InteractionEvent = {
                type: 'focus_adjust',
                section: state.currentSection,
                timestamp: Date.now(),
                data: { focusTarget: target.priority },
                performanceImpact: target.transitionDuration / 100
            };
            dispatch({ type: 'INTERACTION_EVENT', payload: interactionEvent });
        },

        adjustExposure: (settings: Partial<ExposureSettings>) => {
            dispatch({ type: 'CAMERA_EXPOSURE_ADJUST', payload: settings });

            const interactionEvent: InteractionEvent = {
                type: 'exposure_change',
                section: state.currentSection,
                timestamp: Date.now(),
                data: { exposureSettings: settings },
                performanceImpact: 2
            };
            dispatch({ type: 'INTERACTION_EVENT', payload: interactionEvent });
        },

        handleKeyboardNavigation: (key: string) => {
            const sections: GameFlowSection[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];
            const currentIndex = sections.indexOf(state.currentSection);

            let targetSection: GameFlowSection | null = null;

            switch (key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    if (currentIndex < sections.length - 1) {
                        targetSection = sections[currentIndex + 1];
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        targetSection = sections[currentIndex - 1];
                    }
                    break;
                case 'Home':
                    targetSection = sections[0];
                    break;
                case 'End':
                    targetSection = sections[sections.length - 1];
                    break;
            }

            if (targetSection) {
                actions.navigateToSection(targetSection);
            }
        },

        setScreenReaderCallback: (callback: (section: string, description: string) => void) => {
            setScreenReaderCallback(() => callback);
        },

        optimizePerformance: () => {
            // Implementation for performance optimization
            const currentFrameRate = performanceMonitor.getAverageFrameRate();
            if (currentFrameRate < 30) {
                // Reduce animation complexity, disable non-essential effects
                dispatch({
                    type: 'PERFORMANCE_UPDATE',
                    payload: { frameRate: currentFrameRate }
                });
            }
        },

        reportMetrics: () => {
            if (debugMode) {
                console.log('Game Flow Metrics:', {
                    currentSection: state.currentSection,
                    scrollProgress: state.scrollProgress,
                    sectionProgress: state.sectionProgress,
                    performanceMetrics: state.performanceMetrics,
                    interactionCount: state.interactionHistory.length
                });
            }
        },

        recoverFromError: (section: GameFlowSection) => {
            dispatch({ type: 'ERROR_RECOVERED', payload: { section } });
        }
    }), [state.currentSection, accessibilityMode, debugMode, performanceMonitor, screenReaderCallback]);

    // Performance monitoring effect
    useEffect(() => {
        if (!performanceTracking) return;

        let animationFrameId: number;

        const trackPerformance = () => {
            const frameRate = performanceMonitor.trackFrameRate();

            // Update performance metrics every 60 frames
            if (performanceMonitor['frameCount'] % 60 === 0) {
                const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

                dispatch({
                    type: 'PERFORMANCE_UPDATE',
                    payload: { frameRate, memoryUsage }
                });
            }

            animationFrameId = requestAnimationFrame(trackPerformance);
        };

        trackPerformance();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [performanceTracking, performanceMonitor]);

    // Core Web Vitals tracking effect
    useEffect(() => {
        if (!performanceTracking) return;

        const trackCoreWebVitals = async () => {
            try {
                const coreWebVitals = await performanceMonitor.trackCoreWebVitals();
                dispatch({
                    type: 'PERFORMANCE_UPDATE',
                    payload: { coreWebVitals }
                });
            } catch (error) {
                console.warn('Core Web Vitals tracking failed:', error);
            }
        };

        // Track after initial render
        const timer = setTimeout(trackCoreWebVitals, 1000);

        return () => clearTimeout(timer);
    }, [performanceTracking, performanceMonitor]);

    // Context value
    const contextValue: GameFlowContextValue = useMemo(() => ({
        state,
        actions,
        performance: performanceState
    }), [state, actions, performanceState]);

    if (debugMode) {
        // Add debug logging
        React.useEffect(() => {
            console.log('Game Flow State Update:', {
                section: state.currentSection,
                transition: state.transitionState,
                scrollProgress: state.scrollProgress,
                error: state.error
            });
        }, [state.currentSection, state.transitionState, state.scrollProgress, state.error]);
    }

    return (
        <GameFlowContext.Provider value={contextValue}>
            {children}
        </GameFlowContext.Provider>
    );
}

// Hook to use Game Flow context
export function useGameFlowState(): GameFlowContextValue {
    const context = useContext(GameFlowContext);
    // Return context directly - error handling moved to component level if needed
    return context!;
}

// Hook for section-specific state
export function useGameFlowSection(section: GameFlowSection) {
    const { state, actions } = useGameFlowState();

    const isActive = state.currentSection === section;
    const progress = state.sectionProgress[section];
    const isTransitioning = state.transitionState === 'transitioning';

    const navigateToThisSection = useCallback(() => {
        actions.navigateToSection(section);
    }, [actions, section]);

    const updateProgress = useCallback((progress: number) => {
        actions.updateSectionProgress(section, progress);
    }, [actions, section]);

    return {
        isActive,
        progress,
        isTransitioning,
        navigateToThisSection,
        updateProgress
    };
}