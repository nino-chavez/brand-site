/**
 * Content Token Utilities
 *
 * Helper functions for applying Athletic Design Tokens to content adapters
 * and progressive disclosure components.
 */

import {
  contentLevelColors,
  contentTransitions,
  contentDensity,
  sectionColors,
  athleticTiming,
  athleticEasing,
  type ContentLevel,
  type ContentDensity as ContentDensityType,
  type SectionColor
} from './simple-tokens';

import { ContentLevel as ContentLevelEnum } from '../types/section-content';

/**
 * Get content level styling tokens
 */
export const getContentLevelTokens = (level: ContentLevelEnum) => {
  const tokenLevel = level.toLowerCase() as ContentLevel;
  const colors = contentLevelColors[tokenLevel] || contentLevelColors.summary;

  return {
    colors,
    styles: {
      // Background with opacity for glass effect
      backgroundColor: `${colors.background}40`, // 25% opacity
      borderColor: `${colors.border}80`, // 50% opacity
      textColor: colors.text,
      accentColor: colors.accent,
    },
    classNames: {
      badge: `px-3 py-1 rounded-full text-sm font-medium border`,
      card: `backdrop-blur-md border rounded-xl transition-all`,
      text: `transition-colors`,
      accent: `transition-colors hover:opacity-80`,
    }
  };
};

/**
 * Get section-specific color tokens
 */
export const getSectionTokens = (section: SectionColor) => {
  const colors = sectionColors[section];

  return {
    colors,
    styles: {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
    }
  };
};

/**
 * Get content transition styles
 */
export const getTransitionTokens = (transitionType: keyof typeof contentTransitions = 'disclosure') => {
  const transition = contentTransitions[transitionType];

  return {
    duration: `${transition.duration}ms`,
    easing: transition.easing,
    styles: {
      transition: `all ${transition.duration}ms ${transition.easing}`,
    },
    classNames: {
      transitioning: 'opacity-75 scale-[0.98]',
      stable: 'opacity-100 scale-100',
    }
  };
};

/**
 * Get responsive content density tokens
 */
export const getDensityTokens = (density: ContentDensityType = 'comfortable') => {
  const densityConfig = contentDensity[density];

  return {
    config: densityConfig,
    styles: {
      spacing: densityConfig.spacing,
      padding: densityConfig.padding,
      borderRadius: densityConfig.borderRadius,
      fontSize: densityConfig.fontSize,
    }
  };
};

/**
 * Generate comprehensive styling for content level indicators
 */
export const generateContentLevelStyles = (
  level: ContentLevelEnum,
  section?: SectionColor,
  density: ContentDensityType = 'comfortable'
) => {
  const levelTokens = getContentLevelTokens(level);
  const transitionTokens = getTransitionTokens('disclosure');
  const densityTokens = getDensityTokens(density);

  const sectionTokens = section ? getSectionTokens(section) : null;

  return {
    badge: {
      style: {
        backgroundColor: levelTokens.styles.backgroundColor,
        borderColor: levelTokens.styles.borderColor,
        color: levelTokens.styles.textColor,
        ...transitionTokens.styles,
        ...densityTokens.styles,
      },
      className: `${levelTokens.classNames.badge} ${transitionTokens.classNames.stable}`
    },
    card: {
      style: {
        backgroundColor: levelTokens.styles.backgroundColor,
        borderColor: levelTokens.styles.borderColor,
        ...transitionTokens.styles,
        ...densityTokens.styles,
      },
      className: `${levelTokens.classNames.card} ${transitionTokens.classNames.stable}`
    },
    section: sectionTokens ? {
      style: {
        '--section-primary': sectionTokens.styles.primaryColor,
        '--section-secondary': sectionTokens.styles.secondaryColor,
        '--section-accent': sectionTokens.styles.accentColor,
      } as React.CSSProperties
    } : undefined
  };
};

/**
 * Athletic timing utilities for consistent animations
 */
export const getAthleticTiming = () => ({
  quickSnap: `${athleticTiming['quick-snap']}ms`,
  reaction: `${athleticTiming.reaction}ms`,
  transition: `${athleticTiming.transition}ms`,
  sequence: `${athleticTiming.sequence}ms`,
  flash: `${athleticTiming.flash}ms`,
  flow: `${athleticTiming.flow}ms`,
  power: `${athleticTiming.power}ms`,
});

/**
 * Athletic easing utilities for consistent motion curves
 */
export const getAthleticEasing = () => ({
  snap: athleticEasing.snap,
  flow: athleticEasing.flow,
  power: athleticEasing.power,
  precision: athleticEasing.precision,
  sprint: athleticEasing.sprint,
  glide: athleticEasing.glide,
});

/**
 * Create CSS custom properties for dynamic token usage
 */
export const createTokenCSSProperties = (
  level: ContentLevelEnum,
  section?: SectionColor
): React.CSSProperties => {
  const levelTokens = getContentLevelTokens(level);
  const sectionTokens = section ? getSectionTokens(section) : null;
  const timing = getAthleticTiming();
  const easing = getAthleticEasing();

  return {
    // Content level tokens
    '--content-bg': levelTokens.styles.backgroundColor,
    '--content-border': levelTokens.styles.borderColor,
    '--content-text': levelTokens.styles.textColor,
    '--content-accent': levelTokens.styles.accentColor,

    // Section tokens
    ...(sectionTokens && {
      '--section-primary': sectionTokens.styles.primaryColor,
      '--section-secondary': sectionTokens.styles.secondaryColor,
      '--section-accent': sectionTokens.styles.accentColor,
    }),

    // Timing tokens
    '--timing-quick': timing.quickSnap,
    '--timing-reaction': timing.reaction,
    '--timing-transition': timing.transition,
    '--timing-flow': timing.flow,

    // Easing tokens
    '--easing-snap': easing.snap,
    '--easing-flow': easing.flow,
    '--easing-precision': easing.precision,
  };
};

/**
 * Hook-style API for content token integration
 */
export const useContentTokens = (
  level: ContentLevelEnum,
  section?: SectionColor,
  density: ContentDensityType = 'comfortable'
) => {
  return {
    levelTokens: getContentLevelTokens(level),
    sectionTokens: section ? getSectionTokens(section) : null,
    transitionTokens: getTransitionTokens(),
    densityTokens: getDensityTokens(density),
    styles: generateContentLevelStyles(level, section, density),
    cssProperties: createTokenCSSProperties(level, section),
    timing: getAthleticTiming(),
    easing: getAthleticEasing(),
  };
};