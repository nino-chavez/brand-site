import React, { useEffect, useState, useRef } from 'react';
import { useMouseTracking } from '../../hooks/useMouseTracking';

interface BackdropBlurOverlayProps {
  isActive?: boolean;
  focusRadius?: number;
  maxBlurIntensity?: number;
  children?: React.ReactNode;
  className?: string;
}

const BackdropBlurOverlay: React.FC<BackdropBlurOverlayProps> = ({
  isActive = false,
  focusRadius = 200,
  maxBlurIntensity = 8,
  children,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>('');

  // Track mouse position with delay
  const { currentPosition } = useMouseTracking({
    delay: 100,
    throttleMs: 16,
  });

  // Generate blur mask based on cursor position
  useEffect(() => {
    if (!isActive || !maskCanvasRef.current) {
      setMaskUrl('');
      return;
    }

    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create radial gradient mask
    const gradient = ctx.createRadialGradient(
      currentPosition.x,
      currentPosition.y,
      0,
      currentPosition.x,
      currentPosition.y,
      focusRadius * 2
    );

    // Inner circle (no blur) - transparent
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(focusRadius / (focusRadius * 2), 'rgba(0, 0, 0, 0)');

    // Transition zone
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');

    // Outer area (full blur) - opaque
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    // Clear and fill canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert to data URL for CSS mask
    const dataUrl = canvas.toDataURL();
    setMaskUrl(dataUrl);
  }, [currentPosition, focusRadius, isActive]);

  // Don't use early return after hooks - handle visibility through conditional rendering
  if (!isActive) {
    return <div className="fixed inset-0 opacity-0 invisible pointer-events-none" />;
  }

  return (
    <>
      {/* Hidden canvas for generating mask */}
      <canvas
        ref={maskCanvasRef}
        className="absolute opacity-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />

      {/* Backdrop blur overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{
          backdropFilter: `blur(${maxBlurIntensity}px)`,
          WebkitBackdropFilter: `blur(${maxBlurIntensity}px)`,
          mask: maskUrl ? `url("${maskUrl}")` : undefined,
          WebkitMask: maskUrl ? `url("${maskUrl}")` : undefined,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          transition: 'backdrop-filter 200ms ease-out',
          zIndex: 40,
        }}
      />

      {/* Alternative approach using multiple layers for better browser support */}
      <div
        className={`fixed inset-0 pointer-events-none ${className}`}
        style={{
          background: `radial-gradient(${focusRadius}px at ${currentPosition.x}px ${currentPosition.y}px, transparent 0%, transparent 60%, rgba(255, 255, 255, 0.1) 80%, rgba(255, 255, 255, 0.2) 100%)`,
          backdropFilter: `blur(${maxBlurIntensity}px)`,
          WebkitBackdropFilter: `blur(${maxBlurIntensity}px)`,
          opacity: 0.8,
          transition: 'all 200ms ease-out',
          zIndex: 39,
        }}
      />

      {children}
    </>
  );
};

// Simplified version using CSS only (no canvas)
export const SimpleBackdropBlur: React.FC<{
  isActive?: boolean;
  focusCenter?: { x: number; y: number };
  focusRadius?: number;
  blurIntensity?: number;
  className?: string;
}> = ({
  isActive = false,
  focusCenter,
  focusRadius = 200,
  blurIntensity = 8,
  className = '',
}) => {
  const { currentPosition } = useMouseTracking({
    delay: 100,
    throttleMs: 16,
  });

  const center = focusCenter || currentPosition;

  // Don't use early return after hooks - handle visibility through conditional rendering
  if (!isActive) {
    return <div className="fixed inset-0 opacity-0 invisible pointer-events-none" />;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-all duration-200 ease-out ${className}`}
      style={{
        background: `radial-gradient(${focusRadius}px at ${center.x}px ${center.y}px, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.1) 60%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.5) 100%)`,
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        zIndex: 40,
      }}
    />
  );
};

// Multi-layer blur effect for performance
export const LayeredBlurOverlay: React.FC<{
  isActive?: boolean;
  layers?: Array<{ radius: number; intensity: number; opacity: number }>;
  focusCenter?: { x: number; y: number };
  className?: string;
}> = ({
  isActive = false,
  layers = [
    { radius: 150, intensity: 2, opacity: 0.2 },
    { radius: 250, intensity: 4, opacity: 0.3 },
    { radius: 350, intensity: 8, opacity: 0.4 },
  ],
  focusCenter,
  className = '',
}) => {
  const { currentPosition } = useMouseTracking({
    delay: 100,
    throttleMs: 16,
  });

  const center = focusCenter || currentPosition;

  // Don't use early return after hooks - handle visibility through conditional rendering
  if (!isActive) {
    return <div className="fixed inset-0 opacity-0 invisible pointer-events-none" />;
  }

  return (
    <>
      {layers.map((layer, index) => (
        <div
          key={index}
          className={`fixed inset-0 pointer-events-none transition-all duration-200 ease-out ${className}`}
          style={{
            background: `radial-gradient(${layer.radius}px at ${center.x}px ${center.y}px, transparent 0%, transparent 50%, rgba(0, 0, 0, ${layer.opacity}) 100%)`,
            backdropFilter: `blur(${layer.intensity}px)`,
            WebkitBackdropFilter: `blur(${layer.intensity}px)`,
            zIndex: 40 - index,
          }}
        />
      ))}
    </>
  );
};

// Performance-optimized version with reduced calculations
export const OptimizedBackdropBlur: React.FC<{
  isActive?: boolean;
  className?: string;
}> = ({ isActive = false, className = '' }) => {
  const [blurStyle, setBlurStyle] = useState<React.CSSProperties>({});
  const rafRef = useRef<number>();

  const { currentPosition } = useMouseTracking({
    delay: 100,
    throttleMs: 33, // 30fps for blur updates (less demanding)
  });

  useEffect(() => {
    if (!isActive) {
      setBlurStyle({});
      return;
    }

    const updateBlur = () => {
      const newStyle: React.CSSProperties = {
        background: `radial-gradient(200px at ${currentPosition.x}px ${currentPosition.y}px, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.4) 100%)`,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        transition: 'all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      };

      setBlurStyle(newStyle);
    };

    rafRef.current = requestAnimationFrame(updateBlur);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentPosition, isActive]);

  // Don't use early return after hooks - handle visibility through conditional rendering
  if (!isActive) {
    return <div className="fixed inset-0 opacity-0 invisible pointer-events-none" />;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{
        ...blurStyle,
        zIndex: 40,
      }}
    />
  );
};

export default BackdropBlurOverlay;