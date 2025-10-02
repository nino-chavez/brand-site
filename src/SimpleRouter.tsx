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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Development-only route
  if (currentPath === '/demo' && process.env.NODE_ENV === 'development') {
    return <DemoHarness />;
  }

  // Default to main app
  return <App />;
};

export default SimpleRouter;
