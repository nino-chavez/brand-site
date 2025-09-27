/**
 * Split-Screen Components Index
 *
 * Centralized exports for Phase 5 split-screen storytelling components.
 * Provides clean import paths for split-screen functionality.
 *
 * @fileoverview Split-screen component exports
 * @version 1.0.0
 * @since Phase 5
 */

// Core split-screen components
export { default as SplitScreenLayout } from './SplitScreenLayout';
export { default as DepthOfFieldEffect } from './DepthOfFieldEffect';

// Hook exports (re-export from hooks directory)
export { useSynchronizedAnimation } from '../../hooks/useSynchronizedAnimation';

// Type exports for component usage
export type {
  SplitScreenLayoutProps,
  SplitScreenLayoutConfig,
  SplitScreenPanelConfig,
  DepthOfFieldEffectProps,
  DepthOfFieldEffectConfig,
  SynchronizedAnimationConfig,
  SynchronizedAnimationState,
  UseSynchronizedAnimationReturn,
  SplitScreenAccessibility,
  SplitScreenPerformanceMetrics,
  SplitScreenError,
} from '../../types/split-screen';

// Token exports for styling
export {
  splitScreenTokens,
  splitScreenTiming,
  splitScreenSpacing,
  splitScreenEasing,
  getTimingMs,
  getEasing,
  calculateStaggerDelay,
  validateAnimationCount,
} from '../../tokens/split-screen';