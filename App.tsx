import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: SectionId is exported from types.ts, not constants.ts.
import { SECTIONS } from './constants';
import type { SectionId } from './types';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import WorkSection from './components/WorkSection';
import InsightsSection from './components/InsightsSection';
import GallerySection from './components/GallerySection';
import ReelSection from './components/ReelSection';
import ContactSection from './components/ContactSection';
import FloatingNav from './components/FloatingNav';
import SpotlightCursor from './components/SpotlightCursor';
import BackgroundEffects from './components/BackgroundEffects';
import CursorLens from './components/CursorLens';
import { UnifiedGameFlowProvider } from './contexts/UnifiedGameFlowContext';
import useScrollSpy from './hooks/useScrollSpy';

const App: React.FC = () => {
    const sectionRefs = useRef<Record<SectionId, HTMLDivElement | null>>({} as Record<SectionId, HTMLDivElement | null>);

    const activeSection = useScrollSpy(
        Object.values(sectionRefs.current).filter((ref) => ref !== null) as HTMLElement[],
        { threshold: 0.3 }
    );
    
    const scrollToSection = useCallback((id: SectionId) => {
        sectionRefs.current[id]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                const key = parseInt(e.key);
                if (key >= 1 && key <= SECTIONS.length) {
                    e.preventDefault();
                    const sectionId = SECTIONS[key - 1].id;
                    scrollToSection(sectionId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scrollToSection]);

    return (
        <UnifiedGameFlowProvider
            initialSection="hero"
            performanceMode="high"
            debugMode={true}
        >
            <div className="bg-brand-dark text-brand-light font-sans antialiased">
                <SpotlightCursor />
                <BackgroundEffects />
                <a href="#main-content" className="absolute left-[-9999px] top-auto w-px h-px overflow-hidden focus:left-auto focus:top-auto focus:w-auto focus:h-auto focus:p-4 focus:bg-brand-violet focus:text-white focus:z-50">
                    Skip to main content
                </a>

                <Header onNavigate={scrollToSection} activeSection={activeSection} />
                {/* FIX: Corrected typo in prop value from active-section to activeSection. */}
                <FloatingNav onNavigate={scrollToSection} activeSection={activeSection} />

                <main id="main-content" className="relative z-10">
                    <HeroSection setRef={(el) => (sectionRefs.current['hero'] = el)} onNavigate={scrollToSection} />
                    <AboutSection setRef={(el) => (sectionRefs.current['about'] = el)} />
                    <WorkSection setRef={(el) => (sectionRefs.current['work'] = el)} />
                    <InsightsSection setRef={(el) => (sectionRefs.current['insights'] = el)} />
                    <GallerySection setRef={(el) => (sectionRefs.current['gallery'] = el)} />
                    <ReelSection setRef={(el) => (sectionRefs.current['reel'] = el)} />
                    <ContactSection setRef={(el) => (sectionRefs.current['contact'] = el)} />
                </main>

                {/* CursorLens - Radial Navigation System for Acceptance Criteria Testing */}
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
    );
};

export default App;