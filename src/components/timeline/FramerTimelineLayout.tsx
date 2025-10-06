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
import TimelineThumbnail from './TimelineThumbnail';
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
    <div ref={containerRef} className="relative w-full min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header with Layout Switcher */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '60px',
          background: 'rgba(0, 0, 0, 0.9)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
          Nino Chavez
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Layout:
          </span>
          <div style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                background: 'transparent',
                border: '1px solid transparent',
                fontSize: '18px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              aria-label="Traditional layout"
              title="Traditional layout"
            >
              ☰
            </button>
            <button
              onClick={() => { window.location.href = '/?layout=canvas'; }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                background: 'transparent',
                border: '1px solid transparent',
                fontSize: '16px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 200ms',
                perspective: '100px'
              }}
              aria-label="Canvas layout"
              title="Canvas layout"
            >
              <div style={{
                display: 'inline-block',
                transition: 'transform 300ms',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(30deg) rotateY(-30deg)',
                textShadow: '2px 2px 0 rgba(139, 92, 246, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.8), 4px 4px 0 rgba(75, 29, 153, 0.4)',
                filter: 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))'
              }}>
                ⬚
              </div>
            </button>
            <button
              onClick={() => { window.location.href = '/?layout=timeline'; }}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                background: 'rgba(139, 92, 246, 0.4)',
                border: '1px solid rgba(139, 92, 246, 0.6)',
                boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)',
                transform: 'scale(1.05)',
                fontSize: '18px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              aria-label="Timeline layout (active)"
              title="Timeline layout"
            >
              🎞
            </button>
          </div>
        </div>
      </motion.div>

      {/* Film Editor Filmstrip Navigation */}
      <AnimatePresence>
        {filmstripVisible && (
          <motion.div
            className="fixed left-0 right-0 z-40"
            style={{
              top: '60px',
              height: '100px',
              background: 'rgba(0, 0, 0, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="flex items-center h-full px-4">
              {/* Left arrow */}
              <button
                onClick={() => {
                  const prevIndex = scrollState.currentSectionIndex - 1;
                  if (prevIndex >= 0) transitionToSection(prevIndex, 'backward');
                }}
                disabled={scrollState.isTransitioning || scrollState.currentSectionIndex === 0}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '4px',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: scrollState.isTransitioning ? 'not-allowed' : 'pointer',
                  marginRight: '8px',
                  flexShrink: 0,
                  opacity: scrollState.currentSectionIndex === 0 ? 0.3 : 1,
                }}
              >
                ◄
              </button>

              {/* Filmstrip scrollable area */}
              <div
                className="flex-1 flex gap-0 overflow-x-auto overflow-y-hidden px-2"
                style={{
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {TIMELINE_SECTIONS.map((section, index) => (
                  <TimelineThumbnail
                    key={section.id}
                    sectionId={section.id}
                    sectionName={section.name}
                    index={index}
                    isActive={index === scrollState.currentSectionIndex}
                    onClick={navigateToSection}
                  />
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => {
                  const nextIndex = scrollState.currentSectionIndex + 1;
                  if (nextIndex < TIMELINE_SECTIONS.length) transitionToSection(nextIndex, 'forward');
                }}
                disabled={scrollState.isTransitioning || scrollState.currentSectionIndex === TIMELINE_SECTIONS.length - 1}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: '4px',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: scrollState.isTransitioning ? 'not-allowed' : 'pointer',
                  marginLeft: '8px',
                  flexShrink: 0,
                  opacity: scrollState.currentSectionIndex === TIMELINE_SECTIONS.length - 1 ? 0.3 : 1,
                }}
              >
                ►
              </button>
            </div>

            {/* Scroll Progress Bar underneath filmstrip */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                background: 'linear-gradient(90deg, rgb(139, 92, 246), rgb(239, 68, 68))',
                transformOrigin: 'left',
                scaleX: scrollProgress,
                width: `${100 / TIMELINE_SECTIONS.length}%`,
                marginLeft: `${(scrollState.currentSectionIndex * 100) / TIMELINE_SECTIONS.length}%`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Content Container - Horizontal Sliding */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '160px' }}>
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

      {/* Scroll Indicator - Shows position within section (Premiere Pro style) */}
      <motion.div
        className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px 8px',
        }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {TIMELINE_SECTIONS.map((section, index) => (
          <motion.button
            key={section.id}
            onClick={() => navigateToSection(index)}
            disabled={scrollState.isTransitioning}
            style={{
              position: 'relative',
              width: '4px',
              height: '48px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              cursor: scrollState.isTransitioning ? 'not-allowed' : 'pointer',
            }}
            whileHover={{ scale: scrollState.isTransitioning ? 1 : 1.1 }}
            title={`${section.name} (${index + 1}/${TIMELINE_SECTIONS.length})`}
          >
            {/* Fill indicator */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                bottom: 'auto',
                borderRadius: '2px',
                backgroundColor: section.color,
              }}
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

      {/* Section Info Overlay (Lightroom-style with timecode) */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          background: 'rgba(0, 0, 0, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          padding: '16px 20px',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Recording indicator */}
          <motion.div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: currentSection.color,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            {/* Timecode format */}
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'white',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              Frame {scrollState.currentSectionIndex + 1}/{TIMELINE_SECTIONS.length} · {currentSection.name}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '4px',
              fontFamily: 'monospace'
            }}>
              {scrollState.isAtSectionBottom
                ? '▸ Scroll to advance'
                : scrollState.isAtSectionTop
                ? '▾ Scroll down'
                : `${Math.round(scrollState.scrollProgress * 100)}%`}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts (Film editor style) */}
      <motion.div
        style={{
          position: 'fixed',
          top: '180px',
          right: '24px',
          background: 'rgba(0, 0, 0, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '6px',
          padding: '12px 14px',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: 'monospace',
        }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>Scroll</kbd> Within frame</div>
          <div><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>←/→</kbd> Navigate frames</div>
          <div><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>1-6</kbd> Jump to frame</div>
          <div><kbd style={{ padding: '2px 6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px' }}>f</kbd> Toggle filmstrip</div>
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
