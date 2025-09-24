import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useMouseTracking } from '../hooks/useMouseTracking';
import { CompatibilityFallbacks, ProgressiveEnhancement } from '../utils/browserCompat';

interface ViewfinderOverlayProps {
  isActive?: boolean;
  className?: string;
  onCapture?: () => void;
}

const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  isActive = false,
  className = '',
  onCapture,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
    } else {
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
        setIsVisible(!isVisible);
      } else if (e.key === 'Enter' && isVisible && onCapture) {
        e.preventDefault();
        onCapture();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onCapture]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 pointer-events-auto ${className}`}
      onClick={handleClick}
      style={{
        background: 'transparent',
        cursor: isActive ? 'crosshair' : 'default',
        transition: `opacity 300ms ease-out ${isActive ? '' : ', visibility 300ms ease-out'}`,
        opacity: isActive ? 1 : 0,
        visibility: isActive ? 'visible' : 'hidden',
      }}
    >
      {/* Crosshair Component */}
      <div
        className="absolute pointer-events-none"
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
      <div className="absolute inset-0 pointer-events-none">
        <ViewfinderBrackets />
      </div>

      {/* EXIF Metadata Display */}
      {isActive && (
        <div
          className="absolute pointer-events-none"
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

// Crosshair Icon Component
const CrosshairIcon: React.FC<{
  size: number;
  color: string;
  strokeWidth: number;
}> = ({ size, color, strokeWidth }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Horizontal line */}
    <line
      x1="8"
      y1="20"
      x2="32"
      y2="20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Vertical line */}
    <line
      x1="20"
      y1="8"
      x2="20"
      y2="32"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Center dot */}
    <circle
      cx="20"
      cy="20"
      r="1.5"
      fill={color}
    />
  </svg>
);

// Viewfinder Brackets Component
const ViewfinderBrackets: React.FC = () => (
  <>
    {/* Top-left bracket */}
    <svg
      className="absolute top-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3V9M3 3H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Top-right bracket */}
    <svg
      className="absolute top-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 3V9M21 3H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-left bracket */}
    <svg
      className="absolute bottom-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 21V15M3 21H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-right bracket */}
    <svg
      className="absolute bottom-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21V15M21 21H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </>
);

// EXIF Display Component
const ExifDisplay: React.FC<{
  position: { x: number; y: number };
  isVisible: boolean;
  compat: CompatibilityFallbacks;
}> = ({ position, isVisible, compat }) => {
  const backdropStyle = compat.getBackdropFilterStyle(8);

  return (
    <div
      className="bg-black/80 text-white p-3 rounded-md font-mono text-xs"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        minWidth: '180px',
        ...backdropStyle, // Apply browser-compatible backdrop filter
      }}
    >
      <div className="space-y-1">
        <div className="text-orange-400 font-semibold">CAMERA</div>
        <div>Canon EOS R5</div>
        <div>24-70mm f/2.8L</div>
        <div className="text-orange-400 font-semibold mt-2">SETTINGS</div>
        <div>f/2.8 • 1/60s • ISO 100</div>
        <div className="text-orange-400 font-semibold mt-2">POSITION</div>
        <div>{position.x}px, {position.y}px</div>
        <div className="text-orange-400 font-semibold mt-2">TECH</div>
        <div>React 19.1.1</div>
        <div>60fps • 16.7ms</div>
      </div>
    </div>
  );
};

export default ViewfinderOverlay;