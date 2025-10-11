/**
 * Experimental Layout Type Definitions
 *
 * Type system for the experimental design trend showcase layout
 */

export type DesignTheme =
  | 'glassmorphism'
  | 'bento-grid'
  | 'neumorphism'
  | 'neobrutalism'
  | 'retrofuturism'
  | 'bold-minimalism';

export interface ThemeMetadata {
  id: DesignTheme;
  name: string;
  description: string;
  icon: string; // Icon component name or emoji
  category: 'modern' | 'experimental' | 'classic';
  difficulty: 'easy' | 'medium' | 'hard';
  accessibility: 'excellent' | 'good' | 'challenging';
}

export interface ThemeConfig {
  metadata: ThemeMetadata;
  cssVariables: Record<string, string>;
  componentVariant: string;
}

export interface ExperimentalLayoutState {
  currentTheme: DesignTheme;
  isTransitioning: boolean;
  transitionDuration: number; // milliseconds
  themes: ThemeConfig[];
  previousTheme: DesignTheme | null;
}

export interface ExperimentalLayoutActions {
  switchTheme: (theme: DesignTheme) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  resetToDefault: () => void;
}

export interface ExperimentalLayoutContextValue {
  state: ExperimentalLayoutState;
  actions: ExperimentalLayoutActions;
}

// Theme selector component props
export interface ThemeSelectorProps {
  position?: 'top-right' | 'bottom-sheet';
  className?: string;
}

// Theme icon mapping
export const THEME_ICONS: Record<DesignTheme, string> = {
  'glassmorphism': '🪟', // Frosted glass pane
  'bento-grid': '🍱', // Bento box
  'neumorphism': '⚪', // Soft circle
  'neobrutalism': '⬛', // Bold square
  'retrofuturism': '🌐', // Neon wireframe
  'bold-minimalism': '⚫', // Single bold dot
};

// Theme metadata configurations
export const THEME_METADATA: Record<DesignTheme, ThemeMetadata> = {
  'glassmorphism': {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass surfaces with depth and translucency',
    icon: '🪟',
    category: 'modern',
    difficulty: 'medium',
    accessibility: 'good',
  },
  'bento-grid': {
    id: 'bento-grid',
    name: 'Bento Grid',
    description: 'Modular compartmentalized layout',
    icon: '🍱',
    category: 'modern',
    difficulty: 'easy',
    accessibility: 'excellent',
  },
  'neumorphism': {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Soft, tactile, extruded UI elements',
    icon: '⚪',
    category: 'experimental',
    difficulty: 'hard',
    accessibility: 'challenging',
  },
  'neobrutalism': {
    id: 'neobrutalism',
    name: 'Neobrutalism',
    description: 'Raw, bold, function-first aesthetics',
    icon: '⬛',
    category: 'experimental',
    difficulty: 'medium',
    accessibility: 'good',
  },
  'retrofuturism': {
    id: 'retrofuturism',
    name: 'Retrofuturism',
    description: '80s/90s sci-fi nostalgia meets modern tech',
    icon: '🌐',
    category: 'experimental',
    difficulty: 'hard',
    accessibility: 'good',
  },
  'bold-minimalism': {
    id: 'bold-minimalism',
    name: 'Bold Minimalism',
    description: 'Less is impactful - strategic boldness',
    icon: '⚫',
    category: 'classic',
    difficulty: 'easy',
    accessibility: 'excellent',
  },
};
