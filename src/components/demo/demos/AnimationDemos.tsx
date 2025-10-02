/**
 * AnimationDemos - Animation demonstration components
 *
 * Showcases all animation types with live controls.
 */

import React, { useState, useEffect } from 'react';
import { useScrollAnimation, getAnimationClasses } from '../../../hooks/useScrollAnimation';
import type { AnimationStyle, TransitionSpeed } from '../../../contexts/EffectsContext';

interface FadeUpDemoProps {
  distance?: number;
  speed?: TransitionSpeed;
}

export const FadeUpDemo: React.FC<FadeUpDemoProps> = ({ distance = 8, speed = 'normal' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  const durationMap: Record<TransitionSpeed, string> = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-800',
    off: 'duration-0',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center min-h-[200px] bg-black/20 rounded-lg p-8">
        <div
          key={key}
          className={`transition-all ${durationMap[speed]} ease-out ${
            isVisible
              ? `opacity-100 translate-y-0`
              : `opacity-0 translate-y-${distance === 8 ? '8' : distance === 24 ? '24' : '16'}`
          }`}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">Animated Content</h3>
            <p className="text-white/60">This element fades and translates {distance}px</p>
          </div>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition-colors"
      >
        Replay Animation
      </button>
    </div>
  );
};

export const SlideDemo: React.FC<{
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
}> = ({ direction = 'left', distance = 16 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  const getTransformClass = () => {
    if (isVisible) return 'translate-x-0 translate-y-0';

    switch (direction) {
      case 'left':
        return `-translate-x-${distance}`;
      case 'right':
        return `translate-x-${distance}`;
      case 'up':
        return `-translate-y-${distance}`;
      case 'down':
        return `translate-y-${distance}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center min-h-[200px] bg-black/20 rounded-lg p-8 overflow-hidden">
        <div
          key={key}
          className={`transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${getTransformClass()}`}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">Sliding Content</h3>
            <p className="text-white/60">Slides from {direction}</p>
          </div>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium transition-colors"
      >
        Replay Animation
      </button>
    </div>
  );
};

export const ScaleDemo: React.FC<{ startScale?: number }> = ({ startScale = 0.95 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center min-h-[200px] bg-black/20 rounded-lg p-8">
        <div
          key={key}
          className={`transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 scale-100' : `opacity-0 scale-${Math.round(startScale * 100)}`
          }`}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">Scaling Content</h3>
            <p className="text-white/60">Starts at {startScale}x scale</p>
          </div>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-300 font-medium transition-colors"
      >
        Replay Animation
      </button>
    </div>
  );
};

export const BlurMorphDemo: React.FC<{ blurAmount?: string }> = ({ blurAmount = 'blur-sm' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center min-h-[200px] bg-black/20 rounded-lg p-8">
        <div
          key={key}
          className={`transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 blur-0 scale-100' : `opacity-0 ${blurAmount} scale-95`
          }`}
        >
          <div className="px-8 py-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">Blur Morph Effect</h3>
            <p className="text-white/60">Transitions from {blurAmount} to sharp</p>
          </div>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 font-medium transition-colors"
      >
        Replay Animation
      </button>
    </div>
  );
};
