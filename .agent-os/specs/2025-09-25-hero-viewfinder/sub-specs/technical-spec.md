# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-25-hero-viewfinder/spec.md

> Created: 2025-09-25
> Version: 1.0.0

## Technical Requirements

### React Component Architecture

**Core Component Interface:**
```typescript
interface HeroViewfinderProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onShutterClick?: () => void;
  metadata?: {
    aperture?: string;
    shutter?: string;
    iso?: string;
    focal?: string;
    camera?: string;
    lens?: string;
  };
  autoFocus?: boolean;
  initialBlur?: boolean;
}

interface ViewfinderState {
  isLoading: boolean;
  isFocused: boolean;
  isShutterActive: boolean;
  imageLoaded: boolean;
  error?: string;
}
```

**Component Hierarchy:**
- `HeroViewfinder` (main container)
  - `ViewfinderFrame` (camera overlay UI)
  - `MetadataHUD` (camera settings display)
  - `ImageContainer` (optimized image with blur states)
  - `ShutterButton` (interactive trigger)
  - `FocusIndicators` (AF points and focus confirmation)

### Framer Motion Implementation

**Animation Variants:**
```typescript
const blurVariants = {
  blurred: {
    filter: "blur(8px)",
    scale: 1.02,
    transition: { duration: 0.12 }
  },
  focused: {
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.47,
      ease: [0.23, 1, 0.32, 1],
      delay: 0.12
    }
  }
};

const shutterVariants = {
  idle: { opacity: 1, scale: 1 },
  setup: {
    opacity: 0.95,
    transition: { duration: 0.12 }
  },
  approach: {
    opacity: 0.7,
    scale: 0.98,
    transition: { duration: 0.22 }
  },
  impact: {
    opacity: 0.1,
    scale: 0.95,
    transition: { duration: 0.09 }
  },
  followThrough: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.16 }
  }
};
```

**Performance Optimizations:**
- Transform and opacity only animations for 60fps performance
- `will-change: transform, opacity` CSS properties
- Hardware acceleration with `transform3d(0,0,0)`
- Motion value reuse to prevent layout thrashing

### Vite Image Optimization

**Image Component Configuration:**
```typescript
<img
  src={optimizedSrc}
  alt={alt}
  className="w-full h-full object-cover"
  onLoad={handleImageLoad}
  onError={handleImageError}
  loading="eager" // For hero image priority
  decoding="async"
/>
```

**LCP Optimization Strategy:**
- Vite asset optimization with `?url` imports
- Manual responsive image handling with srcSet
- WebP/AVIF format conversion via Vite plugins
- Preload hints for critical hero image

### Tailwind CSS Integration

**Custom Design Tokens Extension:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'court-navy': '#0B2239',
        'court-orange': '#ff6b35',
        'brand-violet': '#6366f1',
        'viewfinder': {
          overlay: 'rgba(0, 0, 0, 0.3)',
          grid: 'rgba(255, 255, 255, 0.2)',
          focus: '#00ff41',
          inactive: 'rgba(255, 255, 255, 0.6)'
        }
      },
      animation: {
        'focus-pulse': 'focus-pulse 2s ease-in-out infinite',
        'shutter-sequence': 'shutter-sequence 0.59s ease-out',
        'metadata-slide': 'metadata-slide 0.3s ease-out'
      },
      keyframes: {
        'focus-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        }
      }
    }
  }
}
```

### Accessibility Implementation

**Reduced Motion Support:**
```typescript
const prefersReducedMotion = useReducedMotion();

const animationProps = prefersReducedMotion
  ? { initial: false, animate: false }
  : { variants: blurVariants, initial: "blurred", animate: "focused" };
```

**Keyboard Navigation:**
- Tab navigation through interactive elements
- Space/Enter key shutter activation
- Escape key to reset focus state
- ARIA labels for screen readers

**Focus Management:**
```typescript
const focusManagement = {
  'aria-label': 'Camera viewfinder with shutter control',
  'role': 'img',
  'tabIndex': 0,
  'onKeyDown': handleKeyboardInteraction,
  'aria-describedby': 'camera-metadata'
};
```

## Approach

### Component Structure

**1. Container Layer:**
- Full viewport height (100dvh) responsive container
- CSS Grid layout for precise element positioning
- Z-index management for layered UI elements

**2. Image Layer:**
- Vite-optimized image with blur-to-focus animation
- Error boundary for failed image loads
- Loading state management with skeleton UI

**3. Overlay Layer:**
- SVG-based viewfinder frame with CSS Grid lines
- Animated focus points with spring physics
- Metadata HUD with camera settings display

**4. Interaction Layer:**
- Touch and click event handling for shutter
- Keyboard accessibility with proper focus indicators
- Gesture recognition for mobile interactions

### Animation Timing Architecture

**Focus Sequence (590ms total):**
1. Setup Phase (120ms): Initial blur state recognition
2. Approach Phase (220ms): Gradual blur reduction with scale adjustment
3. Impact Phase (90ms): Final focus achievement with micro-bounce
4. Follow-through Phase (160ms): Settle into final state

**Shutter Sequence (590ms total):**
1. Setup (120ms): Button press recognition
2. Approach (220ms): Shutter closing animation
3. Impact (90ms): Full closure with flash effect
4. Follow-through (160ms): Shutter reopening

### State Management

**Focus State Machine:**
```typescript
type FocusState = 'idle' | 'focusing' | 'focused' | 'lost';
type ShutterState = 'ready' | 'firing' | 'processing' | 'complete';

const useCameraState = () => {
  const [focusState, setFocusState] = useState<FocusState>('idle');
  const [shutterState, setShutterState] = useState<ShutterState>('ready');

  return { focusState, shutterState, triggers: { focus, shutter, reset } };
};
```

### Mobile Optimization

**Viewport Handling:**
- Use `100dvh` for accurate mobile viewport height
- Touch event optimization with `touch-action: manipulation`
- Responsive metadata positioning with CSS Grid

**Performance Considerations:**
- GPU acceleration for all animated elements
- Minimize repaints with transform-only animations
- Lazy load non-critical UI elements

## External Dependencies

### Required New Dependencies

**Framer Motion (Latest Version):**
```json
{
  "framer-motion": "^10.16.0"
}
```
- Advanced animation sequencing
- Spring physics for natural motion
- Gesture recognition system
- Performance optimized animations

**React Intersection Observer:**
```json
{
  "react-intersection-observer": "^9.5.0"
}
```
- Viewport detection for auto-focus trigger
- Performance optimization for scroll-based animations

### Optional Performance Dependencies

**React Window (for metadata lists):**
```json
{
  "react-window": "^1.8.0"
}
```
- Virtualized rendering for large metadata sets

**Use-Debounce (for interaction optimization):**
```json
{
  "use-debounce": "^9.0.0"
}
```
- Debounced interactions for better UX
- Performance optimization for rapid inputs

### Native Web APIs

**Required Browser Features:**
- CSS `backdrop-filter` for blur effects
- `IntersectionObserver` for viewport detection
- `ResizeObserver` for responsive behavior
- Touch events for mobile interaction

**Progressive Enhancement:**
- Fallback blur implementation using CSS transform
- Graceful degradation for older browsers
- Feature detection for advanced capabilities

## Implementation Details

### Error Handling Strategy

**Image Loading Failures:**
```typescript
const handleImageError = useCallback((error: Error) => {
  setError('Failed to load hero image');
  // Fallback to solid color background
  // Log error for monitoring
  // Show retry mechanism
}, []);
```

**Animation Performance Issues:**
- Frame rate monitoring with `performance.now()`
- Automatic fallback to CSS transitions
- Reduced animation complexity on low-end devices

### Testing Requirements

**Unit Tests:**
- Component rendering with various prop combinations
- Animation state transitions
- Keyboard interaction handling
- Error boundary behavior

**Integration Tests:**
- Image loading and optimization
- Animation timing accuracy
- Accessibility compliance
- Mobile touch interactions

**Performance Tests:**
- Animation frame rate monitoring
- Memory usage during transitions
- Load time impact measurement
- LCP optimization validation

### Browser Support

**Target Browsers:**
- Chrome 90+ (full feature support)
- Firefox 88+ (full feature support)
- Safari 14+ (partial backdrop-filter support)
- Edge 90+ (full feature support)

**Fallback Strategy:**
- CSS-only animations for unsupported browsers
- Static image for no-JS environments
- Basic focus indicators without advanced animations