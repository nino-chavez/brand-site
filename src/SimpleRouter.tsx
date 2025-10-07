/**
 * SimpleRouter - Minimal client-side routing
 *
 * Provides basic routing without external dependencies.
 * Supports /demo route for development testing.
 */

import React, { useEffect, useState } from 'react';
import App from './App';
import DemoHarness from './pages/DemoHarness';

export const SimpleRouter: React.FC = () => {
  // SSR-safe: Use '/' as default path during server-side rendering
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    // This only runs on client-side (useEffect doesn't run during SSR)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Demo route - available in all environments
  if (currentPath === '/demo') {
    return <DemoHarness />;
  }

  // Default to main app
  return <App />;
};

export default SimpleRouter;
