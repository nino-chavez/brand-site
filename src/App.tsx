import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SimplifiedGameFlowContainer from './components/sports/SimplifiedGameFlowContainer';
import { UnifiedGameFlowProvider } from './contexts/UnifiedGameFlowContext';
import { CanvasStateProvider } from './contexts/CanvasStateProvider';
import Header from './components/layout/Header';
import BackgroundEffects from './components/effects/BackgroundEffects';
import CursorLensV2 from './components/canvas/CursorLensV2';
import LightboxCanvas from './components/canvas/LightboxCanvas';
import CanvasPortfolioLayout from './components/canvas/CanvasPortfolioLayout';
import CanvasOnboarding from './components/canvas/CanvasOnboarding';
import PersistentCTABar from './components/canvas/PersistentCTABar';
import CanvasMinimap from './components/canvas/CanvasMinimap';
import { AthleticTokenProvider } from '../tokens/simple-provider';
import useScrollSpy from './hooks/useScrollSpy';
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
    const [layoutMode, setLayoutMode] = useState<'traditional' | 'canvas'>('traditional');
    const [debugMode, setDebugMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppReady, setIsAppReady] = useState(false);

    // Check URL parameters for layout mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const layoutParam = urlParams.get('layout');
            const debugParam = urlParams.get('debug');
            const testParam = urlParams.get('test');

            if (layoutParam === 'canvas') {
                setLayoutMode('canvas');
                console.log('🚀 Canvas layout mode activated via URL parameter');
            }

            if (debugParam === 'true') {
                setDebugMode(true);
                console.log('🛠️ Debug mode activated via URL parameter');
            }

            // Log test mode detection
            if (testParam === 'true') {
                console.log('🧪 Test mode detected via URL parameter');
            }
        }
    }, []);

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
            console.log('⚡ Session storage: Skipping loading screen');
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
                    // Minimal delay for smooth transition
                    setTimeout(() => {
                        setIsLoading(false);
                        setIsAppReady(true);
                    }, 300); // Reduced from 900ms to 300ms
                });
            } else {
                // Fallback for browsers without Font Loading API
                setTimeout(() => {
                    setIsLoading(false);
                    setIsAppReady(true);
                }, 300); // Reduced from 1000ms to 300ms
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

    // Collect section elements for scroll spy
    // Uses unified SectionId photography metaphor IDs
    // Note: CaptureSection uses id="capture", not "hero"
    const sectionElements = useMemo(() => {
        if (typeof window === 'undefined') return [];

        return ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio']
            .map(id => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);
    }, [layoutMode]); // Re-collect when layout changes

    // Track active section with scroll spy
    const { activeSection } = useScrollSpy(sectionElements, {
        threshold: 0.3,
        rootMargin: '-20% 0px -35% 0px'
    });

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
                                ? -(2000 + 0) + window.innerWidth / 2 - 500  // Center capture section (at x:0, width:1000)
                                : -1500,
                            y: typeof window !== 'undefined'
                                ? -(1500 + 0) + window.innerHeight / 2 - 350  // Center capture section (at y:0, height:700)
                                : -1150,
                            scale: 1.0
                        }}
                        performanceMode={performanceMode}
                        enableAnalytics={true}
                    >
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
                            <EffectsPanel />
                            <ViewfinderController />

                        <div className="bg-brand-dark text-brand-light font-sans antialiased overflow-hidden h-screen">
                            <BackgroundEffects />

                            {/* Skip link for accessibility */}
                            <a
                                href="#canvas-content"
                                className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:p-4 focus:bg-brand-violet focus:text-white focus:z-50"
                            >
                                Skip to canvas content
                            </a>

                            {/* Header */}
                            <Header onNavigate={handleNavigate} activeSection={activeSection} />

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

                            {/* Persistent CTA Bar - Conversion optimization */}
                            <PersistentCTABar onNavigate={handleNavigate} />

                            {/* CursorLensV2 - Integrated with Canvas */}
                            <CursorLensV2
                                isEnabled={true}
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
                        </div>
                        </EffectsProvider>
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
                    <EffectsPanel />

                    <div className="bg-brand-dark text-brand-light font-sans antialiased">
                        <BackgroundEffects />

                        {/* Skip link for accessibility */}
                        <a
                            href="#main-content"
                            className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:p-4 focus:bg-brand-violet focus:text-white focus:z-50"
                        >
                            Skip to main content
                        </a>

                        {/* Simplified header - Game Flow Container handles most navigation */}
                        <Header onNavigate={handleNavigate} activeSection={activeSection} />

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