import React from 'react';
import type { CompatibilityFallbacks } from '../../utils/browserCompat';

interface ExifDisplayProps {
  position: { x: number; y: number };
  isVisible: boolean;
  compat: CompatibilityFallbacks;
}

/**
 * EXIF metadata display component for viewfinder
 * Shows camera settings and position information
 * Extracted from ViewfinderOverlay for better separation of concerns
 */
export const ExifDisplay: React.FC<ExifDisplayProps> = ({ position, isVisible, compat }) => {
  const backdropStyle = compat.getBackdropFilterStyle(8);

  return (
    <div
      className="bg-black/80 text-white p-4 rounded-md font-mono text-xs"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        minWidth: '180px',
        ...backdropStyle, // Apply browser-compatible backdrop filter
      }}
    >
      <div className="space-y-1">
        <div className="text-athletic-court-orange font-semibold">CAMERA</div>
        <div>Canon EOS R5</div>
        <div>24-70mm f/2.8L</div>
        <div className="text-athletic-court-orange font-semibold mt-2">SETTINGS</div>
        <div>f/2.8 • 1/60s • ISO 100</div>
        <div className="text-athletic-court-orange font-semibold mt-2">POSITION</div>
        <div>{position.x}px, {position.y}px</div>
        <div className="text-athletic-court-orange font-semibold mt-2">TECH</div>
        <div>React 19.1.1</div>
        <div>60fps • 16.7ms</div>
      </div>
    </div>
  );
};