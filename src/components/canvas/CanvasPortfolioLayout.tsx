/**
 * CanvasPortfolioLayout - Portfolio Sections in 2D Spatial Layout
 *
 * Positions all 6 portfolio sections in a photographer's lightbox arrangement
 * with pan/zoom navigation and progressive content disclosure.
 *
 * @fileoverview Canvas layout container for portfolio sections
 * @version 1.0.0
 * @since Canvas Content Integration
 */

import React, { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type { SectionId } from '../../types';
import { SectionSkeleton } from './SectionSkeleton';

// Lazy load section components for progressive loading
const CaptureSection = lazy(() => import('../../../components/sections/CaptureSection'));
const FocusSection = lazy(() => import('../../../components/sections/FocusSection'));
const FrameSection = lazy(() => import('../../../components/sections/FrameSection'));
const ExposureSection = lazy(() => import('../../../components/sections/ExposureSection'));
const DevelopSection = lazy(() => import('../../../components/sections/DevelopSection'));
const PortfolioSection = lazy(() => import('../../../components/sections/PortfolioSection'));

// ===== SPATIAL LAYOUT CONFIGURATION =====

/**
 * 2D Spatial coordinates for photographer's lightbox layout
 *
 * Metaphor: Sections arranged on a photographer's lightbox table
 * - Center: Hero/Capture (primary focal point)
 * - Left: About/Focus (personal story)
 * - Right: Projects/Frame (work showcase)
 * - Top: Skills/Exposure (technical depth)
 * - Bottom: Gallery/Develop (visual portfolio)
 * - Bottom-Right: Contact/Portfolio (connection point)
 */
export const SPATIAL_SECTION_MAP = {
  capture: {
    id: 'capture' as SectionId,
    coordinates: { x: 0, y: 0 },
    dimensions: { width: 1100, height: 800 },  // Increased to 800 for full content
    zIndex: 10,
    description: 'Hero section - Enterprise architect introduction'
  },
  focus: {
    id: 'focus' as SectionId,
    coordinates: { x: -1400, y: 0 },  // Increased spacing from -1300
    dimensions: { width: 1000, height: 900 },  // Increased to 900 for full bio content
    zIndex: 5,
    description: 'About section - Professional background and expertise'
  },
  frame: {
    id: 'frame' as SectionId,
    coordinates: { x: 1400, y: 0 },  // Increased spacing from 1300
    dimensions: { width: 1000, height: 1100 },  // Increased to 1100 to fit all project cards
    zIndex: 5,
    description: 'Projects section - Technical case studies'
  },
  exposure: {
    id: 'exposure' as SectionId,
    coordinates: { x: 0, y: -1000 },  // Increased spacing from -900
    dimensions: { width: 900, height: 800 },  // Increased to 800 for full skills content
    zIndex: 3,
    description: 'Skills section - Technical stack and expertise'
  },
  develop: {
    id: 'develop' as SectionId,
    coordinates: { x: 0, y: 1100 },  // Increased spacing from 1000
    dimensions: { width: 1100, height: 900 },  // Increased to 900 for gallery grid
    zIndex: 5,
    description: 'Gallery section - Visual portfolio'
  },
  portfolio: {
    id: 'portfolio' as SectionId,
    coordinates: { x: 1600, y: 1100 },  // Increased spacing from 1500, 1000
    dimensions: { width: 800, height: 1100 },  // Increased to 1100 to fit full contact form with all fields
    zIndex: 3,
    description: 'Contact section - Get in touch'
  }
} as const;

// ===== COMPONENT =====

export interface CanvasPortfolioLayoutProps {
  className?: string;
}

/**
 * CanvasPortfolioLayout - Renders all portfolio sections in 2D spatial arrangement
 */
export const CanvasPortfolioLayout: React.FC<CanvasPortfolioLayoutProps> = ({
  className = ''
}) => {
  const { state, actions } = useCanvasState();
  const currentScale = state.position.scale;
  const activeSection = state.activeSection as SectionId;

  // Track mousedown position to detect drag vs click
  const mouseDownPos = useRef<{ x: number; y: number; time: number } | null>(null);

  // ===== SECTION REPOSITIONING =====

  // Custom position offsets (loaded from localStorage)
  const [sectionOffsets, setSectionOffsets] = useState<Record<SectionId, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('canvas-section-positions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Track active drag state for repositioning
  const [dragState, setDragState] = useState<{
    sectionId: SectionId;
    startX: number;
    startY: number;
    initialOffset: { x: number; y: number };
  } | null>(null);

  // Save positions to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(sectionOffsets).length > 0) {
      localStorage.setItem('canvas-section-positions', JSON.stringify(sectionOffsets));
    }
  }, [sectionOffsets]);

  const handleSectionMouseDown = useCallback((e: React.MouseEvent, sectionId: SectionId) => {
    mouseDownPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };

    // Alt+drag = reposition mode (like Figma/design tools)
    if (e.altKey) {
      e.stopPropagation(); // Prevent canvas pan

      const currentOffset = sectionOffsets[sectionId] || { x: 0, y: 0 };

      setDragState({
        sectionId,
        startX: e.clientX,
        startY: e.clientY,
        initialOffset: currentOffset
      });

      console.log(`[INFO] Reposition mode activated for ${sectionId} (Alt+drag)`);
    }
  }, [sectionOffsets]);

  // Section order for keyboard navigation
  const sectionOrder: SectionId[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

  /**
   * Camera navigation - smoothly pan/zoom to focus on a section
   * Prevents navigation if user was dragging the canvas
   */
  const handleSectionClick = useCallback((sectionId: SectionId, e: React.MouseEvent) => {
    // Prevent navigation if user dragged (mouse moved > 5px from mousedown)
    if (mouseDownPos.current) {
      const dx = e.clientX - mouseDownPos.current.x;
      const dy = e.clientY - mouseDownPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        console.log('[INFO] Click blocked - user dragged canvas', { distance });
        mouseDownPos.current = null;
        return;
      }
    }

    const section = SPATIAL_SECTION_MAP[sectionId];
    if (!section) return;

    // Calculate centered position
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Section's absolute position in canvas space (with 2000, 1500 offset)
    const sectionAbsoluteX = 2000 + section.coordinates.x;
    const sectionAbsoluteY = 1500 + section.coordinates.y;

    // Center point of the section
    const sectionCenterX = sectionAbsoluteX + section.dimensions.width / 2;
    const sectionCenterY = sectionAbsoluteY + section.dimensions.height / 2;

    // Target position: move canvas so section center aligns with viewport center
    // Canvas position is the negative offset (moving canvas left = positive x)
    const targetX = sectionCenterX - viewportWidth / 2;
    const targetY = sectionCenterY - viewportHeight / 2;
    const targetScale = 1.0; // Keep at 1.0 for consistent view

    // Update canvas position with smooth animation (handled by LightboxCanvas)
    actions.updatePosition({
      x: targetX,
      y: targetY,
      scale: targetScale
    });

    // Set active section
    actions.setActiveSection(sectionId);

    console.log(`[INFO] Navigating to ${sectionId} section`, {
      sectionId,
      sectionAbsolute: { x: sectionAbsoluteX, y: sectionAbsoluteY },
      sectionCenter: { x: sectionCenterX, y: sectionCenterY },
      viewport: { width: viewportWidth, height: viewportHeight },
      targetPosition: { x: targetX, y: targetY, scale: targetScale }
    });
  }, [actions]);

  /**
   * Global mouse handlers for section repositioning
   */
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;

      const deltaX = (e.clientX - dragState.startX) / currentScale;
      const deltaY = (e.clientY - dragState.startY) / currentScale;

      const newOffset = {
        x: dragState.initialOffset.x + deltaX,
        y: dragState.initialOffset.y + deltaY
      };

      setSectionOffsets(prev => ({
        ...prev,
        [dragState.sectionId]: newOffset
      }));
    };

    const handleMouseUp = () => {
      if (dragState) {
        console.log(`[INFO] Reposition complete for ${dragState.sectionId}`, sectionOffsets[dragState.sectionId]);
        setDragState(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, currentScale, sectionOffsets]);

  /**
   * Keyboard navigation - Tab/Shift+Tab to cycle through sections
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only handle Tab if not in input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();

        const currentIndex = sectionOrder.indexOf(activeSection);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + sectionOrder.length) % sectionOrder.length  // Shift+Tab = previous
          : (currentIndex + 1) % sectionOrder.length;                        // Tab = next

        const nextSection = sectionOrder[nextIndex];
        handleSectionClick(nextSection);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, handleSectionClick]);

  // Helper to get effective coordinates (default + custom offset)
  const getEffectiveCoordinates = useCallback((sectionId: SectionId) => {
    const baseCoords = SPATIAL_SECTION_MAP[sectionId].coordinates;
    const offset = sectionOffsets[sectionId] || { x: 0, y: 0 };
    return {
      x: baseCoords.x + offset.x,
      y: baseCoords.y + offset.y
    };
  }, [sectionOffsets]);

  // Reset all positions to defaults
  const resetPositions = useCallback(() => {
    setSectionOffsets({});
    localStorage.removeItem('canvas-section-positions');
    console.log('[INFO] All section positions reset to defaults');
  }, []);

  return (
    <div
      className={`canvas-portfolio-layout relative ${className}`}
      style={{
        width: '4000px',
        height: '3000px',
        minWidth: '4000px',
        minHeight: '3000px',
        marginLeft: '-2000px',
        marginTop: '-1500px'
      }}
    >
      {/* Capture Section (Hero) - Center - Torn Notebook Paper */}
      <div
        className={`absolute overflow-visible canvas-section-torn ${
          dragState?.sectionId === 'capture'
            ? 'cursor-move ring-4 ring-blue-400 shadow-2xl shadow-blue-400/30'
            : 'cursor-pointer transition-all duration-300'
        } ${
          activeSection === 'capture'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('capture').x}px`,
          top: `${1500 + getEffectiveCoordinates('capture').y}px`,
          width: `${SPATIAL_SECTION_MAP.capture.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.capture.dimensions.height}px`,
          zIndex: dragState?.sectionId === 'capture' ? 100 : SPATIAL_SECTION_MAP.capture.zIndex,
          /* Torn notebook paper appearance */
          backgroundColor: '#fffef8',
          boxShadow: dragState?.sectionId === 'capture'
            ? '0 30px 60px -12px rgba(59, 130, 246, 0.5), 0 10px 20px -8px rgba(59, 130, 246, 0.3)'
            : activeSection === 'capture'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(-0.5deg)',
          borderLeft: '3px solid rgba(255, 150, 150, 0.3)', // Torn edge indicator (red margin line)
          clipPath: `polygon(
            0% 2%, 0.5% 0%, 1% 1.5%, 2% 0.5%, 3% 2%, 3.5% 1%, 4% 2.5%, 5% 1%, 6% 2%,
            7% 0.5%, 8% 2%, 9% 1%, 10% 2.5%, 15% 1%, 20% 2%, 30% 1%, 40% 2%, 50% 0.5%,
            60% 2%, 70% 1%, 80% 2%, 90% 1%, 95% 2%, 98% 1%, 99% 2%, 100% 1%,
            100% 98%, 100% 100%,
            0% 100%, 0% 98%
          )`
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'capture')}
        onClick={(e) => handleSectionClick('capture', e)}
        tabIndex={0}
        aria-label="Navigate to Capture section (Hold Alt to reposition)"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="torn"
              width={SPATIAL_SECTION_MAP.capture.dimensions.width}
              height={SPATIAL_SECTION_MAP.capture.dimensions.height}
              contentBlocks={4}
            />
          }
        >
          <CaptureSection
            active={activeSection === 'capture'}
            progress={1}
            shutterSpeed={1000}
            onCapture={() => {}}
          />
        </Suspense>
      </div>

      {/* Focus Section (About) - Left - Scratch Note Paper */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-scratch ${
          activeSection === 'focus'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('focus').x}px`,
          top: `${1500 + getEffectiveCoordinates('focus').y}px`,
          width: `${SPATIAL_SECTION_MAP.focus.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.focus.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.focus.zIndex,
          /* Scratch note paper with subtle texture */
          backgroundColor: '#fefdfb',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 30px,
              rgba(139, 92, 246, 0.03) 30px,
              rgba(139, 92, 246, 0.03) 31px
            )
          `,
          boxShadow: activeSection === 'focus'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(1.2deg)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderTop: '3px double rgba(139, 92, 246, 0.2)' // Header accent line
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'focus')}
        onClick={(e) => handleSectionClick('focus', e)}
        tabIndex={0}
        aria-label="Navigate to Focus section"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="ruled"
              width={SPATIAL_SECTION_MAP.focus.dimensions.width}
              height={SPATIAL_SECTION_MAP.focus.dimensions.height}
              contentBlocks={5}
            />
          }
        >
          <FocusSection
            active={activeSection === 'focus'}
            progress={1}
            depthOfField={0.5}
            onFocusLock={() => {}}
          />
        </Suspense>
      </div>

      {/* Frame Section (Projects) - Right - Clean Paper with Corner Fold */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-folded ${
          activeSection === 'frame'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('frame').x}px`,
          top: `${1500 + getEffectiveCoordinates('frame').y}px`,
          width: `${SPATIAL_SECTION_MAP.frame.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.frame.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.frame.zIndex,
          /* Clean paper with corner fold effect */
          backgroundColor: '#ffffff',
          boxShadow: activeSection === 'frame'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(-0.8deg)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          clipPath: 'polygon(0 0, 100% 0, 100% 95%, 97% 100%, 0 100%)' // Bottom-right fold
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'frame')}
        onClick={(e) => handleSectionClick('frame', e)}
        tabIndex={0}
        aria-label="Navigate to Frame section"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="folded"
              width={SPATIAL_SECTION_MAP.frame.dimensions.width}
              height={SPATIAL_SECTION_MAP.frame.dimensions.height}
              contentBlocks={4}
            />
          }
        >
          <FrameSection
            active={activeSection === 'frame'}
            progress={1}
            exposureSettings={{
              aperture: 2.8,
              shutterSpeed: 1000,
              iso: 400,
              exposureCompensation: 0
            }}
            onExposureAdjust={() => {}}
          />
        </Suspense>
      </div>

      {/* Exposure Section (Skills) - Top - Index Card Style */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-index ${
          activeSection === 'exposure'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('exposure').x}px`,
          top: `${1500 + getEffectiveCoordinates('exposure').y}px`,
          width: `${SPATIAL_SECTION_MAP.exposure.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.exposure.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.exposure.zIndex,
          /* Index card appearance with horizontal lines */
          backgroundColor: '#fffff8',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 28px,
              rgba(200, 210, 220, 0.4) 28px,
              rgba(200, 210, 220, 0.4) 29px
            )
          `,
          boxShadow: activeSection === 'exposure'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(0.6deg)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderLeft: '4px solid rgba(245, 158, 11, 0.3)' // Vertical margin line (orange)
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'exposure')}
        onClick={(e) => handleSectionClick('exposure', e)}
        tabIndex={0}
        aria-label="Navigate to Exposure section"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="index"
              width={SPATIAL_SECTION_MAP.exposure.dimensions.width}
              height={SPATIAL_SECTION_MAP.exposure.dimensions.height}
              contentBlocks={4}
            />
          }
        >
          <ExposureSection
            active={activeSection === 'exposure'}
            progress={1}
            currentExposure={{
              aperture: 2.8,
              shutterSpeed: 1000,
              iso: 400,
              exposureCompensation: 0
            }}
            onExposureChange={() => {}}
          />
        </Suspense>
      </div>

      {/* Develop Section (Gallery) - Bottom - Filmstrip with Sprocket Holes */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 overflow-visible canvas-section-filmstrip ${
          activeSection === 'develop'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('develop').x}px`,
          top: `${1500 + getEffectiveCoordinates('develop').y}px`,
          width: `${SPATIAL_SECTION_MAP.develop.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.develop.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.develop.zIndex,
          /* Filmstrip appearance with sprocket holes */
          backgroundColor: '#f5f5f5',
          boxShadow: activeSection === 'develop'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(-1.5deg)',
          /* Film border - dark edges like real film (scales inversely with zoom) */
          borderTop: `${16 / currentScale}px solid #2a2a2a`,
          borderBottom: `${16 / currentScale}px solid #2a2a2a`,
          borderLeft: `${12 / currentScale}px solid #2a2a2a`,
          borderRight: `${12 / currentScale}px solid #2a2a2a`,
          borderRadius: '2px',
          backgroundImage: `
            /* Sprocket holes on left edge */
            radial-gradient(circle at 6px 20px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at 6px 60px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at 6px 100px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at 6px 140px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            /* Sprocket holes on right edge */
            radial-gradient(circle at calc(100% - 6px) 20px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 60px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 100px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 140px, transparent 3px, #2a2a2a 3px, #2a2a2a 5px, transparent 5px)
          `,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% 160px'
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'develop')}
        onClick={(e) => handleSectionClick('develop', e)}
        tabIndex={0}
        aria-label="Navigate to Develop section"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="filmstrip"
              width={SPATIAL_SECTION_MAP.develop.dimensions.width}
              height={SPATIAL_SECTION_MAP.develop.dimensions.height}
              contentBlocks={3}
            />
          }
        >
          <DevelopSection
            active={activeSection === 'develop'}
            progress={1}
            developmentStage="final"
            onDevelopmentComplete={() => {}}
          />
        </Suspense>
      </div>

      {/* Portfolio Section (Contact) - Bottom Right - Polaroid Style */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 overflow-visible canvas-section-polaroid ${
          activeSection === 'portfolio'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + getEffectiveCoordinates('portfolio').x}px`,
          top: `${1500 + getEffectiveCoordinates('portfolio').y}px`,
          width: `${SPATIAL_SECTION_MAP.portfolio.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.portfolio.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.portfolio.zIndex,
          /* Polaroid/instant photo appearance with thick bottom border (scales inversely with zoom) */
          backgroundColor: '#ffffff',
          boxShadow: activeSection === 'portfolio'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(0.9deg)',
          border: `${16 / currentScale}px solid #ffffff`,
          borderBottom: `${60 / currentScale}px solid #ffffff`,
          borderRadius: '2px',
          outline: '1px solid rgba(0, 0, 0, 0.1)'
        }}
        onMouseDown={(e) => handleSectionMouseDown(e, 'portfolio')}
        onClick={(e) => handleSectionClick('portfolio', e)}
        tabIndex={0}
        aria-label="Navigate to Portfolio section"
      >
        <Suspense
          fallback={
            <SectionSkeleton
              paperStyle="polaroid"
              width={SPATIAL_SECTION_MAP.portfolio.dimensions.width}
              height={SPATIAL_SECTION_MAP.portfolio.dimensions.height}
              contentBlocks={4}
            />
          }
        >
          <PortfolioSection
            active={activeSection === 'portfolio'}
            progress={1}
            exportFormat="web"
            onExport={() => {}}
          />
        </Suspense>
      </div>

      {/* Enhanced Navigation Hints - Visible at all zoom levels */}
      {/* Audit feedback: Increase visibility, add background, remove scale restriction */}

      {/* Connection Lines from Center (Capture) to Each Section */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: '4000px',
          height: '3000px',
          zIndex: 0
        }}
      >
        {/* Line to Skills (up) */}
        <line
          x1="2550" y1="1500"
          x2="2450" y2="500"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* Line to About (left) */}
        <line
          x1="1450" y1="1500"
          x2="600" y2="1500"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* Line to Projects (right) */}
        <line
          x1="2650" y1="1500"
          x2="3400" y2="1500"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          strokeDasharray="8,4"
        />

        {/* Line to Gallery (down) */}
        <line
          x1="2550" y1="1900"
          x2="2550" y2="2600"
          stroke="rgba(139, 92, 246, 0.15)"
          strokeWidth="2"
          strokeDasharray="8,4"
        />
      </svg>

      <div
        className="absolute pointer-events-none"
        style={{
          left: '2000px',
          top: '1200px',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 3s ease-in-out infinite'
        }}
      >
        <div
          className="bg-black/60 backdrop-blur-sm border border-athletic-brand-violet/30 px-3 py-2 rounded-full"
          style={{
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="text-white/90 text-sm font-medium text-center">
            ↑ <span className="text-athletic-brand-violet">Skills</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="absolute pointer-events-none"
        style={{
          left: '600px',
          top: '1500px',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 3s ease-in-out infinite 0.5s' // Stagger delay
        }}
      >
        <div
          className="bg-black/60 backdrop-blur-sm border border-athletic-brand-violet/30 px-3 py-2 rounded-full"
          style={{
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="text-white/90 text-sm font-medium text-center">
            ← <span className="text-athletic-brand-violet">About Me</span>
          </div>
        </div>
      </div>

      <div
        className="absolute pointer-events-none"
        style={{
          left: '3400px',
          top: '1500px',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 3s ease-in-out infinite 1s' // Stagger delay
        }}
      >
        <div
          className="bg-black/60 backdrop-blur-sm border border-athletic-brand-violet/30 px-3 py-2 rounded-full"
          style={{
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="text-white/90 text-sm font-medium text-center">
            <span className="text-athletic-brand-violet">Projects</span> →
          </div>
        </div>
      </div>

      <div
        className="absolute pointer-events-none"
        style={{
          left: '2000px',
          top: '2700px',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse 3s ease-in-out infinite 1.5s' // Stagger delay
        }}
      >
        <div
          className="bg-black/60 backdrop-blur-sm border border-athletic-brand-violet/30 px-3 py-2 rounded-full"
          style={{
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }}
        >
          <div className="text-white/90 text-sm font-medium text-center">
            ↓ <span className="text-athletic-brand-violet">Gallery</span>
          </div>
        </div>
      </div>

      {/* Reset Layout Button - Only show if positions have been customized */}
      {Object.keys(sectionOffsets).length > 0 && (
        <button
          onClick={resetPositions}
          className="fixed bottom-6 left-6 z-50 bg-white/90 hover:bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
          aria-label="Reset section layout to defaults"
          title="Reset all sections to default positions"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 8a6 6 0 0 1 10-4.5M14 8a6 6 0 0 1-10 4.5M12 3.5v3h-3M4 12.5v-3h3" />
          </svg>
          Reset Layout
        </button>
      )}

      {/* Alt+Drag Hint - Show on hover over sections */}
      {!dragState && (
        <div className="fixed top-6 left-6 z-40 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white/90 text-xs pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-mono">Alt</kbd>
          <span className="ml-2">+ drag to reposition sections</span>
        </div>
      )}
    </div>
  );
};

export default CanvasPortfolioLayout;
