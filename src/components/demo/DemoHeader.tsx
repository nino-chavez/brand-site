/**
 * DemoHeader - Header for demo harness page
 *
 * Provides navigation and global controls for the demo harness.
 */

import React from 'react';

interface DemoHeaderProps {
  onReset?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const DemoHeader: React.FC<DemoHeaderProps> = ({ onReset, searchQuery, onSearchChange }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo & Title */}
          <div>
            <h1 className="text-2xl font-bold text-white">UI/UX Component Demo</h1>
            <p className="text-sm text-white/60 mt-1">
              Interactive showcase of battle-tested interface patterns
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                data-testid="demo-search"
                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
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
