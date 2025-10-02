/**
 * useDemoState - State management for demo harness
 *
 * Manages demo component states, settings, and interactions
 * with localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';

interface DemoState {
  [key: string]: any;
}

export const useDemoState = (demoId: string, initialState: DemoState = {}) => {
  const storageKey = `demo-state-${demoId}`;

  const [state, setState] = useState<DemoState>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return { ...initialState, ...JSON.parse(stored) };
        } catch {
          return initialState;
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey]);

  const updateState = useCallback((key: string, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [initialState, storageKey]);

  return { state, updateState, resetState };
};

export default useDemoState;
