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
    description: 'Entrance animations with configurable timing, distance, and easing curves. Maintains 60fps performance on Chrome 90+, Firefox 88+, Safari 14+.',
  },
  effects: {
    id: 'effects',
    title: 'Effects',
    icon: '✨',
    description: 'Visual enhancements within performance budgets. Each effect includes <16ms frame time impact metrics.',
  },
  interactive: {
    id: 'interactive',
    title: 'Interactive',
    icon: '🎯',
    description: 'Interactive components with sub-100ms visual feedback on user input. Magnetic attraction (20-200px radius), keyboard navigation (WCAG 2.1.1), and state-aware animations.',
  },
  sections: {
    id: 'sections',
    title: 'Section Transitions',
    icon: '📄',
    description: 'Section transitions with preserved focus management and reduced-motion media query support (prefers-reduced-motion).',
  },
  hoverStates: {
    id: 'hoverStates',
    title: 'Hover States',
    icon: '🎨',
    description: 'Sub-200ms hover feedback with pointer-precision offset tracking. Desktop-optimized for precision pointing devices.',
  },
  clickStates: {
    id: 'clickStates',
    title: 'Click/Active States',
    icon: '🖱️',
    description: 'Immediate visual confirmation of user actions within 100ms. Press states include ripple effects (300-600ms duration) and scale transforms (0.95-0.98).',
  },
  mobileTouch: {
    id: 'mobileTouch',
    title: 'Mobile Touch',
    icon: '📱',
    description: 'WCAG 2.5.5 compliant touch targets. All interactive elements minimum 44x44px with haptic feedback on supporting devices.',
  },
  passiveStates: {
    id: 'passiveStates',
    title: 'Passive States',
    icon: '⏳',
    description: 'Loading indicators that signal system responsiveness and reduce perceived wait time. Skeleton screens and spinners with 300-1000ms configurable timing.',
  },
  aiFeatures: {
    id: 'aiFeatures',
    title: 'AI Features',
    icon: '🤖',
    description: 'Gemini-powered AI features with comprehensive cost protection. Resume tailoring (~$0.002), recruiter match analysis (~$0.002), semantic search ($0.0001), photo analysis (~$0.005), contextual recommendations ($0), and cross-site discovery ($0). Multi-layer rate limiting (5-10/hr), bot detection, and $50/month hard cap.',
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

  // HOVER STATES
  {
    id: 'button-hover',
    title: 'Button Hover',
    description: 'Button hover with scale and glow',
    category: 'hoverStates',
    controls: {
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['primary', 'secondary', 'outline'],
        defaultValue: 'primary',
      },
      glowIntensity: {
        type: 'slider',
        label: 'Glow Intensity',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.5,
      },
    },
    states: ['idle', 'hover', 'active'],
    codeSnippet: `className="transition-all hover:scale-105 hover:shadow-lg"`,
  },
  {
    id: 'card-hover',
    title: 'Card Hover',
    description: 'Card lift with shadow enhancement',
    category: 'hoverStates',
    controls: {
      liftHeight: {
        type: 'slider',
        label: 'Lift Height (px)',
        min: 2,
        max: 16,
        step: 2,
        defaultValue: 8,
      },
      shadowIntensity: {
        type: 'select',
        label: 'Shadow Intensity',
        options: ['sm', 'md', 'lg', 'xl'],
        defaultValue: 'lg',
      },
    },
    states: ['idle', 'hover'],
    codeSnippet: `className="transition-all hover:-translate-y-2 hover:shadow-xl"`,
  },
  {
    id: 'image-zoom',
    title: 'Image Zoom',
    description: 'Image zoom on hover with overlay',
    category: 'hoverStates',
    controls: {
      zoomScale: {
        type: 'slider',
        label: 'Zoom Scale',
        min: 1.05,
        max: 1.3,
        step: 0.05,
        defaultValue: 1.1,
      },
      overlayOpacity: {
        type: 'slider',
        label: 'Overlay Opacity',
        min: 0,
        max: 0.8,
        step: 0.1,
        defaultValue: 0.3,
      },
    },
    states: ['idle', 'hover'],
    codeSnippet: `className="overflow-hidden">
  <img className="transition-transform duration-500 hover:scale-110"`,
  },
  {
    id: 'icon-hover',
    title: 'Icon Hover',
    description: 'Icon animations (rotate/scale/bounce/spin)',
    category: 'hoverStates',
    controls: {
      animation: {
        type: 'select',
        label: 'Animation',
        options: ['rotate', 'scale', 'bounce', 'spin'],
        defaultValue: 'rotate',
      },
      speed: {
        type: 'select',
        label: 'Speed',
        options: ['fast', 'normal', 'slow'],
        defaultValue: 'normal',
      },
    },
    states: ['idle', 'hover'],
    codeSnippet: `className="transition-transform hover:rotate-12"`,
  },
  {
    id: 'link-hover',
    title: 'Link Hover',
    description: 'Link underline animations (fade/slide/grow)',
    category: 'hoverStates',
    controls: {
      style: {
        type: 'select',
        label: 'Style',
        options: ['fade', 'slide', 'grow'],
        defaultValue: 'slide',
      },
      thickness: {
        type: 'slider',
        label: 'Thickness (px)',
        min: 1,
        max: 4,
        step: 1,
        defaultValue: 2,
      },
    },
    states: ['idle', 'hover'],
    codeSnippet: `className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all hover:after:w-full"`,
  },
  {
    id: 'group-hover',
    title: 'Group Hover',
    description: 'Group hover cascade with stagger',
    category: 'hoverStates',
    controls: {
      staggerDelay: {
        type: 'slider',
        label: 'Stagger Delay (ms)',
        min: 50,
        max: 300,
        step: 50,
        defaultValue: 100,
      },
      itemCount: {
        type: 'slider',
        label: 'Items',
        min: 3,
        max: 8,
        step: 1,
        defaultValue: 5,
      },
    },
    states: ['idle', 'group-hover'],
    codeSnippet: `className="group">
  <div className="transition-all group-hover:translate-x-2 delay-[0ms]">
  <div className="transition-all group-hover:translate-x-2 delay-[100ms]">`,
  },

  // CLICK STATES
  {
    id: 'button-press',
    title: 'Button Press',
    description: 'Button press with scale-98 and ripple',
    category: 'clickStates',
    controls: {
      rippleEnabled: {
        type: 'toggle',
        label: 'Ripple Effect',
        defaultValue: true,
      },
      feedbackStrength: {
        type: 'select',
        label: 'Feedback',
        options: ['subtle', 'normal', 'strong'],
        defaultValue: 'normal',
      },
    },
    states: ['idle', 'pressed', 'released'],
    codeSnippet: `className="active:scale-98 transition-transform"
onMouseDown={() => setPressed(true)}`,
  },
  {
    id: 'form-focus',
    title: 'Form Focus',
    description: 'Input focus with border and shadow',
    category: 'clickStates',
    controls: {
      borderColor: {
        type: 'select',
        label: 'Border Color',
        options: ['blue', 'violet', 'green'],
        defaultValue: 'violet',
      },
      glowEnabled: {
        type: 'toggle',
        label: 'Glow Effect',
        defaultValue: true,
      },
    },
    states: ['idle', 'focused', 'filled'],
    codeSnippet: `className="border-2 border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"`,
  },
  {
    id: 'toggle-switch',
    title: 'Toggle Switch',
    description: 'Animated toggle on/off',
    category: 'clickStates',
    controls: {
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      color: {
        type: 'select',
        label: 'Color',
        options: ['blue', 'violet', 'green'],
        defaultValue: 'violet',
      },
    },
    states: ['off', 'on', 'transitioning'],
    codeSnippet: `const [enabled, setEnabled] = useState(false);
className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors \${enabled ? 'bg-violet-500' : 'bg-gray-300'}\`}`,
  },
  {
    id: 'accordion',
    title: 'Accordion',
    description: 'Expandable accordion items',
    category: 'clickStates',
    controls: {
      itemCount: {
        type: 'slider',
        label: 'Items',
        min: 2,
        max: 5,
        step: 1,
        defaultValue: 3,
      },
      expandSpeed: {
        type: 'select',
        label: 'Speed',
        options: ['fast', 'normal', 'slow'],
        defaultValue: 'normal',
      },
    },
    states: ['collapsed', 'expanding', 'expanded', 'collapsing'],
    codeSnippet: `<div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? '500px' : '0' }}>`,
  },
  {
    id: 'modal-dialog',
    title: 'Modal Dialog',
    description: 'Modal open/close with backdrop',
    category: 'clickStates',
    controls: {
      animation: {
        type: 'select',
        label: 'Animation',
        options: ['fade', 'slide', 'scale'],
        defaultValue: 'scale',
      },
      backdropBlur: {
        type: 'toggle',
        label: 'Backdrop Blur',
        defaultValue: true,
      },
    },
    states: ['closed', 'opening', 'open', 'closing'],
    codeSnippet: `{isOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm">
    <div className="scale-95 opacity-0 animate-modal-enter">`,
  },

  // MOBILE TOUCH
  {
    id: 'tap-feedback',
    title: 'Tap Feedback',
    description: 'Tap ripple feedback',
    category: 'mobileTouch',
    controls: {
      rippleColor: {
        type: 'select',
        label: 'Ripple Color',
        options: ['light', 'dark', 'primary'],
        defaultValue: 'primary',
      },
      duration: {
        type: 'slider',
        label: 'Duration (ms)',
        min: 300,
        max: 1000,
        step: 100,
        defaultValue: 600,
      },
    },
    states: ['idle', 'tapped', 'rippling'],
    codeSnippet: `onTouchStart={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;
  showRipple(x, y);
}}`,
  },
  {
    id: 'swipe-gesture',
    title: 'Swipe Gesture',
    description: 'Swipe detection (left/right/up/down)',
    category: 'mobileTouch',
    controls: {
      threshold: {
        type: 'slider',
        label: 'Threshold (px)',
        min: 30,
        max: 150,
        step: 10,
        defaultValue: 50,
      },
      enabledDirections: {
        type: 'select',
        label: 'Directions',
        options: ['all', 'horizontal', 'vertical'],
        defaultValue: 'all',
      },
    },
    states: ['idle', 'swiping', 'detected'],
    codeSnippet: `const handleTouchMove = (e: TouchEvent) => {
  const deltaX = e.touches[0].clientX - startX;
  const deltaY = e.touches[0].clientY - startY;
  if (Math.abs(deltaX) > threshold) {
    onSwipe(deltaX > 0 ? 'right' : 'left');
  }
}`,
  },
  {
    id: 'long-press',
    title: 'Long Press',
    description: 'Long press activation with progress',
    category: 'mobileTouch',
    controls: {
      duration: {
        type: 'slider',
        label: 'Duration (ms)',
        min: 500,
        max: 2000,
        step: 100,
        defaultValue: 800,
      },
      showProgress: {
        type: 'toggle',
        label: 'Show Progress',
        defaultValue: true,
      },
    },
    states: ['idle', 'pressing', 'activated', 'cancelled'],
    codeSnippet: `const timer = setTimeout(() => {
  onLongPress();
}, 800);

onTouchEnd={() => clearTimeout(timer)}`,
  },
  {
    id: 'touch-button',
    title: 'Touch Button',
    description: 'Touch-optimized button sizes',
    category: 'mobileTouch',
    controls: {
      size: {
        type: 'select',
        label: 'Size',
        options: ['standard', 'comfortable', 'large'],
        defaultValue: 'comfortable',
      },
      spacing: {
        type: 'slider',
        label: 'Spacing (px)',
        min: 8,
        max: 24,
        step: 4,
        defaultValue: 16,
      },
    },
    states: ['idle', 'touch', 'active'],
    codeSnippet: `className="min-h-[44px] min-w-[44px] px-6 py-3"
// WCAG 2.1: Touch targets should be at least 44x44px`,
  },

  // PASSIVE STATES
  {
    id: 'loading-spinner',
    title: 'Loading Spinner',
    description: 'Spinner variants (spin/pulse/dots/bars)',
    category: 'passiveStates',
    controls: {
      variant: {
        type: 'select',
        label: 'Variant',
        options: ['spin', 'pulse', 'dots', 'bars'],
        defaultValue: 'spin',
      },
      size: {
        type: 'select',
        label: 'Size',
        options: ['sm', 'md', 'lg'],
        defaultValue: 'md',
      },
      color: {
        type: 'select',
        label: 'Color',
        options: ['primary', 'secondary', 'white'],
        defaultValue: 'primary',
      },
    },
    states: ['loading'],
    codeSnippet: `<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>`,
  },
  {
    id: 'skeleton-screen',
    title: 'Skeleton Screen',
    description: 'Skeleton loading placeholder',
    category: 'passiveStates',
    controls: {
      layout: {
        type: 'select',
        label: 'Layout',
        options: ['card', 'list', 'profile'],
        defaultValue: 'card',
      },
      animationSpeed: {
        type: 'select',
        label: 'Animation',
        options: ['slow', 'normal', 'fast'],
        defaultValue: 'normal',
      },
    },
    states: ['loading', 'loaded'],
    codeSnippet: `<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>`,
  },
  {
    id: 'pulse-animation',
    title: 'Pulse Animation',
    description: 'Pulsing elements with speed/intensity controls',
    category: 'passiveStates',
    controls: {
      speed: {
        type: 'select',
        label: 'Speed',
        options: ['slow', 'normal', 'fast'],
        defaultValue: 'normal',
      },
      intensity: {
        type: 'slider',
        label: 'Intensity',
        min: 0.5,
        max: 1.0,
        step: 0.1,
        defaultValue: 0.8,
      },
    },
    states: ['pulsing'],
    codeSnippet: `className="animate-pulse"
// Custom: @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`,
  },
  {
    id: 'status-indicator',
    title: 'Status Indicator',
    description: 'Status badges and progress bars',
    category: 'passiveStates',
    controls: {
      type: {
        type: 'select',
        label: 'Type',
        options: ['badge', 'progress', 'dot'],
        defaultValue: 'badge',
      },
      status: {
        type: 'select',
        label: 'Status',
        options: ['success', 'warning', 'error', 'info'],
        defaultValue: 'success',
      },
    },
    states: ['idle', 'updating'],
    codeSnippet: `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>`,
  },

  // AI FEATURES
  {
    id: 'resume-generator',
    title: 'Smart Resume Generator (Job Seeker)',
    description: 'AI-powered resume tailoring from job descriptions using Gemini Pro. For job seekers to generate customized resumes.',
    category: 'aiFeatures',
    controls: {
      enabled: {
        type: 'toggle',
        label: 'Feature Enabled',
        defaultValue: true,
      },
    },
    states: ['idle', 'analyzing', 'generating', 'complete', 'rate-limited', 'captcha-required'],
    codeSnippet: `import { SmartResumeGenerator } from '@/components/ai/SmartResumeGenerator';

<SmartResumeGenerator />
// Cost: ~$0.002 per generation
// Rate limit: 5 per hour per user`,
  },
  {
    id: 'recruiter-match-analyzer',
    title: 'Recruiter Match Analyzer (Recruiter)',
    description: 'AI-powered candidate fit analysis for recruiters. Paste job description → get match score, strong points, gaps, and interview recommendations.',
    category: 'aiFeatures',
    controls: {
      enabled: {
        type: 'toggle',
        label: 'Feature Enabled',
        defaultValue: true,
      },
    },
    states: ['idle', 'analyzing', 'complete', 'rate-limited', 'captcha-required'],
    codeSnippet: `import { RecruiterMatchAnalyzer } from '@/components/ai/RecruiterMatchAnalyzer';

<RecruiterMatchAnalyzer />
// Cost: ~$0.002 per analysis
// Rate limit: 10 per session
// Output: Match score, gaps, interview focus areas`,
  },
  {
    id: 'skill-matcher',
    title: 'Semantic Skill Matcher',
    description: 'Client-side semantic search across 24 skills and projects',
    category: 'aiFeatures',
    controls: {
      maxResults: {
        type: 'slider',
        label: 'Max Results',
        min: 3,
        max: 10,
        step: 1,
        defaultValue: 5,
      },
      showHistory: {
        type: 'toggle',
        label: 'Show Search History',
        defaultValue: true,
      },
    },
    states: ['idle', 'searching', 'results', 'no-results'],
    codeSnippet: `import { SkillMatcher } from '@/components/ai/SkillMatcher';

<SkillMatcher />
// Cost: ~$0.0001 per search (embedding query only)
// Pre-computed embeddings: 491KB`,
  },
  {
    id: 'composition-analyzer',
    title: 'Photo Composition Analyzer',
    description: 'AI photo analysis with Gemini Vision (composition, lighting, timing)',
    category: 'aiFeatures',
    controls: {
      enabled: {
        type: 'toggle',
        label: 'Feature Enabled',
        defaultValue: true,
      },
      cacheEnabled: {
        type: 'toggle',
        label: 'Response Caching',
        defaultValue: true,
      },
    },
    states: ['idle', 'uploading', 'analyzing', 'complete', 'session-limit'],
    codeSnippet: `import { CompositionAnalyzer } from '@/components/ai/CompositionAnalyzer';

<CompositionAnalyzer />
// Cost: ~$0.005 per analysis
// Session limit: 3 analyses
// Response caching: SHA-256 image hash`,
  },
  {
    id: 'content-discovery',
    title: 'Cross-Site Content Discovery',
    description: 'Find related content across blog.nino.photos and gallery.nino.photos',
    category: 'aiFeatures',
    controls: {
      maxResults: {
        type: 'slider',
        label: 'Max Results',
        min: 3,
        max: 12,
        step: 1,
        defaultValue: 8,
      },
      siteFilter: {
        type: 'select',
        label: 'Site Filter',
        options: ['all', 'blog', 'gallery'],
        defaultValue: 'all',
      },
    },
    states: ['idle', 'searching', 'results', 'no-results'],
    codeSnippet: `import { ContentDiscovery } from '@/components/ai/ContentDiscovery';

<ContentDiscovery
  context="action sports photography"
  maxResults={8}
  siteFilter="all"
/>
// Cost: $0 (pre-computed embeddings, client-side search)`,
  },
  {
    id: 'contextual-recommendations',
    title: 'Contextual Recommendations',
    description: 'Smart navigation suggestions based on current portfolio section',
    category: 'aiFeatures',
    controls: {
      maxRecommendations: {
        type: 'slider',
        label: 'Max Recommendations',
        min: 2,
        max: 5,
        step: 1,
        defaultValue: 3,
      },
      currentSection: {
        type: 'select',
        label: 'Current Section',
        options: ['capture', 'focus', 'frame', 'exposure', 'develop', 'portfolio'],
        defaultValue: 'capture',
      },
    },
    states: ['idle', 'loading', 'displayed'],
    codeSnippet: `import { ContextualRecommendations } from '@/components/ai/ContextualRecommendations';

<ContextualRecommendations
  currentSection="develop"
  maxRecommendations={3}
/>
// Cost: $0 (pre-computed at build time)`,
  },
  {
    id: 'cost-dashboard',
    title: 'Cost Monitoring Dashboard',
    description: 'Real-time AI usage tracking with budget alerts and feature controls',
    category: 'aiFeatures',
    controls: {
      showAlerts: {
        type: 'toggle',
        label: 'Show Budget Alerts',
        defaultValue: true,
      },
      refreshInterval: {
        type: 'select',
        label: 'Refresh Interval',
        options: ['1s', '5s', '10s', 'manual'],
        defaultValue: '5s',
      },
    },
    states: ['normal', 'warning-60', 'warning-90', 'budget-exceeded'],
    codeSnippet: `import { CostDashboard } from '@/components/ai/CostDashboard';

<CostDashboard />
// Monitors: Daily/monthly spend, per-feature usage
// Alerts: 60% ($30), 90% ($45) thresholds
// Hard cap: $50/month`,
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting System',
    description: 'Multi-layer cost protection (IP, session, daily, monthly)',
    category: 'aiFeatures',
    controls: {
      showLimits: {
        type: 'toggle',
        label: 'Show Current Limits',
        defaultValue: true,
      },
      testMode: {
        type: 'toggle',
        label: 'Test Mode (Low Limits)',
        defaultValue: false,
      },
    },
    states: ['within-limits', 'approaching-limit', 'rate-limited', 'reset-pending'],
    codeSnippet: `import { rateLimiter } from '@/utils/rateLimiter';

const check = await rateLimiter.checkLimit(
  userIP,
  'resume-generator',
  0.002
);

if (!check.allowed) {
  // Show rate limit message
  // Reset time: check.resetTime
}

// Limits:
// - IP: 10 requests/hour
// - Session: 5 requests/hour
// - Daily: 100 requests
// - Monthly: $50 hard cap`,
  },
  {
    id: 'bot-detection',
    title: 'Bot Detection System',
    description: 'Multi-signal bot analysis (honeypot, user-agent, mouse tracking, timing)',
    category: 'aiFeatures',
    controls: {
      sensitivity: {
        type: 'select',
        label: 'Detection Sensitivity',
        options: ['low', 'medium', 'high'],
        defaultValue: 'medium',
      },
      showSignals: {
        type: 'toggle',
        label: 'Show Detection Signals',
        defaultValue: true,
      },
    },
    states: ['analyzing', 'human-verified', 'suspicious', 'bot-blocked'],
    codeSnippet: `import { botDetector } from '@/utils/botDetection';

const check = await botDetector.checkRequest({
  userAgent: navigator.userAgent,
  referrer: document.referrer,
  honeypot,
  timing: botDetector.getFormDuration()
});

if (!check.passed) {
  // Escalate to CAPTCHA
  // Or block if confidence > 0.9
}

// Signals:
// - Honeypot fields (invisible to humans)
// - User-agent analysis
// - Mouse movement patterns
// - Form timing patterns
// - Browser feature detection`,
  },
];

export const getDemosByCategory = (category: string) => {
  return demoComponents.filter((demo) => demo.category === category);
};

export const getDemoById = (id: string) => {
  return demoComponents.find((demo) => demo.id === id);
};

export default demoComponents;
