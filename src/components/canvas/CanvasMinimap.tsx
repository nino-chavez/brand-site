/**
 * CanvasMinimap - Spatial Orientation and Navigation Map
 *
 * Addresses UX audit feedback: "No Spatial Orientation - Users have no idea
 * where they are or what else exists on the canvas"
 *
 * @fileoverview Minimap showing all sections and current viewport
 * @version 1.0.0
 * @since Canvas UX Improvements - Quick Win #2
 */

import React, { useMemo, useState } from 'react';
import { useCanvasState } from '../../contexts/CanvasStateProvider';
import type { SectionId } from '../../types';

// Import spatial section map for coordinates (must match CanvasPortfolioLayout)
const SPATIAL_SECTION_MAP = {
  capture: { coordinates: { x: 0, y: 0 }, dimensions: { width: 1100, height: 750 } },
  focus: { coordinates: { x: -1300, y: 0 }, dimensions: { width: 1000, height: 750 } },
  frame: { coordinates: { x: 1300, y: 0 }, dimensions: { width: 1000, height: 850 } },
  exposure: { coordinates: { x: 0, y: -900 }, dimensions: { width: 900, height: 600 } },
  develop: { coordinates: { x: 0, y: 1000 }, dimensions: { width: 1100, height: 800 } },
  portfolio: { coordinates: { x: 1500, y: 1000 }, dimensions: { width: 800, height: 650 } }
} as const;

// Canvas world dimensions
const CANVAS_WORLD = {
  width: 4000,
  height: 3000,
  centerX: 2000,
  centerY: 1500
};

// Minimap dimensions - increased size for better visibility
const MINIMAP = {
  width: 240,  // Increased from 200 (20% larger)
  height: 180, // Increased from 150 (20% larger)
  scale: 240 / 4000 // Scale factor to fit 4000px world into 240px minimap
};

export interface CanvasMinimapProps {
  className?: string;
}

/**
 * CanvasMinimap - Fixed position overview showing all sections and current viewport
 *
 * Features:
 * - Shows all 6 portfolio sections as labeled rectangles
 * - Highlights active section with violet ring
 * - Displays current viewport position
 * - Click-to-jump navigation
 * - Hover tooltips with section names
 * - Collapsible to save screen space
 */
export const CanvasMinimap: React.FC<CanvasMinimapProps> = ({ className = '' }) => {
  const { state, actions } = useCanvasState();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);

  // Calculate viewport rectangle in minimap coordinates
  const viewportRect = useMemo(() => {
    const viewportWidth = window.innerWidth / state.position.scale;
    const viewportHeight = window.innerHeight / state.position.scale;

    // FIXED: position.x/y are now world coordinates (not inverted)
    // The viewport shows content from (position.x, position.y) in world space
    const worldX = state.position.x;
    const worldY = state.position.y;

    // Convert to minimap pixel coordinates
    const minimapX = worldX * MINIMAP.scale;
    const minimapY = worldY * MINIMAP.scale;
    const minimapWidth = viewportWidth * MINIMAP.scale;
    const minimapHeight = viewportHeight * MINIMAP.scale;

    return {
      x: minimapX,
      y: minimapY,
      width: minimapWidth,
      height: minimapHeight
    };
  }, [state.position.x, state.position.y, state.position.scale]);

  // Handle section click navigation
  const handleSectionClick = (sectionId: SectionId) => {
    const section = SPATIAL_SECTION_MAP[sectionId];
    if (!section) return;

    // Calculate centered position (FIXED - matching CanvasPortfolioLayout)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Section's absolute position in canvas space
    const sectionAbsoluteX = CANVAS_WORLD.centerX + section.coordinates.x;
    const sectionAbsoluteY = CANVAS_WORLD.centerY + section.coordinates.y;

    // Center point of the section
    const sectionCenterX = sectionAbsoluteX + section.dimensions.width / 2;
    const sectionCenterY = sectionAbsoluteY + section.dimensions.height / 2;

    // Target position: move canvas so section center aligns with viewport center
    const targetX = sectionCenterX - viewportWidth / 2;
    const targetY = sectionCenterY - viewportHeight / 2;

    actions.updatePosition({
      x: targetX,
      y: targetY,
      scale: 1.0 // Consistent zoom level
    });
    actions.setActiveSection(sectionId);
    console.log(`🗺️ Minimap: Navigating to ${sectionId}`, {
      sectionId,
      sectionAbsolute: { x: sectionAbsoluteX, y: sectionAbsoluteY },
      sectionCenter: { x: sectionCenterX, y: sectionCenterY },
      targetPosition: { x: targetX, y: targetY }
    });
  };

  // Section display names
  const sectionNames: Record<SectionId, string> = {
    capture: 'Hero',
    focus: 'About',
    frame: 'Projects',
    exposure: 'Skills',
    develop: 'Gallery',
    portfolio: 'Contact'
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-6 left-6 z-40 p-3 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}
        aria-label="Show minimap"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 ${className}`}
      role="complementary"
      aria-label="Canvas minimap for spatial navigation"
    >
      {/* Minimap Container */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          width: `${MINIMAP.width}px`,
          height: `${MINIMAP.height}px`,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 4px 14px rgba(139, 92, 246, 0.2)'
        }}
      >
        {/* Canvas background */}
        <div className="absolute inset-0 bg-gray-900/50" />

        {/* Sections */}
        {(Object.keys(SPATIAL_SECTION_MAP) as SectionId[]).map((sectionId) => {
          const section = SPATIAL_SECTION_MAP[sectionId];
          const isActive = state.activeSection === sectionId;
          const isHovered = hoveredSection === sectionId;

          // Convert section coordinates to minimap coordinates
          const minimapX = (CANVAS_WORLD.centerX + section.coordinates.x) * MINIMAP.scale;
          const minimapY = (CANVAS_WORLD.centerY + section.coordinates.y) * MINIMAP.scale;
          const minimapWidth = section.dimensions.width * MINIMAP.scale;
          const minimapHeight = section.dimensions.height * MINIMAP.scale;

          return (
            <button
              key={sectionId}
              onClick={() => handleSectionClick(sectionId)}
              onMouseEnter={() => setHoveredSection(sectionId)}
              onMouseLeave={() => setHoveredSection(null)}
              className="absolute cursor-pointer transition-all duration-200"
              style={{
                left: `${minimapX}px`,
                top: `${minimapY}px`,
                width: `${minimapWidth}px`,
                height: `${minimapHeight}px`,
                background: isActive
                  ? 'rgba(139, 92, 246, 0.4)'
                  : isHovered
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
                border: isActive
                  ? '2px solid rgb(139, 92, 246)'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
              aria-label={`Navigate to ${sectionNames[sectionId]} section`}
            >
              {/* Section label - only show for larger sections */}
              {minimapWidth > 30 && (
                <div
                  className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium"
                  style={{
                    fontSize: '8px',
                    opacity: isActive ? 1 : isHovered ? 0.9 : 0.6
                  }}
                >
                  {sectionNames[sectionId]}
                </div>
              )}
            </button>
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${viewportRect.x}px`,
            top: `${viewportRect.y}px`,
            width: `${viewportRect.width}px`,
            height: `${viewportRect.height}px`,
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)'
          }}
        />

        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded transition-all duration-200 hover:bg-white/10"
          aria-label="Hide minimap"
        >
          <svg className="w-3 h-3 text-white/60 hover:text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Hover tooltip */}
      {hoveredSection && (
        <div
          className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          Click to jump to <span className="text-athletic-brand-violet font-semibold">{sectionNames[hoveredSection]}</span>
        </div>
      )}

      {/* Legend */}
      <div
        className="mt-2 px-3 py-2 rounded-lg text-xs text-white/70"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/80 rounded-sm" />
          <span>Your view</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasMinimap;
