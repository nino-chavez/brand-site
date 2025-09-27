import React from 'react';
import SimplifiedGameFlowContainer from './components/SimplifiedGameFlowContainer';
import { UnifiedGameFlowProvider } from './contexts/UnifiedGameFlowContext';
import Header from './components/Header';
import BackgroundEffects from './components/BackgroundEffects';
import CursorLens from './components/CursorLens';
import { AthleticTokenProvider } from './tokens/simple-provider';

const App: React.FC = () => {
    return (
        <AthleticTokenProvider>
            <UnifiedGameFlowProvider
                initialSection="capture"
                performanceMode="high"
                debugMode={false}
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
                            performanceMode="high"
                            debugMode={false}
                        />
                    </main>

                    {/* CursorLens - Radial Navigation System */}
                    <CursorLens
                        isEnabled={true}
                        activationDelay={800}
                        onSectionSelect={(section) => {
                            console.log('CursorLens navigation to:', section);
                        }}
                        onActivate={(method) => {
                            console.log('CursorLens activated via:', method);
                        }}
                        onDeactivate={() => {
                            console.log('CursorLens deactivated');
                        }}
                        fallbackMode="keyboard"
                    />
                </div>
            </UnifiedGameFlowProvider>
        </AthleticTokenProvider>
    );
};

export default App;