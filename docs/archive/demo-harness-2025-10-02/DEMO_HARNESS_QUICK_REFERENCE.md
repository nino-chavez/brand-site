# Demo Harness Quick Reference

**Fast access guide for common tasks**

---

## Access

```
Development: http://localhost:3000/demo
Production:  Not accessible (dev-only)
```

---

## Quick Navigation

| Category | URL Hash | Components |
|----------|----------|------------|
| Animations | `#category-animations` | 5 types |
| Effects | `#category-effects` | 3 types |
| Interactive | `#category-interactive` | 3 types |
| Sections | `#category-sections` | 3 types |

---

## Available Demos

### Animations

```
✓ Fade Up (8px)   - Subtle upward fade
✓ Fade Up (24px)  - Dramatic upward fade
✓ Slide           - Directional slide-in
✓ Scale           - Scale-up animation
✓ Blur Morph      - Blur-to-sharp transition
```

### Effects

```
✓ Parallax        - Background depth effect
✓ Spotlight       - Custom cursor highlight
✓ Glow Effects    - Progressive hover glow
```

### Interactive

```
✓ Magnetic Button - Proximity-based transform
✓ Effects Panel   - Settings control panel
✓ Keyboard Nav    - Full keyboard support
```

### Section Transitions

```
✓ Fade + Slide    - Full section entrance
✓ Border          - Animated boundary
✓ Staggered       - Sequential reveals
```

---

## Control Types

```typescript
// Button
{ type: 'button', label: 'Trigger' }

// Toggle
{ type: 'toggle', label: 'Enabled', value: true }

// Slider
{ type: 'slider', label: 'Distance', min: 8, max: 48, step: 8 }

// Select
{ type: 'select', label: 'Speed', options: ['fast', 'normal', 'slow'] }
```

---

## Adding New Demo

**1. Create Component:**
```tsx
// src/components/demo/demos/MyDemos.tsx
export const MyDemo: React.FC<Props> = (props) => {
  return <div>Demo</div>;
};
```

**2. Add Config:**
```typescript
// src/config/demoComponents.ts
{
  id: 'my-demo',
  title: 'My Demo',
  category: 'animations',
  controls: { /* ... */ }
}
```

**3. Render:**
```tsx
// src/pages/DemoHarness.tsx
<DemoCard title="My Demo">
  <MyDemo {...state} />
</DemoCard>
```

---

## Testing Selectors

```typescript
// By test ID
page.locator('[data-testid="demo-fade-up-8px"]')

// By category
page.locator('[data-demo-category="animations"]')

// By state
page.locator('[data-demo-state="visible"]')
```

---

## Keyboard Navigation

```
Tab       - Navigate demos
Space     - Trigger focused
Enter     - Activate control
Esc       - Close panels
/         - Search (planned)
```

---

## State Management

```typescript
// Get demo state
const { state, updateState, resetState } = useDemoState('demo-id', {
  defaultValue: 'initial'
});

// Update state
updateState('key', newValue);

// Reset to defaults
resetState();
```

---

## Common Tasks

### Reset All Demos
```
Click "Reset All" in header
```

### Search Components
```
Type in search box at top
```

### Filter by Category
```
Click category in sidebar
```

### Copy Code
```
Click "Show Code" → "Copy"
```

### View All States
```
Adjust controls to cycle through states
```

---

## File Locations

```
Main Page:      src/pages/DemoHarness.tsx
Components:     src/components/demo/
Configuration:  src/config/demoComponents.ts
State Hook:     src/hooks/useDemoState.ts
Router:         src/SimpleRouter.tsx
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 at /demo | Check dev server running |
| Blank screen | Verify NODE_ENV=development |
| Controls frozen | Clear localStorage |
| No animations | Check prefers-reduced-motion |

---

## Statistics

```
Total Demos:           14
Animation Types:        5
Effect Types:           3
Interactive Types:      3
Section Transitions:    3
Total Test Scenarios:  119+
```

---

**Updated:** 2025-10-01
**Version:** 1.0.0
