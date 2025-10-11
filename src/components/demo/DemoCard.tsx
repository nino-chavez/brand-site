/**
 * DemoCard - Container for component demonstrations
 *
 * Provides a standardized layout for showcasing components with
 * controls, state indicators, and code snippets.
 */

import React, { useState } from 'react';

interface DemoCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  codeSnippet?: string;
  testId?: string;
  category?: string;
  states?: string[];
  currentState?: string;
}

export const DemoCard: React.FC<DemoCardProps> = ({
  title,
  description,
  children,
  controls,
  codeSnippet,
  testId,
  category,
  states,
  currentState,
}) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (codeSnippet) {
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="border border-white/20 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-lg hover:border-white/30 transition-colors"
      data-testid={testId}
      data-demo-category={category}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-neutral-800/40 to-neutral-900/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/80">{description}</p>
          </div>

          {/* State Indicators */}
          {states && currentState && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">State:</span>
              <span className="px-2 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs font-mono">
                {currentState}
              </span>
            </div>
          )}
        </div>

        {/* Category Tag */}
        {category && (
          <div className="mt-4">
            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Demo Content */}
      <div className="p-8 min-h-[200px] bg-neutral-900/40">
        {children}
      </div>

      {/* Controls Panel */}
      {controls && (
        <div className="bg-neutral-800/30">
          {controls}
        </div>
      )}

      {/* Code Snippet */}
      {codeSnippet && (
        <div className="border-t border-white/10">
          <button
            onClick={() => setShowCode(!showCode)}
            className="w-full px-4 py-2 flex items-center justify-between text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg
                className={`w-4 h-4 transition-transform ${showCode ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showCode ? 'Hide' : 'Show'} Code
            </span>
          </button>

          {showCode && (
            <div className="relative">
              <pre className="p-4 bg-black/40 text-sm text-white/80 overflow-x-auto font-mono">
                <code>{codeSnippet}</code>
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2 right-2 px-4 py-1 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemoCard;
