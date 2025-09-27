# Viewfinder Hero Interface System

A comprehensive camera viewfinder interface for React applications featuring cursor-following crosshairs, dynamic focus effects, and professional camera aesthetics.

## Overview

The Viewfinder System provides an immersive camera-like interface where users can:
- Control a crosshair that tracks mouse movement with natural delay
- Experience dynamic focus/blur effects based on cursor position
- Capture "shots" with satisfying click feedback and visual effects
- View technical EXIF metadata in real-time
- Navigate using keyboard controls with full accessibility support

## Architecture

### Core Components

```
ViewfinderSystem/
├── components/
│   ├── ViewfinderOverlay.tsx          # Main interface container
│   ├── CrosshairSystem.tsx           # Crosshair and focus rings
│   ├── ExifMetadata.tsx              # Camera metadata display
│   ├── BlurContainer.tsx             # Dynamic blur effects
│   ├── ShutterEffect.tsx             # Capture animations
│   ├── KeyboardControls.tsx          # Keyboard navigation
│   └── ViewfinderErrorBoundary.tsx   # Error handling
├── hooks/
│   ├── useMouseTracking.ts           # 100ms delay mouse tracking
│   └── useViewfinder.ts              # Viewfinder state management
├── contexts/
│   └── ViewfinderContext.tsx         # Global state provider
├── types/
│   └── viewfinder.ts                 # TypeScript definitions
└── utils/
    └── browserCompat.ts              # Cross-browser compatibility
```

## Quick Start

### Basic Usage

```tsx
import { ViewfinderOverlay } from '@/components/ViewfinderOverlay';

function App() {
  const [isActive, setIsActive] = useState(false);

  const handleCapture = () => {
    console.log('Photo captured!');
    // Handle capture logic
  };

  return (
    <div className="relative">
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Close' : 'Open'} Viewfinder
      </button>

      <ViewfinderOverlay
        isActive={isActive}
        onCapture={handleCapture}
      />
    </div>
  );
}
```

### With Context Provider

```tsx
import { ViewfinderProvider, useViewfinder } from '@/contexts/ViewfinderContext';

function ViewfinderApp() {
  return (
    <ViewfinderProvider>
      <MainContent />
      <ViewfinderInterface />
    </ViewfinderProvider>
  );
}

function ViewfinderInterface() {
  const { isActive, toggleViewfinder, capture } = useViewfinder();

  return (
    <ViewfinderOverlay
      isActive={isActive}
      onCapture={capture}
    />
  );
}
```

## Component Reference

### ViewfinderOverlay

The main container component that orchestrates the entire viewfinder experience.

```tsx
interface ViewfinderOverlayProps {
  isActive?: boolean;           // Controls visibility
  className?: string;           // Additional CSS classes
  onCapture?: () => void;       // Capture callback
}

<ViewfinderOverlay
  isActive={true}
  onCapture={() => console.log('Captured!')}
  className="z-50"
/>
```

**Features:**
- 100ms mouse tracking delay for natural feel
- Hardware-accelerated animations (60fps)
- Automatic fade transitions (300ms duration)
- Keyboard controls (V to toggle, Enter/Space to capture)

### CrosshairSystem

Renders crosshairs, focus rings, and optional grid overlays.

```tsx
interface CrosshairSystemProps {
  position: { x: number; y: number };
  isActive: boolean;
  focusRadius?: number;
  crosshairStyle?: 'default' | 'camera' | 'precision' | 'minimal';
  theme?: 'light' | 'dark' | 'contrast' | 'neon';
  showGrid?: boolean;
  showRuleOfThirds?: boolean;
}

<CrosshairSystem
  position={{ x: 500, y: 400 }}
  isActive={true}
  focusRadius={150}
  crosshairStyle="camera"
  theme="dark"
  showRuleOfThirds={true}
/>
```

**Crosshair Styles:**
- `default`: Simple cross lines with center dot
- `camera`: Professional camera-style crosshair
- `precision`: Fine precision crosshair for detailed work
- `minimal`: Minimal design for subtle presence

### ExifMetadata

Displays camera settings and technical information.

```tsx
interface ExifMetadataProps {
  position: { x: number; y: number };
  isVisible: boolean;
  displayMode?: 'camera' | 'technical' | 'capture' | 'all';
  theme?: 'dark' | 'light' | 'camera';
  positioning?: 'relative' | 'smart' | 'fixed';
}

<ExifMetadata
  position={{ x: 520, y: 100 }}
  isVisible={true}
  displayMode="camera"
  theme="dark"
  positioning="smart" // Avoids screen edges
/>
```

**Display Modes:**
- `camera`: Shows camera model, lens, and settings
- `technical`: Shows React/performance metrics
- `capture`: Shows capture timestamp and position
- `all`: Shows all available information

### BlurContainer

Applies dynamic blur effects to content based on focus distance.

```tsx
interface BlurContainerProps {
  isActive: boolean;
  focusCenter: { x: number; y: number };
  focusRadius?: number;
  maxBlur?: number;
  children: React.ReactNode;
}

<BlurContainer
  isActive={true}
  focusCenter={{ x: 400, y: 300 }}
  focusRadius={200}
  maxBlur={8}
>
  <div>Content that will be selectively blurred</div>
</BlurContainer>
```

### KeyboardControls

Handles keyboard navigation and shortcuts.

```tsx
interface KeyboardControlsProps {
  isActive: boolean;
  onToggleViewfinder?: () => void;
  onCapture?: () => void;
  onShowHelp?: () => void;
}

<KeyboardControls
  isActive={true}
  onToggleViewfinder={() => setActive(!active)}
  onCapture={() => handleCapture()}
/>
```

**Default Shortcuts:**
- `V`: Toggle viewfinder
- `Enter` / `Space`: Capture shot
- `?`: Show help overlay
- `Escape`: Close help/cancel actions

### ShutterEffect

Provides visual feedback for capture actions.

```tsx
interface ShutterEffectProps {
  isTriggered: boolean;
  onComplete: () => void;
  effectType?: 'default' | 'flash' | 'ripple';
  duration?: number;
}

<ShutterEffect
  isTriggered={captureInProgress}
  onComplete={() => setCaptureInProgress(false)}
  effectType="flash"
  duration={300}
/>
```

## Advanced Usage

### Custom Mouse Tracking

```tsx
import { useMouseTracking } from '@/hooks/useMouseTracking';

function CustomViewfinder() {
  const { currentPosition, targetPosition, isTracking } = useMouseTracking({
    delay: 150,              // Custom delay
    throttleMs: 16,          // 60fps throttling
    enableEasing: true,      // Smooth transitions
    boundaryElement: ref.current,
  });

  return (
    <div>
      <div style={{
        left: currentPosition.x,
        top: currentPosition.y,
        transition: isTracking ? 'none' : 'all 150ms ease-out'
      }}>
        Custom Crosshair
      </div>
    </div>
  );
}
```

### Progressive Loading

```tsx
import { OptimizedViewfinderOverlay } from '@/components/ViewfinderLazy';

// Automatically lazy-loads non-critical components
<OptimizedViewfinderOverlay
  isActive={true}
  onCapture={handleCapture}
/>
```

### Error Boundaries

```tsx
import { ViewfinderErrorBoundary } from '@/components/ViewfinderErrorBoundary';

<ViewfinderErrorBoundary
  fallback={<div>Viewfinder temporarily unavailable</div>}
  onError={(error) => console.error('Viewfinder error:', error)}
>
  <ViewfinderOverlay isActive={true} />
</ViewfinderErrorBoundary>
```

## Configuration

### Performance Settings

```tsx
import { CompatibilityFallbacks } from '@/utils/browserCompat';

const compat = CompatibilityFallbacks.getInstance();
const settings = compat.getPerformanceSettings();

// Adjust based on device capabilities
const config = {
  maxBlurIntensity: settings.maxBlurIntensity,    // 4-8px
  animationDuration: settings.animationDuration,  // 100-200ms
  throttleMs: settings.throttleMs,                // 16-33ms
  enableHardwareAcceleration: settings.enableHardwareAcceleration,
};
```

### Browser Compatibility

```tsx
import { detectBrowserFeatures } from '@/utils/browserCompat';

const features = detectBrowserFeatures();

if (features.backdropFilter) {
  // Use backdrop-filter for better performance
} else {
  // Fallback to background overlay
}
```

## Styling

### CSS Variables

```css
:root {
  --viewfinder-crosshair-color: rgba(255, 255, 255, 0.9);
  --viewfinder-focus-ring-color: rgba(255, 255, 255, 0.5);
  --viewfinder-blur-amount: 8px;
  --viewfinder-animation-duration: 200ms;
  --viewfinder-z-index: 50;
}
```

### Custom Themes

```tsx
const customTheme = {
  crosshair: {
    color: '#00ff00',
    strokeWidth: 1.5,
    size: 48,
  },
  focusRing: {
    color: '#00ff00',
    opacity: 0.7,
    strokeWidth: 2,
  },
  exif: {
    background: 'rgba(0, 0, 0, 0.95)',
    textColor: '#00ff00',
    accentColor: '#ffaa00',
  }
};
```

## Performance Optimization

### Bundle Size

Current optimized bundle sizes:
- Core viewfinder: ~45KB (gzipped: ~15KB)
- With all components: ~65KB (gzipped: ~20KB)
- Lazy-loaded components: ~25KB additional (loaded on demand)

### Best Practices

1. **Lazy Loading**: Use `OptimizedViewfinderOverlay` for automatic code splitting
2. **Error Boundaries**: Wrap components in `ViewfinderErrorBoundary`
3. **Performance Monitoring**: Monitor 60fps target with browser dev tools
4. **Memory Management**: Components auto-cleanup on unmount

```tsx
// Optimal implementation
<ViewfinderErrorBoundary>
  <Suspense fallback={<ViewfinderLoading />}>
    <OptimizedViewfinderOverlay
      isActive={isActive}
      onCapture={handleCapture}
    />
  </Suspense>
</ViewfinderErrorBoundary>
```

## Testing

### Component Testing

```tsx
import { renderWithTestUtils } from '@/test/utils';
import { ViewfinderOverlay } from '@/components/ViewfinderOverlay';

test('renders active viewfinder', () => {
  const { container } = renderWithTestUtils(
    <ViewfinderOverlay isActive={true} />
  );

  expect(container.querySelector('.fixed')).toBeTruthy();
  expect(container.querySelector('svg')).toBeTruthy(); // Crosshair
});
```

### Performance Testing

```tsx
test('maintains 60fps during mouse tracking', async () => {
  const component = render(<ViewfinderOverlay isActive={true} />);

  // Simulate rapid mouse movements
  for (let i = 0; i < 100; i++) {
    fireEvent.mouseMove(document, {
      clientX: i * 5,
      clientY: Math.sin(i * 0.1) * 100
    });
  }

  // Verify smooth performance (implementation-specific)
});
```

## Accessibility

The viewfinder system includes comprehensive accessibility support:

- **Screen Reader Support**: All interactive elements have ARIA labels
- **Keyboard Navigation**: Complete keyboard control without mouse
- **Focus Management**: Proper focus indication and trapping
- **Reduced Motion**: Respects `prefers-reduced-motion` settings
- **High Contrast**: Supports high contrast themes

```tsx
// Accessibility example
<ViewfinderOverlay
  isActive={true}
  aria-label="Camera viewfinder interface"
  role="application"
/>
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Support**: iOS Safari 14+, Chrome Mobile 90+
- **Performance**: Hardware acceleration on supported devices

## Troubleshooting

### Common Issues

**Viewfinder not appearing:**
```tsx
// Check z-index conflicts
<ViewfinderOverlay className="z-50" />

// Verify isActive prop
<ViewfinderOverlay isActive={true} />
```

**Mouse tracking lag:**
```tsx
// Adjust throttling for lower-end devices
const { currentPosition } = useMouseTracking({
  throttleMs: 33, // 30fps for better performance
});
```

**Blur effects not working:**
```tsx
import { detectBrowserFeatures } from '@/utils/browserCompat';

const features = detectBrowserFeatures();
if (!features.backdropFilter) {
  // Implement fallback blur
}
```

## Migration Guide

### From Basic Implementation

```tsx
// Before
<div className="cursor-crosshair" onMouseMove={handleMove}>
  Content
</div>

// After
<ViewfinderOverlay
  isActive={true}
  onCapture={handleCapture}
>
  <BlurContainer focusCenter={mousePosition}>
    Content
  </BlurContainer>
</ViewfinderOverlay>
```

### Performance Upgrades

```tsx
// Standard implementation
import { ViewfinderOverlay } from '@/components/ViewfinderOverlay';

// Optimized implementation
import { OptimizedViewfinderOverlay } from '@/components/ViewfinderLazy';
```

## Contributing

When contributing to the viewfinder system:

1. **Testing**: Add tests for new components in `/test/`
2. **Documentation**: Update this guide for new features
3. **Performance**: Maintain 60fps target and bundle size limits
4. **Accessibility**: Include ARIA labels and keyboard support
5. **Browser Compatibility**: Test across supported browsers

## License

Part of the Nino Chavez Portfolio project. All rights reserved.