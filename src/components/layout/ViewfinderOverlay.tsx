import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useMouseTracking } from '../../hooks/useMouseTracking';
import { CompatibilityFallbacks, ProgressiveEnhancement } from '../../utils/browserCompat';
import type { TechnicalSkill, SkillCategory } from '../../types';
import { HERO_VIEWFINDER_CONFIG, HERO_TECHNICAL_SKILLS, SKILL_CATEGORIES } from '../../constants';
import { useAthleticColors } from '../../../tokens/simple-provider';

// Extracted viewfinder components
import { CrosshairIcon } from '../../../components/viewfinder/CrosshairIcon';
import { ViewfinderBrackets } from '../../../components/viewfinder/ViewfinderBrackets';
import { ExifDisplay } from '../../../components/viewfinder/ExifDisplay';
import { HeroTechnicalProfile } from '../../../components/viewfinder/HeroTechnicalProfile';

interface ViewfinderOverlayProps {
  isActive?: boolean;
  className?: string;
  onCapture?: () => void;
  // Hero mode props
  mode?: 'standard' | 'hero';
  showMetadataHUD?: boolean;
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
  profileVisible?: boolean;
  onHideProfile?: () => void;
}

const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  isActive = false,
  className = '',
  onCapture,
  mode = 'standard',
  showMetadataHUD = false,
  isMinimized = false,
  onToggleMinimized,
  profileVisible = true,
  onHideProfile,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');

  // Access athletic design tokens
  const athleticColors = useAthleticColors();

  // Initialize browser compatibility utilities
  const compat = useMemo(() => CompatibilityFallbacks.getInstance(), []);
  const enhancement = useMemo(() => new ProgressiveEnhancement(), []);
  const config = useMemo(() => enhancement.getOptimizedViewfinderConfig(), [enhancement]);

  // Use our mouse tracking hook with optimized settings for device
  const { currentPosition, targetPosition, isTracking } = useMouseTracking({
    delay: config.mouseTracking.delay,
    throttleMs: config.mouseTracking.throttleMs,
    enableEasing: config.mouseTracking.enableEasing,
    easingCurve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    boundaryElement: overlayRef.current,
  });

  // Handle activation state
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setScreenReaderAnnouncement('Viewfinder activated. Use mouse to aim, Enter to capture, V to toggle.');
    } else {
      setScreenReaderAnnouncement('Viewfinder deactivated.');
      // Add fade out delay before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Handle click capture
  const handleClick = (e: React.MouseEvent) => {
    if (isActive && onCapture) {
      e.preventDefault();
      onCapture();
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const newVisible = !isVisible;
        setIsVisible(newVisible);
        setScreenReaderAnnouncement(newVisible ? 'Viewfinder visible' : 'Viewfinder hidden');
      } else if (e.key === 'Enter' && isVisible && onCapture) {
        e.preventDefault();
        setScreenReaderAnnouncement('Capturing image');
        onCapture();
      } else if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        setIsVisible(false);
        setScreenReaderAnnouncement('Viewfinder closed');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onCapture]);

  // Don't use early return after hooks - handle visibility through conditional rendering instead

  // Return nothing if not visible, but without early return
  if (!isVisible) {
    return <div className="fixed inset-0 pointer-events-none opacity-0 invisible" />;
  }

  // Hero mode: show technical profile instead of viewfinder
  if (mode === 'hero' && showMetadataHUD && profileVisible) {
    return (
      <div className="relative">
        <HeroTechnicalProfile
          skills={HERO_TECHNICAL_SKILLS}
          isVisible={true}
          isMinimized={isMinimized}
          onToggleMinimized={onToggleMinimized}
          onHideProfile={onHideProfile}
        />
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 pointer-events-auto ${className}`}
      onClick={handleClick}
      role="application"
      aria-label="Interactive camera viewfinder"
      aria-description="Camera-style viewfinder interface with crosshair tracking. Press Enter to capture or V to toggle visibility."
      tabIndex={isActive ? 0 : -1}
      style={{
        background: 'transparent',
        cursor: isActive ? 'crosshair' : 'default',
        transition: `opacity 300ms ease-out ${isActive ? '' : ', visibility 300ms ease-out'}`,
        opacity: isActive ? 1 : 0,
        visibility: isActive ? 'visible' : 'hidden',
      }}
    >
      {/* Screen Reader Announcements */}
      <div
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      >
        {screenReaderAnnouncement}
      </div>

      {/* Crosshair Component */}
      <div
        className="absolute pointer-events-none"
        role="img"
        aria-label={`Viewfinder crosshair positioned at ${Math.round(currentPosition.x)}, ${Math.round(currentPosition.y)}`}
        style={enhancement.enhanceStyles(
          {
            left: currentPosition.x - config.visual.crosshairSize / 2,
            top: currentPosition.y - config.visual.crosshairSize / 2,
            width: config.visual.crosshairSize,
            height: config.visual.crosshairSize,
          },
          {
            transform: { x: 0, y: 0 }, // Use hardware acceleration if supported
            animation: isTracking ? undefined : {
              duration: config.animations.duration,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
          }
        )}
      >
        <CrosshairIcon
          size={config.visual.crosshairSize}
          color="rgba(255, 255, 255, 0.9)"
          strokeWidth={2}
        />
      </div>

      {/* Focus Ring */}
      <div
        className="absolute pointer-events-none"
        role="img"
        aria-label={`Viewfinder focus ring, ${isActive ? 'active' : 'inactive'}`}
        style={enhancement.enhanceStyles(
          {
            left: currentPosition.x - config.visual.focusRingSize / 2,
            top: currentPosition.y - config.visual.focusRingSize / 2,
            width: config.visual.focusRingSize,
            height: config.visual.focusRingSize,
            borderRadius: '50%',
            border: '2px dashed rgba(255, 255, 255, 0.5)',
            opacity: isActive ? 0.6 : 0,
          },
          {
            transform: { x: 0, y: 0 }, // Use hardware acceleration if supported
            animation: isTracking ? undefined : {
              duration: config.animations.duration,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
          }
        )}
      />

      {/* Viewfinder Corner Brackets */}
      <div
        className="absolute inset-0 pointer-events-none"
        role="img"
        aria-label="Camera viewfinder frame with corner brackets"
      >
        <ViewfinderBrackets />
      </div>

      {/* EXIF Metadata Display - Development only */}
      {process.env.NODE_ENV === 'development' && isActive && (
        <div
          className="absolute pointer-events-none"
          role="complementary"
          aria-label="Camera metadata information"
          aria-live="polite"
          style={enhancement.enhanceStyles(
            {
              left: Math.min(currentPosition.x + 30, window.innerWidth - 200),
              top: Math.max(currentPosition.y - 80, 20),
            },
            {
              animation: isTracking ? undefined : {
                duration: config.animations.duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              },
            }
          )}
        >
          <ExifDisplay
            position={currentPosition}
            isVisible={isActive}
            compat={compat}
          />
        </div>
      )}
    </div>
  );
};


export default ViewfinderOverlay;