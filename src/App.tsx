import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimplifiedGameFlowContainer from './components/sports/SimplifiedGameFlowContainer';
import { UnifiedGameFlowProvider } from './contexts/UnifiedGameFlowContext';
import { CanvasStateProvider, useCanvasState } from './contexts/CanvasStateProvider';
import Header from './components/layout/Header';
import CursorLensV2 from './components/canvas/CursorLensV2';
import LightboxCanvas from './components/canvas/LightboxCanvas';
import CanvasPortfolioLayout from './components/canvas/CanvasPortfolioLayout';
import CanvasOnboarding from './components/canvas/CanvasOnboarding';
import PersistentCTABar from './components/canvas/PersistentCTABar';
import CanvasMinimap from './components/canvas/CanvasMinimap';
import CanvasTimelineLayout from './components/timeline/CanvasTimelineLayout';
import { AthleticTokenProvider } from '../tokens/simple-provider';
import type { SectionId } from './types';

// WOW Factor Components
import CustomCursor from './components/effects/CustomCursor';
import ScrollProgress from './components/effects/ScrollProgress';
import ConsoleEasterEgg from './components/effects/ConsoleEasterEgg';
import SectionAmbientLighting from './components/effects/SectionAmbientLighting';
import FilmMode from './components/effects/FilmMode';
import EffectsPanel from './components/effects/EffectsPanel';
import ViewfinderController from './components/effects/ViewfinderController';
import LoadingScreen from './components/effects/LoadingScreen';
import { EffectsProvider } from './contexts/EffectsContext';

const App: React.FC = () => {
    const [layoutMode, setLayoutMode] = useState<'traditional' | 'canvas' | 'timeline'>('traditional');
    const [debugMode, setDebugMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppReady, setIsAppReady] = useState(false);

    // Check URL parameters for layout mode + mobile detection
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const layoutParam = urlParams.get('layout');
            const debugParam = urlParams.get('debug');
            const testParam = urlParams.get('test');

            // Progressive Enhancement: Detect mobile viewport
            const checkAndSetLayout = () => {
                const isMobileViewport = window.innerWidth < 768;

                if (layoutParam === 'canvas') {
                    // Only allow canvas mode on desktop viewports
                    if (isMobileViewport) {
                        console.log('📱 Mobile viewport detected - forcing traditional layout for accessibility');
                        setLayoutMode('traditional');
                    } else {
                        setLayoutMode('canvas');
                        console.log('🚀 Canvas layout mode activated via URL parameter');
                    }
                } else if (layoutParam === 'timeline') {
                    // Only allow timeline mode on desktop viewports
                    if (isMobileViewport) {
                        console.log('📱 Mobile viewport detected - forcing traditional layout for accessibility');
                        setLayoutMode('traditional');
                    } else {
                        setLayoutMode('timeline');
                        console.log('🎬 Timeline layout mode activated via URL parameter');
                    }
                }
            };

            checkAndSetLayout();

            // Handle viewport resize (orientation change, browser resize)
            const handleResize = () => {
                const isMobileViewport = window.innerWidth < 768;
                if (isMobileViewport && (layoutMode === 'canvas' || layoutMode === 'timeline')) {
                    console.log('📱 Viewport resized to mobile - switching to traditional layout');
                    setLayoutMode('traditional');
                }
            };

            window.addEventListener('resize', handleResize);

            if (debugParam === 'true') {
                setDebugMode(true);
                console.log('🛠️ Debug mode activated via URL parameter');
            }

            // Log test mode detection
            if (testParam === 'true') {
                console.log('🧪 Test mode detected via URL parameter');
            }

            return () => window.removeEventListener('resize', handleResize);
        }
    }, [layoutMode]);

    // Handle initial loading state
    useEffect(() => {
        // Check for test mode - skip loading screen entirely
        const urlParams = new URLSearchParams(window.location.search);
        const isTestMode = urlParams.get('test') === 'true' || process.env.NODE_ENV === 'test';

        if (isTestMode) {
            console.log('🧪 Test mode: Skipping loading screen');
            setIsLoading(false);
            setIsAppReady(true);
            return;
        }

        // Check if user has already seen loading this session
        const hasSeenLoading = sessionStorage.getItem('hasSeenLoading');
        if (hasSeenLoading) {
            if (import.meta.env.DEV) {
                console.log('⚡ Session storage: Skipping loading screen');
            }
            setIsLoading(false);
            setIsAppReady(true);
            return;
        }

        // Mark as seen for this session
        sessionStorage.setItem('hasSeenLoading', 'true');

        // Wait for fonts only (no artificial delays)
        const handleDOMContentLoaded = () => {
            if (document.fonts) {
                document.fonts.ready.then(() => {
                    // Immediate transition to prevent scroll blocking
                    setIsLoading(false);
                    setIsAppReady(true);
                });
            } else {
                // Fallback for browsers without Font Loading API - minimal delay
                setTimeout(() => {
                    setIsLoading(false);
                    setIsAppReady(true);
                }, 100); // Reduced from 300ms to 100ms
            }
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            handleDOMContentLoaded();
        } else {
            window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
            return () => window.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
        }
    }, []);

    // Auto-detect performance mode based on device
    const performanceMode = (() => {
        if (typeof window !== 'undefined') {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const hasHighMemory = (navigator as any).deviceMemory >= 4;
            const hasHighCores = navigator.hardwareConcurrency >= 4;

            if (isMobile && (!hasHighMemory || !hasHighCores)) {
                return 'low' as const;
            } else if (hasHighMemory && hasHighCores) {
                return 'high' as const;
            }
        }
        return 'balanced' as const;
    })();

    // Navigation handler for smooth scrolling to sections
    const handleNavigate = useCallback((sectionId: SectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    // Note: ScrollSpy functionality removed - each layout mode (timeline, canvas, traditional)
    // handles its own navigation tracking through UnifiedGameFlowContext

    // Timeline Layout Mode
    if (layoutMode === 'timeline') {
        return (
            <AthleticTokenProvider>
                <UnifiedGameFlowProvider
                    initialSection="capture"
                    performanceMode={performanceMode}
                    debugMode={debugMode}
                >
                    <EffectsProvider>
                        {/* Photography-themed loading screen */}
                        <LoadingScreen isLoading={isLoading || !isAppReady} />

                        {/* WOW Factor Components */}
                        <CustomCursor />
                        <ConsoleEasterEgg />

                        {/* Timeline Layout */}
                        <CanvasTimelineLayout />
                    </EffectsProvider>
                </UnifiedGameFlowProvider>
            </AthleticTokenProvider>
        );
    }

    // Canvas Layout Mode
    if (layoutMode === 'canvas') {
        // Check if we need diagnostic mode
        const urlParams = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();
        const isTestMode = urlParams.get('test') === 'true';
        const isDiagnosticMode = urlParams.get('diagnostic') === 'true';

        // Diagnostic mode - simple test component
        if (isDiagnosticMode) {
            return <div>Canvas Debug Diagnostic (Component Missing)</div>;
        }

        // Test mode detection logging
        if (isTestMode) {
            console.log('🧪 Test mode active - initializing optimized canvas system');
        }

        // Canvas-specific navigation component
        const CanvasAppContent = () => {
            const { actions } = useCanvasState();

            // Canvas navigation handler - uses updated section coordinates
            const handleCanvasNavigate = useCallback((sectionId: SectionId) => {
                // Section coordinates matching CanvasPortfolioLayout SPATIAL_SECTION_MAP
                const sectionMap: Record<SectionId, { x: number; y: number; width: number; height: number }> = {
                    capture: { x: 0, y: 0, width: 1100, height: 800 },
                    focus: { x: -1400, y: 0, width: 1000, height: 900 },
                    frame: { x: 1400, y: 0, width: 1000, height: 1100 },
                    exposure: { x: 0, y: -1000, width: 900, height: 800 },
                    develop: { x: 0, y: 1100, width: 1100, height: 900 },
                    portfolio: { x: 1600, y: 1100, width: 800, height: 1100 }
                };

                const section = sectionMap[sectionId];
                if (!section) return;

                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Section's absolute position in canvas space
                const sectionAbsoluteX = 2000 + section.x;
                const sectionAbsoluteY = 1500 + section.y;

                // Center point of the section
                const sectionCenterX = sectionAbsoluteX + section.width / 2;
                const sectionCenterY = sectionAbsoluteY + section.height / 2;

                // Target position
                const targetX = sectionCenterX - viewportWidth / 2;
                const targetY = sectionCenterY - viewportHeight / 2;

                actions.updatePosition({
                    x: targetX,
                    y: targetY,
                    scale: 1.0
                });
                actions.setActiveSection(sectionId);

                console.log(`🎯 Header navigation to ${sectionId}`, {
                    sectionId,
                    sectionAbsolute: { x: sectionAbsoluteX, y: sectionAbsoluteY },
                    targetPosition: { x: targetX, y: targetY }
                });
            }, [actions]);

            return (
                <EffectsProvider>
                    {/* Photography-themed loading screen */}
                    <LoadingScreen isLoading={isLoading || !isAppReady} />

                    {/* Canvas Onboarding - First visit guidance */}
                    <CanvasOnboarding />

                    {/* WOW Factor Components */}
                    <CustomCursor />
                    <ScrollProgress />
                    <ConsoleEasterEgg />
                    <SectionAmbientLighting />
                    <FilmMode />
                    <ViewfinderController />

                <div className="bg-brand-dark text-brand-light font-sans antialiased overflow-hidden h-screen">
                    {/* Skip link for accessibility */}
                    <a
                        href="#canvas-content"
                        className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:p-4 focus:bg-brand-violet focus:text-white focus:z-50"
                    >
                        Skip to canvas content
                    </a>

                    {/* Header with canvas navigation */}
                    <Header onNavigate={handleCanvasNavigate} />

                    {/* Debug Info */}
                    {debugMode && (
                        <div className="absolute top-20 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-sm max-w-md">
                            <div className="font-semibold text-green-400 mb-2">🎯 Canvas Debug Info</div>
                            <div>Layout Mode: {layoutMode}</div>
                            <div>Performance: {performanceMode}</div>
                            <div>Canvas System: Loading...</div>
                            <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70">
                                Check console for additional logs
                            </div>
                        </div>
                    )}

                    {/* Canvas Layout System */}
                    <main id="canvas-content" className="relative z-10 h-screen w-screen overflow-hidden bg-gray-900">
                        <LightboxCanvas
                            performanceMode={performanceMode}
                            debugMode={debugMode}
                            className="photographer-lightbox-app relative z-10"
                        >
                            <CanvasPortfolioLayout />
                        </LightboxCanvas>
                    </main>

                    {/* Canvas Mode Indicator - Development only */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
                            <div className="bg-black/60 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="font-mono">CANVAS MODE</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance warning - Development only */}
                    {process.env.NODE_ENV === 'development' && performanceMode === 'low' && (
                        <div className="fixed bottom-16 right-4 z-40 pointer-events-none">
                            <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm">
                                ⚡ Performance mode: Low
                            </div>
                        </div>
                    )}

                    {/* Layout switcher hidden - use ?layout=canvas URL param to switch modes */}

                    {/* Canvas Minimap - Spatial orientation */}
                    <CanvasMinimap />

                    {/* CursorLensV2 - Disabled in canvas mode (conflicts with mouse drag panning) */}
                    {process.env.NODE_ENV === 'development' && false && (
                        <CursorLensV2
                            isEnabled={false}
                            activationDelay={800}
                            onSectionSelect={(section) => {
                                console.log('🎯 CursorLens navigation to:', section);
                            }}
                            onActivate={() => {
                                console.log('🎯 CursorLens activated');
                            }}
                            onDeactivate={() => {
                                console.log('🎯 CursorLens deactivated');
                            }}
                            className="canvas-cursor-lens"
                        />
                    )}
                </div>
                </EffectsProvider>
            );
        };

        return (
            <AthleticTokenProvider>
                <UnifiedGameFlowProvider
                    initialSection="capture"
                    performanceMode={performanceMode}
                    debugMode={debugMode}
                >
                    <CanvasStateProvider
                        initialPosition={{
                            x: typeof window !== 'undefined'
                                ? (2000 + 0) - window.innerWidth / 2 + 550
                                : 1550,
                            y: typeof window !== 'undefined'
                                ? (1500 + 0) - window.innerHeight / 2 + 400
                                : 1100,
                            scale: 1.0
                        }}
                        performanceMode={performanceMode}
                        enableAnalytics={true}
                    >
                        <CanvasAppContent />
                    </CanvasStateProvider>
                </UnifiedGameFlowProvider>
            </AthleticTokenProvider>
        );
    }

    // Traditional Layout Mode (default)
    return (
        <EffectsProvider>
            <AthleticTokenProvider>
                <UnifiedGameFlowProvider
                initialSection="capture"
                performanceMode={performanceMode}
                debugMode={debugMode}
            >
                <CanvasStateProvider
                    initialPosition={{ x: 0, y: 0, scale: 1.0 }}
                    performanceMode={performanceMode}
                    enableAnalytics={true}
                >
                    {/* Photography-themed loading screen */}
                    <LoadingScreen isLoading={isLoading || !isAppReady} />

                    {/* WOW Factor Components */}
                    <CustomCursor />
                    <ScrollProgress />
                    <ConsoleEasterEgg />
                    <SectionAmbientLighting />
                    <FilmMode />
                    <ViewfinderController />

                    <div className="bg-brand-dark text-brand-light font-sans antialiased scroll-smooth overflow-x-hidden" style={{ overflowY: 'auto', minHeight: '100vh' }}>
                        {/* Skip link for accessibility */}
                        <a
                            href="#main-content"
                            className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:p-4 focus:bg-brand-violet focus:text-white focus:z-50"
                        >
                            Skip to main content
                        </a>

                        {/* Simplified header - Game Flow Container handles most navigation */}
                        <Header onNavigate={handleNavigate} />

                        {/* Main Game Flow experience */}
                        <main id="main-content" className="relative z-10">
                            <SimplifiedGameFlowContainer
                                performanceMode={performanceMode}
                                debugMode={debugMode}
                            />
                        </main>

                        {/* Layout switcher hidden - use ?layout=canvas URL param to switch modes */}

                        {/* CursorLensV2 - Disabled in traditional mode (canvas-only feature) */}
                        {process.env.NODE_ENV === 'development' && false && (
                            <CursorLensV2
                                isEnabled={true}
                                activationDelay={800}
                                onSectionSelect={(section) => {
                                    console.log('CursorLens navigation to:', section);
                                }}
                                onActivate={() => {
                                    console.log('CursorLens activated');
                                }}
                                onDeactivate={() => {
                                    console.log('CursorLens deactivated');
                                }}
                            />
                        )}
                    </div>
                </CanvasStateProvider>
            </UnifiedGameFlowProvider>
        </AthleticTokenProvider>
        </EffectsProvider>
    );
};

export default App;