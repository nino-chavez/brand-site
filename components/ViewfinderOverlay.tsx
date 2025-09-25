import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useMouseTracking } from '../hooks/useMouseTracking';
import { CompatibilityFallbacks, ProgressiveEnhancement } from '../utils/browserCompat';
import type { TechnicalSkill, SkillCategory } from '../types';
import { HERO_VIEWFINDER_CONFIG, HERO_TECHNICAL_SKILLS, SKILL_CATEGORIES } from '../constants';

interface ViewfinderOverlayProps {
  isActive?: boolean;
  className?: string;
  onCapture?: () => void;
  // Hero mode props
  mode?: 'standard' | 'hero';
  showMetadataHUD?: boolean;
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
  profileVisible?: boolean;
  onHideProfile?: () => void;
}

const ViewfinderOverlay: React.FC<ViewfinderOverlayProps> = ({
  isActive = false,
  className = '',
  onCapture,
  mode = 'standard',
  showMetadataHUD = false,
  isMinimized = false,
  onToggleMinimized,
  profileVisible = true,
  onHideProfile,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Initialize browser compatibility utilities
  const compat = useMemo(() => CompatibilityFallbacks.getInstance(), []);
  const enhancement = useMemo(() => new ProgressiveEnhancement(), []);
  const config = useMemo(() => enhancement.getOptimizedViewfinderConfig(), [enhancement]);

  // Use our mouse tracking hook with optimized settings for device
  const { currentPosition, targetPosition, isTracking } = useMouseTracking({
    delay: config.mouseTracking.delay,
    throttleMs: config.mouseTracking.throttleMs,
    enableEasing: config.mouseTracking.enableEasing,
    easingCurve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    boundaryElement: overlayRef.current,
  });

  // Handle activation state
  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    } else {
      // Add fade out delay before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  // Handle click capture
  const handleClick = (e: React.MouseEvent) => {
    if (isActive && onCapture) {
      e.preventDefault();
      onCapture();
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsVisible(!isVisible);
      } else if (e.key === 'Enter' && isVisible && onCapture) {
        e.preventDefault();
        onCapture();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onCapture]);

  if (!isVisible) return null;

  // Hero mode: show technical profile instead of viewfinder
  if (mode === 'hero' && showMetadataHUD && profileVisible) {
    return (
      <div className="relative">
        <HeroTechnicalProfile
          skills={HERO_TECHNICAL_SKILLS}
          isVisible={true}
          isMinimized={isMinimized}
          onToggleMinimized={onToggleMinimized}
          onHideProfile={onHideProfile}
        />
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 pointer-events-auto ${className}`}
      onClick={handleClick}
      style={{
        background: 'transparent',
        cursor: isActive ? 'crosshair' : 'default',
        transition: `opacity 300ms ease-out ${isActive ? '' : ', visibility 300ms ease-out'}`,
        opacity: isActive ? 1 : 0,
        visibility: isActive ? 'visible' : 'hidden',
      }}
    >
      {/* Crosshair Component */}
      <div
        className="absolute pointer-events-none"
        style={enhancement.enhanceStyles(
          {
            left: currentPosition.x - config.visual.crosshairSize / 2,
            top: currentPosition.y - config.visual.crosshairSize / 2,
            width: config.visual.crosshairSize,
            height: config.visual.crosshairSize,
          },
          {
            transform: { x: 0, y: 0 }, // Use hardware acceleration if supported
            animation: isTracking ? undefined : {
              duration: config.animations.duration,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
          }
        )}
      >
        <CrosshairIcon
          size={config.visual.crosshairSize}
          color="rgba(255, 255, 255, 0.9)"
          strokeWidth={2}
        />
      </div>

      {/* Focus Ring */}
      <div
        className="absolute pointer-events-none"
        style={enhancement.enhanceStyles(
          {
            left: currentPosition.x - config.visual.focusRingSize / 2,
            top: currentPosition.y - config.visual.focusRingSize / 2,
            width: config.visual.focusRingSize,
            height: config.visual.focusRingSize,
            borderRadius: '50%',
            border: '2px dashed rgba(255, 255, 255, 0.5)',
            opacity: isActive ? 0.6 : 0,
          },
          {
            transform: { x: 0, y: 0 }, // Use hardware acceleration if supported
            animation: isTracking ? undefined : {
              duration: config.animations.duration,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
          }
        )}
      />

      {/* Viewfinder Corner Brackets */}
      <div className="absolute inset-0 pointer-events-none">
        <ViewfinderBrackets />
      </div>

      {/* EXIF Metadata Display */}
      {isActive && (
        <div
          className="absolute pointer-events-none"
          style={enhancement.enhanceStyles(
            {
              left: Math.min(currentPosition.x + 30, window.innerWidth - 200),
              top: Math.max(currentPosition.y - 80, 20),
            },
            {
              animation: isTracking ? undefined : {
                duration: config.animations.duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              },
            }
          )}
        >
          <ExifDisplay
            position={currentPosition}
            isVisible={isActive}
            compat={compat}
          />
        </div>
      )}
    </div>
  );
};

// Crosshair Icon Component
const CrosshairIcon: React.FC<{
  size: number;
  color: string;
  strokeWidth: number;
}> = ({ size, color, strokeWidth }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Horizontal line */}
    <line
      x1="8"
      y1="20"
      x2="32"
      y2="20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Vertical line */}
    <line
      x1="20"
      y1="8"
      x2="20"
      y2="32"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Center dot */}
    <circle
      cx="20"
      cy="20"
      r="1.5"
      fill={color}
    />
  </svg>
);

// Viewfinder Brackets Component
const ViewfinderBrackets: React.FC = () => (
  <>
    {/* Top-left bracket */}
    <svg
      className="absolute top-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3V9M3 3H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Top-right bracket */}
    <svg
      className="absolute top-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 3V9M21 3H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-left bracket */}
    <svg
      className="absolute bottom-4 left-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 21V15M3 21H9"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Bottom-right bracket */}
    <svg
      className="absolute bottom-4 right-4"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 21V15M21 21H15"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </>
);

// EXIF Display Component
const ExifDisplay: React.FC<{
  position: { x: number; y: number };
  isVisible: boolean;
  compat: CompatibilityFallbacks;
}> = ({ position, isVisible, compat }) => {
  const backdropStyle = compat.getBackdropFilterStyle(8);

  return (
    <div
      className="bg-black/80 text-white p-3 rounded-md font-mono text-xs"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        minWidth: '180px',
        ...backdropStyle, // Apply browser-compatible backdrop filter
      }}
    >
      <div className="space-y-1">
        <div className="text-orange-400 font-semibold">CAMERA</div>
        <div>Canon EOS R5</div>
        <div>24-70mm f/2.8L</div>
        <div className="text-orange-400 font-semibold mt-2">SETTINGS</div>
        <div>f/2.8 • 1/60s • ISO 100</div>
        <div className="text-orange-400 font-semibold mt-2">POSITION</div>
        <div>{position.x}px, {position.y}px</div>
        <div className="text-orange-400 font-semibold mt-2">TECH</div>
        <div>React 19.1.1</div>
        <div>60fps • 16.7ms</div>
      </div>
    </div>
  );
};

// Hero Technical Profile Component with scrollbar improvements
const HeroTechnicalProfile: React.FC<{
  skills: TechnicalSkill[];
  isVisible: boolean;
  isMinimized: boolean;
  onToggleMinimized?: () => void;
  onHideProfile?: () => void;
}> = ({ skills, isVisible, isMinimized, onToggleMinimized, onHideProfile }) => {
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
            <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse"></div>
            <div className={`text-brand-violet font-bold tracking-wider ${
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
                  <div className="text-orange-400 font-bold text-xs">&lt;2.5s</div>
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
                <span className="text-brand-violet">Expert</span>
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
              <div className="bg-brand-violet/20 backdrop-blur-sm rounded-full p-1.5 animate-pulse border border-brand-violet/30">
                <svg className="w-3 h-3 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            </div>
          )}

          {scrollState.canScrollDown && (
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
              <div className="bg-brand-violet/20 backdrop-blur-sm rounded-full p-1.5 animate-pulse border border-brand-violet/30">
                <svg className="w-3 h-3 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default ViewfinderOverlay;