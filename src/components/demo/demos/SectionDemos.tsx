/**
 * SectionDemos - Section-level animation demonstrations
 *
 * Showcases full section transitions, borders, and staggered content.
 */

import React, { useState } from 'react';

export const SectionFadeSlideDemo: React.FC<{
  distance?: number;
  duration?: number;
}> = ({ distance = 24, duration = 700 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  return (
    <div className="space-y-4">
      <div className="h-[400px] bg-black/20 rounded-lg overflow-hidden">
        <div
          key={key}
          className={`h-full bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 transition-all ease-out`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
            transitionDuration: `${duration}ms`,
          }}
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Full Section Animation</h2>
            <p className="text-white/60 mb-4">
              The entire section container animates as one unit, creating a dramatic entrance effect.
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-violet-500/20 rounded w-full"></div>
              <div className="h-2 bg-violet-500/20 rounded w-3/4"></div>
              <div className="h-2 bg-violet-500/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition-colors"
      >
        Replay Section Animation
      </button>
    </div>
  );
};

export const SectionBorderDemo: React.FC<{
  color?: string;
  style?: string;
}> = ({ color = 'violet', style = 'gradient' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [key, setKey] = useState(0);

  const trigger = () => {
    setIsVisible(false);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsVisible(true), 100);
  };

  const colorMap = {
    violet: 'from-transparent via-violet-500 to-transparent',
    blue: 'from-transparent via-blue-500 to-transparent',
    green: 'from-transparent via-green-500 to-transparent',
  };

  return (
    <div className="space-y-4">
      <div className="relative h-[300px] bg-black/20 rounded-lg overflow-hidden">
        {/* Animated Border */}
        <div
          key={key}
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            colorMap[color as keyof typeof colorMap]
          } transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />

        <div className="p-8">
          <h3 className="text-xl font-bold text-white mb-2">Section Border Animation</h3>
          <p className="text-white/60">
            A decorative border appears at the top of the section to mark its entrance
          </p>
          <p className="text-white/40 text-sm mt-2">Color: {color}, Style: {style}</p>
        </div>
      </div>

      <button
        onClick={trigger}
        className="px-4 py-2 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition-colors"
      >
        Replay Border Animation
      </button>
    </div>
  );
};

export const StaggeredContentDemo: React.FC<{
  baseDelay?: number;
  elementCount?: number;
}> = ({ baseDelay = 150, elementCount = 4 }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  const trigger = () => {
    setIsAnimating(true);
    setVisibleIndices(new Set());

    Array.from({ length: elementCount }).forEach((_, index) => {
      setTimeout(() => {
        setVisibleIndices((prev) => new Set([...prev, index]));
      }, index * baseDelay);
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, elementCount * baseDelay + 500);
  };

  const elements = [
    { title: 'Heading', icon: '📝' },
    { title: 'Subheading', icon: '📋' },
    { title: 'Content', icon: '📄' },
    { title: 'Call to Action', icon: '🎯' },
    { title: 'Footer', icon: '📌' },
    { title: 'Extra Element', icon: '✨' },
  ].slice(0, elementCount);

  return (
    <div className="space-y-4">
      <div className="min-h-[400px] bg-black/20 rounded-lg p-8">
        <div className="space-y-4">
          {elements.map((element, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                visibleIndices.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg flex items-center gap-3">
                <span className="text-2xl">{element.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{element.title}</h4>
                  <p className="text-white/40 text-sm">
                    Delay: {index * baseDelay}ms
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={trigger}
        disabled={isAnimating}
        className="px-4 py-2 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnimating ? 'Animating...' : 'Replay Staggered Animation'}
      </button>
    </div>
  );
};
