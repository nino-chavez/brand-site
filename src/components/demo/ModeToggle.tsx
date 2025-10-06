/**
 * ModeToggle - Switch between Developer and Stakeholder modes
 *
 * Developer Mode: Technical specs, code samples, npm install
 * Stakeholder Mode: Business benefits, ROI, case studies
 */

import React from 'react';

export type ViewMode = 'developer' | 'stakeholder';

interface ModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 bg-neutral-800/50 rounded-lg border border-white/10">
      <button
        onClick={() => onChange('developer')}
        className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${mode === 'developer'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          }
        `}
        aria-pressed={mode === 'developer'}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Developer
        </span>
      </button>
      <button
        onClick={() => onChange('stakeholder')}
        className={`
          px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${mode === 'stakeholder'
            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
            : 'text-white/60 hover:text-white/80 hover:bg-white/5'
          }
        `}
        aria-pressed={mode === 'stakeholder'}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Business
        </span>
      </button>
    </div>
  );
};

export default ModeToggle;
