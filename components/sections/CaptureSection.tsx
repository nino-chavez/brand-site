import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import { useMagneticEffect } from '../../src/hooks/useMagneticEffect';

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
  const { state, actions } = useUnifiedGameFlow();
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

  // Magnetic button effects
  const viewWorkButtonRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.4, radius: 100 });
  const contactButtonRef = useMagneticEffect<HTMLButtonElement>({ strength: 0.3, radius: 90 });

  // Camera readiness sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('capture-section-ready');

      const readinessSequence = async () => {
        try {
          // Simulate camera startup sequence
          await new Promise(resolve => setTimeout(resolve, 200));
          setCameraReady(true);

          await new Promise(resolve => setTimeout(resolve, 300));
          setFocusLocked(true);

          await new Promise(resolve => setTimeout(resolve, 200));
          setExposureSet(true);

          await new Promise(resolve => setTimeout(resolve, 300));
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

  // Mouse movement handler for subtle interactions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!sectionRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  }, []);

  const handleViewWorkCTA = useCallback(() => {
    gameFlowDebugger.log('info', 'navigation', 'View Work CTA clicked - initiating Game Flow journey');

    // Trigger capture sequence animation
    setCaptureSequenceActive(true);

    // Navigate to focus section after animation
    setTimeout(() => {
      actions.navigateToSection('focus');
    }, 800); // Match capture sequence duration
  }, [gameFlowDebugger, actions]);

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
        if (typeof ref === 'function') {
          ref(el);
        } else if (ref) {
          ref.current = el;
        }
      }}
      id="capture"
      className={`min-h-screen relative overflow-hidden ${className}`}
      data-testid="capture-section"
      data-active={active || isActive}
      data-progress={progress}
      data-camera-ready={cameraReady}
      data-section="capture"
      data-camera-metaphor="true"
      onMouseMove={handleMouseMove}
      aria-label="Capture section - Introduction and technical readiness"
    >
      {/* Background with enhanced parallax */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/hero.jpg)',
          willChange: 'transform',
          height: '120%',
          top: '-10%',
          transform: `translate3d(0, ${progress * 20}px, 0)` // Parallax based on section progress
        }}
      />

      {/* Interactive spotlight effect following mouse */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.15), transparent 60%)`,
        }}
      />

      {/* Enhanced dark overlays for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      <div className="absolute inset-0 bg-black/20" />

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
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          {/* Title with clean, impactful presentation */}
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none"
            style={{
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
              animation: 'fadeInUp 1s ease-out 0.2s both'
            }}
            data-testid="hero-title"
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
            className="mb-8"
            style={{ animation: 'fadeInUp 1s ease-out 0.4s both' }}
            data-testid="hero-role"
          >
            <p className="text-xl md:text-3xl lg:text-4xl font-semibold tracking-wide mb-2">
              Enterprise Architect
            </p>
            <div className="flex items-center justify-center space-x-3 text-lg md:text-xl text-white/90 font-medium">
              <span>Software Engineer</span>
              <div className="w-1 h-1 rounded-full bg-white/60" />
              <span>Action Photographer</span>
            </div>
          </div>

          {/* Simplified tagline */}
          <p
            className="text-xl md:text-2xl text-white/85 mb-12 font-normal leading-relaxed tracking-wide"
            style={{
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}
          >
            Technical excellence meets athletic precision
          </p>

          {/* Primary CTA - "View Work" to initiate scroll journey */}
          <div
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
            style={{ animation: 'fadeInUp 1s ease-out 0.8s both' }}
            data-testid="primary-cta"
          >
            <button
              ref={viewWorkButtonRef}
              onClick={handleViewWorkCTA}
              className="group bg-athletic-brand-violet hover:bg-athletic-brand-violet/90 text-white font-bold px-10 py-4 rounded-xl border border-white/20 backdrop-blur-sm"
              style={{
                transition: 'background-color 300ms, box-shadow 300ms, border-color 300ms',
                willChange: 'transform'
              }}
              data-testid="view-work-cta"
            >
              <span className="flex items-center justify-center space-x-2">
                <span className="text-lg tracking-wide">View Work</span>
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <button
              ref={contactButtonRef}
              onClick={handlePrimaryCTA}
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold px-10 py-4 rounded-xl hover:bg-white/20 hover:border-white/60"
              style={{
                transition: 'background-color 300ms, box-shadow 300ms, border-color 300ms',
                willChange: 'transform'
              }}
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-lg tracking-wide">Contact</span>
              </span>
            </button>
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

        .shutter-active {
          animation: flash 0.8s ease-out;
        }
      `}</style>
    </section>
  );
});

CaptureSection.displayName = 'CaptureSection';

export default CaptureSection;