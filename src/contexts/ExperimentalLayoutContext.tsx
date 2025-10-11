import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import type {
  DesignTheme,
  ExperimentalLayoutState,
  ExperimentalLayoutActions,
  ExperimentalLayoutContextValue,
  ThemeConfig,
} from '../types/experimental';
import { THEME_METADATA } from '../types/experimental';

const DEFAULT_THEME: DesignTheme = 'glassmorphism';
const TRANSITION_DURATION = 300; // milliseconds
const STORAGE_KEY = 'experimental-layout-theme';

// Create context
const ExperimentalLayoutContext = createContext<ExperimentalLayoutContextValue | undefined>(
  undefined
);

// Theme configurations
const createThemeConfigs = (): ThemeConfig[] => {
  return Object.values(THEME_METADATA).map((metadata) => ({
    metadata,
    cssVariables: {}, // Will be populated by individual theme implementations
    componentVariant: metadata.id,
  }));
};

interface ExperimentalLayoutProviderProps {
  children: React.ReactNode;
  initialTheme?: DesignTheme;
}

export function ExperimentalLayoutProvider({
  children,
  initialTheme,
}: ExperimentalLayoutProviderProps) {
  // Load theme from URL > localStorage > default
  const getInitialTheme = (): DesignTheme => {
    if (initialTheme) return initialTheme;

    if (typeof window !== 'undefined') {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const themeParam = urlParams.get('theme');
      if (themeParam && THEME_METADATA[themeParam as DesignTheme]) {
        console.log(`[Experimental Layout] Loading theme from URL: ${themeParam}`);
        return themeParam as DesignTheme;
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEME_METADATA[stored as DesignTheme]) {
        return stored as DesignTheme;
      }
    }

    return DEFAULT_THEME;
  };

  const [state, setState] = useState<ExperimentalLayoutState>({
    currentTheme: getInitialTheme(),
    isTransitioning: false,
    transitionDuration: TRANSITION_DURATION,
    themes: createThemeConfigs(),
    previousTheme: null,
  });

  // Persist theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, state.currentTheme);
    }
  }, [state.currentTheme]);

  // Apply theme CSS variables to document root
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const theme = state.themes.find((t) => t.metadata.id === state.currentTheme);
    if (!theme) return;

    // Apply CSS variables
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Add theme class to body
    document.body.dataset.experimentalTheme = state.currentTheme;

    // Log theme change for analytics
    console.log(`[Experimental Layout] Theme switched to: ${state.currentTheme}`);
  }, [state.currentTheme, state.themes]);

  // Actions
  const switchTheme = useCallback((theme: DesignTheme) => {
    if (!THEME_METADATA[theme]) {
      console.error(`[Experimental Layout] Invalid theme: ${theme}`);
      return;
    }

    setState((prev) => {
      if (prev.currentTheme === theme) {
        console.log(`[Experimental Layout] Already on theme: ${theme}`);
        return prev;
      }

      return {
        ...prev,
        previousTheme: prev.currentTheme,
        currentTheme: theme,
        isTransitioning: true,
      };
    });

    // End transition after duration
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isTransitioning: false,
      }));
    }, TRANSITION_DURATION);
  }, []);

  const setTransitioning = useCallback((isTransitioning: boolean) => {
    setState((prev) => ({
      ...prev,
      isTransitioning,
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    switchTheme(DEFAULT_THEME);
  }, [switchTheme]);

  const actions: ExperimentalLayoutActions = useMemo(
    () => ({
      switchTheme,
      setTransitioning,
      resetToDefault,
    }),
    [switchTheme, setTransitioning, resetToDefault]
  );

  const contextValue: ExperimentalLayoutContextValue = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <ExperimentalLayoutContext.Provider value={contextValue}>
      {children}
    </ExperimentalLayoutContext.Provider>
  );
}

// Hook to use experimental layout context
export function useExperimentalLayout() {
  const context = useContext(ExperimentalLayoutContext);

  if (!context) {
    throw new Error(
      'useExperimentalLayout must be used within ExperimentalLayoutProvider'
    );
  }

  return context;
}

// Hook for theme switching with analytics
export function useThemeSwitcher() {
  const { state, actions } = useExperimentalLayout();

  const switchToTheme = useCallback(
    (theme: DesignTheme) => {
      // Analytics: Track theme switch
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'theme_switch', {
          event_category: 'experimental_layout',
          event_label: theme,
          previous_theme: state.currentTheme,
        });
      }

      actions.switchTheme(theme);
    },
    [actions, state.currentTheme]
  );

  const cycleTheme = useCallback(() => {
    const themes = state.themes.map((t) => t.metadata.id);
    const currentIndex = themes.indexOf(state.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    switchToTheme(themes[nextIndex]);
  }, [state.themes, state.currentTheme, switchToTheme]);

  return {
    currentTheme: state.currentTheme,
    previousTheme: state.previousTheme,
    isTransitioning: state.isTransitioning,
    availableThemes: state.themes.map((t) => t.metadata),
    switchToTheme,
    cycleTheme,
    resetToDefault: actions.resetToDefault,
  };
}

// Hook for theme metadata
export function useThemeMetadata(theme?: DesignTheme) {
  const { state } = useExperimentalLayout();
  const targetTheme = theme || state.currentTheme;

  return useMemo(() => {
    const themeConfig = state.themes.find((t) => t.metadata.id === targetTheme);
    return themeConfig?.metadata || null;
  }, [state.themes, targetTheme]);
}
