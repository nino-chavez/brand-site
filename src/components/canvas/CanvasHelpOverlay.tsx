/**
 * CanvasHelpOverlay - Persistent Help System
 *
 * Provides discoverable help for canvas navigation with:
 * - Help button in top-right corner
 * - Keyboard shortcuts overlay (press '?')
 * - Contextual hints for first-time users
 *
 * @fileoverview Help system matching industry standards (Figma, Miro)
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';

export interface CanvasHelpOverlayProps {
  className?: string;
}

export const CanvasHelpOverlay: React.FC<CanvasHelpOverlayProps> = ({ className = '' }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showFirstVisitHint, setShowFirstVisitHint] = useState(false);

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('canvas-help-seen');
    if (!hasVisited) {
      setShowFirstVisitHint(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowFirstVisitHint(false);
        localStorage.setItem('canvas-help-seen', 'true');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Keyboard shortcut: '?' to toggle help
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if in input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        setShowHelp(prev => !prev);
      }
      // ESC to close
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showHelp]);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className={`fixed top-4 right-16 z-50 w-8 h-8 bg-white/90 hover:bg-white border border-gray-300 rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors ${className}`}
        aria-label="Show help"
        title="Show keyboard shortcuts (?)"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="10" cy="10" r="8" />
          <path d="M8 8c0-1.1.9-2 2-2s2 .9 2 2c0 .8-.5 1.5-1.2 1.8-.5.2-.8.7-.8 1.2v.5" />
          <circle cx="10" cy="15" r="0.5" fill="currentColor" />
        </svg>
      </button>

      {/* First Visit Hint */}
      {showFirstVisitHint && (
        <div className="fixed top-16 right-4 z-50 max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-600">
                  <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Welcome to Canvas Mode</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Your portfolio arranged like photos on a light table
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Drag</strong> to pan the canvas</li>
                  <li>• <strong>Ctrl+Scroll</strong> to zoom in/out</li>
                  <li>• <strong>Click</strong> minimap to navigate</li>
                  <li>• Press <strong>?</strong> for more shortcuts</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setShowFirstVisitHint(false);
                  localStorage.setItem('canvas-help-seen', 'true');
                }}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                aria-label="Dismiss hint"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Canvas Navigation</h2>
                <p className="text-sm text-gray-600 mt-1">Keyboard shortcuts and navigation guide</p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                aria-label="Close help"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l8 8M14 6l-8 8" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Navigation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Navigation</h3>
                <div className="space-y-2">
                  <ShortcutRow icon="🖱️" action="Click and drag" description="Pan the canvas" />
                  <ShortcutRow icon="⌨️" keys={['↑', '↓', '←', '→']} description="Pan with arrow keys" />
                  <ShortcutRow icon="🗺️" action="Click minimap" description="Jump to section" />
                  <ShortcutRow icon="⌨️" keys={['Tab']} description="Cycle through sections" />
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Zoom</h3>
                <div className="space-y-2">
                  <ShortcutRow icon="🔍" keys={['Ctrl', 'Scroll']} description="Zoom in/out at cursor" />
                  <ShortcutRow icon="➕" action="Zoom buttons" description="Use +/- controls" />
                  <ShortcutRow icon="↩️" action="1:1 button" description="Reset to 100%" />
                </div>
              </div>

              {/* Interactions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Interactions</h3>
                <div className="space-y-2">
                  <ShortcutRow icon="👆" action="Click section" description="Focus and zoom to section" />
                  <ShortcutRow icon="🖱️" action="Right-click drag" description="Pan from anywhere" />
                  <ShortcutRow icon="⌨️" keys={['?']} description="Toggle this help overlay" />
                  <ShortcutRow icon="⌨️" keys={['Esc']} description="Close help overlay" />
                </div>
              </div>

              {/* Tips */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-violet-900 mb-2">💡 Pro Tips</h3>
                <ul className="text-sm text-violet-800 space-y-1">
                  <li>• Hold <kbd className="px-1.5 py-0.5 bg-white border border-violet-300 rounded text-xs">Ctrl</kbd> while scrolling to zoom</li>
                  <li>• Use the minimap (bottom-left) for quick navigation</li>
                  <li>• Paper textures scale with zoom for authentic feel</li>
                  <li>• Current zoom level shown above zoom controls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface ShortcutRowProps {
  icon: string;
  action?: string;
  keys?: string[];
  description: string;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ icon, action, keys, description }) => (
  <div className="flex items-center gap-4 text-sm">
    <span className="text-lg">{icon}</span>
    <div className="flex-1 flex items-center gap-2">
      {action && <span className="font-medium text-gray-700">{action}</span>}
      {keys && (
        <div className="flex gap-1">
          {keys.map(key => (
            <kbd key={key} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
              {key}
            </kbd>
          ))}
        </div>
      )}
    </div>
    <span className="text-gray-600">{description}</span>
  </div>
);

export default CanvasHelpOverlay;
