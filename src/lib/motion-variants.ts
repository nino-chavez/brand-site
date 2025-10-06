/**
 * Framer Motion Animation Variants Library
 *
 * Centralized animation variants for consistent motion design.
 * All variants respect user's reduced-motion preferences.
 *
 * @version 1.0.0
 */

import type { Variants, Transition } from 'framer-motion';
import { EASING, ANIMATION_TIMING } from '../config/features';

/**
 * Shared transition configurations
 */
export const transitions = {
  smooth: {
    duration: ANIMATION_TIMING.normal,
    ease: EASING.smooth,
  } as Transition,

  fast: {
    duration: ANIMATION_TIMING.fast,
    ease: EASING.snap,
  } as Transition,

  slow: {
    duration: ANIMATION_TIMING.slow,
    ease: EASING.smooth,
  } as Transition,

  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  } as Transition,

  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  } as Transition,
};

/**
 * Fade up animation (most common scroll animation)
 * Element fades in while translating upward
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.smooth,
      delay: custom * 0.1,
    },
  }),
};

/**
 * Fade in animation (simple opacity transition)
 */
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
};

/**
 * Scale animation (element scales up from 95%)
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
};

/**
 * Slide from left animation
 */
export const slideFromLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

/**
 * Slide from right animation
 */
export const slideFromRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

/**
 * Blur morph animation (element fades in from blurred state)
 */
export const blurMorphVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: 'blur(8px)',
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: transitions.smooth,
  },
};

/**
 * Stagger container (for animating children sequentially)
 * Use with child variants for coordinated animations
 */
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

/**
 * Stagger item (child of stagger container)
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

/**
 * Modal/Overlay variants
 * Backdrop fades in, content scales up
 */
export const modalBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transitions.fast,
  },
};

/**
 * Card hover animation
 * Slight lift with spring physics
 */
export const cardHoverVariants: Variants = {
  initial: {},
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    transition: transitions.spring,
  },
};

/**
 * Button press animation
 * Quick scale down on tap
 */
export const buttonPressVariants: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: EASING.snap,
    },
  },
};

/**
 * Navigation item animation
 * Used in floating nav and mobile menu
 */
export const navItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: (custom = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_TIMING.fast,
      delay: custom * 0.05,
      ease: EASING.smooth,
    },
  }),
};

/**
 * Page transition variants
 * For route changes
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitions.fast,
  },
};

/**
 * Accordion expand/collapse animation
 */
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.fast,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: transitions.smooth,
  },
};

/**
 * Image reveal animation
 * Used for progressive image loading
 */
export const imageRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.1,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASING.smooth,
    },
  },
};

/**
 * List stagger variants
 * For animating lists of items (projects, skills, etc.)
 */
export const listContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -16,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
};

/**
 * Magnetic button effect
 * Element follows cursor within radius
 */
export const magneticVariants = (x: number, y: number): Record<string, any> => ({
  hover: {
    x,
    y,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
});

/**
 * Parallax scroll effect
 * Element moves at different speed during scroll
 */
export const parallaxVariants = (offset: number): Record<string, any> => ({
  initial: {
    y: 0,
  },
  scroll: {
    y: offset,
    transition: {
      ease: 'linear',
    },
  },
});
