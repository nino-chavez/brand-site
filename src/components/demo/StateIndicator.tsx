/**
 * StateIndicator - Visual state display for components
 *
 * Shows current state with color-coded badges for quick
 * visual feedback during testing.
 */

import React from 'react';

interface StateIndicatorProps {
  states: {
    label: string;
    value: boolean | string | number;
    type?: 'boolean' | 'string' | 'number';
  }[];
  className?: string;
}

export const StateIndicator: React.FC<StateIndicatorProps> = ({ states, className = '' }) => {
  const getStateColor = (value: boolean | string | number, type?: string) => {
    if (type === 'boolean' || typeof value === 'boolean') {
      return value ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300';
    }
    return 'bg-blue-500/20 text-blue-300';
  };

  const formatValue = (value: boolean | string | number) => {
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    return String(value);
  };

  const getStateId = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {states.map((state, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10"
          data-state={getStateId(state.label)}
        >
          <span className="text-xs text-white/40">{state.label}:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-mono ${getStateColor(
              state.value,
              state.type
            )}`}
          >
            {formatValue(state.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StateIndicator;
