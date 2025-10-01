/**
 * EffectsPanel - Photography-Themed Effects Control
 *
 * Lightroom/Camera-style panel for adjusting visual effects.
 * Inspired by photo editing software and camera menus.
 *
 * @version 1.0.0
 * @since WOW Factor Enhancement
 */

import React, { useState } from 'react';
import { useEffects } from '../../contexts/EffectsContext';
import type { AnimationStyle, TransitionSpeed, ParallaxIntensity } from '../../contexts/EffectsContext';

export const EffectsPanel: React.FC = () => {
  const { settings, updateSetting, resetToDefaults } = useEffects();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'motion' | 'effects'>('motion');

  const animationStyles: Array<{ value: AnimationStyle; label: string; icon: string }> = [
    { value: 'fade-up', label: 'Fade Up', icon: '↑' },
    { value: 'slide', label: 'Slide', icon: '→' },
    { value: 'scale', label: 'Scale', icon: '⊕' },
    { value: 'blur-morph', label: 'Blur Morph', icon: '∿' },
    { value: 'clip-reveal', label: 'Clip Reveal', icon: '▭' },
  ];

  const speeds: Array<{ value: TransitionSpeed; label: string }> = [
    { value: 'fast', label: 'Fast (300ms)' },
    { value: 'normal', label: 'Normal (500ms)' },
    { value: 'slow', label: 'Slow (800ms)' },
    { value: 'off', label: 'Off' },
  ];

  const parallaxLevels: Array<{ value: ParallaxIntensity; label: string }> = [
    { value: 'subtle', label: 'Subtle (0.3x)' },
    { value: 'normal', label: 'Normal (0.5x)' },
    { value: 'intense', label: 'Intense (0.8x)' },
    { value: 'off', label: 'Off' },
  ];

  return (
    <>
      {/* Toggle Button - Camera Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/20 hover:border-brand-violet/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
        aria-label="Toggle effects panel"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
          📷
        </span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange rounded-full animate-pulse" />
      </button>

      {/* Effects Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-slide-in-up">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="text-brand-orange">◉</span>
                Effects Control
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('motion')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeTab === 'motion'
                    ? 'bg-brand-violet text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Motion
              </button>
              <button
                onClick={() => setActiveTab('effects')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                  activeTab === 'effects'
                    ? 'bg-brand-violet text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Effects
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {activeTab === 'motion' && (
              <>
                {/* Animation Style */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Animation Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {animationStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => updateSetting('animationStyle', style.value)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                          settings.animationStyle === style.value
                            ? 'bg-brand-violet text-white ring-2 ring-brand-violet/50'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className="mr-1">{style.icon}</span>
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transition Speed */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Transition Speed
                  </label>
                  <div className="space-y-1">
                    {speeds.map((speed) => (
                      <button
                        key={speed.value}
                        onClick={() => updateSetting('transitionSpeed', speed.value)}
                        className={`w-full px-3 py-2 rounded text-sm font-medium text-left transition-all ${
                          settings.transitionSpeed === speed.value
                            ? 'bg-brand-cyan/20 text-brand-cyan border-l-2 border-brand-cyan'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-l-2 border-transparent'
                        }`}
                      >
                        {speed.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parallax Intensity */}
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Parallax Depth
                  </label>
                  <div className="space-y-1">
                    {parallaxLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updateSetting('parallaxIntensity', level.value)}
                        className={`w-full px-3 py-2 rounded text-sm font-medium text-left transition-all ${
                          settings.parallaxIntensity === level.value
                            ? 'bg-brand-orange/20 text-brand-orange border-l-2 border-brand-orange'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-l-2 border-transparent'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'effects' && (
              <>
                {/* Toggle Effects */}
                <div className="space-y-3">
                  {[
                    { key: 'enableMotionBlur', label: 'Motion Blur', icon: '∿', description: 'Subtle blur during transitions' },
                    { key: 'enableParticles', label: 'Particles', icon: '✦', description: 'Floating light particles' },
                    { key: 'enableGlow', label: 'Glow Effects', icon: '◉', description: 'Card and button glows' },
                  ].map((effect) => (
                    <button
                      key={effect.key}
                      onClick={() => updateSetting(effect.key as keyof typeof settings, !settings[effect.key as keyof typeof settings])}
                      className="w-full bg-gray-800 hover:bg-gray-700 rounded p-3 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{effect.icon}</span>
                          <div>
                            <div className="text-white font-medium">{effect.label}</div>
                            <div className="text-gray-400 text-xs">{effect.description}</div>
                          </div>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full transition-all ${
                            settings[effect.key as keyof typeof settings]
                              ? 'bg-brand-violet'
                              : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full mt-1 transition-all ${
                              settings[effect.key as keyof typeof settings]
                                ? 'ml-5'
                                : 'ml-1'
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-3 bg-gray-900">
            <button
              onClick={resetToDefaults}
              className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-sm font-medium transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default EffectsPanel;
