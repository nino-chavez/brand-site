/**
 * InteractiveDemos - Interactive component demonstrations
 *
 * Showcases magnetic buttons, effects panel, and keyboard navigation.
 */

import React, { useState, useRef, useEffect } from 'react';

export const MagneticButtonDemo: React.FC<{
  strength?: number;
  radius?: number;
  enabled?: boolean;
}> = ({ strength = 0.2, radius = 100, enabled = true }) => {
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isInRange, setIsInRange] = useState(false);
  const [distance, setDistance] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!buttonRef.current || !enabled) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    setDistance(Math.round(dist));

    if (dist < radius) {
      setIsInRange(true);
      const magnetStrength = 1 - dist / radius;
      setTransform({
        x: deltaX * strength * magnetStrength,
        y: deltaY * strength * magnetStrength,
      });
    } else {
      setIsInRange(false);
      setTransform({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, radius, enabled]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-black/20 rounded-lg p-8">
        <button
          ref={buttonRef}
          className="px-8 py-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg transition-all duration-200"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px)`,
            boxShadow: isInRange
              ? `0 0 ${30 + (1 - distance / radius) * 20}px rgba(139, 92, 246, ${
                  0.3 + (1 - distance / radius) * 0.3
                })`
              : 'none',
          }}
        >
          <h3 className="text-xl font-bold text-white mb-2">Magnetic Button</h3>
          <p className="text-white/60">Move your cursor close</p>
        </button>

        <div className="mt-6 text-center space-y-1">
          <p className="text-white/40 text-sm">
            Distance: <span className="font-mono">{distance}px</span> / {radius}px
          </p>
          <p className="text-white/40 text-sm">
            Transform: <span className="font-mono">({transform.x.toFixed(1)}, {transform.y.toFixed(1)})</span>
          </p>
          <p className="text-white/40 text-sm">
            Status: <span className={isInRange ? 'text-green-400' : 'text-red-400'}>{isInRange ? 'In Range' : 'Out of Range'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const EffectsPanelDemo: React.FC<{ position?: string }> = ({ position = 'bottom-right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animationStyle, setAnimationStyle] = useState('fade-up');
  const [speed, setSpeed] = useState('normal');

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
  };

  return (
    <div className="relative h-[400px] bg-black/20 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-white/60">Effects Panel Preview</p>
      </div>

      <div className={`absolute ${positionClasses[position as keyof typeof positionClasses]}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110"
          aria-label="Toggle effects panel"
        >
          📷
        </button>

        {isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
              Animation Settings
            </h3>

            <div>
              <label className="text-xs text-white/60 mb-2 block">Animation Style</label>
              <select
                value={animationStyle}
                onChange={(e) => setAnimationStyle(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm"
              >
                <option value="fade-up">Fade Up</option>
                <option value="slide">Slide</option>
                <option value="scale">Scale</option>
                <option value="blur-morph">Blur Morph</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-2 block">Transition Speed</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white/5 border border-white/10 text-white/80 text-sm"
              >
                <option value="fast">Fast</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const KeyboardNavDemo: React.FC<{ showFocusIndicators?: boolean }> = ({
  showFocusIndicators = true,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [activatedIndex, setActivatedIndex] = useState<number | null>(null);

  const buttons = [
    { label: 'Tab to focus', key: 'Tab' },
    { label: 'Enter to activate', key: 'Enter' },
    { label: 'Space to activate', key: 'Space' },
    { label: 'Escape to close', key: 'Esc' },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          Use <kbd className="px-2 py-1 bg-white/10 rounded">Tab</kbd> to navigate, <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to activate
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onClick={() => {
              setActivatedIndex(index);
              setTimeout(() => setActivatedIndex(null), 300);
            }}
            className={`px-6 py-4 rounded-lg border-2 transition-all ${
              focusedIndex === index && showFocusIndicators
                ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/50'
                : 'border-white/10 bg-white/5'
            } ${activatedIndex === index ? 'scale-95' : ''}`}
          >
            <div className="text-white font-medium">{button.label}</div>
            <div className="text-white/40 text-sm mt-1">Key: {button.key}</div>
          </button>
        ))}
      </div>

      {focusedIndex !== null && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-300">
            Currently focused: {buttons[focusedIndex].label}
          </p>
        </div>
      )}
    </div>
  );
};
