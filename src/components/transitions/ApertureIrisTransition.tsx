/**
 * Aperture Iris Transition
 *
 * Camera lens aperture blades that open/close between sections.
 * Mimics the mechanical iris diaphragm of a camera lens.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ApertureIrisTransitionProps {
  /** Number of aperture blades (6-9 is typical for camera lenses) */
  bladeCount?: number;
  /** Position in viewport where iris is fully open (0-1) */
  openThreshold?: number;
  /** Color of the aperture blades */
  bladeColor?: string;
}

export function ApertureIrisTransition({
  bladeCount = 8,
  openThreshold = 0.5,
  bladeColor = 'rgba(139, 92, 246, 0.8)',
}: ApertureIrisTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Iris opens from closed (0) to fully open (1) as we scroll
  const irisScale = useTransform(
    scrollYProgress,
    [openThreshold - 0.2, openThreshold + 0.2],
    [0, 1]
  );

  const rotation = useTransform(
    scrollYProgress,
    [openThreshold - 0.2, openThreshold + 0.2],
    [0, 45]
  );

  // Generate blade paths for SVG polygon
  const generateBladePath = (index: number) => {
    const angle = (360 / bladeCount) * index;
    const nextAngle = (360 / bladeCount) * (index + 1);

    // Create blade shape (trapezoid pointing to center)
    const innerRadius = 0;
    const outerRadius = 100;
    const bladeWidth = 15;

    const x1 = Math.cos((angle - bladeWidth) * Math.PI / 180) * outerRadius;
    const y1 = Math.sin((angle - bladeWidth) * Math.PI / 180) * outerRadius;
    const x2 = Math.cos((angle + bladeWidth) * Math.PI / 180) * outerRadius;
    const y2 = Math.sin((angle + bladeWidth) * Math.PI / 180) * outerRadius;
    const x3 = Math.cos(nextAngle * Math.PI / 180) * innerRadius;
    const y3 = Math.sin(nextAngle * Math.PI / 180) * innerRadius;

    return `M 0,0 L ${x1},${y1} L ${x2},${y2} Z`;
  };

  return (
    <div ref={ref} className="absolute left-0 right-0 h-64 flex items-center justify-center pointer-events-none z-40">
      <motion.div
        style={{
          scale: irisScale,
          rotate: rotation,
        }}
        className="relative"
      >
        <svg
          width="120"
          height="120"
          viewBox="-60 -60 120 120"
          className="drop-shadow-2xl"
        >
          {/* Central aperture opening */}
          <motion.circle
            cx="0"
            cy="0"
            r="20"
            fill="transparent"
            stroke={bladeColor}
            strokeWidth="2"
            style={{
              scale: irisScale,
            }}
          />

          {/* Aperture blades */}
          {Array.from({ length: bladeCount }).map((_, i) => (
            <motion.path
              key={i}
              d={generateBladePath(i)}
              fill={bladeColor}
              style={{
                rotate: `${(360 / bladeCount) * i}deg`,
                originX: '0px',
                originY: '0px',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}

          {/* Outer ring */}
          <circle
            cx="0"
            cy="0"
            r="55"
            fill="transparent"
            stroke={bladeColor}
            strokeWidth="3"
            opacity="0.4"
          />

          {/* Inner mechanical details */}
          {Array.from({ length: bladeCount * 2 }).map((_, i) => (
            <line
              key={`detail-${i}`}
              x1="0"
              y1="0"
              x2={Math.cos((360 / (bladeCount * 2)) * i * Math.PI / 180) * 50}
              y2={Math.sin((360 / (bladeCount * 2)) * i * Math.PI / 180) * 50}
              stroke={bladeColor}
              strokeWidth="0.5"
              opacity="0.2"
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
