/**
 * DemoControls - Standardized control panel for demos
 *
 * Provides buttons, sliders, toggles, and dropdowns for
 * manipulating component demos in real-time.
 */

import React from 'react';

export interface ControlConfig {
  type: 'button' | 'slider' | 'toggle' | 'select';
  label: string;
  value?: any;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: any) => void;
}

interface DemoControlsProps {
  controls: ControlConfig[];
  onReset?: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ controls, onReset }) => {
  // Generate data-control attribute from label
  const getControlId = (label: string) => label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="p-4 border-t border-white/10 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/60 uppercase tracking-wide font-semibold">
          Controls
        </span>
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <div className="space-y-3">
        {controls.map((control, index) => (
          <div key={index} className="flex items-center gap-4">
            <label className="text-sm text-white/70 min-w-[100px] font-medium">{control.label}</label>

            {control.type === 'button' && (
              <button
                onClick={() => control.onChange?.(true)}
                data-control={getControlId(control.label)}
                className="px-4 py-2 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium transition-colors"
              >
                Trigger
              </button>
            )}

            {control.type === 'toggle' && (
              <button
                onClick={() => control.onChange?.(!control.value)}
                data-control={getControlId(control.label)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  control.value ? 'bg-violet-500' : 'bg-white/20'
                }`}
                role="switch"
                aria-checked={control.value}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    control.value ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            )}

            {control.type === 'slider' && (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="range"
                  min={control.min ?? 0}
                  max={control.max ?? 100}
                  step={control.step ?? 1}
                  value={control.value}
                  onChange={(e) => control.onChange?.(Number(e.target.value))}
                  data-control={getControlId(control.label)}
                  className="flex-1 h-2 rounded-full appearance-none bg-white/10"
                  style={{
                    background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${
                      ((control.value - (control.min ?? 0)) / ((control.max ?? 100) - (control.min ?? 0))) * 100
                    }%, rgba(255, 255, 255, 0.1) ${
                      ((control.value - (control.min ?? 0)) / ((control.max ?? 100) - (control.min ?? 0))) * 100
                    }%, rgba(255, 255, 255, 0.1) 100%)`,
                  }}
                />
                <span className="text-sm text-white/60 font-mono min-w-[40px] text-right">
                  {control.value}
                </span>
              </div>
            )}

            {control.type === 'select' && (
              <select
                value={control.value}
                onChange={(e) => control.onChange?.(e.target.value)}
                data-control={getControlId(control.label)}
                className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                {control.options?.map((option) => (
                  <option key={option} value={option} className="bg-neutral-900">
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoControls;
