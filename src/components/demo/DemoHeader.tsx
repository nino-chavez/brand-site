/**
 * DemoHeader - Header for demo harness page
 *
 * Provides navigation and global controls for the demo harness.
 */

import React from 'react';

interface DemoHeaderProps {
  onReset?: () => void;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">UI/UX Component Demo</h1>
            <p className="text-sm text-white/60 mt-1">
              Golden reference implementation - Battle-tested interface patterns with full test coverage
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onReset && (
              <button
                onClick={onReset}
                data-testid="global-reset"
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Reset All
              </button>
            )}
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium transition-colors"
            >
              Back to Site
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DemoHeader;
