/**
 * Hover State Demos
 *
 * Demonstrations of hover effects found throughout the portfolio:
 * - Button hover (scale + glow)
 * - Card hover (lift + shadow)
 * - Image zoom
 * - Icon animations
 * - Link states
 * - Group hover cascades
 */

import React, { useState } from 'react';

// Button Hover Demo
export const ButtonHoverDemo: React.FC<{
  variant?: 'primary' | 'secondary' | 'ghost';
  showGlow?: boolean;
}> = ({ variant = 'primary', showGlow = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    primary: 'bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 hover:border-white/60',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white/40'
  };

  const glowClass = showGlow ? 'hover:shadow-lg hover:shadow-purple-500/30' : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-neutral-900 rounded-lg p-8">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group px-8 py-4 rounded-xl font-bold
          transition-all duration-300
          hover:scale-105
          ${variantStyles[variant]}
          ${glowClass}
        `}
        data-testid="hover-button"
        data-hover-state={isHovered}
      >
        <span className="flex items-center gap-2">
          Hover Me
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>

      <div className="mt-4 text-sm text-white/60">
        State: <span className="text-white font-mono">{isHovered ? 'hovered' : 'idle'}</span>
      </div>
    </div>
  );
};

// Card Hover Demo
export const CardHoverDemo: React.FC<{
  liftAmount?: number;
  showShadow?: boolean;
}> = ({ liftAmount = 105, showShadow = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6
          transition-all duration-300 cursor-pointer
          hover:bg-white/10 hover:border-white/20
          ${showShadow ? 'hover:shadow-2xl hover:shadow-purple-500/20' : ''}
        `}
        style={{
          transform: isHovered ? `scale(${liftAmount / 100})` : 'scale(1)'
        }}
        data-testid="hover-card"
        data-hover-state={isHovered}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-athletic-brand-violet transition-colors">
          Interactive Card
        </h3>
        <p className="text-white/70 mb-4">
          Hover to see lift effect with shadow enhancement and gradient shine
        </p>
        <div className="flex items-center gap-2 text-sm text-white/50 group-hover:text-white/80 transition-colors">
          <span>Learn more</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Image Zoom Hover Demo
export const ImageZoomDemo: React.FC<{
  zoomScale?: number;
  showOverlay?: boolean;
}> = ({ zoomScale = 110, showOverlay = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-64 h-64 rounded-xl overflow-hidden cursor-pointer"
        data-testid="hover-image"
        data-hover-state={isHovered}
      >
        <div
          className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 transition-transform duration-300"
          style={{
            transform: isHovered ? `scale(${zoomScale / 100})` : 'scale(1)'
          }}
        />

        {showOverlay && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span className="text-sm">Click to enlarge</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Icon Animation Hover Demo
export const IconHoverDemo: React.FC<{
  animation?: 'rotate' | 'scale' | 'bounce' | 'spin';
}> = ({ animation = 'rotate' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const animationClasses = {
    rotate: 'group-hover:rotate-90',
    scale: 'group-hover:scale-110',
    bounce: 'group-hover:animate-bounce',
    spin: 'group-hover:animate-spin'
  };

  return (
    <div className="flex items-center justify-center min-h-[200px] bg-neutral-900 rounded-lg p-8">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group p-6 bg-white/5 rounded-full cursor-pointer hover:bg-white/10 transition-colors"
        data-testid="hover-icon"
        data-hover-state={isHovered}
      >
        <svg
          className={`w-12 h-12 text-white transition-all duration-300 ${animationClasses[animation]}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    </div>
  );
};

// Link Hover Demo
export const LinkHoverDemo: React.FC<{
  underlineStyle?: 'fade' | 'slide' | 'grow';
  showIcon?: boolean;
}> = ({ underlineStyle = 'slide', showIcon = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[200px] bg-neutral-900 rounded-lg p-8">
      <a
        href="#demo"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative text-xl font-semibold text-white hover:text-athletic-brand-violet transition-colors inline-flex items-center gap-2"
        data-testid="hover-link"
        data-hover-state={isHovered}
      >
        <span className="relative">
          Interactive Link
          {underlineStyle === 'fade' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-athletic-brand-violet opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          {underlineStyle === 'slide' && (
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-athletic-brand-violet group-hover:w-full transition-all duration-300" />
          )}
          {underlineStyle === 'grow' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-athletic-brand-violet group-hover:w-full transition-all duration-300" />
          )}
        </span>
        {showIcon && (
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </a>
    </div>
  );
};

// Group Hover Cascade Demo
export const GroupHoverDemo: React.FC<{
  itemCount?: number;
  staggerDelay?: number;
}> = ({ itemCount = 4, staggerDelay = 50 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-center min-h-[300px] bg-neutral-900 rounded-lg p-8">
      <div
        className="group relative"
        data-testid="hover-group"
      >
        <div className="flex gap-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative w-16 h-16 bg-white/5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-athletic-brand-violet hover:scale-110 hover:-translate-y-2"
              style={{
                transitionDelay: `${index * staggerDelay}ms`
              }}
              data-testid={`hover-item-${index}`}
              data-item-index={index}
              data-hover-state={hoveredIndex === index}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-white/60">
          Hover on group to see cascading animation
        </div>
      </div>
    </div>
  );
};
