/**
 * Cross-Dissolve Transition
 *
 * Cinematic cross-dissolve effect where outgoing section fades out
 * while incoming section fades in - like video editing software.
 *
 * Creates a dedicated transition zone where both sections are superimposed
 * and blended together for a smooth, professional transition.
 *
 * @version 1.0.0
 */

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface CrossDissolveTransitionProps {
  /** Height of transition zone in vh */
  zoneHeight?: number;
  /** Blend mode for compositing */
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  /** Transition style variant */
  variant?: 'simple' | 'with-blur' | 'with-zoom' | 'with-photography-elements';
}

export function CrossDissolveTransition({
  zoneHeight = 30,
  blendMode = 'normal',
  variant = 'with-photography-elements',
}: CrossDissolveTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Outgoing section opacity (fades out)
  const outgoingOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Incoming section opacity (fades in)
  const incomingOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  // Optional blur for depth effect
  const blur = variant === 'with-blur'
    ? useTransform(scrollYProgress, [0, 0.5, 1], [0, 8, 0])
    : useTransform(scrollYProgress, [0, 1], [0, 0]);

  // Optional zoom for emphasis
  const scale = variant === 'with-zoom'
    ? useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1])
    : useTransform(scrollYProgress, [0, 1], [1, 1]);

  return (
    <div
      ref={ref}
      className={`absolute left-0 right-0 overflow-hidden pointer-events-none z-40`}
      style={{ height: `${zoneHeight}vh` }}
    >
      {/* Cinematic transition zone - both sections visible and blending */}
      <div className="relative w-full h-full">

        {/* Photography-inspired transition elements (optional) */}
        {variant === 'with-photography-elements' && (
          <>
            {/* Film frame markers */}
            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]) }}
              className="absolute top-1/2 left-4 -translate-y-1/2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="rgba(139, 92, 246, 0.8)" />
              </svg>
            </motion.div>

            <motion.div
              style={{ opacity: useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]) }}
              className="absolute top-1/2 right-4 -translate-y-1/2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" fill="rgba(139, 92, 246, 0.8)" />
              </svg>
            </motion.div>

            {/* Transition progress indicator */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              style={{ opacity: useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 0.6, 0]) }}
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-8 bg-violet-500/40"
                    style={{
                      opacity: scrollYProgress.get() > (i / 5) ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* Blend overlay visualization */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.8),
              rgba(0,0,0,0.4) 50%,
              rgba(0,0,0,0.8))`,
            mixBlendMode: blendMode,
            opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3]),
          }}
        />
      </div>
    </div>
  );
}
