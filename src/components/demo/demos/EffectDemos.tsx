/**
 * EffectDemos - Visual effects demonstration components
 *
 * Showcases parallax, spotlight, and glow effects.
 */

import React, { useState, useEffect, useRef } from 'react';

export const ParallaxDemo: React.FC<{ intensity?: number; enabled?: boolean }> = ({
  intensity = 0.2,
  enabled = true,
}) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeScroll = window.scrollY - (containerRef.current.offsetTop - window.innerHeight);
        setScrollY(relativeScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = enabled ? scrollY * intensity : 0;

  return (
    <div ref={containerRef} className="relative h-[300px] bg-black/20 rounded-lg overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 transition-transform"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
        }}
      />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Parallax Background</h3>
          <p className="text-white/60">Scroll to see effect</p>
          <p className="text-white/40 text-sm mt-2">Intensity: {intensity}</p>
        </div>
      </div>
    </div>
  );
};

export const SpotlightDemo: React.FC<{
  radius?: number;
  opacity?: number;
  enabled?: boolean;
}> = ({ radius = 200, opacity = 0.3, enabled = true }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative h-[300px] bg-black/40 rounded-lg overflow-hidden cursor-none"
    >
      {enabled && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            width: radius * 2,
            height: radius * 2,
            marginLeft: -radius,
            marginTop: -radius,
            background: `radial-gradient(circle, rgba(139, 92, 246, ${opacity}) 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Spotlight Cursor</h3>
          <p className="text-white/60">Move your mouse around</p>
          <p className="text-white/40 text-sm mt-2">
            Radius: {radius}px, Opacity: {opacity}
          </p>
        </div>
      </div>
    </div>
  );
};

export const GlowDemo: React.FC<{ intensity?: string; enabled?: boolean }> = ({
  intensity = 'medium',
  enabled = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const glowIntensityMap = {
    low: '0 0 20px rgba(139, 92, 246, 0.3)',
    medium: '0 0 30px rgba(139, 92, 246, 0.5)',
    high: '0 0 50px rgba(139, 92, 246, 0.8)',
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] bg-black/20 rounded-lg p-8">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="px-8 py-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-lg transition-all duration-300"
        style={{
          boxShadow: enabled && isHovered ? glowIntensityMap[intensity as keyof typeof glowIntensityMap] : 'none',
        }}
      >
        <h3 className="text-xl font-bold text-white mb-2">Glow Effect</h3>
        <p className="text-white/60">Hover to see glow</p>
        <p className="text-white/40 text-sm mt-2">Intensity: {intensity}</p>
      </button>
    </div>
  );
};
