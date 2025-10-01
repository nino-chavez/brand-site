/**
 * EffectsContext - User-Controlled Visual Effects
 *
 * Photography-themed effects panel allowing users to customize
 * animation styles and visual effects throughout the portfolio.
 *
 * @version 1.0.0
 * @since WOW Factor Enhancement
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AnimationStyle = 'fade-up' | 'slide' | 'scale' | 'blur-morph' | 'clip-reveal';
export type TransitionSpeed = 'fast' | 'normal' | 'slow' | 'off';
export type ParallaxIntensity = 'subtle' | 'normal' | 'intense' | 'off';

interface EffectsSettings {
  animationStyle: AnimationStyle;
  transitionSpeed: TransitionSpeed;
  parallaxIntensity: ParallaxIntensity;
  enableMotionBlur: boolean;
  enableParticles: boolean;
  enableGlow: boolean;
  enableViewfinder: boolean;
}

interface EffectsContextType {
  settings: EffectsSettings;
  updateSetting: <K extends keyof EffectsSettings>(
    key: K,
    value: EffectsSettings[K]
  ) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: EffectsSettings = {
  animationStyle: 'fade-up',
  transitionSpeed: 'normal',
  parallaxIntensity: 'normal',
  enableMotionBlur: false,
  enableParticles: false,
  enableGlow: true,
  enableViewfinder: true,
};

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

export const EffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<EffectsSettings>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('portfolio-effects');
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch {
          return DEFAULT_SETTINGS;
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Save to localStorage when settings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-effects', JSON.stringify(settings));
    }
  }, [settings]);

  const updateSetting = <K extends keyof EffectsSettings>(
    key: K,
    value: EffectsSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <EffectsContext.Provider value={{ settings, updateSetting, resetToDefaults }}>
      {children}
    </EffectsContext.Provider>
  );
};

export const useEffects = () => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within EffectsProvider');
  }
  return context;
};

export default EffectsContext;
