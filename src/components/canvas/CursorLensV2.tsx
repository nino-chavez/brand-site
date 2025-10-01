/**
 * CursorLensV2 - Minimal Radial Navigation Menu
 *
 * Simplified implementation to replace over-engineered CursorLens (920 LOC → 200 LOC)
 * Eliminates infinite loop bugs by using local state only, no context dependencies.
 *
 * @fileoverview Minimal cursor lens with radial menu for section navigation
 * @version 2.0.0
 * @since Week 1, Day 2 - Architectural Refactor
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { GameFlowSection } from '../../types';

// ===== TYPES =====

interface CursorLensV2Props {
  /** Callback when user selects a section */
  onSectionSelect: (section: GameFlowSection) => void;
  /** Enable/disable the lens */
  isEnabled?: boolean;
  /** Activation delay in ms (default: 500) */
  activationDelay?: number;
  /** Optional callback when lens activates */
  onActivate?: () => void;
  /** Optional callback when lens deactivates */
  onDeactivate?: () => void;
  /** CSS class name */
  className?: string;
}

// ===== CONSTANTS =====

const MENU_RADIUS = 80; // Distance from center to menu items
const ACTIVATION_DELAY = 500; // Default hold time to activate

const SECTIONS: Array<{ id: GameFlowSection; label: string; icon: string }> = [
  { id: 'capture', label: 'Capture', icon: '📷' },
  { id: 'focus', label: 'Focus', icon: '🎯' },
  { id: 'frame', label: 'Frame', icon: '🖼️' },
  { id: 'exposure', label: 'Exposure', icon: '☀️' },
  { id: 'develop', label: 'Develop', icon: '🎨' },
  { id: 'portfolio', label: 'Portfolio', icon: '📁' },
];

// ===== COMPONENT =====

export const CursorLensV2: React.FC<CursorLensV2Props> = ({
  onSectionSelect,
  isEnabled = true,
  activationDelay = ACTIVATION_DELAY,
  onActivate,
  onDeactivate,
  className = ''
}) => {
  // ===== STATE (LOCAL ONLY - NO CONTEXT) =====

  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredSection, setHoveredSection] = useState<GameFlowSection | null>(null);

  // ===== REFS =====

  const activationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseDownRef = useRef(false);

  // ===== MENU POSITIONING =====

  const getMenuItemPosition = (index: number, total: number) => {
    // Start at top (-90°) and go clockwise
    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / total;
    const angle = startAngle + (index * angleStep);

    return {
      x: position.x + MENU_RADIUS * Math.cos(angle),
      y: position.y + MENU_RADIUS * Math.sin(angle)
    };
  };

  // ===== EVENT HANDLERS =====

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!isEnabled || e.button !== 0) return; // Only left click

    e.preventDefault();
    isMouseDownRef.current = true;
    setPosition({ x: e.clientX, y: e.clientY });

    // Start activation timer
    activationTimerRef.current = setTimeout(() => {
      if (isMouseDownRef.current) {
        setIsActive(true);
        onActivate?.();
      }
    }, activationDelay);
  }, [isEnabled, activationDelay, onActivate]);

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;

    // Clear activation timer
    if (activationTimerRef.current) {
      clearTimeout(activationTimerRef.current);
      activationTimerRef.current = null;
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Update position while mouse is down (for dragging)
    if (isMouseDownRef.current && !isActive) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }, [isActive]);

  const handleSectionClick = useCallback((section: GameFlowSection) => {
    onSectionSelect(section);
    setIsActive(false);
    setHoveredSection(null);
    onDeactivate?.();
  }, [onSectionSelect, onDeactivate]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (isActive) {
      setIsActive(false);
      setHoveredSection(null);
      onDeactivate?.();
    }
  }, [isActive, onDeactivate]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isActive) {
      setIsActive(false);
      setHoveredSection(null);
      onDeactivate?.();
    }
  }, [isActive, onDeactivate]);

  // ===== LIFECYCLE =====

  useEffect(() => {
    if (!isEnabled) return;

    // Add global event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      // Cleanup
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);

      if (activationTimerRef.current) {
        clearTimeout(activationTimerRef.current);
      }
    };
  }, [isEnabled, handleMouseDown, handleMouseUp, handleMouseMove, handleClickOutside, handleEscape]);

  // ===== RENDER =====

  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-auto ${className}`}
      role="dialog"
      aria-label="Radial navigation menu"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      {/* Center indicator with enhanced glow */}
      <div
        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: position.x,
          top: position.y,
          background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
          boxShadow: '0 10px 40px rgba(251, 146, 60, 0.5), 0 0 0 2px rgba(251, 146, 60, 0.3)',
          zIndex: 9999
        }}
      >
        {/* Pulse effect */}
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: '#fb923c',
            opacity: 0.3
          }}
        />
      </div>

      {/* Connecting lines */}
      {SECTIONS.map((section, index) => {
        const itemPos = getMenuItemPosition(index, SECTIONS.length);
        const isHovered = hoveredSection === section.id;

        return (
          <svg
            key={`line-${section.id}`}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <line
              x1={position.x}
              y1={position.y}
              x2={itemPos.x}
              y2={itemPos.y}
              stroke={isHovered ? '#fb923c' : '#ffffff'}
              strokeWidth={isHovered ? '3' : '1.5'}
              strokeOpacity={isHovered ? '0.8' : '0.4'}
              className="transition-all duration-200"
            />
          </svg>
        );
      })}

      {/* Menu items */}
      {SECTIONS.map((section, index) => {
        const itemPos = getMenuItemPosition(index, SECTIONS.length);
        const isHovered = hoveredSection === section.id;

        return (
          <button
            key={section.id}
            className={`
              absolute -translate-x-1/2 -translate-y-1/2
              w-20 h-20 min-w-[44px] min-h-[44px] rounded-full
              flex flex-col items-center justify-center
              transition-all duration-200 ease-out
              focus:outline-none
              active:scale-95
              touch-manipulation
              border-2
              ${isHovered ? 'scale-110' : ''}
            `}
            style={{
              left: itemPos.x,
              top: itemPos.y,
              zIndex: isHovered ? 3 : 2,
              background: isHovered
                ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                : 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              borderColor: isHovered ? 'rgba(251, 146, 60, 0.8)' : 'rgba(255, 255, 255, 0.2)',
              boxShadow: isHovered
                ? '0 20px 60px rgba(251, 146, 60, 0.4), 0 0 0 2px rgba(251, 146, 60, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
            onClick={() => handleSectionClick(section.id)}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
            aria-label={`Navigate to ${section.label}`}
          >
            <span className={`text-2xl mb-1 transition-transform duration-200 ${isHovered ? 'scale-110' : ''}`}>
              {section.icon}
            </span>
            <span className={`text-xs font-medium transition-colors duration-200 ${
              isHovered ? 'text-white' : 'text-white/80'
            }`}>
              {section.label}
            </span>
          </button>
        );
      })}

      {/* Instructions */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-slate-900/95 backdrop-blur-sm border border-white/20 text-white/90 px-4 py-2 rounded-lg text-sm shadow-lg">
          Click a section to navigate • Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default CursorLensV2;
