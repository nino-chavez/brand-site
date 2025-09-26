import React, { createContext, useContext } from 'react';
import { athleticColors, athleticTiming, athleticEasing } from './simple-tokens';

/**
 * Simple Athletic Token Context
 * Provides core token values without over-engineering
 */
const AthleticTokenContext = createContext({
  colors: athleticColors,
  timing: athleticTiming,
  easing: athleticEasing
});

/**
 * Simple Athletic Token Provider
 * Just provides the core values, no complex utilities
 */
export const AthleticTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    colors: athleticColors,
    timing: athleticTiming,
    easing: athleticEasing
  };

  return (
    <AthleticTokenContext.Provider value={value}>
      {children}
    </AthleticTokenContext.Provider>
  );
};

/**
 * Simple hook to access athletic colors
 */
export const useAthleticColors = () => {
  const context = useContext(AthleticTokenContext);
  return context.colors;
};

/**
 * Simple hook to access athletic timing
 */
export const useAthleticTiming = () => {
  const context = useContext(AthleticTokenContext);
  return context.timing;
};

/**
 * Simple hook to access all athletic tokens
 */
export const useAthleticTokens = () => {
  return useContext(AthleticTokenContext);
};