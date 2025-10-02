/**
 * ComponentCategory - Collapsible category section
 *
 * Groups related component demos together with
 * expand/collapse functionality.
 */

import React, { useState } from 'react';

interface ComponentCategoryProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: string;
}

export const ComponentCategory: React.FC<ComponentCategoryProps> = ({
  title,
  description,
  children,
  defaultExpanded = true,
  icon,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-neutral-900/50 backdrop-blur-sm">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <h2 className="text-[22px] font-bold text-white">{title}</h2>
            {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
          </div>
        </div>

        <svg
          className={`w-6 h-6 text-white/60 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-white/10 bg-black/20">
          {children}
        </div>
      )}
    </div>
  );
};

export default ComponentCategory;
