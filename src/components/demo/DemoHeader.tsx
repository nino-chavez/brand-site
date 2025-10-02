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
            <h1 className="text-2xl font-bold text-white">Enterprise UI Pattern Library</h1>
            <p className="text-sm text-white/60 mt-1">
              Engineered by <span className="text-violet-400 font-medium">Nino Chavez</span> • Enterprise Software Engineer • Trusted patterns from 3+ years of enterprise deployments
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onReset && (
              <button
                onClick={onReset}
                data-testid="global-reset"
                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-sm font-medium transition-all border border-red-500/20 hover:border-red-500/40"
                title="Reset all component states to default values"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All
                </span>
              </button>
            )}
            <a
              href="/#contact"
              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 hover:text-green-200 text-sm font-medium transition-all border border-green-500/20 hover:border-green-500/40"
              title="Implement these patterns in your application"
            >
              Implement These Patterns →
            </a>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 hover:text-violet-200 text-sm font-medium transition-all border border-violet-500/20 hover:border-violet-500/40"
            >
              View Portfolio
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DemoHeader;
