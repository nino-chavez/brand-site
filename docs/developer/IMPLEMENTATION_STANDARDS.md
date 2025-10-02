# Implementation Standards Guide

**Last Updated:** 2025-10-02
**Purpose:** Code implementation patterns, conventions, and best practices based on production codebase and demo harness test learnings.

---

## Table of Contents

1. [Component Architecture Patterns](#component-architecture-patterns)
2. [Test ID Conventions](#test-id-conventions)
3. [State Management Patterns](#state-management-patterns)
4. [Props Interface Standards](#props-interface-standards)
5. [Control Types and Labeling](#control-types-and-labeling)
6. [Accessibility Requirements](#accessibility-requirements)
7. [File Organization](#file-organization)

---

## Component Architecture Patterns

### Component Structure Template

```tsx
/**
 * ComponentName - Brief description
 *
 * Detailed purpose and usage explanation.
 *
 * @example
 * <ComponentName prop1="value" prop2={value} />
 */

import React, { useState, useEffect } from 'react';
import type { PropsType } from './types';

interface ComponentNameProps {
  // Props interface (see Props Interface Standards section)
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 'defaultValue',
  className = '',
  ...rest
}) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState<Type>(initialValue);

  // 2. Derived state and computed values
  const derivedValue = useMemo(() => computeValue(state), [state]);

  // 3. Event handlers
  const handleEvent = useCallback(() => {
    // Handle event
  }, [dependencies]);

  // 4. Effects
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 5. Render
  return (
    <div
      className={`base-classes ${className}`}
      data-testid="component-name"
      {...rest}
    >
      {/* Component content */}
    </div>
  );
};

// 6. Default export
export default ComponentName;
```

### Hook Order Convention

**Always follow this order for consistency:**

1. State hooks (`useState`, `useReducer`)
2. Context hooks (`useContext`, `useTheme`)
3. Ref hooks (`useRef`, `useImperativeHandle`)
4. Effect hooks (`useEffect`, `useLayoutEffect`)
5. Custom hooks (`useScrollAnimation`, `useMagneticButton`)
6. Memoization hooks (`useMemo`, `useCallback`)

```tsx
// Good: Consistent hook ordering
const Component = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { elementRef, animate } = useScrollAnimation();
  const memoizedValue = useMemo(() => expensive(), [deps]);

  // ...
};
```

### Component Composition Pattern

```tsx
// Parent component with child composition
export const DemoContainer: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <div className="demo-container">
      <DemoHeader />
      <div className="demo-content">{children}</div>
      <DemoFooter />
    </div>
  );
};

// Usage
<DemoContainer>
  <FadeUpDemo />
  <SlideDemo />
</DemoContainer>
```

### Compound Component Pattern

```tsx
// For complex components with sub-components
export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card">{children}</div>
);

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="card-header">{children}</div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="card-footer">{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

---

## Test ID Conventions

### Naming Pattern

**Format:** `{component}-{element}-{variant?}`

```tsx
// Component root
data-testid="demo-harness"
data-testid="fade-up-demo"
data-testid="state-indicator"

// Component parts
data-testid="demo-harness-sidebar"
data-testid="demo-harness-controls"
data-testid="demo-harness-code-snippet"

// Indexed items
data-testid="hover-item-0"
data-testid="hover-item-1"
data-testid="category-button-animations"

// State-based
data-testid="control-panel-expanded"
data-testid="control-panel-collapsed"
```

### Test ID Implementation

```tsx
// Component with test IDs
export const HoverDemo: React.FC = () => {
  return (
    <div data-testid="hover-demo">
      <div data-testid="hover-demo-container">
        {items.map((item, index) => (
          <div
            key={item.id}
            data-testid={`hover-item-${index}`}
            className="hover-item"
          >
            {item.content}
          </div>
        ))}
      </div>
      <button data-testid="hover-demo-reset">Reset</button>
    </div>
  );
};
```

### State Indicators Test IDs

**Special pattern for StateIndicator components:**

```tsx
// StateIndicator automatically generates data-state attributes
<StateIndicator
  states={[
    { label: 'Speed', value: 'normal' },
    { label: 'Is Active', value: true }
  ]}
/>

// Generates:
// <div data-state="speed"><span>Speed:</span> <span>normal</span></div>
// <div data-state="is-active"><span>Is Active:</span> <span>✓</span></div>

// Test selectors:
const speedValue = await page.locator('[data-state="speed"] span').last().textContent();
const isActive = await page.locator('[data-state="is-active"] span').last().textContent();
```

### Dynamic Test IDs

```tsx
// For dynamic content with identifiers
{demos.map((demo) => (
  <div key={demo.id} data-testid={`demo-${demo.id}`}>
    <h3 data-testid={`demo-${demo.id}-title`}>{demo.title}</h3>
    <div data-testid={`demo-${demo.id}-content`}>{demo.content}</div>
  </div>
))}
```

---

## State Management Patterns

### Component-Level State (useState)

```tsx
// Simple component state
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
const [text, setText] = useState('');

// Complex state (prefer single useState for related data)
const [formState, setFormState] = useState({
  name: '',
  email: '',
  message: ''
});

// Update complex state
setFormState(prev => ({ ...prev, name: 'New Name' }));
```

### LocalStorage Persistence Pattern

**Based on EffectsPanel implementation:**

```tsx
// Custom hook for localStorage state
const useLocalStorageState = <T,>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setState(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [state, setValue];
};

// Usage
const [settings, setSettings] = useLocalStorageState('demo-settings', {
  speed: 'normal',
  enabled: true
});
```

### Context Pattern

```tsx
// Context definition
interface EffectsContextType {
  animationStyle: AnimationStyle;
  transitionSpeed: TransitionSpeed;
  setAnimationStyle: (style: AnimationStyle) => void;
  setTransitionSpeed: (speed: TransitionSpeed) => void;
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

// Provider component
export const EffectsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [animationStyle, setAnimationStyle] = useLocalStorageState<AnimationStyle>(
    'animation-style',
    'normal'
  );

  return (
    <EffectsContext.Provider
      value={{
        animationStyle,
        setAnimationStyle,
        // ... other values
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
};

// Custom hook for context
export const useEffects = () => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within EffectsProvider');
  }
  return context;
};
```

### Ref Pattern

```tsx
// DOM ref for element access
const containerRef = useRef<HTMLDivElement>(null);

// Callback ref for dynamic references
const [buttonRefs, setButtonRefs] = useState<Map<string, HTMLButtonElement>>(
  new Map()
);

const setButtonRef = useCallback((id: string, element: HTMLButtonElement | null) => {
  setButtonRefs((prev) => {
    const next = new Map(prev);
    if (element) {
      next.set(id, element);
    } else {
      next.delete(id);
    }
    return next;
  });
}, []);

// Usage
<button ref={(el) => setButtonRef('button-1', el)}>Button</button>
```

---

## Props Interface Standards

### Required vs. Optional Props

```tsx
interface ComponentProps {
  // Required props (no default, no ?)
  id: string;
  title: string;
  onSubmit: (data: FormData) => void;

  // Optional props (with ?)
  description?: string;
  className?: string;
  disabled?: boolean;

  // Optional with default value (defined in destructuring)
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

// Implementation with defaults
export const Component: React.FC<ComponentProps> = ({
  id,
  title,
  onSubmit,
  description,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  // ...
};
```

### Children Props

```tsx
// Simple children
interface Props {
  children: React.ReactNode;
}

// Render prop pattern
interface Props {
  children: (data: DataType) => React.ReactNode;
}

// Usage
<Component>
  {(data) => <div>{data.value}</div>}
</Component>
```

### Event Handler Props

```tsx
interface Props {
  // Standard event handlers (prefixed with 'on')
  onClick?: () => void;
  onChange?: (value: string) => void;
  onSubmit?: (data: FormData) => void;

  // Event handlers with event object
  onMouseMove?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}
```

### Complex Type Props

```tsx
// Type definitions
type AnimationStyle = 'subtle' | 'normal' | 'dramatic' | 'off';
type TransitionSpeed = 'fast' | 'normal' | 'slow' | 'off';

interface DemoConfig {
  id: string;
  title: string;
  category: string;
  component: React.ComponentType<any>;
}

interface Props {
  style: AnimationStyle;
  speed: TransitionSpeed;
  config: DemoConfig;
  demos: DemoConfig[];
}
```

---

## Control Types and Labeling

### Control Component Pattern

**Based on demo harness controls implementation:**

```tsx
interface ControlProps {
  label: string;           // Required: Human-readable label
  value: string | number | boolean;
  onChange: (value: any) => void;
  type?: 'range' | 'select' | 'toggle' | 'button';
  min?: number;           // For range controls
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>; // For select
  unit?: string;          // For display (ms, px, %)
  testId?: string;        // For testing
}

export const Control: React.FC<ControlProps> = ({
  label,
  value,
  onChange,
  type = 'range',
  unit,
  testId
}) => {
  return (
    <div className="control-group" data-testid={testId}>
      <label className="control-label">{label}</label>
      {type === 'range' && (
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="control-range"
        />
      )}
      <div className="control-value">
        {value}
        {unit && <span className="control-unit">{unit}</span>}
      </div>
    </div>
  );
};
```

### Control Label Conventions

**Technical precision over casual naming:**

```tsx
// GOOD: Precise, technical labels with units
'Duration (ms)' instead of 'Speed'
'Opacity (%)' instead of 'Intensity'
'Distance (px)' instead of 'Amount'
'Delay (ms)' instead of 'Wait'
'Active' / 'Inactive' instead of 'Enabled' / 'Disabled'

// GOOD: Show units for all numeric values
<Control label="Duration (ms)" value={500} />
<Control label="Opacity (%)" value={80} />
<Control label="Distance (px)" value={24} />
```

### Control Groups

```tsx
// Related controls grouped together
interface ControlGroupProps {
  title: string;
  controls: ControlProps[];
  onReset?: () => void;
}

export const ControlGroup: React.FC<ControlGroupProps> = ({
  title,
  controls,
  onReset
}) => {
  return (
    <div className="control-group-container" data-testid="control-group">
      <div className="control-group-header">
        <h4>{title}</h4>
        {onReset && (
          <button
            onClick={onReset}
            className="control-reset"
            data-testid="control-reset"
          >
            Reset
          </button>
        )}
      </div>
      <div className="controls">
        {controls.map((control, index) => (
          <Control key={index} {...control} />
        ))}
      </div>
    </div>
  );
};
```

---

## Accessibility Requirements

### Keyboard Navigation

```tsx
// Keyboard event handlers
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':  // Space key
      event.preventDefault();
      handleActivate();
      break;
    case 'Escape':
      handleClose();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      event.preventDefault();
      handleNavigate(event.key === 'ArrowUp' ? -1 : 1);
      break;
  }
};

// Implementation
<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleActivate}
>
  Interactive Element
</div>
```

### ARIA Attributes

```tsx
// Buttons
<button
  aria-label="Open settings panel"
  aria-expanded={isOpen}
  aria-controls="settings-panel"
>
  ⚙️
</button>

// Toggles
<button
  role="switch"
  aria-checked={isEnabled}
  onClick={() => setIsEnabled(!isEnabled)}
>
  Toggle Feature
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Progress indicators
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
>
  {progress}%
</div>
```

### Focus Management

```tsx
// Focus trap in modals
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => container.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return containerRef;
};
```

### Semantic HTML

```tsx
// GOOD: Semantic structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
  </ul>
</nav>

<main>
  <section aria-labelledby="about-heading">
    <h2 id="about-heading">About Me</h2>
    <article>
      {/* Content */}
    </article>
  </section>
</main>

// BAD: Non-semantic divs
<div className="nav">
  <div className="nav-item" onClick={navigate}>Home</div>
</div>
```

---

## File Organization

### Component File Structure

```
src/components/
├── demo/
│   ├── DemoHarness.tsx              # Main container
│   ├── DemoSidebar.tsx              # Sidebar navigation
│   ├── StateIndicator.tsx           # Shared component
│   ├── demos/
│   │   ├── AnimationDemos.tsx       # Category demos
│   │   ├── InteractiveDemos.tsx
│   │   └── index.ts                 # Export barrel
│   ├── types.ts                     # Shared types
│   └── utils.ts                     # Shared utilities
```

### Type Definitions

```tsx
// types.ts - Shared type definitions
export type AnimationStyle = 'subtle' | 'normal' | 'dramatic' | 'off';
export type TransitionSpeed = 'fast' | 'normal' | 'slow' | 'off';

export interface DemoComponent {
  id: string;
  title: string;
  description: string;
  category: string;
  component: React.ComponentType<any>;
  defaultProps?: Record<string, any>;
}

export interface ControlConfig {
  type: 'range' | 'select' | 'toggle';
  label: string;
  key: string;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: any }>;
}
```

### Export Patterns

```tsx
// Named exports (preferred for components)
export const Component = () => { /* ... */ };
export const AnotherComponent = () => { /* ... */ };

// Default export for main component
export default Component;

// Barrel exports (index.ts)
export { FadeUpDemo, SlideDemo } from './AnimationDemos';
export { HoverDemo, ClickDemo } from './InteractiveDemos';
export { StateIndicator } from './StateIndicator';
```

---

## Code Quality Standards

### TypeScript Strictness

```tsx
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}

// Type all props and state
interface Props {
  value: string;  // Not: value: any
}

// Type event handlers
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Not: (event: any)
};
```

### Comments and Documentation

```tsx
/**
 * Component-level JSDoc comment
 * Explains purpose, usage, and examples
 */

// Inline comments for complex logic
const calculateValue = (input: number) => {
  // Apply logarithmic scaling for smoother transitions
  return Math.log(input + 1) * scaleFactor;
};

// TODO comments for future work
// TODO: Add keyboard shortcuts for demo navigation
// FIXME: Range slider doesn't work on Safari < 14
```

### Error Handling

```tsx
// Try-catch for risky operations
try {
  const data = JSON.parse(localStorage.getItem('key') || '{}');
  setState(data);
} catch (error) {
  console.warn('Failed to parse localStorage data:', error);
  setState(defaultValue);
}

// Error boundaries for component errors
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Implementation Checklist

When creating new components, verify:

- [ ] Component follows standard structure template
- [ ] Hooks are ordered consistently
- [ ] Props interface has clear required/optional distinction
- [ ] Default props are provided in destructuring
- [ ] Test IDs follow `{component}-{element}-{variant}` pattern
- [ ] State indicators use `data-state` attribute pattern
- [ ] LocalStorage state uses error handling try-catch
- [ ] Controls have precise technical labels with units
- [ ] Keyboard navigation handles Enter, Space, Escape, Arrows
- [ ] ARIA attributes are present for interactive elements
- [ ] Focus indicators are visible on all focusable elements
- [ ] TypeScript types are strict (no `any`)
- [ ] Error handling is present for risky operations
- [ ] File is exported properly in barrel index.ts

---

**Document Status:** Complete
**Source:** Demo harness test fixes and production codebase patterns (2025-10-02)
**Related Docs:**
- `/docs/developer/DESIGN_STANDARDS.md` - Design system standards
- `/docs/developer/TESTING_STRATEGY.md` - Testing implementation
- `/docs/developer/code-quality.md` - Code quality guidelines
