import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import { useMagneticEffect } from '../../src/hooks/useMagneticEffect';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';
import { useEffects } from '../../src/contexts/EffectsContext';

interface CaptureSectionProps {
  active: boolean;
  progress: number;
  onSectionReady: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const CaptureSection = forwardRef<HTMLElement, CaptureSectionProps>(({
  active,
  progress,
  onSectionReady,
  onError,
  className = ''
}, ref) => {
  // Game Flow section hook
  const { state } = useUnifiedGameFlow();
  const isActive = state.currentSection === 'capture';

  // Debug logging
  const gameFlowDebugger = useGameFlowDebugger();

  // Component state
  const [cameraReady, setCameraReady] = useState(false);
  const [focusLocked, setFocusLocked] = useState(false);
  const [exposureSet, setExposureSet] = useState(false);
  const [compositionFramed, setCompositionFramed] = useState(false);
  const [captureSequenceActive, setCaptureSequenceActive] = useState(false);

  // Mouse tracking for subtle interactions
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const sectionRef = useRef<HTMLElement>(null);

  // Dynamic background showcase with Ken Burns effect
  const heroImages = [
    '/images/gallery/portfolio-00.jpg',
    '/images/gallery/portfolio-05.jpg',
    '/images/gallery/portfolio-10.jpg',
    '/images/gallery/portfolio-15.jpg',
    '/images/gallery/portfolio-20.jpg',
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);

  // Magnetic button effects
  const viewWorkButtonRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.4, radius: 100 });
  const contactButtonRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.3, radius: 90 });

  // Effects context for user-controlled animations
  const { settings } = useEffects();
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation (whole section entrance)
  const { elementRef: sectionAnimRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true
  });

  // Content-level animation hooks for each element (staggered after section)
  const { elementRef: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: roleRef, isVisible: roleVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: taglineRef, isVisible: taglineVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: ctaRef, isVisible: ctaVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  // Parallax multiplier based on user settings
  const parallaxMultiplier = {
    subtle: 0.3,
    normal: 0.5,
    intense: 0.8,
    off: 0
  }[settings.parallaxIntensity];

  // Camera readiness sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('capture-section-ready');

      const readinessSequence = async () => {
        try {
          // Instant content reveal - no delays for immediate visibility
          setCameraReady(true);
          setFocusLocked(true);
          setExposureSet(true);
          setCompositionFramed(true);

          gameFlowDebugger.endBenchmark('capture-section-ready');
          if (onSectionReady && typeof onSectionReady === 'function') {
            onSectionReady();
          }

        } catch (error) {
          gameFlowDebugger.log('error', 'section', 'Capture section readiness failed', error);
          onError?.(error instanceof Error ? error : new Error('Capture section failed'));
        }
      };

      readinessSequence();
    }
  }, [active, isActive, onSectionReady, onError, gameFlowDebugger]);

  // Dynamic background rotation (only if motion not reduced)
  useEffect(() => {
    // Respect user's motion preference
    if (settings.animationStyle === 'reduced' || settings.transitionSpeed === 'none') {
      return;
    }

    const interval = setInterval(() => {
      setNextImageIndex((current) => (current + 1) % heroImages.length);

      // Crossfade timing - reduced to 800ms for snappier feel
      setTimeout(() => {
        setCurrentImageIndex((current) => (current + 1) % heroImages.length);
      }, 800); // 800ms crossfade duration (was 1000ms)
    }, 6000); // Change image every 6 seconds (was 8s) for more dynamic feel

    return () => clearInterval(interval);
  }, [settings.animationStyle, settings.transitionSpeed, heroImages.length]);

  // Mouse movement handler for subtle interactions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  }, []);

  const handleViewWorkCTA = useCallback(() => {
    gameFlowDebugger.log('info', 'navigation', 'View Work CTA clicked - smooth scroll to projects');

    // Navigate directly to frame (projects) section without flash animation
    const frameSection = document.getElementById('frame');
    if (frameSection) {
      frameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [gameFlowDebugger]);

  // Primary CTA handler - for immediate contact
  const handlePrimaryCTA = useCallback(() => {
    gameFlowDebugger.log('info', 'navigation', 'Primary CTA clicked - direct contact');

    const contactSection = document.getElementById('portfolio');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [gameFlowDebugger]);

  // Capture sequence trigger for camera interactions
  const handleCaptureSequence = useCallback(() => {
    setCaptureSequenceActive(true);

    setTimeout(() => {
      setCaptureSequenceActive(false);
    }, 800);
  }, []);

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        sectionAnimRef.current = el;
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      id="capture"
      className={`min-h-screen relative overflow-hidden ${getClasses(sectionVisible)} ${className}`}
      data-testid="capture-section"
      data-active={active || isActive}
      data-progress={progress}
      data-camera-ready={cameraReady}
      data-section="capture"
      data-camera-metaphor="true"
      onMouseMove={handleMouseMove}
      aria-label="Capture section - Introduction and technical readiness"
    >
      {/* Dynamic Ken Burns Background Showcase */}
      {/* Current image layer with Ken Burns effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          willChange: 'transform, opacity',
          height: '120%',
          top: '-10%',
          transform: `translate3d(0, ${progress * 20 * parallaxMultiplier}px, 0)`,
          animation: settings.animationStyle !== 'reduced' ? 'kenBurns 12s ease-out infinite' : 'none',
          opacity: 1
        }}
        data-parallax-intensity={settings.parallaxIntensity}
        data-ken-burns-active={settings.animationStyle !== 'reduced'}
      />

      {/* Next image layer for crossfade (pre-loading) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${heroImages[nextImageIndex]})`,
          willChange: 'transform, opacity',
          height: '120%',
          top: '-10%',
          transform: `translate3d(0, ${progress * 20 * parallaxMultiplier}px, 0)`,
          animation: settings.animationStyle !== 'reduced' ? 'kenBurnsReverse 12s ease-out infinite' : 'none',
          opacity: 0
        }}
        data-parallax-intensity={settings.parallaxIntensity}
      />

      {/* Interactive spotlight effect following mouse */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15), transparent 60%)`,
        }}
      />

      {/* Enhanced dark overlays for better contrast and text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Animated gradient overlay - more subdued for minimalist focus */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(-45deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05), rgba(245, 158, 11, 0.05))',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      />

      {/* Minimalist content - focus on title, role, and primary CTA only */}
      <div className="absolute inset-0 flex items-center justify-center z-20 p-8">
        <div className="text-center text-white max-w-4xl mx-auto px-8">
          {/* Availability Badge - Urgency Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-green-500/20 border border-green-400/40 backdrop-blur-sm rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-green-100">
              Taking New Engagements • Q1 2026
            </span>
          </div>

          {/* Title with clean, impactful presentation */}
          <h1
            ref={titleRef}
            className={`text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none ${getClasses(titleVisible)}`}
            style={{
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.9)'
            }}
            data-testid="hero-title"
            data-animation-style={settings.animationStyle}
          >
            <span className="relative inline-block group">
              <span className="relative z-10">Nino Chavez</span>
              {/* Subtle shimmer effect on hover */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s ease-in-out infinite'
                }}
              />
            </span>
          </h1>

          {/* Role with professional focus */}
          <div
            ref={roleRef}
            className={`mb-8 ${getClasses(roleVisible)}`}
            data-testid="hero-role"
          >
            <p className="text-xl md:text-3xl lg:text-4xl font-semibold tracking-wide mb-4" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
              Systems Thinker • Enterprise Architect
            </p>
            <p className="text-lg md:text-xl text-white/80 font-medium" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
              I help teams build infrastructure that holds up when it matters
            </p>
          </div>

          {/* Value proposition */}
          <p
            ref={taglineRef}
            className={`text-lg md:text-xl text-white/75 mb-6 font-normal leading-relaxed ${getClasses(taglineVisible)}`}
            style={{
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)'
            }}
          >
            25 years in enterprise architecture<br />
            Currently: Guiding Fortune 500s through AI-native transformation
          </p>

          {/* Trust signals with specific companies */}
          <p className="text-sm md:text-base text-white/70 mb-4 font-medium" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
            SAP Commerce • Salesforce • Adobe
          </p>
          <p className="text-xs md:text-sm text-white/50 mb-6" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
            Not here for buzzwords or hype cycles<br />
            Here to find the signal in the noise
          </p>

          {/* Consolidated 2-CTA Approach */}
          <div
            ref={ctaRef}
            className={`${getClasses(ctaVisible)}`}
            data-testid="primary-cta"
          >
            {/* Primary & Secondary CTAs Only - No Tertiary */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8">
              {/* High Commitment: View Portfolio */}
              <button
                ref={viewWorkButtonRef}
                onClick={handleViewWorkCTA}
                className="group bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white font-bold px-16 py-7 text-2xl rounded-xl border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-2xl animate-pulse-subtle"
                style={{
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform'
                }}
                data-testid="view-work-cta"
                aria-label="View case studies and portfolio"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="tracking-wide">View Case Studies</span>
                  <svg
                    className="w-6 h-6 transition-transform duration-300 group-hover:translate-y-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {/* Medium Commitment: Read Writing */}
              <button
                ref={contactButtonRef}
                onClick={handlePrimaryCTA}
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold px-12 py-6 text-xl rounded-xl hover:bg-white/20 hover:border-white/60 shadow-md hover:shadow-lg"
                style={{
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform'
                }}
                aria-label="Read Signal Dispatch field notes"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="tracking-wide">Read Signal Dispatch</span>
                </span>
              </button>
            </div>

            {/* Social Proof Links - Moved to Subtle Footer Row */}
            <div className="flex justify-center gap-6 text-sm text-white/50">
              <a
                href="https://github.com/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://github.com/signal-x-studio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Signal X
              </a>
              <a
                href="https://linkedin.com/in/nino-chavez"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/80 transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy ViewfinderOverlay removed - ViewfinderController + ViewfinderMetadata handles display */}

      {/* Camera readiness indicators - Hidden (internal state tracking only) */}

      {/* Capture sequence animation overlay */}
      <div
        className={`absolute inset-0 z-50 pointer-events-none transition-all duration-800 ${
          captureSequenceActive ? 'opacity-100' : 'opacity-0'
        }`}
        data-testid="capture-sequence"
        data-active={captureSequenceActive}
      >
        {/* Shutter flash effect */}
        <div
          className={`absolute inset-0 bg-white ${
            captureSequenceActive ? 'animate-pulse' : ''
          }`}
          style={{
            animation: captureSequenceActive ? 'flash 0.2s ease-out' : 'none'
          }}
        />

        {/* Viewfinder brackets animation */}
        <div className="absolute inset-0 border-4 border-white animate-pulse"
          style={{
            clipPath: 'polygon(0 0, 20px 0, 20px 4px, 4px 4px, 4px 20px, 0 20px, 0 0, 100% 0, 100% 20px, calc(100% - 4px) 20px, calc(100% - 4px) 4px, calc(100% - 20px) 4px, calc(100% - 20px) 0, 100% 0, 100% 100%, calc(100% - 20px) 100%, calc(100% - 20px) calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) calc(100% - 20px), 100% calc(100% - 20px), 100% 100%, 0 100%, 0 calc(100% - 20px), 4px calc(100% - 20px), 4px calc(100% - 4px), 20px calc(100% - 4px), 20px 100%, 0 100%)'
          }}
        />

        {/* Camera click sound visual indicator */}
        {captureSequenceActive && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-white text-6xl animate-ping">📸</div>
          </div>
        )}
      </div>

      {/* Smooth transition fade for seamless section flow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-30 pointer-events-none" />

      {/* Test interaction button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleCaptureSequence}
          className="fixed bottom-40 left-4 px-3 py-1 bg-purple-600 text-white text-xs rounded z-50"
          data-testid="shutter-trigger"
        >
          📸 Capture
        </button>
      )}

      <style>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }

        @keyframes flash {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }

        /* Ken Burns effect - optimized timing for engagement */
        @keyframes kenBurns {
          0% {
            transform: scale(1) translate(0, 0);
          }
          100% {
            transform: scale(1.08) translate(-1.5%, -1%);
          }
        }

        @keyframes kenBurnsReverse {
          0% {
            transform: scale(1.08) translate(1.5%, 1%);
          }
          100% {
            transform: scale(1) translate(0, 0);
          }
        }

        .shutter-active {
          animation: flash 0.8s ease-out;
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
});

CaptureSection.displayName = 'CaptureSection';

export default CaptureSection;