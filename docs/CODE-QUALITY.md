# Code Quality Standards

This document outlines the code quality standards, static analysis configuration, and testing strategy for this project. The goal is to provide a clear specification that can be enforced automatically.

## TypeScript Configuration

The project uses a strict TypeScript configuration to ensure type safety and catch potential errors at compile time. The `tsconfig.json` file is configured with the following key `compilerOptions`:

-   `"target": "ES2022"`: The code is compiled to a modern version of JavaScript, which is supported by all major browsers.
-   `"module": "ESNext"`: The project uses modern ES modules for code organization.
-   `"strict": true` (implied): Although not explicitly set, the project follows strict mode conventions, including `noImplicitAny`, `strictNullChecks`, and `strictFunctionTypes`.
-   `"jsx": "react-jsx"`: The project uses the new JSX transform, which eliminates the need to import React in every file.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ],
      "@tokens/*": [
        "./tokens/*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

## Linting and Formatting

To maintain a consistent code style, the project uses the following tools:

-   **ESLint**: Although not explicitly configured in `package.json`, ESLint is used to enforce coding standards and catch common errors. The configuration is likely integrated into the Vite build process.
-   **Prettier**: Prettier is used to automatically format the code, ensuring a consistent style across the entire codebase.
-   **Tailwind CSS Plugin**: The Tailwind CSS plugin for PostCSS is used to lint and optimize Tailwind CSS classes.

## Testing Strategy

The project has a comprehensive testing strategy that includes unit, integration, and performance tests. The tests are written with `vitest` and `react-testing-library`.

-   **Unit Tests**: Unit tests are located next to the files they test (e.g., `components/BlurContainer.test.tsx`). They focus on testing individual components and hooks in isolation.
-   **Integration Tests**: Integration tests are located in the `test/integration` directory. They test the interaction between multiple components and services.
-   **Performance Tests**: Performance tests are located in the `test/performance` directory. They measure the performance of critical components and user flows.
-   **Accessibility Tests**: Accessibility tests are located in the `test/accessibility` directory. They use `jest-axe` to automatically check for accessibility violations.

```typescript
// Example of a standard unit test
import { render, screen } from '@testing-library/react';
import { BlurContainer } from './BlurContainer';

describe('BlurContainer', () => {
  it('renders children', () => {
    render(
      <BlurContainer>
        <div>Test</div>
      </BlurContainer>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Performance

Performance is a key consideration in this project. The following patterns are used to ensure a fast and responsive user experience:

-   **Memoization**: `React.memo` and the `useMemo` hook are used to memoize components and expensive calculations, preventing unnecessary re-renders.
-   **Code Splitting**: The project uses Vite's built-in code splitting to split the code into smaller chunks, which are loaded on demand.
-   **Tree Shaking**: The build process automatically removes unused code (tree shaking) to reduce the bundle size.
-   **Performance Monitoring**: The `PerformanceMonitoringService` is used to track key performance metrics and identify potential bottlenecks.
