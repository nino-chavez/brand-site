/**
 * FramerTimelineLayout - Enhanced Timeline with Framer Motion
 *
 * Film editor-inspired timeline with Framer Motion for:
 * - Smooth section transitions with AnimatePresence
 * - Shared layout animations for filmstrip
 * - Gesture-based navigation (swipe/drag)
 * - Cinematic entrance/exit animations
 *
 * @fileoverview Framer Motion-powered timeline layout
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
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

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const FramerTimelineLayout: React.FC = () => {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [filmstripVisible, setFilmstripVisible] = useState(true);
  const controls = useAnimation();

  const currentSection = TIMELINE_SECTIONS[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'l') {
        paginate(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        paginate(-1);
      } else if (e.key === 'f') {
        setFilmstripVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  const paginate = (newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < TIMELINE_SECTIONS.length) {
      setCurrentIndex([newIndex, newDirection]);
    }
  };

  const navigateToSection = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setCurrentIndex([index, newDirection]);
  };

  // Slide variants for smooth transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      rotateY: direction > 0 ? 10 : -10
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      rotateY: direction < 0 ? 10 : -10
    })
  };

  const SectionComponent = currentSection.component;

  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden">
      {/* Filmstrip Navigation */}
      <AnimatePresence>
        {filmstripVisible && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
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
                  className={`relative flex-shrink-0 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                    index === currentIndex
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  layoutId={index === currentIndex ? 'activeTab' : undefined}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Color indicator */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 h-1 rounded-full"
                    style={{ backgroundColor: section.color }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index === currentIndex ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10">{section.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Content with Swipe Gestures */}
      <div className="relative w-full h-full pt-20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }: PanInfo) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0"
            style={{
              perspective: 1200,
              transformStyle: 'preserve-3d'
            }}
          >
            <SectionComponent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={() => paginate(-1)}
          disabled={currentIndex === 0}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <div className="flex gap-2 mx-2">
          {TIMELINE_SECTIONS.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => navigateToSection(index)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: index === currentIndex ? section.color : 'rgba(255,255,255,0.3)'
              }}
              whileHover={{ scale: 1.5 }}
              animate={{
                scale: index === currentIndex ? 1.5 : 1
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => paginate(1)}
          disabled={currentIndex === TIMELINE_SECTIONS.length - 1}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="fixed top-24 right-8 bg-black/70 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-xs text-white/60"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="space-y-1">
          <div><kbd className="px-2 py-1 bg-white/10 rounded">←/→</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">h/l</kbd> Navigate</div>
          <div><kbd className="px-2 py-1 bg-white/10 rounded">f</kbd> Toggle filmstrip</div>
        </div>
      </motion.div>
    </div>
  );
};

export default FramerTimelineLayout;
