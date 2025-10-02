/**
 * Demo Components Configuration
 *
 * Centralized configuration for all component demos
 * in the test harness.
 */

export interface DemoComponentConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  controls?: {
    [key: string]: {
      type: 'button' | 'slider' | 'toggle' | 'select';
      label: string;
      options?: any[];
      min?: number;
      max?: number;
      step?: number;
      defaultValue?: any;
    };
  };
  states?: string[];
  codeSnippet?: string;
}

export const DEMO_CATEGORIES = {
  animations: {
    id: 'animations',
    title: 'Animations',
    icon: '🎬',
    description: 'Scroll-triggered and interactive animations',
  },
  effects: {
    id: 'effects',
    title: 'Effects',
    icon: '✨',
    description: 'Visual effects and enhancements',
  },
  interactive: {
    id: 'interactive',
    title: 'Interactive',
    icon: '🎯',
    description: 'Interactive components and controls',
  },
  sections: {
    id: 'sections',
    title: 'Section Transitions',
    icon: '📄',
    description: 'Section-level animations and transitions',
  },
};

export const demoComponents: DemoComponentConfig[] = [
  // ANIMATIONS
  {
    id: 'fade-up-8px',
    title: 'Fade Up Animation (8px)',
    description: 'Element fades in while translating up 8 pixels',
    category: 'animations',
    controls: {
      trigger: {
        type: 'button',
        label: 'Trigger Animation',
      },
      speed: {
        type: 'select',
        label: 'Speed',
        options: ['fast', 'normal', 'slow', 'off'],
        defaultValue: 'normal',
      },
    },
    states: ['hidden', 'animating', 'visible'],
    codeSnippet: `className="opacity-0 translate-y-8 transition-all duration-500"
// Becomes: opacity-100 translate-y-0`,
  },
  {
    id: 'fade-up-24px',
    title: 'Fade Up Animation (24px)',
    description: 'Element fades in while translating up 24 pixels (more dramatic)',
    category: 'animations',
    controls: {
      trigger: {
        type: 'button',
        label: 'Trigger Animation',
      },
      speed: {
        type: 'select',
        label: 'Speed',
        options: ['fast', 'normal', 'slow'],
        defaultValue: 'normal',
      },
    },
    states: ['hidden', 'animating', 'visible'],
    codeSnippet: `className="opacity-0 translate-y-24 transition-all duration-700"`,
  },
  {
    id: 'slide-animation',
    title: 'Slide Animation',
    description: 'Element slides in from the side',
    category: 'animations',
    controls: {
      direction: {
        type: 'select',
        label: 'Direction',
        options: ['left', 'right', 'up', 'down'],
        defaultValue: 'left',
      },
      distance: {
        type: 'slider',
        label: 'Distance',
        min: 8,
        max: 48,
        step: 8,
        defaultValue: 16,
      },
    },
    states: ['hidden', 'animating', 'visible'],
  },
  {
    id: 'scale-animation',
    title: 'Scale Animation',
    description: 'Element scales up from smaller size',
    category: 'animations',
    controls: {
      startScale: {
        type: 'select',
        label: 'Start Scale',
        options: ['0.95', '0.90', '0.85'],
        defaultValue: '0.95',
      },
    },
    states: ['hidden', 'animating', 'visible'],
    codeSnippet: `className="opacity-0 scale-95 transition-all duration-500"`,
  },
  {
    id: 'blur-morph',
    title: 'Blur Morph Animation',
    description: 'Element fades in from blurred state',
    category: 'animations',
    controls: {
      blurAmount: {
        type: 'select',
        label: 'Blur Amount',
        options: ['blur-sm', 'blur-md', 'blur-lg'],
        defaultValue: 'blur-sm',
      },
    },
    states: ['hidden', 'animating', 'visible'],
    codeSnippet: `className="opacity-0 blur-sm scale-95 transition-all duration-500"`,
  },

  // EFFECTS
  {
    id: 'parallax-subtle',
    title: 'Parallax Effect (Subtle)',
    description: 'Background moves at different speed during scroll',
    category: 'effects',
    controls: {
      intensity: {
        type: 'slider',
        label: 'Intensity',
        min: 0.1,
        max: 0.5,
        step: 0.1,
        defaultValue: 0.2,
      },
      enabled: {
        type: 'toggle',
        label: 'Enabled',
        defaultValue: true,
      },
    },
    states: ['idle', 'scrolling'],
  },
  {
    id: 'spotlight-cursor',
    title: 'Spotlight Cursor',
    description: 'Custom cursor with spotlight effect',
    category: 'effects',
    controls: {
      radius: {
        type: 'slider',
        label: 'Radius',
        min: 100,
        max: 400,
        step: 50,
        defaultValue: 200,
      },
      opacity: {
        type: 'slider',
        label: 'Opacity',
        min: 0.1,
        max: 1.0,
        step: 0.1,
        defaultValue: 0.3,
      },
      enabled: {
        type: 'toggle',
        label: 'Enabled',
        defaultValue: false,
      },
    },
    states: ['idle', 'moving'],
  },
  {
    id: 'glow-effects',
    title: 'Glow Effects',
    description: 'Progressive glow on interactive elements',
    category: 'effects',
    controls: {
      intensity: {
        type: 'select',
        label: 'Intensity',
        options: ['low', 'medium', 'high'],
        defaultValue: 'medium',
      },
      enabled: {
        type: 'toggle',
        label: 'Enabled',
        defaultValue: true,
      },
    },
    states: ['idle', 'hover', 'active'],
  },

  // INTERACTIVE
  {
    id: 'magnetic-button',
    title: 'Magnetic Button',
    description: 'Button responds to cursor proximity with transform and glow',
    category: 'interactive',
    controls: {
      strength: {
        type: 'slider',
        label: 'Strength',
        min: 0.1,
        max: 0.5,
        step: 0.1,
        defaultValue: 0.2,
      },
      radius: {
        type: 'slider',
        label: 'Radius',
        min: 50,
        max: 200,
        step: 25,
        defaultValue: 100,
      },
      enabled: {
        type: 'toggle',
        label: 'Enabled',
        defaultValue: true,
      },
    },
    states: ['idle', 'hover', 'magnetic', 'active'],
    codeSnippet: `const { ref, transform } = useMagneticEffect({
  strength: 0.2,
  radius: 100
});`,
  },
  {
    id: 'effects-panel',
    title: 'Effects Panel HUD',
    description: 'Camera-themed settings panel for customizing animations',
    category: 'interactive',
    controls: {
      position: {
        type: 'select',
        label: 'Position',
        options: ['bottom-right', 'bottom-left', 'top-right'],
        defaultValue: 'bottom-right',
      },
    },
    states: ['closed', 'open', 'animating'],
  },
  {
    id: 'keyboard-nav',
    title: 'Keyboard Navigation',
    description: 'Full keyboard support with Tab, Enter, Space, Escape',
    category: 'interactive',
    controls: {
      showFocusIndicators: {
        type: 'toggle',
        label: 'Show Focus',
        defaultValue: true,
      },
    },
    states: ['idle', 'focused', 'activated'],
  },

  // SECTION TRANSITIONS
  {
    id: 'section-fade-slide',
    title: 'Section Fade + Slide',
    description: 'Entire section fades and slides into view',
    category: 'sections',
    controls: {
      distance: {
        type: 'slider',
        label: 'Distance',
        min: 8,
        max: 48,
        step: 8,
        defaultValue: 24,
      },
      duration: {
        type: 'slider',
        label: 'Duration (ms)',
        min: 300,
        max: 1000,
        step: 100,
        defaultValue: 700,
      },
    },
    states: ['hidden', 'entering', 'visible'],
  },
  {
    id: 'section-border',
    title: 'Section Border Animation',
    description: 'Animated border appears at section boundary',
    category: 'sections',
    controls: {
      color: {
        type: 'select',
        label: 'Color',
        options: ['violet', 'blue', 'green'],
        defaultValue: 'violet',
      },
      style: {
        type: 'select',
        label: 'Style',
        options: ['solid', 'gradient', 'animated'],
        defaultValue: 'gradient',
      },
    },
    states: ['hidden', 'animating', 'visible'],
  },
  {
    id: 'staggered-content',
    title: 'Staggered Content Animation',
    description: 'Content elements animate in sequence with delays',
    category: 'sections',
    controls: {
      baseDelay: {
        type: 'slider',
        label: 'Base Delay (ms)',
        min: 50,
        max: 300,
        step: 50,
        defaultValue: 150,
      },
      elementCount: {
        type: 'slider',
        label: 'Elements',
        min: 2,
        max: 6,
        step: 1,
        defaultValue: 4,
      },
    },
    states: ['idle', 'staggering', 'complete'],
  },
];

export const getDemosByCategory = (category: string) => {
  return demoComponents.filter((demo) => demo.category === category);
};

export const getDemoById = (id: string) => {
  return demoComponents.find((demo) => demo.id === id);
};

export default demoComponents;
