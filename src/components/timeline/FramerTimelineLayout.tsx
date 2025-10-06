/**
 * FramerTimelineLayout - Scroll-Based Timeline Navigation
 *
 * Implements intuitive vertical→horizontal scroll pattern:
 * - Scroll down within section (normal vertical scroll)
 * - At section bottom → smooth horizontal transition to next section
 * - New section starts at top → repeat
 *
 * Enhanced with Framer Motion for:
 * - Smooth horizontal slide transitions
 * - Section enter/exit animations
 * - Progress indicators
 * - Gesture-based navigation
 *
 * @fileoverview Scroll-aware timeline with Framer Motion
 * @version 3.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import type { SectionId } from '../../types';

// Import section components
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
import FrameSection from '../../../components/sections/FrameSection';
import ExposureSection from '../../../components/sections/ExposureSection';
import DevelopSection from '../../../components/sections/DevelopSection';
import PortfolioSection from '../../../components/sections/PortfolioSection';

interface TimelineSection {
  id: SectionId;
  name: string;
  component: React.ComponentType<any>;
  color: string;
}

const TIMELINE_SECTIONS: TimelineSection[] = [
  { id: 'capture', name: 'Capture', component: CaptureSection, color: '#8b5cf6' },
  { id: 'focus', name: 'Focus', component: FocusSection, color: '#06b6d4' },
  { id: 'frame', name: 'Frame', component: FrameSection, color: '#10b981' },
  { id: 'exposure', name: 'Exposure', component: ExposureSection, color: '#f59e0b' },
  { id: 'develop', name: 'Develop', component: DevelopSection, color: '#ef4444' },
  { id: 'portfolio', name: 'Portfolio', component: PortfolioSection, color: '#ec4899' },
];

export const FramerTimelineLayout: React.FC = () => {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [filmstripVisible, setFilmstripVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use scroll-based navigation hook
  const { state: scrollState, registerSection, transitionToSection } = useTimelineScroll({
    totalSections: TIMELINE_SECTIONS.length,
    onSectionChange: (newIndex, dir) => {
      setDirection(dir);
      console.log(`[INFO] Transitioned to section ${newIndex} (${TIMELINE_SECTIONS[newIndex].name})`);
    },
    transitionDuration: 800,
    scrollThreshold: 50
  });

  const currentSection = TIMELINE_SECTIONS[scrollState.currentSectionIndex];

  // Scroll progress animation with spring physics
  const scrollProgress = useSpring(scrollState.scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (scrollState.isTransitioning) return;

      if (e.key === 'ArrowRight' || e.key === 'l') {
        const nextIndex = scrollState.currentSectionIndex + 1;
        if (nextIndex < TIMELINE_SECTIONS.length) {
          transitionToSection(nextIndex, 'forward');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        const prevIndex = scrollState.currentSectionIndex - 1;
        if (prevIndex >= 0) {
          transitionToSection(prevIndex, 'backward');
        }
      } else if (e.key === 'f') {
        setFilmstripVisible(prev => !prev);
      } else if (e.key === 'Home') {
        transitionToSection(0, 'backward');
      } else if (e.key === 'End') {
        transitionToSection(TIMELINE_SECTIONS.length - 1, 'forward');
      } else if (e.key >= '1' && e.key <= '6') {
        const targetIndex = parseInt(e.key) - 1;
        const dir = targetIndex > scrollState.currentSectionIndex ? 'forward' : 'backward';
        transitionToSection(targetIndex, dir);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scrollState.currentSectionIndex, scrollState.isTransitioning, transitionToSection]);

  const navigateToSection = (index: number) => {
    if (scrollState.isTransitioning) return;
    const dir = index > scrollState.currentSectionIndex ? 'forward' : 'backward';
    transitionToSection(index, dir);
  };

  // Horizontal slide variants for section transitions
  const slideVariants = {
    enter: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
      scale: 0.95,
    })
  };

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-neutral-900">
      {/* Filmstrip Navigation */}
      <AnimatePresence>
        {filmstripVisible && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="flex items-center gap-2 px-6 py-4 overflow-x-auto">
              {TIMELINE_SECTIONS.map((section, index) => (
                <motion.button
                  key={section.id}
                  onClick={() => navigateToSection(index)}
                  disabled={scrollState.isTransitioning}
                  className={`relative flex-shrink-0 px-6 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    index === scrollState.currentSectionIndex
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  whileHover={{ scale: scrollState.isTransitioning ? 1 : 1.05 }}
                  whileTap={{ scale: scrollState.isTransitioning ? 1 : 0.95 }}
                >
                  {/* Color indicator */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-1 rounded-full"
                    style={{ backgroundColor: section.color }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index === scrollState.currentSectionIndex ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">{section.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Scroll Progress Bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-athletic-brand-violet to-athletic-brand-orange origin-left"
              style={{
                scaleX: scrollProgress,
                width: `${100 / TIMELINE_SECTIONS.length}%`,
                left: `${(scrollState.currentSectionIndex * 100) / TIMELINE_SECTIONS.length}%`
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Content Container - Horizontal Sliding */}
      <div className="relative w-full overflow-hidden pt-20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={scrollState.currentSectionIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            className="w-full"
          >
            {/* Section Wrapper - Allows Vertical Scrolling */}
            <div
              ref={(el) => registerSection(scrollState.currentSectionIndex, el)}
              className="w-full min-h-screen"
              style={{
                minHeight: '100vh',
                overflowY: 'auto'
              }}
            >
              {React.createElement(currentSection.component, {
                active: true,
                progress: scrollState.scrollProgress
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll Indicator - Shows position within section */}
      <motion.div
        className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {TIMELINE_SECTIONS.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => navigateToSection(index)}
            disabled={scrollState.isTransitioning}
            className="relative w-3 h-12 rounded-full bg-white/10 overflow-hidden disabled:cursor-not-allowed"
            whileHover={{ scale: scrollState.isTransitioning ? 1 : 1.2 }}
            title={section.name}
          >
            {/* Fill indicator */}
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-full"
              style={{ backgroundColor: section.color }}
              initial={{ height: 0 }}
              animate={{
                height: index === scrollState.currentSectionIndex
                  ? `${scrollState.scrollProgress * 100}%`
                  : index < scrollState.currentSectionIndex
                  ? '100%'
                  : '0%'
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        ))}
      </motion.div>

      {/* Section Info Overlay */}
      <motion.div
        className="fixed bottom-8 left-8 bg-black/70 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentSection.color }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <div className="text-white font-medium">
              {scrollState.currentSectionIndex + 1} / {TIMELINE_SECTIONS.length} · {currentSection.name}
            </div>
            <div className="text-white/50 text-sm">
              {scrollState.isAtSectionBottom
                ? 'Scroll to continue →'
                : scrollState.isAtSectionTop
                ? 'Scroll down ↓'
                : `${Math.round(scrollState.scrollProgress * 100)}% complete`}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="fixed top-24 right-8 bg-black/70 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-xs text-white/60"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="space-y-1">
          <div><kbd className="px-2 py-1 bg-white/10 rounded">Scroll</kbd> Navigate section</div>
          <div><kbd className="px-2 py-1 bg-white/10 rounded">←/→</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">h/l</kbd> Jump sections</div>
          <div><kbd className="px-2 py-1 bg-white/10 rounded">1-6</kbd> Direct jump</div>
          <div><kbd className="px-2 py-1 bg-white/10 rounded">f</kbd> Toggle filmstrip</div>
        </div>
      </motion.div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {scrollState.isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FramerTimelineLayout;
