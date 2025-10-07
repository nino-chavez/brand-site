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
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';
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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [filmstripVisible, setFilmstripVisible] = useState(true);
  const [transitionStyle, setTransitionStyle] = useState<string>('spring');
  const [isPlaying, setIsPlaying] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionScrollRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<number | null>(null);
  const scrollAccumulator = useRef(0);

  // Track scroll progress within current section using Framer Motion
  const { scrollYProgress } = useScroll({
    container: sectionScrollRef,
    layoutEffect: false
  });

  // Update scroll progress state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  // Transition to next/previous section
  const transitionToSection = useCallback((newIndex: number, dir: 'forward' | 'backward') => {
    if (newIndex < 0 || newIndex >= TIMELINE_SECTIONS.length) return;
    if (isTransitioning) return;

    console.log(`[INFO] Transitioning to section ${newIndex} (${TIMELINE_SECTIONS[newIndex].name})`);

    setIsTransitioning(true);
    setDirection(dir);
    scrollAccumulator.current = 0;

    // Transition to new section
    setTimeout(() => {
      setCurrentSectionIndex(newIndex);
      setScrollProgress(0);

      // Reset scroll position of new section container
      if (sectionScrollRef.current) {
        sectionScrollRef.current.scrollTop = 0;
      }

      setIsTransitioning(false);
    }, 400);
  }, [isTransitioning]);

  // Scroll event handler for boundary detection
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) {
        e.preventDefault();
        return;
      }

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // Get LIVE scroll progress from Framer Motion (not stale React state)
      const liveProgress = scrollYProgress.get();

      // Detect boundaries (90% = bottom for more reliable detection, 10% = top)
      const atBottom = liveProgress > 0.9;
      const atTop = liveProgress < 0.1;

      console.log(`[SCROLL] Progress: ${(liveProgress * 100).toFixed(1)}%, Section: ${currentSectionIndex + 1}, Down: ${scrollingDown}, AtBottom: ${atBottom}`);

      if (scrollingDown && atBottom && currentSectionIndex < TIMELINE_SECTIONS.length - 1) {
        // Accumulate scroll momentum
        scrollAccumulator.current += Math.abs(e.deltaY);

        if (scrollAccumulator.current > 80) { // Lower threshold for faster response
          e.preventDefault();
          console.log(`[TRANSITION] Forward to section ${currentSectionIndex + 2}`);
          transitionToSection(currentSectionIndex + 1, 'forward');
        }
      } else if (scrollingUp && atTop && currentSectionIndex > 0) {
        // Accumulate scroll momentum
        scrollAccumulator.current += Math.abs(e.deltaY);

        if (scrollAccumulator.current > 80) { // Lower threshold for faster response
          e.preventDefault();
          console.log(`[TRANSITION] Backward to section ${currentSectionIndex}`);
          transitionToSection(currentSectionIndex - 1, 'backward');
        }
      } else {
        // Reset accumulator when not at boundary
        scrollAccumulator.current = 0;
      }
    };

    const container = sectionScrollRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [scrollYProgress, currentSectionIndex, isTransitioning, transitionToSection]);

  // Professional timecode formatter (HH:MM:SS:FF format)
  const formatTimecode = useCallback((sectionIndex: number, progress: number): string => {
    const fps = 30; // 30 frames per second
    const secondsPerSection = 15;

    // Calculate total seconds and frames
    const totalSeconds = sectionIndex * secondsPerSection + Math.floor(progress * secondsPerSection);
    const frames = Math.floor((progress * secondsPerSection * fps) % fps);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  }, []);

  // Transport controls: Play/Pause
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Transport controls: Previous frame
  const previousFrame = useCallback(() => {
    const prevIndex = currentSectionIndex - 1;
    if (prevIndex >= 0) {
      transitionToSection(prevIndex, 'backward');
    }
  }, [currentSectionIndex, transitionToSection]);

  // Transport controls: Next frame
  const nextFrame = useCallback(() => {
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex < TIMELINE_SECTIONS.length) {
      transitionToSection(nextIndex, 'forward');
    }
  }, [currentSectionIndex, transitionToSection]);

  // Auto-play: advance to next section automatically
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < TIMELINE_SECTIONS.length) {
          transitionToSection(nextIndex, 'forward');
        } else {
          setIsPlaying(false); // Stop at last section
        }
      }, 3000); // 3 seconds per section
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, currentSectionIndex, transitionToSection]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu only on timeline container
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const currentSection = TIMELINE_SECTIONS[currentSectionIndex];

  // Scroll progress animation with spring physics (for smooth UI updates)
  const scrollProgressSpring = useSpring(scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === 'ArrowRight' || e.key === 'l') {
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < TIMELINE_SECTIONS.length) {
          transitionToSection(nextIndex, 'forward');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        const prevIndex = currentSectionIndex - 1;
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
        const dir = targetIndex > currentSectionIndex ? 'forward' : 'backward';
        transitionToSection(targetIndex, dir);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSectionIndex, isTransitioning, transitionToSection]);

  const navigateToSection = (index: number) => {
    if (isTransitioning) return;
    const dir = index > currentSectionIndex ? 'forward' : 'backward';
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
                  const prevIndex = currentSectionIndex - 1;
                  if (prevIndex >= 0) transitionToSection(prevIndex, 'backward');
                }}
                disabled={isTransitioning || currentSectionIndex === 0}
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
                  cursor: isTransitioning ? 'not-allowed' : 'pointer',
                  marginRight: '8px',
                  flexShrink: 0,
                  opacity: currentSectionIndex === 0 ? 0.3 : 1,
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
                    isActive={index === currentSectionIndex}
                    onClick={navigateToSection}
                  />
                ))}
              </div>

              {/* Right arrow */}
              <button
                onClick={() => {
                  const nextIndex = currentSectionIndex + 1;
                  if (nextIndex < TIMELINE_SECTIONS.length) transitionToSection(nextIndex, 'forward');
                }}
                disabled={isTransitioning || currentSectionIndex === TIMELINE_SECTIONS.length - 1}
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
                  cursor: isTransitioning ? 'not-allowed' : 'pointer',
                  marginLeft: '8px',
                  flexShrink: 0,
                  opacity: currentSectionIndex === TIMELINE_SECTIONS.length - 1 ? 0.3 : 1,
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
                marginLeft: `${(currentSectionIndex * 100) / TIMELINE_SECTIONS.length}%`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Content Container - Horizontal Sliding */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '160px' }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSectionIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              transitionStyle === 'spring'
                ? { x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.3 }, scale: { duration: 0.3 } }
                : transitionStyle === 'tween'
                ? { x: { type: 'tween', duration: 0.5, ease: 'easeInOut' }, opacity: { duration: 0.3 }, scale: { duration: 0.3 } }
                : transitionStyle === 'cut'
                ? { x: { duration: 0.1 }, opacity: { duration: 0.05 }, scale: { duration: 0.05 } }
                : { x: { type: 'spring', stiffness: 200, damping: 40 }, opacity: { duration: 0.4 }, scale: { duration: 0.4 } }
            }
            className="w-full"
          >
            {/* Section Wrapper - Scrollable container for current section */}
            <div
              ref={sectionScrollRef}
              className="w-full overflow-y-auto"
              style={{
                height: `calc(100vh - 160px)`, // Account for header + filmstrip
                position: 'relative'
              }}
            >
              {React.createElement(currentSection.component, {
                active: true,
                progress: scrollProgress
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
            disabled={isTransitioning}
            style={{
              position: 'relative',
              width: '4px',
              height: '48px',
              borderRadius: '2px',
              background: 'rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              cursor: isTransitioning ? 'not-allowed' : 'pointer',
            }}
            whileHover={{ scale: isTransitioning ? 1 : 1.1 }}
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
                height: index === currentSectionIndex
                  ? `${scrollProgress * 100}%`
                  : index < currentSectionIndex
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
              Frame {currentSectionIndex + 1}/{TIMELINE_SECTIONS.length} · {currentSection.name}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              marginTop: '4px',
              fontFamily: 'monospace'
            }}>
              {(scrollProgress > 0.95)
                ? '▸ Scroll to advance'
                : (scrollProgress < 0.05)
                ? '▾ Scroll down'
                : `${Math.round(scrollProgress * 100)}%`}
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

      {/* Scroll Threshold Indicator - Shows when approaching transition boundary */}
      <AnimatePresence>
        {scrollProgress > 0.7 && !isTransitioning && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: '250px', // Match scrollThreshold
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.6), transparent)',
              pointerEvents: 'none',
              zIndex: 45,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Timeline Controls Bar (Professional Desktop Editor Style - Mobile Responsive) */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          height: 'clamp(44px, 5vh, 48px)', // Responsive: 44px mobile minimum, 48px max
          background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
          borderTop: '1px solid #3a3a3a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 clamp(8px, 2vw, 16px)', // Responsive padding
          justifyContent: 'space-between',
          fontFamily: 'SF Mono, Monaco, Consolas, monospace',
          fontSize: 'clamp(10px, 2.5vw, 11px)', // Responsive font size
          color: 'rgba(255, 255, 255, 0.85)',
          gap: 'clamp(6px, 2vw, 12px)', // Responsive gap
        }}
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Left: Transport controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Previous frame button */}
          <button
            onClick={previousFrame}
            disabled={isTransitioning || currentSectionIndex === 0}
            style={{
              background: 'rgba(50, 50, 50, 0.8)',
              border: '1px solid rgba(100, 100, 100, 0.5)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: 'clamp(6px, 1.5vh, 8px) clamp(10px, 2vw, 12px)', // Responsive padding for touch
              fontSize: 'clamp(13px, 3vw, 14px)', // Larger for mobile
              cursor: currentSectionIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentSectionIndex === 0 ? 0.3 : 1,
              minWidth: '44px', // iOS minimum touch target
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Previous frame"
            title="Previous frame (←)"
          >
            ⏮
          </button>

          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            disabled={isTransitioning || currentSectionIndex === TIMELINE_SECTIONS.length - 1}
            style={{
              background: isPlaying ? 'rgba(139, 92, 246, 0.3)' : 'rgba(50, 50, 50, 0.8)',
              border: isPlaying ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid rgba(100, 100, 100, 0.5)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: 'clamp(6px, 1.5vh, 8px) clamp(12px, 2.5vw, 14px)', // Responsive padding
              fontSize: 'clamp(13px, 3vw, 14px)', // Larger for mobile
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 0 8px rgba(139, 92, 246, 0.4)' : 'none',
              minWidth: '44px', // iOS minimum touch target
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          {/* Next frame button */}
          <button
            onClick={nextFrame}
            disabled={isTransitioning || currentSectionIndex === TIMELINE_SECTIONS.length - 1}
            style={{
              background: 'rgba(50, 50, 50, 0.8)',
              border: '1px solid rgba(100, 100, 100, 0.5)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: 'clamp(6px, 1.5vh, 8px) clamp(10px, 2vw, 12px)', // Responsive padding
              fontSize: 'clamp(13px, 3vw, 14px)', // Larger for mobile
              cursor: currentSectionIndex === TIMELINE_SECTIONS.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentSectionIndex === TIMELINE_SECTIONS.length - 1 ? 0.3 : 1,
              minWidth: '44px', // iOS minimum touch target
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Next frame"
            title="Next frame (→)"
          >
            ⏭
          </button>

          <span style={{ opacity: 0.3, marginLeft: '4px' }}>|</span>

          {/* Frame counter */}
          <span style={{ fontWeight: 600, letterSpacing: '0.5px', fontSize: '10px' }}>
            {currentSectionIndex + 1}/{TIMELINE_SECTIONS.length}
          </span>
        </div>

        {/* Center: Timeline ruler with draggable playhead */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Timeline track */}
          <div
            style={{
              flex: 1,
              height: 'clamp(24px, 4vh, 28px)', // Increased from 18px for mobile touch targets
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(100, 100, 100, 0.3)',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              const targetSection = Math.floor(percentage * TIMELINE_SECTIONS.length);
              const dir = targetSection > currentSectionIndex ? 'forward' : 'backward';
              transitionToSection(Math.min(targetSection, TIMELINE_SECTIONS.length - 1), dir);
            }}
          >
            {/* Section markers */}
            {TIMELINE_SECTIONS.map((section, index) => (
              <div
                key={section.id}
                style={{
                  position: 'absolute',
                  left: `${(index / TIMELINE_SECTIONS.length) * 100}%`,
                  width: `${(1 / TIMELINE_SECTIONS.length) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${section.color}20, ${section.color}10)`,
                  borderRight: index < TIMELINE_SECTIONS.length - 1 ? '1px solid rgba(100, 100, 100, 0.3)' : 'none',
                }}
                title={section.name}
              />
            ))}

            {/* Playhead */}
            <motion.div
              style={{
                position: 'absolute',
                left: `${((currentSectionIndex + scrollProgress) / TIMELINE_SECTIONS.length) * 100}%`,
                top: -2,
                width: '2px',
                height: 'calc(100% + 4px)',
                background: 'rgba(139, 92, 246, 0.9)',
                boxShadow: '0 0 8px rgba(139, 92, 246, 0.8)',
                transform: 'translateX(-1px)',
                pointerEvents: 'none',
              }}
              initial={false}
              animate={{ left: `${((currentSectionIndex + scrollProgress) / TIMELINE_SECTIONS.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />

            {/* Playhead handle */}
            <motion.div
              style={{
                position: 'absolute',
                left: `${((currentSectionIndex + scrollProgress) / TIMELINE_SECTIONS.length) * 100}%`,
                top: -4,
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid rgba(139, 92, 246, 0.9)',
                transform: 'translateX(-5px)',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.8))',
              }}
              initial={false}
              animate={{ left: `${((currentSectionIndex + scrollProgress) / TIMELINE_SECTIONS.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Section name */}
          <span style={{ fontSize: '10px', opacity: 0.7, whiteSpace: 'nowrap' }}>
            {currentSection.name}
          </span>
        </div>

        {/* Right: Timecode + Transition selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Professional timecode display (HH:MM:SS:FF) */}
          <div style={{
            fontWeight: 600,
            letterSpacing: '1px',
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 4px rgba(139, 92, 246, 0.6)',
            fontFamily: 'SF Mono, Monaco, Consolas, monospace',
            fontSize: '10px',
          }}>
            {formatTimecode(currentSectionIndex, scrollProgress)}
          </div>

          <span style={{ opacity: 0.3 }}>|</span>

          {/* Transition selector */}
          <select
            value={transitionStyle}
            onChange={(e) => setTransitionStyle(e.target.value)}
            style={{
              background: 'rgba(50, 50, 50, 0.8)',
              border: '1px solid rgba(100, 100, 100, 0.5)',
              borderRadius: '3px',
              color: 'rgba(255, 255, 255, 0.85)',
              padding: '3px 6px',
              fontSize: '9px',
              cursor: 'pointer',
              fontFamily: 'SF Mono, Monaco, Consolas, monospace',
              outline: 'none',
            }}
            aria-label="Select transition effect"
            title="Transition effect"
          >
            <option value="spring">Spring</option>
            <option value="ease">Ease</option>
            <option value="linear">Linear</option>
            <option value="anticipate">Anticipate</option>
          </select>
        </div>
      </motion.div>

      {/* Context Menu (Desktop Editor Style) */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            style={{
              position: 'fixed',
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
              background: 'rgba(30, 30, 30, 0.98)',
              border: '1px solid rgba(100, 100, 100, 0.5)',
              borderRadius: '6px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              padding: '6px',
              zIndex: 100,
              minWidth: '180px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '13px',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Jump to Frame */}
            <div style={{
              padding: '8px 12px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Navigation
            </div>

            {TIMELINE_SECTIONS.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  const dir = index > currentSectionIndex ? 'forward' : 'backward';
                  transitionToSection(index, dir);
                  setContextMenu(null);
                }}
                disabled={index === currentSectionIndex}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  background: index === currentSectionIndex ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: index === currentSectionIndex ? 'rgba(139, 92, 246, 0.9)' : 'rgba(255, 255, 255, 0.85)',
                  cursor: index === currentSectionIndex ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSectionIndex) {
                    e.currentTarget.style.background = 'rgba(100, 100, 100, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSectionIndex) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span>{section.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>{index + 1}</span>
              </button>
            ))}

            <div style={{
              height: '1px',
              background: 'rgba(100, 100, 100, 0.3)',
              margin: '6px 0',
            }} />

            {/* Toggle Filmstrip */}
            <button
              onClick={() => {
                setFilmstripVisible(prev => !prev);
                setContextMenu(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(100, 100, 100, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>Toggle Filmstrip</span>
              <span style={{ fontSize: '11px', opacity: 0.5 }}>F</span>
            </button>

            <div style={{
              height: '1px',
              background: 'rgba(100, 100, 100, 0.3)',
              margin: '6px 0',
            }} />

            {/* Keyboard Shortcuts Reference */}
            <div style={{
              padding: '8px 12px',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Shortcuts
            </div>

            <div style={{ padding: '4px 12px 8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Navigate</span>
                <span style={{ opacity: 0.7 }}>← / →</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Jump to frame</span>
                <span style={{ opacity: 0.7 }}>1-6</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>First / Last</span>
                <span style={{ opacity: 0.7 }}>Home / End</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Filmstrip</span>
                <span style={{ opacity: 0.7 }}>F</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FramerTimelineLayout;
