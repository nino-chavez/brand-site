import React, { useState, useEffect } from 'react';
import SimplifiedGameFlowContainer from './components/sports/SimplifiedGameFlowContainer';
import { UnifiedGameFlowProvider } from './contexts/UnifiedGameFlowContext';
import { CanvasStateProvider } from './contexts/CanvasStateProvider';
import Header from './components/layout/Header';
import BackgroundEffects from './components/effects/BackgroundEffects';
import CursorLensV2 from './components/canvas/CursorLensV2';
import { AthleticTokenProvider } from '../tokens/simple-provider';

const App: React.FC = () => {
    const [debugMode, setDebugMode] = useState(false);

    // Check URL parameters for debug mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const debugParam = urlParams.get('debug');

            if (debugParam === 'true') {
                setDebugMode(true);
                console.log('🛠️ Debug mode activated via URL parameter');
            }
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

    // Traditional Layout (Single layout mode)
    return (
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
                        <Header />

                        {/* Main Game Flow experience */}
                        <main id="main-content" className="relative z-10">
                            <SimplifiedGameFlowContainer
                                performanceMode={performanceMode}
                                debugMode={debugMode}
                            />
                        </main>

                        {/* CursorLensV2 - Minimal Radial Navigation */}
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
                    </div>
                </CanvasStateProvider>
            </UnifiedGameFlowProvider>
        </AthleticTokenProvider>
    );
};

export default App;