# AI Agent Collaboration Guide

## Agent Team Structure

This project employs multiple AI agents working together under Nino's direction. Each agent should understand their role in the collaborative development process.

## Coding Standards

All code in this project is expected to adhere to the standards enforced by the `CodeGuardianAgent`. Key standards include:

### TypeScript Requirements
- All new components must be fully typed
- Use proper interface definitions from `types.ts`
- No `any` types without explicit justification
- Import React explicitly when needed: `import React from 'react';`

### Component Architecture
- Follow functional component patterns with hooks
- Use `React.FC` type annotation for components
- Maintain consistent prop interface naming
- Implement proper ref forwarding when needed

### File Organization

For any major file reorganization tasks, invoke the `FileOrganizerAgent` to ensure that all changes are made safely and that no broken references are introduced.

- Components in `/components/` directory
- Shared types in `types.ts`
- Constants and data in `src/constants.ts`
- Custom hooks in `/hooks/` directory

### Naming Conventions
- Components: PascalCase (e.g., `HeroSection.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Props interfaces: `ComponentNameProps`
- CSS classes: Follow Tailwind conventions

## Architecture Principles

### 1. Static Site Optimization
- No unnecessary client-side state management
- Optimize for fast loading and performance
- Use CDN resources when appropriate
- Minimize bundle size

### 2. Accessibility First
- Maintain ARIA labels and proper heading hierarchy
- Ensure keyboard navigation works correctly
- Test with screen readers in mind
- Follow WCAG guidelines

### 3. Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Test across device sizes
- Maintain consistent spacing and typography
- Use semantic HTML elements

## Visual Design System

### Brand Colors
- `brand-dark`: #0a0a0f (background)
- `brand-violet`: #8b5cf6 (accent)
- `brand-light`: #f0f0f5 (text)

### Typography
- Primary: Inter font family
- Consistent spacing using Tailwind scale
- Proper heading hierarchy (h1, h2, h3)

### Interactions
- Subtle animations and transitions
- Spotlight cursor effect
- Smooth scrolling between sections
- Keyboard shortcuts (Cmd/Ctrl + 1-7)

## Development Workflow

### 1. Before Making Changes
- Read existing component code to understand patterns
- Check `types.ts` for existing interfaces
- Review similar components for consistency
- Consider accessibility implications

### 2. Implementation Standards
- Write clean, readable TypeScript
- Add proper type annotations
- Maintain existing code style
- Test keyboard navigation

### 3. Testing Approach
- Manual testing across devices
- Keyboard navigation verification
- Screen reader compatibility check
- Performance impact assessment

## Common Patterns

### Section Components
```typescript
interface SectionProps {
  setRef: (el: HTMLDivElement | null) => void;
}

const Section: React.FC<SectionProps> = ({ setRef }) => {
  return (
    <section ref={setRef} className="...">
      {/* Content */}
    </section>
  );
};
```

### Navigation Integration
- Use `SectionId` type for navigation
- Implement smooth scrolling with `scrollIntoView`
- Maintain active section highlighting
- Support keyboard shortcuts

## Communication Between Agents

- Document any architectural decisions in commit messages
- Note breaking changes or pattern modifications
- Share context about user experience considerations
- Coordinate on feature additions to avoid conflicts

## Error Handling

- Graceful degradation for interactive features
- Proper TypeScript error prevention
- Accessibility fallbacks for dynamic content
- Performance monitoring considerations

Remember: This is a professional portfolio that demonstrates technical expertise through its own implementation. Every code change should reflect high-quality software development practices.