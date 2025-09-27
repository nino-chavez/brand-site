import React from 'react';

interface CrosshairIconProps {
  size: number;
  color: string;
  strokeWidth: number;
}

/**
 * Crosshair icon component for viewfinder overlay
 * Extracted from ViewfinderOverlay for better separation of concerns
 */
export const CrosshairIcon: React.FC<CrosshairIconProps> = ({ size, color, strokeWidth }) => (
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