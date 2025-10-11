/**
 * Click/Active State Demos
 *
 * Demonstrations of click and active states:
 * - Button press effects (scale-98)
 * - Form input focus states
 * - Toggle switches
 * - Expandable accordions
 * - Modal dialogs
 */

import React, { useState } from 'react';

// Button Press/Active Demo
export const ButtonPressDemo: React.FC<{
  pressScale?: number;
  showRipple?: boolean;
}> = ({ pressScale = 0.98, showRipple = true }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);

    if (showRipple) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRipples(prev => [...prev, { x, y, id: Date.now() }]);

      setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-neutral-900 rounded-lg p-8">
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative overflow-hidden px-8 py-4 bg-athletic-brand-violet text-white font-bold rounded-xl transition-all duration-150 hover:bg-athletic-brand-violet/90"
        style={{
          transform: isPressed ? `scale(${pressScale})` : 'scale(1)'
        }}
        data-testid="press-button"
        data-pressed={isPressed}
      >
        Click Me

        {showRipple && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute w-2 h-2 bg-white/40 rounded-full animate-ping"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </button>

      <div className="mt-4 text-sm text-white/60">
        State: <span className="text-white font-mono">{isPressed ? 'pressed' : 'idle'}</span>
      </div>
    </div>
  );
};

// Form Input Focus Demo
export const FormFocusDemo: React.FC<{
  showLabel?: boolean;
  showValidation?: boolean;
}> = ({ showLabel = true, showValidation = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleBlur = () => {
    setIsFocused(false);
    if (showValidation) {
      setIsValid(value.length >= 3);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[250px] bg-neutral-900 rounded-lg p-8">
      <div className="w-full max-w-sm">
        {showLabel && (
          <label
            htmlFor="demo-input"
            className={`block text-sm font-semibold mb-2 transition-colors ${
              isFocused ? 'text-athletic-brand-violet' : 'text-white/70'
            }`}
          >
            Email Address
          </label>
        )}

        <input
          id="demo-input"
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="you@example.com"
          className={`
            w-full px-4 py-4 bg-white/5 border-2 rounded-lg text-white placeholder-white/40
            transition-all duration-200
            focus:outline-none focus:bg-white/10
            ${isFocused
              ? 'border-athletic-brand-violet shadow-lg shadow-purple-500/20'
              : isValid
                ? 'border-white/10'
                : 'border-red-500'
            }
          `}
          data-testid="focus-input"
          data-focused={isFocused}
          data-valid={isValid}
        />

        {showValidation && !isValid && !isFocused && (
          <p className="mt-2 text-sm text-red-400">
            Email must be at least 3 characters
          </p>
        )}

        <div className="mt-4 text-sm text-white/60">
          State: <span className="text-white font-mono">{isFocused ? 'focused' : 'idle'}</span>
        </div>
      </div>
    </div>
  );
};

// Toggle Switch Demo
export const ToggleSwitchDemo: React.FC<{
  defaultChecked?: boolean;
  showLabel?: boolean;
}> = ({ defaultChecked = false, showLabel = true }) => {
  const [isOn, setIsOn] = useState(defaultChecked);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-neutral-900 rounded-lg p-8">
      <div className="flex items-center gap-4">
        {showLabel && (
          <span className="text-white font-semibold">
            Animations {isOn ? 'Enabled' : 'Disabled'}
          </span>
        )}

        <button
          onClick={() => setIsOn(!isOn)}
          className={`
            relative w-16 h-8 rounded-full transition-all duration-300
            ${isOn ? 'bg-athletic-brand-violet' : 'bg-white/20'}
          `}
          data-testid="toggle-switch"
          data-checked={isOn}
          aria-checked={isOn}
          role="switch"
        >
          <span
            className={`
              absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg
              transition-all duration-300
              ${isOn ? 'left-9' : 'left-1'}
            `}
          />
        </button>
      </div>

      <div className="mt-4 text-sm text-white/60">
        State: <span className="text-white font-mono">{isOn ? 'on' : 'off'}</span>
      </div>
    </div>
  );
};

// Accordion/Expandable Demo
export const AccordionDemo: React.FC<{
  items?: string[];
}> = ({ items = ['Section 1', 'Section 2', 'Section 3'] }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div className="w-full max-w-md space-y-2">
        {items.map((item, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
              data-testid={`accordion-item-${index}`}
              data-expanded={isExpanded}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
              >
                <span className="text-white font-semibold">{item}</span>
                <svg
                  className={`w-5 h-5 text-white/60 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <div className="px-4 py-4 bg-white/5 text-white/70">
                  This is the expandable content for {item}. It smoothly transitions in and out when you click the header.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Modal Dialog Demo
export const ModalDemo: React.FC<{
  triggerText?: string;
}> = ({ triggerText = 'Open Modal' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-4 bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
        data-testid="modal-trigger"
      >
        {triggerText}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            data-testid="modal-backdrop"
          />

          {/* Modal */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in-95 duration-200"
            data-testid="modal-dialog"
            data-open={isOpen}
          >
            <div className="bg-neutral-800 border border-white/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Modal Dialog</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  data-testid="modal-close"
                >
                  <svg className="w-5 h-5 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <p className="text-white/80 mb-4">
                  This modal demonstrates the click-to-open interaction with backdrop fade and content zoom-in animation.
                </p>
                <p className="text-white/60 text-sm">
                  Click outside or press the X button to close.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white rounded-lg transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 text-sm text-white/60">
        Modal state: <span className="text-white font-mono">{isOpen ? 'open' : 'closed'}</span>
      </div>
    </div>
  );
};
