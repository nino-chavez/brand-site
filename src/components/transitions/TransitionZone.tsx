/**
 * TransitionZone Component
 *
 * Dedicated zone for cinematic cross-dissolve blending between sections.
 * Includes optional photography-inspired visual elements.
 *
 * @version 1.0.0
 */

import { motion, useTransform, type MotionValue } from 'framer-motion';

interface TransitionZoneProps {
  /** Position: top or bottom of section */
  position: 'top' | 'bottom';
  /** Opacity controlled by parent (from useTransitionZones hook) */
  opacity: MotionValue<number>;
  /** Background color to blend */
  backgroundColor: string;
  /** Enable photography visual elements */
  withPhotographyElements?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TransitionZone({
  position,
  opacity,
  backgroundColor,
  withPhotographyElements = true,
  className = '',
}: TransitionZoneProps) {
  return (
    <motion.div
      className={`absolute left-0 right-0 h-[20vh] overflow-hidden pointer-events-none z-30 ${className}`}
      style={{
        [position]: 0,
        opacity,
        background: backgroundColor,
      }}
    >
      {/* Film grain texture overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {withPhotographyElements && (
        <>
          {/* Frame markers (subtle) */}
          {position === 'top' && (
            <>
              <motion.div
                className="absolute top-4 left-4"
                style={{ opacity: useTransform(opacity, [0, 1], [0, 0.4]) }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" />
                  <circle cx="8" cy="8" r="2" fill="rgba(139, 92, 246, 0.8)" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute top-4 right-4"
                style={{ opacity: useTransform(opacity, [0, 1], [0, 0.4]) }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" />
                  <circle cx="8" cy="8" r="2" fill="rgba(139, 92, 246, 0.8)" />
                </svg>
              </motion.div>
            </>
          )}

          {position === 'bottom' && (
            <>
              <motion.div
                className="absolute bottom-4 left-4"
                style={{ opacity: useTransform(opacity, [0, 1], [0.4, 0]) }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" />
                  <circle cx="8" cy="8" r="2" fill="rgba(139, 92, 246, 0.8)" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute bottom-4 right-4"
                style={{ opacity: useTransform(opacity, [0, 1], [0.4, 0]) }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="1" />
                  <circle cx="8" cy="8" r="2" fill="rgba(139, 92, 246, 0.8)" />
                </svg>
              </motion.div>
            </>
          )}

          {/* Subtle light leak effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: useTransform(opacity, [0, 0.5, 1], [0, 0.15, 0]),
              background: position === 'top'
                ? 'radial-gradient(ellipse at top, rgba(251, 146, 60, 0.1), transparent 60%)'
                : 'radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.1), transparent 60%)',
            }}
          />
        </>
      )}

      {/* Gradient fade (ensures smooth blend at edges) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            position === 'top'
              ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.1))'
              : 'linear-gradient(to top, transparent, rgba(0,0,0,0.1))',
        }}
      />
    </motion.div>
  );
}
