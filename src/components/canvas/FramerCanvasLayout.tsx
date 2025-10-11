/**
 * FramerCanvasLayout - Enhanced Canvas with Framer Motion
 *
 * Modern replacement for CanvasPortfolioLayout using Framer Motion for:
 * - Smooth pan/zoom with spring physics
 * - Cinematic camera movements
 * - Hardware-accelerated transforms
 * - Automatic reduced-motion support
 *
 * @fileoverview Framer Motion-powered canvas layout
 * @version 2.0.0
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasPanZoom, useCameraMovement } from '../../hooks/useFramerAnimation';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type { SectionId } from '../../types';

// Import section components
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
import FrameSection from '../../../components/sections/FrameSection';
import ExposureSection from '../../../components/sections/ExposureSection';
import DevelopSection from '../../../components/sections/DevelopSection';
import PortfolioSection from '../../../components/sections/PortfolioSection';

// Spatial layout (same as original)
export const SPATIAL_SECTION_MAP = {
  capture: {
    id: 'capture' as SectionId,
    coordinates: { x: 0, y: 0 },
    dimensions: { width: 1100, height: 800 },
    zIndex: 10,
    component: CaptureSection
  },
  focus: {
    id: 'focus' as SectionId,
    coordinates: { x: -1400, y: 0 },
    dimensions: { width: 1000, height: 900 },
    zIndex: 5,
    component: FocusSection
  },
  frame: {
    id: 'frame' as SectionId,
    coordinates: { x: 1400, y: 0 },
    dimensions: { width: 1000, height: 1100 },
    zIndex: 5,
    component: FrameSection
  },
  exposure: {
    id: 'exposure' as SectionId,
    coordinates: { x: 0, y: -1000 },
    dimensions: { width: 900, height: 800 },
    zIndex: 3,
    component: ExposureSection
  },
  develop: {
    id: 'develop' as SectionId,
    coordinates: { x: 0, y: 1100 },
    dimensions: { width: 1100, height: 900 },
    zIndex: 5,
    component: DevelopSection
  },
  portfolio: {
    id: 'portfolio' as SectionId,
    coordinates: { x: 1600, y: 1100 },
    dimensions: { width: 800, height: 1100 },
    zIndex: 3,
    component: PortfolioSection
  }
} as const;

export interface FramerCanvasLayoutProps {
  className?: string;
}

/**
 * FramerCanvasLayout - Framer Motion-powered portfolio canvas
 */
export const FramerCanvasLayout: React.FC<FramerCanvasLayoutProps> = ({
  className = ''
}) => {
  const { state } = useCanvasState();
  const activeSection = state.activeSection as SectionId;

  // Pan/zoom with Framer Motion
  const { containerRef, x, y, scale, panTo, reset, isDraggable } = useCanvasPanZoom({
    minScale: 0.4,
    maxScale: 2.5,
    initialPosition: { x: 0, y: 0, scale: 1 }
  });

  // Camera movements
  const { controls, animateTo } = useCameraMovement();

  // Navigate to section with cinematic movement
  const navigateToSection = useCallback((sectionId: SectionId) => {
    const section = SPATIAL_SECTION_MAP[sectionId];
    if (!section) return;

    const { coordinates } = section;

    // Center the section in viewport
    const centerX = -coordinates.x + (window.innerWidth / 2);
    const centerY = -coordinates.y + (window.innerHeight / 2);

    animateTo(
      { x: centerX, y: centerY, scale: 1 },
      sectionId === activeSection ? 'rack-focus' : 'pan-tilt'
    );
  }, [activeSection, animateTo]);

  return (
    <motion.div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-neutral-900 ${className}`}
      style={{ cursor: isDraggable ? 'grab' : 'default' }}
    >
      <motion.div
        style={{ x, y, scale }}
        animate={controls}
        drag={isDraggable}
        dragMomentum={false}
        dragElastic={0.1}
        whileDrag={{ cursor: 'grabbing' }}
        className="relative w-full h-full"
      >
        {/* Render all sections */}
        <AnimatePresence>
          {Object.entries(SPATIAL_SECTION_MAP).map(([key, section]) => {
            const SectionComponent = section.component;
            const isActive = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                className="absolute"
                style={{
                  left: section.coordinates.x,
                  top: section.coordinates.y,
                  width: section.dimensions.width,
                  height: section.dimensions.height,
                  zIndex: isActive ? 20 : section.zIndex
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95
                }}
                whileHover={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.2 }
                }}
                onClick={() => navigateToSection(section.id)}
              >
                <SectionComponent />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Navigation controls */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/50 backdrop-blur-md px-6 py-4 rounded-full border border-white/10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        {Object.entries(SPATIAL_SECTION_MAP).map(([key, section]) => (
          <motion.button
            key={section.id}
            onClick={() => navigateToSection(section.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-violet-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </motion.button>
        ))}

        <motion.button
          onClick={reset}
          className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FramerCanvasLayout;
