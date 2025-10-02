# Design System - Photography Portfolio
**Version 2.0 - Lens & Lightbox Aesthetic**

> Extending the radial navigation's sophisticated visual language across the entire portfolio experience.

---

## Design Philosophy

**"Captured Precision with Dynamic Energy"**

The design system blends photography's technical precision with the dynamic energy of professional sports capture. Every interaction should feel intentional, smooth, and professionally crafted—like viewing a curated portfolio through a high-end camera viewfinder.

---

## Color System

### Primary Palette

```css
/* State Colors - Semantic Meaning */
--state-current: #8b5cf6;      /* Violet - Active/Current state */
--state-preview: #06b6d4;      /* Cyan - Preview/Hover state */
--state-highlight: #f97316;    /* Orange - Interaction/Highlight */
--state-success: #10b981;      /* Green - Success states */
--state-warning: #f59e0b;      /* Amber - Warning/Attention */
```

### Gradient System

```css
/* Violet Gradients - Current/Active States */
--gradient-violet-primary: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%);
--gradient-violet-subtle: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.2) 100%);
--gradient-violet-glow: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);

/* Cyan Gradients - Preview/Secondary States */
--gradient-cyan-primary: linear-gradient(135deg, #67e8f9 0%, #06b6d4 50%, #0891b2 100%);
--gradient-cyan-subtle: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.2) 100%);

/* Orange Gradients - Highlights/Interactions */
--gradient-orange-primary: linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%);
--gradient-orange-intense: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
--gradient-orange-subtle: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.2) 100%);

/* Dark Gradients - Backgrounds */
--gradient-dark-subtle: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%);
--gradient-dark-radial: radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, rgba(10, 10, 15, 1) 70%);
```

### Opacity Scale

```css
/* Background Opacity Tokens */
--opacity-backdrop: 0.4;        /* Full-screen overlays */
--opacity-surface: 0.9;         /* Cards, panels */
--opacity-surface-hover: 0.95;  /* Hover states */
--opacity-border: 0.2;          /* Default borders */
--opacity-border-hover: 0.4;    /* Hover borders */
--opacity-glow: 0.3;           /* Ring effects */
```

---

## Elevation & Shadow System

### Shadow Tokens

```css
/* Colored Shadows - Brand Reinforcement */
--shadow-violet-sm: 0 2px 8px rgba(139, 92, 246, 0.15);
--shadow-violet-md: 0 4px 16px rgba(139, 92, 246, 0.2);
--shadow-violet-lg: 0 10px 40px rgba(139, 92, 246, 0.3);
--shadow-violet-xl: 0 20px 60px rgba(139, 92, 246, 0.4);

--shadow-cyan-sm: 0 2px 8px rgba(6, 182, 212, 0.15);
--shadow-cyan-md: 0 4px 16px rgba(6, 182, 212, 0.2);
--shadow-cyan-lg: 0 10px 40px rgba(6, 182, 212, 0.3);

--shadow-orange-sm: 0 2px 8px rgba(251, 146, 60, 0.15);
--shadow-orange-md: 0 4px 16px rgba(251, 146, 60, 0.2);
--shadow-orange-lg: 0 10px 40px rgba(251, 146, 60, 0.4);
--shadow-orange-xl: 0 20px 60px rgba(251, 146, 60, 0.5);

/* Neutral Shadows - Depth & Hierarchy */
--shadow-neutral-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
--shadow-neutral-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-neutral-lg: 0 10px 30px rgba(0, 0, 0, 0.5);
```

### Ring Effects

```css
/* Ring System - Focus & Emphasis */
--ring-violet: 0 0 0 2px rgba(139, 92, 246, 0.3);
--ring-violet-strong: 0 0 0 2px rgba(139, 92, 246, 0.5);

--ring-cyan: 0 0 0 2px rgba(6, 182, 212, 0.3);
--ring-orange: 0 0 0 2px rgba(251, 146, 60, 0.3);
--ring-orange-strong: 0 0 0 2px rgba(251, 146, 60, 0.5);

/* Multi-layer Ring Effects */
--ring-focus:
  0 0 0 2px rgba(251, 146, 60, 0.5),
  0 0 0 4px rgba(251, 146, 60, 0.2);
```

---

## Blur & Backdrop System

```css
/* Glassmorphism Effects */
--blur-sm: blur(4px);
--blur-md: blur(8px);
--blur-lg: blur(12px);
--blur-xl: blur(16px);

/* Combined Backdrop Effects */
.backdrop-glass-violet {
  background: rgba(139, 92, 246, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.backdrop-glass-dark {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Component Patterns

### Card System

**Base Card - Default State**
```css
.card-base {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 200ms ease-out;
}
```

**Card - Hover State (Preview)**
```css
.card-base:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow:
    0 10px 40px rgba(6, 182, 212, 0.3),
    0 0 0 2px rgba(6, 182, 212, 0.3);
  transform: translateY(-4px) scale(1.02);
}
```

**Card - Active State**
```css
.card-base.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.3) 100%);
  border-color: rgba(139, 92, 246, 0.8);
  box-shadow:
    0 20px 60px rgba(139, 92, 246, 0.4),
    0 0 0 2px rgba(139, 92, 246, 0.5);
}
```

### Button System

**Primary Button - Highlight Action**
```css
.btn-primary {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: 2px solid rgba(251, 146, 60, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(251, 146, 60, 0.3);
  transition: all 200ms ease-out;
}

.btn-primary:hover {
  box-shadow: 0 8px 32px rgba(251, 146, 60, 0.5);
  transform: translateY(-2px);
}
```

**Secondary Button - Subtle Action**
```css
.btn-secondary {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 200ms ease-out;
}

.btn-secondary:hover {
  background: rgba(6, 182, 212, 0.15);
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.3);
}
```

### Section Headers

```css
.section-header {
  position: relative;
  padding: 80px 0 40px;
}

.section-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.5) 50%,
    transparent 100%
  );
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff 0%, rgba(139, 92, 246, 1) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}
```

---

## Animation & Transitions

### Timing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-entrance: cubic-bezier(0, 0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```

### Standard Transitions

```css
/* Fast interactions */
.transition-fast {
  transition: all 150ms var(--ease-smooth);
}

/* Standard interactions */
.transition-base {
  transition: all 200ms var(--ease-smooth);
}

/* Smooth animations */
.transition-smooth {
  transition: all 300ms var(--ease-smooth);
}
```

### Hover Scale Pattern

```css
.hover-lift {
  transition: all 200ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px) scale(1.02);
}
```

---

## Typography

### Heading Gradient System

```css
.heading-primary {
  background: linear-gradient(135deg, #ffffff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.heading-accent {
  color: #f97316;
  text-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
```

---

## Implementation Guidelines

### 1. State Hierarchy
- **Violet** = Current/Active state
- **Cyan** = Preview/Hover state
- **Orange** = Interaction/Highlight/CTA
- **Green** = Success confirmation
- **Amber** = Warning/Attention

### 2. Layering System
```
Z-Index Scale:
- Base content: 1
- Elevated cards: 10
- Sticky header: 30
- Overlays: 40
- Modals: 50
- Tooltips: 60
```

### 3. Responsive Considerations
- Reduce blur intensity on mobile (performance)
- Simplify shadows on low-end devices
- Maintain color semantics across breakpoints
- Touch targets minimum 44x44px

### 4. Accessibility
- Maintain 4.5:1 contrast for body text
- 3:1 contrast for UI components
- Focus indicators always visible
- Reduced motion support

---

## Usage Examples

### Portfolio Card
```jsx
<div className="card-base hover:card-preview group">
  <img className="transition-transform group-hover:scale-105" />
  <div className="backdrop-glass-dark p-6">
    <h3 className="heading-primary">Project Title</h3>
    <button className="btn-primary">View Details</button>
  </div>
</div>
```

### Section Divider
```jsx
<div className="section-header">
  <h2 className="section-title">About Me</h2>
  <div className="w-24 h-1 bg-gradient-orange-primary mx-auto mt-4"></div>
</div>
```

---

**Design System Version**: 2.0.0
**Last Updated**: 2025-10-01
**Based On**: CursorLensV2 radial navigation aesthetics
