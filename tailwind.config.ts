import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Existing brand colors (preserved for backward compatibility)
      colors: {
        'brand-dark': '#0a0a0f',
        'brand-violet': '#8b5cf6',
        'brand-light': '#f0f0f5',
        // Athletic design token colors
        'athletic-court-navy': '#1a365d',
        'athletic-court-orange': '#ea580c',
        'athletic-brand-violet': '#7c3aed',
        // Semantic athletic colors
        'athletic-success': '#10b981',
        'athletic-warning': '#f59e0b',
        'athletic-error': '#ef4444',
        // Athletic neutral scale
        'athletic-neutral-50': '#fafafa',
        'athletic-neutral-100': '#f5f5f5',
        'athletic-neutral-200': '#e5e5e5',
        'athletic-neutral-300': '#d4d4d4',
        'athletic-neutral-400': '#a3a3a3',
        'athletic-neutral-500': '#737373',
        'athletic-neutral-600': '#525252',
        'athletic-neutral-700': '#404040',
        'athletic-neutral-800': '#262626',
        'athletic-neutral-900': '#171717',
        'athletic-neutral-950': '#0a0a0a',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      // Extended with athletic timing system
      transitionDuration: {
        'quick-snap': '90ms',
        'reaction': '120ms',
        'transition': '160ms',
        'sequence': '220ms',
        'flash': '60ms',
        'flow': '300ms',
        'power': '400ms',
      },
      transitionTimingFunction: {
        'athletic-snap': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'athletic-flow': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'athletic-power': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'athletic-precision': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'athletic-sprint': 'cubic-bezier(0.55, 0, 0.1, 1)',
        'athletic-glide': 'cubic-bezier(0.25, 0, 0.75, 1)',
      },
      animation: {
        // Existing animations (preserved)
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'subtle-float': 'subtle-float 6s ease-in-out infinite',
        // Athletic timing animations
        'quick-snap': 'quickSnap 90ms cubic-bezier(0.4, 0, 0.2, 1)',
        'reaction': 'reaction 120ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'athletic-transition': 'athleticTransition 160ms cubic-bezier(0.4, 0, 0.6, 1)',
        'sequence': 'sequence 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      keyframes: {
        // Existing keyframes (preserved)
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'subtle-float': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        // Athletic animation keyframes
        'quickSnap': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'reaction': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'athleticTransition': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'sequence': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default config