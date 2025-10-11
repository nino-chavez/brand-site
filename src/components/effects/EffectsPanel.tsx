/**
 * EffectsPanel - Photography-Themed Effects Control
 *
 * Lightroom/Camera-style panel for adjusting visual effects.
 * Inspired by photo editing software and camera menus.
 *
 * @version 1.0.0
 * @since WOW Factor Enhancement
 */

import React, { useState, useEffect, useRef } from 'react';
import { useEffects } from '../../contexts/EffectsContext';
import type { AnimationStyle, TransitionSpeed, ParallaxIntensity } from '../../contexts/EffectsContext';

export const EffectsPanel: React.FC = () => {
  const { settings, updateSetting, resetToDefaults } = useEffects();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'motion' | 'effects'>('motion');
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const [announcement, setAnnouncement] = useState('');

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

  // Focus management when panel opens/closes
  useEffect(() => {
    if (isOpen && panelRef.current) {
      // Focus first focusable element in panel
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
      setAnnouncement('Effects control panel opened');
    } else if (!isOpen && toggleButtonRef.current) {
      // Return focus to toggle button when panel closes
      toggleButtonRef.current.focus();
      setAnnouncement('Effects control panel closed');
    }
  }, [isOpen]);

  // Announce tab changes
  useEffect(() => {
    if (isOpen) {
      setAnnouncement(`${activeTab === 'motion' ? 'Motion' : 'Effects'} tab selected`);
    }
  }, [activeTab, isOpen]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowLeft':
        if (activeTab === 'effects') {
          e.preventDefault();
          setActiveTab('motion');
        }
        break;
      case 'ArrowRight':
        if (activeTab === 'motion') {
          e.preventDefault();
          setActiveTab('effects');
        }
        break;
    }
  };

  // Trap focus within panel when open
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (!isOpen || !panelRef.current || e.key !== 'Tab') return;

    const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  return (
    <>
      {/* Toggle Button - Camera Icon */}
      <button
        ref={toggleButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/20 hover:border-brand-violet/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-110 group"
        aria-label={isOpen ? "Close effects panel" : "Open effects panel"}
        aria-expanded={isOpen}
        aria-controls="effects-panel"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform inline-block">
          ◉
        </span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange rounded-full animate-pulse" />
      </button>

      {/* Effects Panel */}
      {isOpen && (
        <div
          id="effects-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Effects Control Panel"
          aria-modal="true"
          onKeyDown={(e) => {
            handleKeyDown(e);
            handleTabKey(e);
          }}
          className="fixed bottom-24 right-6 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-slide-in-up"
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
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
            <div className="flex gap-2" role="tablist" aria-label="Effects settings categories">
              <button
                role="tab"
                aria-selected={activeTab === 'motion'}
                aria-controls="motion-panel"
                onClick={() => setActiveTab('motion')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
                  activeTab === 'motion'
                    ? 'bg-brand-violet text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Motion
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'effects'}
                aria-controls="effects-panel-content"
                onClick={() => setActiveTab('effects')}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-all ${
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
              <div
                id="motion-panel"
                role="tabpanel"
                aria-labelledby="motion-tab"
              >
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
                        className={`px-4 py-2 rounded text-sm font-medium transition-all ${
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
                        className={`w-full px-4 py-2 rounded text-sm font-medium text-left transition-all ${
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
                        className={`w-full px-4 py-2 rounded text-sm font-medium text-left transition-all ${
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
              </div>
            )}

            {activeTab === 'effects' && (
              <div
                id="effects-panel-content"
                role="tabpanel"
                aria-labelledby="effects-tab"
              >
                {/* Toggle Effects */}
                <div className="space-y-4">
                  {[
                    { key: 'enableViewfinder', label: 'Viewfinder Mode', icon: '◉', description: 'Camera metadata & brackets' },
                    { key: 'enableMotionBlur', label: 'Motion Blur', icon: '∿', description: 'Subtle blur during transitions' },
                    { key: 'enableParticles', label: 'Particles', icon: '✦', description: 'Floating light particles' },
                    { key: 'enableGlow', label: 'Glow Effects', icon: '◉', description: 'Card and button glows' },
                  ].map((effect) => (
                    <button
                      key={effect.key}
                      onClick={() => updateSetting(effect.key as keyof typeof settings, !settings[effect.key as keyof typeof settings])}
                      className="w-full bg-gray-800 hover:bg-gray-700 rounded p-4 text-left transition-all group"
                      role="switch"
                      aria-checked={settings[effect.key as keyof typeof settings] as boolean}
                      aria-label={`${effect.label}: ${settings[effect.key as keyof typeof settings] ? 'enabled' : 'disabled'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
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
                                ? 'ml-6'
                                : 'ml-1'
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 bg-gray-900">
            <button
              onClick={resetToDefaults}
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-sm font-medium transition-all"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

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
