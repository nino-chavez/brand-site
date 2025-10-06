/**
 * SplitScreenLayout Component
 *
 * CSS Grid-based split-screen layout component for Phase 5 storytelling.
 * Implements technical + athletic content pairing with responsive design
 * and accessibility compliance.
 *
 * @fileoverview Split-screen layout component implementation
 * @version 1.0.0
 * @since Phase 5
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { SplitScreenLayoutProps } from '../../types/split-screen';
import { splitScreenSpacing, splitScreenTiming, splitScreenEasing, getTimingMs } from '../../tokens/split-screen';
import { useSynchronizedAnimation } from '../../hooks/useSynchronizedAnimation';

/**
 * SplitScreenLayout Component
 *
 * Renders a responsive split-screen layout with CSS Grid implementation.
 * Supports US1: "Display two photos side-by-side in a split-screen layout"
 *
 * Features:
 * - CSS Grid 50/50 split with responsive behavior
 * - Athletic design token integration
 * - Accessibility compliance with keyboard navigation
 * - Performance optimized for 60fps transitions
 */
const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  config,
  animationConfig,
  depthConfig,
  leftContent,
  rightContent,
  focusedPanel = null,
  className = '',
  onActivate,
  onDeactivate,
  onPanelFocus,
}) => {
  // Component state
  const [isActive, setIsActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs for panel management
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Animation coordination
  const animationState = useSynchronizedAnimation(animationConfig);

  // Responsive breakpoint handling
  const getGridTemplate = useCallback(() => {
    if (typeof window === 'undefined') return '1fr 1fr';

    const width = window.innerWidth;

    // Mobile: stack vertically if configured
    if (width < 768 && config.responsive.mobile === 'stack') {
      return '1fr / 1fr'; // Single column, stacked rows
    }

    // Tablet: maintain or stack based on config
    if (width < 1024 && config.responsive.tablet === 'stack') {
      return '1fr / 1fr';
    }

    // Desktop: always maintain split layout
    if (config.orientation === 'vertical') {
      return '1fr / 1fr'; // Single column, two rows
    }

    // Horizontal split with configurable ratio
    const leftRatio = config.ratio;
    const rightRatio = 1 - config.ratio;
    return `${leftRatio}fr ${rightRatio}fr`;
  }, [config.orientation, config.ratio, config.responsive]);

  // Panel focus management
  const handlePanelFocus = useCallback((panel: 'left' | 'right') => {
    onPanelFocus?.(panel);

    // Update ARIA attributes for accessibility
    if (containerRef.current) {
      containerRef.current.setAttribute('aria-activedescendant', `${panel}-panel`);
    }
  }, [onPanelFocus]);

  // Keyboard navigation handling
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handlePanelFocus('left');
        leftPanelRef.current?.focus();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handlePanelFocus('right');
        rightPanelRef.current?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isActive) {
          setIsActive(true);
          onActivate?.();
        }
        break;
      case 'Escape':
        event.preventDefault();
        if (isActive) {
          setIsActive(false);
          onDeactivate?.();
        }
        break;
    }
  }, [isActive, onActivate, onDeactivate, handlePanelFocus]);

  // Layout activation/deactivation
  const handleActivation = useCallback(() => {
    setIsTransitioning(true);
    setIsActive(true);

    // Start coordinated animation
    animationState.controls.start();

    // Complete activation after animation
    setTimeout(() => {
      setIsTransitioning(false);
      onActivate?.();
    }, animationConfig.duration + animationConfig.staggerDelay);
  }, [animationState.controls, animationConfig, onActivate]);

  const handleDeactivation = useCallback(() => {
    setIsTransitioning(true);
    setIsActive(false);

    // Start exit animation
    animationState.controls.stop();

    // Complete deactivation after animation
    setTimeout(() => {
      setIsTransitioning(false);
      onDeactivate?.();
    }, animationConfig.duration);
  }, [animationState.controls, animationConfig, onDeactivate]);

  // Responsive layout updates
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const gridTemplate = getGridTemplate();
        containerRef.current.style.gridTemplate = gridTemplate;
      }
    };

    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getGridTemplate]);

  // Component styles with athletic design tokens
  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplate: getGridTemplate(),
    gap: config.responsive.mobile === 'stack' && typeof window !== 'undefined' && window.innerWidth < 768
      ? splitScreenSpacing['grid-gap-mobile']
      : splitScreenSpacing['grid-gap'],
    width: '100%',
    height: '100%',
    minHeight: '400px',
    transition: [
      `grid-template ${getTimingMs('layout-shift')} ${splitScreenEasing['split-reveal']}`,
      `gap ${getTimingMs('layout-shift')} ${splitScreenEasing['split-reveal']}`,
      `opacity ${getTimingMs('split-activate')} ${splitScreenEasing['split-reveal']}`
    ].join(', '),
    opacity: isActive ? 1 : 0.95,
    transform: isActive ? 'scale(1)' : 'scale(0.98)',
    willChange: isTransitioning ? 'transform, opacity' : 'auto',
  };

  const panelBaseStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    minWidth: splitScreenSpacing['min-panel-width'],
    maxWidth: splitScreenSpacing['max-panel-width'],
    padding: splitScreenSpacing['panel-padding'],
    borderRadius: '8px',
    transition: [
      `transform ${getTimingMs('panel-transition')} ${splitScreenEasing['sync-motion']}`,
      `box-shadow ${getTimingMs('panel-transition')} ${splitScreenEasing['sync-motion']}`
    ].join(', '),
    willChange: isTransitioning ? 'transform, box-shadow' : 'auto',
    outline: 'none', // Custom focus styling below
  };

  const leftPanelStyles: React.CSSProperties = {
    ...panelBaseStyles,
    transform: focusedPanel === 'left' ? 'scale(1.02)' : 'scale(1)',
    boxShadow: focusedPanel === 'left'
      ? '0 8px 25px rgba(26, 54, 93, 0.2), 0 0 0 3px rgba(26, 54, 93, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  };

  const rightPanelStyles: React.CSSProperties = {
    ...panelBaseStyles,
    transform: focusedPanel === 'right' ? 'scale(1.02)' : 'scale(1)',
    boxShadow: focusedPanel === 'right'
      ? '0 8px 25px rgba(234, 88, 12, 0.2), 0 0 0 3px rgba(234, 88, 12, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div
      ref={containerRef}
      className={`split-screen-layout ${className}`}
      style={containerStyles}
      role="region"
      aria-label="Split-screen storytelling interface"
      aria-activedescendant={focusedPanel ? `${focusedPanel}-panel` : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid="split-screen-layout"
      data-active={isActive}
      data-transitioning={isTransitioning}
      data-focused-panel={focusedPanel}
    >
      {/* Left Panel - Technical Content */}
      <div
        ref={leftPanelRef}
        id="left-panel"
        className="split-screen-panel left-panel"
        style={leftPanelStyles}
        role={config.panels.left.interactions.focusable ? 'button' : 'presentation'}
        aria-label={config.panels.left.ariaLabel}
        tabIndex={config.panels.left.interactions.focusable ? 0 : -1}
        onClick={config.panels.left.interactions.clickable ? () => handlePanelFocus('left') : undefined}
        onFocus={() => handlePanelFocus('left')}
        data-testid="split-screen-left-panel"
        data-content-type={config.panels.left.contentType}
      >
        {leftContent}
      </div>

      {/* Right Panel - Athletic Content */}
      <div
        ref={rightPanelRef}
        id="right-panel"
        className="split-screen-panel right-panel"
        style={rightPanelStyles}
        role={config.panels.right.interactions.focusable ? 'button' : 'presentation'}
        aria-label={config.panels.right.ariaLabel}
        tabIndex={config.panels.right.interactions.focusable ? 0 : -1}
        onClick={config.panels.right.interactions.clickable ? () => handlePanelFocus('right') : undefined}
        onFocus={() => handlePanelFocus('right')}
        data-testid="split-screen-right-panel"
        data-content-type={config.panels.right.contentType}
      >
        {rightContent}
      </div>

      {/* Activation Controls */}
      {!isActive && (
        <button
          className="split-screen-activator"
          onClick={handleActivation}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: 'rgba(26, 54, 93, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: `all ${getTimingMs('quick-snap')} ${splitScreenEasing['snap']}`,
            zIndex: 10,
          }}
          aria-label="Activate split-screen storytelling mode"
        >
          Split View
        </button>
      )}

      {/* Deactivation Controls */}
      {isActive && (
        <button
          className="split-screen-deactivator"
          onClick={handleDeactivation}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: 'rgba(234, 88, 12, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: `all ${getTimingMs('quick-snap')} ${splitScreenEasing['snap']}`,
            zIndex: 10,
          }}
          aria-label="Exit split-screen storytelling mode"
        >
          Exit Split
        </button>
      )}
    </div>
  );
};

export default SplitScreenLayout;