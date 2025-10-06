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

import React, { useCallback, useEffect, useRef } from 'react';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type { SectionId } from '../../types';

// Import section components
import CaptureSection from '../../../components/sections/CaptureSection';
import FocusSection from '../../../components/sections/FocusSection';
import FrameSection from '../../../components/sections/FrameSection';
import ExposureSection from '../../../components/sections/ExposureSection';
import DevelopSection from '../../../components/sections/DevelopSection';
import PortfolioSection from '../../../components/sections/PortfolioSection';

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

  // Track if user is dragging to prevent accidental clicks
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);

  // Track drag for click prevention
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartPos.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 5) { // Same threshold as useCanvasTouchGestures
      isDraggingRef.current = true;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    // Reset after a small delay to allow onClick to check isDraggingRef
    setTimeout(() => {
      dragStartPos.current = null;
      isDraggingRef.current = false;
    }, 10);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Section order for keyboard navigation
  const sectionOrder: SectionId[] = ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'];

  /**
   * Camera navigation - smoothly pan/zoom to focus on a section
   * Prevents navigation if user was dragging the canvas
   */
  const handleSectionClick = useCallback((sectionId: SectionId, e?: React.MouseEvent) => {
    // Prevent navigation if user was dragging
    if (isDraggingRef.current) {
      console.log('[INFO] Click blocked - user was dragging canvas');
      isDraggingRef.current = false;
      return;
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
        className={`absolute cursor-pointer transition-all duration-300 overflow-visible canvas-section-torn ${
          activeSection === 'capture'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.capture.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.capture.coordinates.y}px`,
          width: `${SPATIAL_SECTION_MAP.capture.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.capture.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.capture.zIndex,
          /* Torn notebook paper appearance */
          backgroundColor: '#fffef8',
          boxShadow: activeSection === 'capture'
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
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('capture')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Capture section"
      >
        <CaptureSection
          active={activeSection === 'capture'}
          progress={1}
          shutterSpeed={1000}
          onCapture={() => {}}
        />
      </div>

      {/* Focus Section (About) - Left - Scratch Note Paper */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-scratch ${
          activeSection === 'focus'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.focus.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.focus.coordinates.y}px`,
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
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('focus')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Focus section"
      >
        <FocusSection
          active={activeSection === 'focus'}
          progress={1}
          depthOfField={0.5}
          onFocusLock={() => {}}
        />
      </div>

      {/* Frame Section (Projects) - Right - Clean Paper with Corner Fold */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-folded ${
          activeSection === 'frame'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.frame.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.frame.coordinates.y}px`,
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
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('frame')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Frame section"
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
      </div>

      {/* Exposure Section (Skills) - Top - Index Card Style */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 rounded-sm overflow-visible canvas-section-index ${
          activeSection === 'exposure'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.exposure.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.exposure.coordinates.y}px`,
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
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('exposure')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Exposure section"
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
      </div>

      {/* Develop Section (Gallery) - Bottom - Filmstrip with Sprocket Holes */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 overflow-visible canvas-section-filmstrip ${
          activeSection === 'develop'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.develop.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.develop.coordinates.y}px`,
          width: `${SPATIAL_SECTION_MAP.develop.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.develop.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.develop.zIndex,
          /* Filmstrip appearance with sprocket holes */
          backgroundColor: '#fafafa',
          boxShadow: activeSection === 'develop'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2), inset 0 0 0 12px rgba(0, 0, 0, 0.05)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1), inset 0 0 0 12px rgba(0, 0, 0, 0.05)',
          transform: 'rotate(-1.5deg)',
          border: '12px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '2px',
          backgroundImage: `
            radial-gradient(circle at 6px 20px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at 6px 60px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at 6px 100px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at 6px 140px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 20px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 60px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 100px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px),
            radial-gradient(circle at calc(100% - 6px) 140px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 5px, transparent 5px)
          `,
          backgroundRepeat: 'repeat-y',
          backgroundSize: '100% 160px'
        }}
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('develop')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Develop section"
      >
        <DevelopSection
          active={activeSection === 'develop'}
          progress={1}
          developmentStage="final"
          onDevelopmentComplete={() => {}}
        />
      </div>

      {/* Portfolio Section (Contact) - Bottom Right - Polaroid Style */}
      <div
        className={`absolute cursor-pointer transition-all duration-300 overflow-visible canvas-section-polaroid ${
          activeSection === 'portfolio'
            ? 'ring-4 ring-athletic-brand-violet shadow-2xl shadow-athletic-brand-violet/20'
            : 'ring-1 ring-neutral-300/40 hover:ring-2 hover:ring-athletic-brand-violet/50'
        }`}
        style={{
          left: `${2000 + SPATIAL_SECTION_MAP.portfolio.coordinates.x}px`,
          top: `${1500 + SPATIAL_SECTION_MAP.portfolio.coordinates.y}px`,
          width: `${SPATIAL_SECTION_MAP.portfolio.dimensions.width}px`,
          height: `${SPATIAL_SECTION_MAP.portfolio.dimensions.height}px`,
          zIndex: SPATIAL_SECTION_MAP.portfolio.zIndex,
          /* Polaroid/instant photo appearance with thick bottom border */
          backgroundColor: '#ffffff',
          boxShadow: activeSection === 'portfolio'
            ? '0 20px 50px -12px rgba(0, 0, 0, 0.35), 0 8px 16px -8px rgba(0, 0, 0, 0.2)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
          transform: 'rotate(0.9deg)',
          border: '16px solid #ffffff',
          borderBottom: '60px solid #ffffff',
          borderRadius: '2px',
          outline: '1px solid rgba(0, 0, 0, 0.1)'
        }}
        onMouseDown={handleMouseDown}
        onClick={() => handleSectionClick('portfolio')}
        role="button"
        tabIndex={0}
        aria-label="Navigate to Portfolio section"
      >
        <PortfolioSection
          active={activeSection === 'portfolio'}
          progress={1}
          exportFormat="web"
          onExport={() => {}}
        />
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
    </div>
  );
};

export default CanvasPortfolioLayout;
