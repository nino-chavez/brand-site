/**
 * SpatialSection Component
 *
 * Wrapper component that transforms existing sections for spatial positioning within
 * the 2D canvas layout system. Provides responsive scaling, progressive disclosure,
 * and athletic design integration for photographer's lightbox navigation.
 *
 * @fileoverview Spatial section wrapper with responsive behavior
 * @version 1.0.0
 * @since Task 4 - Spatial Section Components
 */

import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import type { SpatialSectionProps } from '../types/canvas';
import type { SpatialCoordinates, CanvasPosition } from '../types/canvas';
import { SPATIAL_SECTION_DESCRIPTIONS } from '../hooks/useSpatialAccessibility';

// Scale thresholds for progressive disclosure
const SCALE_THRESHOLDS = {
  MINIMAL: 0.6,     // Show only essential content
  COMPACT: 0.8,     // Show reduced content
  NORMAL: 1.0,      // Show full content
  DETAILED: 1.5,    // Show enhanced content
  EXPANDED: 2.0     // Show maximum detail
} as const;

// Responsive breakpoints for canvas-aware sizing
const RESPONSIVE_BREAKPOINTS = {
  mobile: { maxWidth: 768, scaleFactor: 0.8 },
  tablet: { maxWidth: 1024, scaleFactor: 0.9 },
  desktop: { maxWidth: Infinity, scaleFactor: 1.0 }
} as const;

/**
 * SpatialSection - Individual section positioned within 2D canvas
 *
 * This component wraps existing section content and adapts it for spatial navigation,
 * providing responsive scaling, progressive disclosure, and athletic design integration.
 */
export const SpatialSection: React.FC<SpatialSectionProps> = ({
  section,
  sectionMap,
  isActive,
  scale,
  children,
  className = ''
}) => {
  // Refs and state
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasLoadedContent, setHasLoadedContent] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Calculate responsive scale factor based on device and canvas scale
  const responsiveScale = useMemo(() => {
    const deviceScaleFactor = RESPONSIVE_BREAKPOINTS[deviceType].scaleFactor;
    return scale * deviceScaleFactor;
  }, [scale, deviceType]);

  // Determine content visibility level based on scale
  const contentLevel = useMemo(() => {
    if (responsiveScale <= SCALE_THRESHOLDS.MINIMAL) return 'minimal';
    if (responsiveScale <= SCALE_THRESHOLDS.COMPACT) return 'compact';
    if (responsiveScale <= SCALE_THRESHOLDS.NORMAL) return 'normal';
    if (responsiveScale <= SCALE_THRESHOLDS.DETAILED) return 'detailed';
    return 'expanded';
  }, [responsiveScale]);

  // Progressive disclosure styles based on content level
  const progressiveStyles = useMemo(() => {
    const baseStyles = {
      transition: 'all 160ms cubic-bezier(0.4, 0, 0.6, 1)', // athletic-transition
      willChange: isActive ? 'transform, opacity' : 'auto'
    };

    switch (contentLevel) {
      case 'minimal':
        return {
          ...baseStyles,
          padding: '0.5rem'
        };

      case 'compact':
        return {
          ...baseStyles,
          padding: '0.75rem'
        };

      case 'normal':
        return {
          ...baseStyles,
          padding: '1rem'
        };

      case 'detailed':
        return {
          ...baseStyles,
          padding: '1.5rem'
        };

      case 'expanded':
        return {
          ...baseStyles,
          padding: '2rem'
        };

      default:
        return baseStyles;
    }
  }, [contentLevel, isActive]);

  // Calculate spatial positioning transform
  const spatialTransform = useMemo(() => {
    const { x, y } = sectionMap.canvasPosition;
    const { gridX, gridY, offsetX = 0, offsetY = 0 } = sectionMap.coordinates;

    // Hardware-accelerated 3D transform for optimal performance
    const transformValue = `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) scale(${responsiveScale})`;

    return {
      transform: transformValue,
      transformOrigin: 'center center',
      backfaceVisibility: 'hidden' as const,
      perspective: '1000px'
    };
  }, [sectionMap.canvasPosition, sectionMap.coordinates, responsiveScale]);

  // Athletic design token classes based on section priority and state
  const athleticClasses = useMemo(() => {
    const baseClasses = [
      'spatial-section',
      'absolute',
      'athletic-animate-transition',
      'rounded-lg',
      'overflow-hidden'
    ];

    // Priority-based styling
    const priorityClass = sectionMap.metadata.priority <= 2
      ? 'bg-athletic-neutral-900/95'
      : 'bg-athletic-neutral-800/90';

    // Active state styling
    const activeClasses = isActive ? [
      'ring-2',
      'ring-athletic-court-orange/50',
      'bg-athletic-neutral-900/98',
      'shadow-2xl',
      'shadow-athletic-court-orange/10'
    ] : [
      'ring-1',
      'ring-athletic-neutral-700/30'
    ];

    // Content level classes
    const contentClasses = [
      `content-level-${contentLevel}`,
      'backdrop-blur-sm',
      'border',
      'border-athletic-neutral-700/20'
    ];

    return baseClasses
      .concat(activeClasses)
      .concat(contentClasses)
      .concat([priorityClass])
      .concat(className.split(' '))
      .join(' ');
  }, [sectionMap.metadata.priority, isActive, contentLevel, className]);

  // Device detection effect
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) {
        setDeviceType('mobile');
      } else if (width <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // Intersection observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasLoadedContent) {
          setHasLoadedContent(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasLoadedContent]);

  // Accessibility keyboard handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isActive) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        // Focus enhancement for active section
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        break;

      case 'Escape':
        // Allow parent to handle escape (zoom out)
        break;
    }
  }, [isActive]);

  // Section metadata display
  const SectionMetadata = useMemo(() => (
    <div className="section-metadata absolute top-2 left-2 right-2 z-10">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-athletic-neutral-400 tracking-wider">
          {sectionMap.metadata.cameraMetaphor}
        </div>
        {isActive && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-athletic-court-orange rounded-full animate-pulse" />
            <span className="text-xs text-athletic-court-orange font-medium">ACTIVE</span>
          </div>
        )}
      </div>
      {contentLevel === 'expanded' && (
        <div className="section-enhanced mt-1 text-xs text-athletic-neutral-500">
          Priority: {sectionMap.metadata.priority} | Scale: {responsiveScale.toFixed(2)}
        </div>
      )}
    </div>
  ), [sectionMap.metadata, isActive, contentLevel, responsiveScale]);

  // Progressive content wrapper
  const ProgressiveContent = useMemo(() => (
    <div
      className="section-content relative z-0"
      style={progressiveStyles}
    >
      {hasLoadedContent ? children : (
        <div className="flex items-center justify-center h-32" role="status" aria-label="Loading section content">
          <div className="w-8 h-8 border-2 border-athletic-court-orange border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  ), [children, hasLoadedContent, progressiveStyles]);

  return (
    <div
      ref={sectionRef}
      className={athleticClasses}
      style={{
        ...spatialTransform,
        width: '300px', // Base section width
        minHeight: '200px', // Base section height
        zIndex: isActive ? 20 : sectionMap.metadata.priority,
        opacity: isInView ? 1 : 0.7,
        pointerEvents: contentLevel === 'minimal' ? 'none' : 'auto'
      }}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      role="region"
      aria-label={`${sectionMap.metadata.title} - ${sectionMap.metadata.description}`}
      aria-expanded={isActive}
      aria-live={isActive ? 'polite' : 'off'}
      aria-description={SPATIAL_SECTION_DESCRIPTIONS[section as keyof typeof SPATIAL_SECTION_DESCRIPTIONS] || sectionMap.metadata.description}
      aria-current={isActive ? 'location' : undefined}
      aria-setsize={7} // Total number of spatial sections
      aria-posinset={sectionMap.metadata.priority || 1}
      data-section={section}
      data-content-level={contentLevel}
      data-grid-position={`${sectionMap.coordinates.gridX},${sectionMap.coordinates.gridY}`}
      data-canvas-position={`${sectionMap.canvasPosition.x},${sectionMap.canvasPosition.y}`}
      data-testid={`spatial-section-${section}`}
    >
      {SectionMetadata}
      {ProgressiveContent}

      {/* Debug overlay for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs font-mono text-athletic-neutral-500 opacity-50">
          <div>Grid: ({sectionMap.coordinates.gridX}, {sectionMap.coordinates.gridY})</div>
          <div>Canvas: ({sectionMap.canvasPosition.x}, {sectionMap.canvasPosition.y})</div>
          <div>Level: {contentLevel}</div>
        </div>
      )}
    </div>
  );
};

// Utility function to map existing sections to spatial sections
export const createSpatialSectionMapping = (
  existingSections: React.ReactElement[],
  sectionMapping: Record<string, any>
): Array<{ section: string; component: React.ReactElement; mapping: any }> => {
  return existingSections.map((sectionComponent, index) => {
    const sectionId = sectionComponent.props.id || `section-${index}`;
    const mapping = sectionMapping[sectionId];

    return {
      section: sectionId,
      component: sectionComponent,
      mapping: mapping || {
        section: sectionId,
        coordinates: { gridX: index % 3, gridY: Math.floor(index / 3) },
        canvasPosition: { x: (index % 3 - 1) * 200, y: Math.floor(index / 3) * 200, scale: 1.0 },
        metadata: {
          title: `Section ${index + 1}`,
          description: 'Auto-generated section',
          cameraMetaphor: 'Generic',
          priority: index + 1
        }
      }
    };
  });
};

// CSS styles for spatial sections (to be added to global CSS)
export const SpatialSectionStyles = `
  .spatial-section {
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .spatial-section:focus {
    outline: 2px solid var(--color-athletic-court-orange);
    outline-offset: 2px;
  }

  .content-level-minimal .section-title {
    font-size: 0.875rem !important;
  }

  .content-level-expanded .section-enhanced {
    opacity: 1 !important;
  }

  /* Progressive disclosure animations */
  .section-detail,
  .section-secondary,
  .section-enhanced,
  .section-expanded {
    transition: opacity 160ms cubic-bezier(0.4, 0, 0.6, 1);
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .spatial-section {
      min-height: 150px;
      width: 250px;
    }

    .section-metadata {
      font-size: 0.75rem;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .spatial-section {
      border-width: 2px;
      border-color: currentColor;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .spatial-section,
    .section-detail,
    .section-secondary,
    .section-enhanced,
    .section-expanded {
      transition: none !important;
      animation: none !important;
    }
  }
`;

export default SpatialSection;