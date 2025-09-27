/**
 * Simplified Athletic Design Token System
 *
 * Core token exports without over-engineered utilities.
 * Replaces the complex 158-line index.ts with just the essentials.
 */

// Core token values
export {
  athleticColors,
  athleticTiming,
  athleticEasing,
  type AthleticColor,
  type AthleticTiming,
  type AthleticEasing
} from './simple-tokens';

// React provider (if actually needed)
export {
  AthleticTokenProvider,
  useAthleticColors,
  useAthleticTiming
} from './providers/AthleticTokenProvider';

// Version information
export const VERSION = '1.0.0';