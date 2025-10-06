/**
 * Film Strip Transition
 *
 * Animated 35mm film strip with scroll-reactive sprocket holes.
 * Film "advances" through the camera as user scrolls.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface FilmStripTransitionProps {
  /** Number of sprocket holes per side */
  sprocketCount?: number;
  /** Film strip color */
  filmColor?: string;
}

export function FilmStripTransition({
  sprocketCount = 20,
  filmColor = 'rgba(139, 92, 246, 0.6)',
}: FilmStripTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Film advances (translates horizontally) as we scroll
  const filmX = useTransform(scrollYProgress, [0, 1], ['-100%', '100%']);

  // Sprockets pulse as film moves
  const sprocketScale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [1, 0.8, 1, 0.8, 1]
  );

  // Opacity fades in/out at edges
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  return (
    <div ref={ref} className="absolute left-0 right-0 h-48 overflow-hidden pointer-events-none z-35">
      <motion.div
        style={{ opacity }}
        className="relative w-full h-full"
      >
        {/* Top film strip edge */}
        <motion.div
          style={{ x: filmX }}
          className="absolute top-0 left-0 right-0 h-12 flex items-center"
        >
          <svg
            width="200%"
            height="48"
            viewBox="0 0 2000 48"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            {/* Film strip base */}
            <rect x="0" y="8" width="2000" height="32" fill={filmColor} />

            {/* Top border */}
            <rect x="0" y="8" width="2000" height="2" fill="rgba(139, 92, 246, 0.8)" />

            {/* Bottom border */}
            <rect x="0" y="38" width="2000" height="2" fill="rgba(139, 92, 246, 0.8)" />

            {/* Sprocket holes */}
            {Array.from({ length: sprocketCount }).map((_, i) => {
              const x = (2000 / sprocketCount) * i + (2000 / sprocketCount / 2);
              return (
                <motion.g key={`sprocket-${i}`} style={{ scale: sprocketScale }}>
                  {/* Rounded rectangle sprocket hole */}
                  <rect
                    x={x - 6}
                    y="12"
                    width="12"
                    height="8"
                    rx="2"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(139, 92, 246, 0.4)"
                    strokeWidth="0.5"
                  />
                  <rect
                    x={x - 6}
                    y="28"
                    width="12"
                    height="8"
                    rx="2"
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(139, 92, 246, 0.4)"
                    strokeWidth="0.5"
                  />
                </motion.g>
              );
            })}

            {/* Frame dividers (vertical lines between frames) */}
            {Array.from({ length: 5 }).map((_, i) => {
              const x = (2000 / 5) * i;
              return (
                <line
                  key={`divider-${i}`}
                  x1={x}
                  y1="10"
                  x2={x}
                  y2="38"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Bottom film strip edge (offset for parallax effect) */}
        <motion.div
          style={{ x: useTransform(filmX, (x) => typeof x === 'string' ? x : `${parseFloat(x.toString()) * 0.8}%`) }}
          className="absolute bottom-0 left-0 right-0 h-12 flex items-center"
        >
          <svg
            width="200%"
            height="48"
            viewBox="0 0 2000 48"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            <rect x="0" y="8" width="2000" height="32" fill={filmColor} opacity="0.4" />
            <rect x="0" y="8" width="2000" height="2" fill="rgba(139, 92, 246, 0.5)" />
            <rect x="0" y="38" width="2000" height="2" fill="rgba(139, 92, 246, 0.5)" />

            {Array.from({ length: sprocketCount }).map((_, i) => {
              const x = (2000 / sprocketCount) * i + (2000 / sprocketCount / 2);
              return (
                <g key={`sprocket-bottom-${i}`}>
                  <rect
                    x={x - 6}
                    y="12"
                    width="12"
                    height="8"
                    rx="2"
                    fill="rgba(15, 23, 42, 0.7)"
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="0.5"
                  />
                  <rect
                    x={x - 6}
                    y="28"
                    width="12"
                    height="8"
                    rx="2"
                    fill="rgba(15, 23, 42, 0.7)"
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="0.5"
                  />
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Center glow effect */}
        <motion.div
          style={{ opacity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl"
        />
      </motion.div>
    </div>
  );
}
