/**
 * MotionSection Component
 *
 * Framer Motion wrapper for section-level scroll animations.
 * Drop-in replacement for CSS-based scroll animation patterns.
 *
 * @version 1.0.0
 */

import React, { type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { FEATURES, prefersReducedMotion } from '../../config/features';
import { fadeUpVariants, transitions } from '../../lib/motion-variants';

interface MotionSectionProps {
  /** Section content */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Delay before animation starts (seconds) */
  delay?: number;

  /** Custom animation variants (overrides default fadeUp) */
  variants?: Variants;

  /** Viewport trigger amount (0-1, default 0.1) */
  amount?: number;

  /** Viewport margin (default: trigger before fully visible) */
  margin?: string;

  /** Only trigger once (default: true) */
  once?: boolean;

  /** Test ID for testing */
  testId?: string;
}

/**
 * Section wrapper with scroll-triggered animations
 *
 * Uses Framer Motion's whileInView for performant animations.
 * Automatically falls back to instant render if reduced-motion is enabled.
 *
 * @example
 * ```tsx
 * <MotionSection delay={0.2}>
 *   <h2>About Me</h2>
 *   <p>Content here...</p>
 * </MotionSection>
 * ```
 */
export const MotionSection: React.FC<MotionSectionProps> = ({
  children,
  className = '',
  delay = 0,
  variants = fadeUpVariants,
  amount = 0.1,
  margin = '0px 0px -100px 0px',
  once = true,
  testId,
}) => {
  // Skip animation if user prefers reduced motion
  const shouldAnimate = !prefersReducedMotion() && FEATURES.FRAMER_MOTION_ENABLED;

  if (!shouldAnimate) {
    // Render without animation
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin }}
      variants={variants}
      custom={delay / 0.1} // Convert delay to custom index for variants
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger container for animating multiple children
 *
 * Children will animate in sequence with configurable delay.
 *
 * @example
 * ```tsx
 * <MotionStaggerContainer staggerDelay={0.1}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </MotionStaggerContainer>
 * ```
 */
interface MotionStaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  childDelay?: number;
  testId?: string;
}

export const MotionStaggerContainer: React.FC<MotionStaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  childDelay = 0.2,
  testId,
}) => {
  const shouldAnimate = !prefersReducedMotion() && FEATURES.FRAMER_MOTION_ENABLED;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldAnimate ? staggerDelay : 0,
        delayChildren: shouldAnimate ? childDelay : 0,
      },
    },
  };

  if (!shouldAnimate) {
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger item (child of MotionStaggerContainer)
 *
 * @example
 * ```tsx
 * <MotionStaggerContainer>
 *   <MotionStaggerItem>Item 1</MotionStaggerItem>
 *   <MotionStaggerItem>Item 2</MotionStaggerItem>
 * </MotionStaggerContainer>
 * ```
 */
interface MotionStaggerItemProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

export const MotionStaggerItem: React.FC<MotionStaggerItemProps> = ({
  children,
  className = '',
  testId,
}) => {
  const shouldAnimate = !prefersReducedMotion() && FEATURES.FRAMER_MOTION_ENABLED;

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: transitions.smooth,
    },
  };

  if (!shouldAnimate) {
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
};

/**
 * Fade-in wrapper (simple opacity transition)
 *
 * @example
 * ```tsx
 * <MotionFade delay={0.3}>
 *   <img src="..." alt="..." />
 * </MotionFade>
 * ```
 */
interface MotionFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  testId?: string;
}

export const MotionFade: React.FC<MotionFadeProps> = ({
  children,
  className = '',
  delay = 0,
  testId,
}) => {
  const shouldAnimate = !prefersReducedMotion() && FEATURES.FRAMER_MOTION_ENABLED;

  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        ...transitions.smooth,
        delay,
      },
    },
  };

  if (!shouldAnimate) {
    return (
      <div className={className} data-testid={testId}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeVariants}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
};

export default MotionSection;
