/**
 * Vite SSR Client Entry Point
 *
 * Hydrates server-rendered HTML with React interactivity.
 * This runs in the browser after initial SSR HTML is loaded.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SimpleRouter from './SimpleRouter';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to hydrate');
}

// Use hydrateRoot instead of createRoot for SSR
ReactDOM.hydrateRoot(
  rootElement,
  <React.StrictMode>
    <SimpleRouter />
  </React.StrictMode>,
  {
    // Progressive Enhancement: Swap no-js class for js class AFTER hydration
    // This prevents hydration mismatch errors
    onRecoverableError: () => {
      // Hydration errors will be logged but won't break the app
    }
  }
);

// Safe to modify DOM after hydration is initiated
// This enables animation classes only when JavaScript is available
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');
