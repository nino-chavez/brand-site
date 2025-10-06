/**
 * Light Leak Transition
 *
 * Organic animated light leaks that bleed between sections.
 * Mimics film photography light leak accidents with gradient noise.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface LightLeakTransitionProps {
  /** Primary color for light leak */
  primaryColor?: string;
  /** Secondary color for light leak */
  secondaryColor?: string;
  /** Intensity of the leak effect (0-1) */
  intensity?: number;
}

export function LightLeakTransition({
  primaryColor = 'rgba(251, 146, 60, 0.4)',
  secondaryColor = 'rgba(139, 92, 246, 0.3)',
  intensity = 0.6,
}: LightLeakTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Light leak expands from edge to center as we scroll
  const leakProgress = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
  const opacity = useTransform(leakProgress, [0, 0.5, 1], [0, intensity, 0]);
  const scale = useTransform(leakProgress, [0, 1], [0.8, 1.5]);
  const rotate = useTransform(leakProgress, [0, 1], [-15, 15]);

  // Secondary leak (offset timing for organic feel)
  const leak2Progress = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const opacity2 = useTransform(leak2Progress, [0, 0.5, 1], [0, intensity * 0.7, 0]);
  const scale2 = useTransform(leak2Progress, [0, 1], [1.2, 0.9]);

  return (
    <div ref={ref} className="absolute left-0 right-0 h-96 overflow-hidden pointer-events-none z-30">
      {/* Primary light leak */}
      <motion.div
        style={{
          opacity,
          scale,
          rotate,
        }}
        className="absolute inset-0"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0"
        >
          <defs>
            {/* Turbulence filter for organic noise */}
            <filter id="light-leak-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01 0.03"
                numOctaves="4"
                seed="1"
              />
              <feDisplacementMap in="SourceGraphic" scale="100" />
              <feGaussianBlur stdDeviation="20" />
            </filter>

            {/* Gradient for light leak color */}
            <linearGradient id="light-leak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={primaryColor} />
            </linearGradient>
          </defs>

          {/* Light leak shape */}
          <ellipse
            cx="200"
            cy="200"
            rx="600"
            ry="300"
            fill="url(#light-leak-gradient)"
            filter="url(#light-leak-noise)"
            opacity="0.8"
          />
        </svg>
      </motion.div>

      {/* Secondary light leak (different position/timing) */}
      <motion.div
        style={{
          opacity: opacity2,
          scale: scale2,
          rotate: -10,
        }}
        className="absolute inset-0"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0"
        >
          <defs>
            <filter id="light-leak-noise-2">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02 0.015"
                numOctaves="3"
                seed="42"
              />
              <feDisplacementMap in="SourceGraphic" scale="80" />
              <feGaussianBlur stdDeviation="30" />
            </filter>

            <radialGradient id="light-leak-radial">
              <stop offset="0%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <ellipse
            cx="900"
            cy="200"
            rx="500"
            ry="250"
            fill="url(#light-leak-radial)"
            filter="url(#light-leak-noise-2)"
            opacity="0.6"
          />
        </svg>
      </motion.div>

      {/* Edge bloom effect */}
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-violet-500/10 to-transparent blur-xl"
      />
    </div>
  );
}
