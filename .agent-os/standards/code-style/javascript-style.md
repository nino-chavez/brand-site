# Javascript Style Guide

## General Formatting
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for readability

## Naming Conventions
- **Methods and Variables**: Use `camelCase` (e.g., `userProfile`, `calculateTotal`)
- **Classes and Components**: Use `PascalCase` (e.g., `UserProfile`, `PaymentProcessor`)
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

## String Formatting
- Use single quotes for strings: `'Hello World'`
- Use template literals for multi-line strings or complex interpolation

## Code Comments
- Add brief comments above non-obvious business logic
- Document complex algorithms or calculations
- Explain the "why" behind implementation choices
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant

## TypeScript Specifics

### Types and Interfaces
- Prefer `type` aliases for simple types and unions.
- Use `interface` for object shapes and class implementations.
- Be explicit with types, avoid `any` unless absolutely necessary.

### Function Signatures
- Explicitly define return types for functions.
- Use arrow functions for component methods and callbacks.

## React Specifics

### Components
- Use functional components with Hooks.
- Prefer explicit `React.FC` type for components.
- Destructure props at the top of the component.

### State Management
- Use `useState` for local component state.
- Use `useReducer` for complex local state logic.
- Utilize TanStack Query for server-state management.
- Utilize Zustand for light client-side global state.

### Event Handlers
- Name event handlers `handleEventName` (e.g., `handleClick`, `handleChange`).
- Pass event objects explicitly if needed.

## Next.js Specifics

### App Router
- Organize routes using folder-based routing.
- Use `layout.tsx` for shared UI across routes.
- Use `page.tsx` for route segments.

### Server Components & Actions
- Default to Server Components for rendering.
- Use `'use client'` directive for client-side interactivity.
- Implement Server Actions for data mutations.

### Middleware
- Use `middleware.ts` for authentication and authorization gating.

## Testing Specifics

### Test File Organization
- **Unit Tests**: Place in `__tests__/ComponentName.test.(ts|tsx)` alongside source
- **Integration Tests**: Place in `__tests__/integration/` for database-dependent tests
- **Test Utilities**: Use shared utilities from `__tests__/__utils__/testUtils.ts`

### Component Testing Patterns
```typescript
// Good: Use test utilities for consistent mocking
import { createMockSupabaseClient } from './__utils__/testUtils';

// Bad: Global mocks in __mocks__/ directory
// Causes "Cannot redefine property" errors
```

### API Route Testing
```typescript
// Good: Test via HTTP calls or move to integration
const response = await fetch('/api/auth/sign-in', { ... });

// Bad: Direct import of route handlers
import { POST } from '../app/api/auth/sign-in/route';
```

### Mock Strategy
- **Per-test mocking**: Set up mocks in each test's `beforeEach()`
- **Use utilities**: `createMockSupabaseClient()`, `setupRBACMocks()`
- **Clean up**: Call `jest.clearAllMocks()` and `jest.restoreAllMocks()`