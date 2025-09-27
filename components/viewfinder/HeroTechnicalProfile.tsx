import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import type { TechnicalSkill } from '../../types';
import { SKILL_CATEGORIES } from '../../constants';

interface HeroTechnicalProfileProps {
  skills: TechnicalSkill[];
  isVisible: boolean;
  isMinimized: boolean;
  onToggleMinimized?: () => void;
  onHideProfile?: () => void;
}

/**
 * Hero Technical Profile component with scrollbar improvements
 * Displays comprehensive technical skills and performance metrics
 * Extracted from ViewfinderOverlay for better separation of concerns
 */
export const HeroTechnicalProfile: React.FC<HeroTechnicalProfileProps> = ({
  skills,
  isVisible,
  isMinimized,
  onToggleMinimized,
  onHideProfile
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollUp: false, canScrollDown: false });
  const [heroVisibility, setHeroVisibility] = useState(1); // 0-1 opacity based on hero visibility

  // Smooth fade-out based on hero section scroll progress
  useEffect(() => {
    const updateHeroVisibility = () => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const heroHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Calculate how much of hero is still visible
        if (rect.top >= 0) {
          // Hero is fully or partially in view from the top
          setHeroVisibility(1);
        } else if (rect.bottom <= 0) {
          // Hero is completely scrolled past
          setHeroVisibility(0);
        } else {
          // Hero is partially scrolled out - calculate fade based on how much is visible
          const visibleHeight = rect.bottom;
          const fadeStartPoint = viewportHeight * 0.3; // Start fading when 70% scrolled

          if (visibleHeight > fadeStartPoint) {
            setHeroVisibility(1);
          } else {
            // Smooth fade from 1 to 0 as hero scrolls out
            const fadeProgress = Math.max(0, visibleHeight / fadeStartPoint);
            setHeroVisibility(fadeProgress);
          }
        }
      }
    };

    updateHeroVisibility();
    window.addEventListener('scroll', updateHeroVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateHeroVisibility);
  }, []);

  // Check scroll state for custom indicators
  const checkScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container && !isMinimized) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setScrollState({
        canScrollUp: scrollTop > 5,
        canScrollDown: scrollTop < scrollHeight - clientHeight - 5
      });
    } else {
      setScrollState({ canScrollUp: false, canScrollDown: false });
    }
  }, [isMinimized]);

  // Update scroll state on mount and scroll
  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollState, { passive: true });
      return () => container.removeEventListener('scroll', checkScrollState);
    }
  }, [checkScrollState]);

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<string, TechnicalSkill[]> = {};
    skills.forEach(skill => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }, [skills]);

  return (
    <div
      className="fixed z-30 transition-opacity duration-300 ease-out"
      style={{
        left: isMinimized ? 16 : 32, // Back to left side for better UX
        top: isMinimized ? 120 : 140, // Lower position to avoid hero name overlap
        opacity: heroVisibility, // Smooth fade based on hero section visibility
        pointerEvents: heroVisibility < 0.1 ? 'none' : 'auto', // Disable interactions when nearly invisible
      }}
    >
      {/* Custom scrollbar hiding styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        ref={scrollContainerRef}
        className={`bg-black/90 text-white rounded-2xl font-mono backdrop-blur-md transition-all duration-300 scrollbar-hide ${
          isMinimized ? 'p-3' : 'p-6'
        }`}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 500ms ease-out, transform 500ms ease-out, width 300ms ease-out, height 300ms ease-out',
          width: isMinimized
            ? '280px'
            : Math.min(400, window.innerWidth - 64), // Responsive width
          maxHeight: isMinimized
            ? '240px'
            : Math.min(500, window.innerHeight - 140), // Slightly smaller to ensure scrolling is needed
          maxWidth: '90vw',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(139, 92, 246, 0.1)',
          overflowY: isMinimized ? 'hidden' : 'auto',
          overflowX: 'hidden', // Prevent horizontal scroll
          fontSize: isMinimized ? '12px' : '14px',
          // Hide scrollbars with cross-browser support
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {/* Header with toggle */}
        <div className={`flex items-center justify-between border-b border-white/20 ${isMinimized ? 'pb-2' : 'pb-3'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-athletic-brand-violet animate-pulse"></div>
            <div className={`text-athletic-brand-violet font-bold tracking-wider ${
              isMinimized ? 'text-xs' : 'text-sm'
            }`}>
              {isMinimized ? 'PROFILE' : 'TECHNICAL PROFILE'}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onToggleMinimized && (
              <button
                onClick={onToggleMinimized}
                className="text-white/60 hover:text-white/90 transition-colors duration-200 p-1 rounded hover:bg-white/10"
                aria-label={isMinimized ? 'Expand technical profile' : 'Minimize technical profile'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMinimized ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  )}
                </svg>
              </button>
            )}
            {onHideProfile && (
              <button
                onClick={onHideProfile}
                className="text-white/50 hover:text-white/80 transition-colors duration-200 p-1 rounded hover:bg-white/10"
                aria-label="Hide technical profile"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Comprehensive Skills Display */}
        {!isMinimized && (
          <div className="mt-4 space-y-4">
            {Object.entries(skillsByCategory).map(([categoryKey, categorySkills]) => {
              const category = SKILL_CATEGORIES[categoryKey as keyof typeof SKILL_CATEGORIES];
              if (!category) return null;

              return (
                <div key={categoryKey}>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-[2px] rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                      {category.label}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-5">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="flex justify-between items-center text-xs hover:bg-white/5 rounded px-2 py-1 transition-colors">
                        <span className="text-white/90 font-medium">{skill.label}</span>
                        <span
                          className="font-bold text-xs px-2 py-0.5 rounded"
                          style={{
                            color: category.color,
                            backgroundColor: `${category.color}15`,
                          }}
                        >
                          {skill.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Additional Performance Metrics Section to ensure scrolling */}
            <div className="border-t border-white/20 pt-4 mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-[2px] rounded-full bg-green-400" />
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                  Live Performance
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-5">
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">Frame Rate</div>
                  <div className="text-green-400 font-bold text-xs">60fps</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">Frame Time</div>
                  <div className="text-blue-400 font-bold text-xs">16.7ms</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">Bundle Size</div>
                  <div className="text-purple-400 font-bold text-xs">&lt;75KB</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">LCP Score</div>
                  <div className="text-athletic-court-orange font-bold text-xs">&lt;2.5s</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">CLS</div>
                  <div className="text-cyan-400 font-bold text-xs">0.01</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <div className="text-white/60 mb-1 text-xs">FID</div>
                  <div className="text-indigo-400 font-bold text-xs">&lt;100ms</div>
                </div>
              </div>
            </div>

            {/* Technology Stack Section */}
            <div className="border-t border-white/20 pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-[2px] rounded-full bg-blue-400" />
                <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                  Current Stack
                </span>
              </div>
              <div className="space-y-1.5 pl-5">
                <div className="flex justify-between items-center text-xs hover:bg-white/5 rounded px-2 py-1">
                  <span className="text-white/90">React 19.1.1</span>
                  <span className="text-blue-400 bg-blue-400/15 px-2 py-0.5 rounded text-xs font-bold">Latest</span>
                </div>
                <div className="flex justify-between items-center text-xs hover:bg-white/5 rounded px-2 py-1">
                  <span className="text-white/90">TypeScript</span>
                  <span className="text-blue-400 bg-blue-400/15 px-2 py-0.5 rounded text-xs font-bold">5.x</span>
                </div>
                <div className="flex justify-between items-center text-xs hover:bg-white/5 rounded px-2 py-1">
                  <span className="text-white/90">Vite</span>
                  <span className="text-green-400 bg-green-400/15 px-2 py-0.5 rounded text-xs font-bold">6.3.6</span>
                </div>
                <div className="flex justify-between items-center text-xs hover:bg-white/5 rounded px-2 py-1">
                  <span className="text-white/90">Tailwind CSS</span>
                  <span className="text-cyan-400 bg-cyan-400/15 px-2 py-0.5 rounded text-xs font-bold">4.x</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Minimized skills preview */}
        {isMinimized && (
          <div className="mt-2">
            <div className="text-[10px] text-white/70 space-y-1">
              <div className="flex justify-between">
                <span>React/TS</span>
                <span className="text-athletic-brand-violet">Expert</span>
              </div>
              <div className="flex justify-between">
                <span>Architecture</span>
                <span className="text-blue-400">Lead</span>
              </div>
              <div className="text-[9px] text-white/50 mt-1">+12 more skills</div>
            </div>
          </div>
        )}
      </div>

      {/* Custom scroll indicators */}
      {!isMinimized && (
        <>
          {scrollState.canScrollUp && (
            <div className="absolute top-2 right-2 z-10 pointer-events-none">
              <div className="bg-athletic-brand-violet/20 backdrop-blur-sm rounded-full p-1.5 animate-pulse border border-athletic-brand-violet/30">
                <svg className="w-3 h-3 text-athletic-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>
          )}

          {scrollState.canScrollDown && (
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
              <div className="bg-athletic-brand-violet/20 backdrop-blur-sm rounded-full p-1.5 animate-pulse border border-athletic-brand-violet/30">
                <svg className="w-3 h-3 text-athletic-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};