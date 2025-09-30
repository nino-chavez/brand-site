import React from 'react';
import { VolleyballPhase } from '../../hooks/useVolleyballTiming';

interface MockVisualProps {
  type: 'volleyball' | 'technical';
  phase: VolleyballPhase;
  progress: number;
  className?: string;
}

const VOLLEYBALL_VISUALS = {
  setup: {
    title: 'Player Positioning',
    description: 'Athletes assume ready position',
    color: 'from-blue-600 to-blue-800',
    elements: ['🏐', '🏃‍♂️', '🏃‍♀️', '⚡']
  },
  anticipation: {
    title: 'Building Tension',
    description: 'Mental focus intensifies',
    color: 'from-purple-600 to-purple-800',
    elements: ['👁️', '🎯', '⚡', '🔥']
  },
  approach: {
    title: 'Explosive Movement',
    description: 'Dynamic approach run',
    color: 'from-orange-600 to-red-600',
    elements: ['🚀', '💨', '⚡', '🔥']
  },
  spike: {
    title: 'Peak Action',
    description: 'Maximum force delivery',
    color: 'from-red-600 to-red-800',
    elements: ['💥', '⚡', '🔥', '💨']
  },
  impact: {
    title: 'Contact Moment',
    description: 'Ball-hand connection',
    color: 'from-yellow-400 to-orange-600',
    elements: ['✨', '💫', '⭐', '💥']
  },
  'follow-through': {
    title: 'Natural Completion',
    description: 'Coordinated finish',
    color: 'from-green-600 to-blue-600',
    elements: ['🌊', '✨', '🎯', '✅']
  }
};

const TECHNICAL_VISUALS = {
  setup: {
    title: 'System Architecture',
    description: 'Foundation & Infrastructure',
    color: 'from-slate-600 to-slate-800',
    elements: ['🏗️', '📐', '⚙️', '🔧']
  },
  anticipation: {
    title: 'Load Balancing',
    description: 'Scaling considerations',
    color: 'from-indigo-600 to-indigo-800',
    elements: ['⚖️', '📊', '🔄', '⚡']
  },
  approach: {
    title: 'Performance Optimization',
    description: 'Speed & efficiency gains',
    color: 'from-emerald-600 to-emerald-800',
    elements: ['⚡', '🚀', '📈', '💨']
  },
  spike: {
    title: 'Critical Path',
    description: 'Core functionality',
    color: 'from-red-600 to-red-800',
    elements: ['🎯', '💎', '⚡', '🔥']
  },
  impact: {
    title: 'Production Ready',
    description: 'Optimal performance',
    color: 'from-amber-500 to-orange-600',
    elements: ['✅', '🏆', '⭐', '💫']
  },
  'follow-through': {
    title: 'Monitoring & Analytics',
    description: 'Continuous improvement',
    color: 'from-teal-600 to-cyan-600',
    elements: ['📊', '📈', '🔍', '⚙️']
  }
};

export const MockVisuals: React.FC<MockVisualProps> = ({
  type,
  phase,
  progress,
  className = ''
}) => {
  const config = type === 'volleyball' ? VOLLEYBALL_VISUALS[phase] : TECHNICAL_VISUALS[phase];

  // Fallback if phase is not found in configurations
  if (!config) {
    const fallbackConfig = type === 'volleyball' ? VOLLEYBALL_VISUALS.setup : TECHNICAL_VISUALS.setup;
    console.warn(`Phase "${phase}" not found in ${type} visuals, using setup fallback`);
    const intensity = Math.min(1, progress + 0.2);

    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <div
          className={`absolute inset-0 bg-gradient-to-br ${fallbackConfig.color} transition-all duration-1000`}
          style={{
            transform: `scale(${1 + intensity * 0.1})`,
            filter: `brightness(${0.8 + intensity * 0.4}) saturate(${1 + intensity * 0.5})`
          }}
        />
        <div className="relative z-10 h-full flex flex-col p-6">
          <div className="mb-6">
            <h3 className="text-white text-2xl font-bold mb-2">
              {fallbackConfig.title}
            </h3>
            <p className="text-white/80 text-lg">
              {fallbackConfig.description}
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-8">
              {fallbackConfig.elements.map((element, index) => (
                <div
                  key={index}
                  className="text-6xl transition-all duration-500"
                  style={{
                    transform: `scale(${0.8 + intensity * 0.7}) rotate(${progress * 360 * (index + 1)}deg)`,
                    opacity: 0.3 + intensity * 0.7,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {element}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 transition-all duration-300 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="mt-2 text-right text-white/60 text-sm">
              {Math.round(progress * 100)}% Complete
            </div>
          </div>
        </div>
        {intensity > 0.7 && (
          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
        )}
        {intensity > 0.9 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
        )}
      </div>
    );
  }

  const intensity = Math.min(1, progress + 0.2);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Animated background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.color} transition-all duration-1000`}
        style={{
          transform: `scale(${1 + intensity * 0.1})`,
          filter: `brightness(${0.8 + intensity * 0.4}) saturate(${1 + intensity * 0.5})`
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-white text-2xl font-bold mb-2">
            {config.title}
          </h3>
          <p className="text-white/80 text-lg">
            {config.description}
          </p>
        </div>

        {/* Visual elements */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-8">
            {config.elements.map((element, index) => (
              <div
                key={index}
                className="text-6xl transition-all duration-500"
                style={{
                  transform: `scale(${0.8 + intensity * 0.7}) rotate(${progress * 360 * (index + 1)}deg)`,
                  opacity: 0.3 + intensity * 0.7,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                {element}
              </div>
            ))}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/60 transition-all duration-300 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="mt-2 text-right text-white/60 text-sm">
            {Math.round(progress * 100)}% Complete
          </div>
        </div>
      </div>

      {/* Overlay effects based on intensity */}
      {intensity > 0.7 && (
        <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
      )}
      {intensity > 0.9 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

export default MockVisuals;