# Architectural Decisions

This document explains the core architectural choices for this portfolio, which is built with React, TypeScript, and Vite. The goal is to provide a reference for developers to understand the system's design principles.

## React-Specific Patterns

The project leverages modern React patterns to ensure a maintainable and performant codebase.

-   **Functional Components and Hooks**: All components are functional components, utilizing hooks for state management (`useState`, `useReducer`) and side effects (`useEffect`). This promotes a declarative and compositional approach to building UIs.
-   **`React.FC`**: While used, we are mindful of its implicit `children` prop and are moving towards explicitly defining `children` in component props for better type safety.
-   **Custom Hooks**: Logic that is shared across multiple components is extracted into custom hooks (e.g., `useVolleyballNavigation`, `useCursorTracking`). This improves code reuse and separation of concerns.

```typescript
// Example of a custom hook for cursor tracking
export const useCursorTracking = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
};
```

## Service Layer Abstractions

To decouple business logic from the UI, the project uses a service layer. The `services` directory contains singleton classes that encapsulate specific functionalities.

-   **Singleton Pattern**: Services like `PerformanceMonitoringService` and `ContentLevelManager` are implemented as singletons to provide a single source of truth and a global access point for their respective functionalities.
-   **Decoupling**: By abstracting logic into services, components remain focused on rendering UI, and the underlying implementation of a service can be changed without affecting the components that use it.

```typescript
// Example of a service singleton
export class ContentLevelManager {
  private static instance: ContentLevelManager;

  private constructor() {
    // ...
  }

  public static getInstance(): ContentLevelManager {
    if (!ContentLevelManager.instance) {
      ContentLevelManager.instance = new ContentLevelManager();
    }
    return ContentLevelManager.instance;
  }

  // ... public methods
}
```

## State Management Approach

The project employs a hybrid state management strategy, choosing the right tool for the right job.

-   **Local State (`useState`)**: For component-specific state that doesn't need to be shared, `useState` is the default choice.
-   **Shared State (`useContext` and `useReducer`)**: For state that needs to be shared across multiple components, React's Context API is used in combination with `useReducer` for more complex state transitions. This is evident in `UnifiedGameFlowContext` and `ViewfinderContext`.
-   **Provider Pattern**: State is made available to the component tree through provider components (`UnifiedGameFlowProvider`, `CanvasStateProvider`), which encapsulate the state logic and prevent prop drilling.

```typescript
// Example of a context provider
export const UnifiedGameFlowProvider: React.FC<UnifiedGameFlowProviderProps> = ({
  children,
  initialSection = 'capture',
}) => {
  const [state, dispatch] = useReducer(unifiedGameFlowReducer, {
    ...getInitialState(),
    currentSection: initialSection,
  });

  const actions = useMemo(() => ({
    // ... memoized action creators
  }), []);

  const contextValue = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <UnifiedGameFlowContext.Provider value={contextValue}>
      {children}
    </UnifiedGameFlowContext.Provider>
  );
};
```

## Component Organization

The `components` directory is organized by feature, with a clear separation between shared components and feature-specific components.

-   **Feature-Based Grouping**: Components are grouped into directories based on the feature they belong to (e.g., `viewfinder`, `split-screen`).
-   **Shared Components**: Common components that are used across multiple features are placed at the root of the `components` directory (e.g., `Header.tsx`, `Section.tsx`).
-   **Barrel Files (`index.ts`)**: Barrel files are used to re-export components from their respective modules, simplifying import statements.

## Error Handling Strategy

The project uses a combination of error boundaries and local error handling to gracefully manage runtime errors.

-   **Error Boundaries**: `ViewfinderErrorBoundary.tsx` is a class-based component that implements the `componentDidCatch` lifecycle method. It wraps parts of the UI and catches JavaScript errors in their child component tree, logging the errors and displaying a fallback UI instead of the component tree that crashed.
-   **Local Error Handling**: For predictable errors, such as failed network requests, local `try...catch` blocks or promise `.catch()` handlers are used within components or services.
-   **Graceful Degradation**: The `ViewfinderGracefulDegradation` component provides a way to render a fallback UI when a feature is not available or has been disabled due to performance issues.

```typescript
// Example of an Error Boundary component
export class ViewfinderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```
