/**
 * Depth of Field Blur Transition
 *
 * Cinematic blur zone where focus shifts between sections.
 * Mimics camera focus pull (rack focus) technique.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface DepthOfFieldTransitionProps {
  /** Maximum blur amount in pixels */
  maxBlur?: number;
  /** Color tint for the bokeh effect */
  bokehColor?: string;
}

export function DepthOfFieldTransition({
  maxBlur = 20,
  bokehColor = 'rgba(139, 92, 246, 0.15)',
}: DepthOfFieldTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Blur increases at transition point, then decreases
  const blur = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 1],
    [0, maxBlur, maxBlur * 1.2, maxBlur, 0]
  );

  // Bokeh circles scale in/out during blur
  const bokehScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 1, 0]
  );

  const bokehOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0, 0.6, 0.8, 0.6, 0]
  );

  // Focus indicator (aperture ring visualization)
  const focusRingScale = useTransform(
    scrollYProgress,
    [0.4, 0.5, 0.6],
    [0.8, 1.2, 0.8]
  );

  return (
    <div ref={ref} className="absolute left-0 right-0 h-[32rem] overflow-hidden pointer-events-none z-35">
      {/* Blur overlay */}
      <motion.div
        style={{
          filter: useTransform(blur, (b) => `blur(${b}px)`),
          opacity: useTransform(blur, (b) => b / maxBlur * 0.3),
        }}
        className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/50"
      />

      {/* Bokeh circles (out-of-focus highlights) */}
      <motion.div
        style={{
          scale: bokehScale,
          opacity: bokehOpacity,
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Bokeh gradient (circular, soft edge) */}
            <radialGradient id="bokeh-gradient">
              <stop offset="0%" stopColor={bokehColor} stopOpacity="0.8" />
              <stop offset="70%" stopColor={bokehColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Lens distortion filter */}
            <filter id="lens-distortion">
              <feGaussianBlur stdDeviation="3" />
              <feColorMatrix
                type="matrix"
                values="1.2 0 0 0 0
                        0 1.2 0 0 0
                        0 0 1.2 0 0
                        0 0 0 1 0"
              />
            </filter>
          </defs>

          {/* Scattered bokeh circles */}
          {[
            { cx: 200, cy: 80, r: 40 },
            { cx: 450, cy: 150, r: 60 },
            { cx: 750, cy: 100, r: 35 },
            { cx: 950, cy: 200, r: 50 },
            { cx: 300, cy: 280, r: 45 },
            { cx: 650, cy: 320, r: 55 },
            { cx: 1050, cy: 150, r: 40 },
            { cx: 150, cy: 250, r: 30 },
            { cx: 850, cy: 350, r: 48 },
          ].map((bokeh, i) => (
            <motion.circle
              key={`bokeh-${i}`}
              cx={bokeh.cx}
              cy={bokeh.cy}
              r={bokeh.r}
              fill="url(#bokeh-gradient)"
              filter="url(#lens-distortion)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.8],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Focus ring indicator (center) */}
      <motion.div
        style={{
          scale: focusRingScale,
          opacity: bokehOpacity,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Focus peaking indicator ring */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="transparent"
            stroke="rgba(139, 92, 246, 0.6)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="transparent"
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="1"
          />

          {/* Focus points (corners of AF area) */}
          {[
            { x: 30, y: 30 },
            { x: 90, y: 30 },
            { x: 30, y: 90 },
            { x: 90, y: 90 },
          ].map((point, i) => (
            <g key={`focus-point-${i}`}>
              <line
                x1={point.x}
                y1={point.y - 8}
                x2={point.x}
                y2={point.y + 8}
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="2"
              />
              <line
                x1={point.x - 8}
                y1={point.y}
                x2={point.x + 8}
                y2={point.y}
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Chromatic aberration edge effect */}
      <motion.div
        style={{ opacity: useTransform(blur, (b) => b / maxBlur * 0.2) }}
        className="absolute inset-0"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent blur-sm" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/10 to-transparent blur-sm" />
      </motion.div>
    </div>
  );
}
