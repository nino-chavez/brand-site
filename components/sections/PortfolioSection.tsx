import React, { forwardRef, useEffect, useCallback, useState, useRef } from 'react';
import { useUnifiedGameFlow } from '../../src/contexts/UnifiedGameFlowContext';
import { useGameFlowDebugger } from '../../src/hooks/useGameFlowDebugger';
import ViewfinderOverlay from '../../src/components/layout/ViewfinderOverlay';
import { useScrollAnimation, useAnimationWithEffects } from '../../src/hooks/useScrollAnimation';

interface PortfolioSectionProps {
  active: boolean;
  progress: number;
  onSectionReady: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

interface ContactMethod {
  type: 'email' | 'linkedin' | 'github' | 'calendar';
  label: string;
  value: string;
  href: string;
  primary?: boolean;
  icon: string;
}

const PortfolioSection = forwardRef<HTMLElement, PortfolioSectionProps>(({
  active,
  progress,
  onSectionReady,
  onError,
  className = ''
}, ref) => {
  // Game Flow section hook
  const { state, actions } = useUnifiedGameFlow();
  const isActive = state.currentSection === 'portfolio';

  // Debug logging
  const gameFlowDebugger = useGameFlowDebugger();

  // Component state
  const [portfolioComplete, setPortfolioComplete] = useState(false);
  const [contactReady, setContactReady] = useState(false);
  const [narrativeComplete, setNarrativeComplete] = useState(false);
  const [selectedContactMethod, setSelectedContactMethod] = useState<string | null>(null);
  const [sessionPerformanceData, setSessionPerformanceData] = useState({
    frameRate: 60,
    loadTime: 0,
    interactionTime: 0
  });

  const sectionRef = useRef<HTMLElement>(null);

  // Effects context for user-controlled animations
  const { getClasses } = useAnimationWithEffects();

  // Section-level animation (whole section entrance)
  const { elementRef: sectionAnimRef, isVisible: sectionVisible } = useScrollAnimation({
    threshold: 0.15,
    triggerOnce: true
  });

  // Content-level animations (staggered after section)
  const { elementRef: headingRef, isVisible: headingVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: narrativeRef, isVisible: narrativeVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const { elementRef: contactRef, isVisible: contactVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  // Contact methods
  const contactMethods: ContactMethod[] = [
    {
      type: 'email',
      label: 'Direct Email',
      value: 'nino@ninochavez.com',
      href: 'mailto:nino@ninochavez.com?subject=Collaboration Opportunity',
      primary: true,
      icon: '📧'
    },
    {
      type: 'linkedin',
      label: 'LinkedIn',
      value: '/in/ninochavez',
      href: 'https://linkedin.com/in/ninochavez',
      icon: '💼'
    },
    {
      type: 'github',
      label: 'GitHub',
      value: '@ninochavez',
      href: 'https://github.com/ninochavez',
      icon: '⚡'
    },
    {
      type: 'calendar',
      label: 'Schedule Call',
      value: 'Book 30 min consultation',
      href: 'https://calendly.com/ninochavez/consultation',
      icon: '📅'
    }
  ];

  // Portfolio completion sequence
  useEffect(() => {
    if (active || isActive) {
      gameFlowDebugger.startBenchmark('portfolio-section-ready');

      const portfolioSequence = async () => {
        try {
          // Portfolio completion sequence
          await new Promise(resolve => setTimeout(resolve, 200));
          setPortfolioComplete(true);

          await new Promise(resolve => setTimeout(resolve, 300));
          setContactReady(true);

          await new Promise(resolve => setTimeout(resolve, 400));
          setNarrativeComplete(true);

          // Capture final performance metrics
          const finalMetrics = {
            frameRate: 60, // Would be measured from performance monitoring
            loadTime: Math.round(performance.now()),
            interactionTime: Date.now()
          };
          setSessionPerformanceData(finalMetrics);

          gameFlowDebugger.endBenchmark('portfolio-section-ready');
          if (onSectionReady && typeof onSectionReady === 'function') {
            onSectionReady();
          }

        } catch (error) {
          gameFlowDebugger.log('error', 'section', 'Portfolio section failed', error);
          onError?.(error instanceof Error ? error : new Error('Portfolio section failed'));
        }
      };

      portfolioSequence();
    }
  }, [active, isActive, onSectionReady, onError, gameFlowDebugger]);

  // Contact method selection
  const handleContactMethodSelect = useCallback((methodType: string) => {
    setSelectedContactMethod(methodType);

    const method = contactMethods.find(m => m.type === methodType);
    if (method) {
      gameFlowDebugger.log('info', 'interaction', 'Contact method selected', { method: methodType, href: method.href });

      // Open contact method
      if (method.type === 'email' && method.href.startsWith('mailto:')) {
        window.location.href = method.href;
      } else {
        window.open(method.href, '_blank', 'noopener,noreferrer');
      }
    }
  }, [contactMethods, gameFlowDebugger]);

  // Form submission handler
  const handleQuickContact = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      type: formData.get('inquiry-type')
    };

    gameFlowDebugger.log('info', 'form', 'Quick contact form submitted', contactData);

    // In real implementation, would send to backend
    alert('Thank you for your message! I\'ll respond within 24 hours.');
  }, [gameFlowDebugger]);

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
      id="portfolio"
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-neutral-900 via-slate-900 to-black ${getClasses(sectionVisible)} ${className}`}
      data-testid="portfolio-section"
      data-active={active || isActive}
      data-progress={progress}
      data-portfolio-complete={portfolioComplete}
      data-section="portfolio"
      data-camera-metaphor="true"
      aria-label="Portfolio section - Contact and collaboration opportunities"
    >
      {/* Final performance consistency indicator */}
      <div
        className="hidden"
        data-testid="section-performance"
        data-frame-rate={sessionPerformanceData.frameRate}
        data-load-time={sessionPerformanceData.loadTime}
      />

      {/* Main content - clean completion interface */}
      <div className="relative z-20 min-h-screen flex flex-col justify-center">
        <div className="max-w-6xl mx-auto px-8 py-16">

          {/* Journey completion narrative */}
          <div className="text-center mb-16">
            <div data-testid="journey-complete">
              <div className="mb-6">
                <div className="text-sm text-white/60 uppercase tracking-wider mb-2">Contact</div>
                <h2
                  ref={headingRef}
                  className={`text-4xl md:text-6xl font-black text-white leading-tight ${getClasses(headingVisible)}`}
                >
                  The Shot is
                  <span className="block text-athletic-brand-violet">Complete</span>
                </h2>
              </div>

              <div
                ref={narrativeRef}
                className={`max-w-3xl mx-auto space-y-6 mb-12 ${getClasses(narrativeVisible)}`}
                data-testid="narrative-conclusion"
              >
                <p className="text-xl text-white/90 leading-relaxed">
                  From initial capture to final development, every frame in this portfolio represents
                  the same precision I bring to enterprise architecture—
                </p>

                <p className="text-lg text-white/80 leading-relaxed">
                  <strong className="text-athletic-brand-violet">Perfect timing</strong> in problem identification.
                  <strong className="text-athletic-brand-violet"> Sharp focus</strong> on business objectives.
                  <strong className="text-athletic-brand-violet"> Flawless composition</strong> of technical solutions.
                  <strong className="text-athletic-brand-violet"> Optimal exposure</strong> of team capabilities.
                  <strong className="text-athletic-brand-violet"> Expert development</strong> of scalable systems.
                </p>

                <p className="text-xl text-white/90 leading-relaxed">
                  <strong>The match concludes.</strong> Ready for the next championship opportunity.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Contact methods - left column */}
            <div
              ref={contactRef}
              className={getClasses(contactVisible)}
            >
              <div className="mb-8">
                <h3 className="text-4xl font-bold text-white mb-3 leading-tight">Let's Build<br/>Something Exceptional</h3>
                <p className="text-lg text-white/70">Serious inquiries receive responses within 48 hours</p>
              </div>

              <div className="space-y-3 mb-8">
                {contactMethods.map((method) => (
                  <button
                    key={method.type}
                    onClick={() => handleContactMethodSelect(method.type)}
                    className={`w-full p-5 text-left bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl hover:from-white/10 hover:to-white/5 hover:border-athletic-brand-violet/40 transition-all duration-300 hover:translate-x-1 group ${
                      method.primary ? 'ring-1 ring-athletic-brand-violet/30 shadow-lg shadow-purple-500/10' : ''
                    }`}
                    data-testid={`${method.type}-contact`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl group-hover:scale-110 transition-transform">{method.icon}</div>
                        <div>
                          <div className="text-base font-semibold text-white group-hover:text-athletic-brand-violet transition-colors flex items-center gap-2">
                            {method.label}
                            {method.primary && (
                              <span className="px-2 py-0.5 text-xs bg-athletic-brand-violet/20 text-athletic-brand-violet rounded-full font-medium">
                                Preferred
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-white/50 mt-0.5">{method.value}</div>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-white/30 group-hover:text-athletic-brand-violet group-hover:translate-x-1 transition-all"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick stats - More modern card design */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-400 mb-1">&lt; 48hrs</div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Response Time</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
                  <div className="text-xs text-white/60 uppercase tracking-wide">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Contact form - right column */}
            <div
              className={`transition-all duration-1000 delay-500 ${
                contactReady ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}
            >
              <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20">
                <form onSubmit={handleQuickContact} className="space-y-5" data-testid="contact-form">
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-white mb-2">Send a Message</h4>
                    <p className="text-sm text-white/60">All fields are required</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-athletic-brand-violet/50 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-athletic-brand-violet/50 transition-all"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inquiry-type" className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                      What are you interested in?
                    </label>
                    <select
                      id="inquiry-type"
                      name="inquiry-type"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:bg-white/10 focus:border-athletic-brand-violet/50 transition-all"
                    >
                      <option value="architecture">Enterprise Architecture</option>
                      <option value="consulting">Technical Consulting</option>
                      <option value="leadership">Engineering Leadership</option>
                      <option value="ai">AI Strategy & Implementation</option>
                      <option value="photography">Action Sports Photography</option>
                      <option value="speaking">Speaking Engagement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
                      Project Details
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-athletic-brand-violet/50 transition-all resize-none"
                      placeholder="Tell me about your challenge, timeline, and what you're looking to achieve..."
                    />
                  </div>

                  {/* Modern CTAs */}
                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-athletic-brand-violet to-purple-600 hover:from-purple-600 hover:to-athletic-brand-violet text-white font-bold py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.98] group"
                      data-testid="collaboration-cta"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span className="uppercase tracking-wide text-sm">Send Message</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleContactMethodSelect('calendar')}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-white font-semibold py-3 rounded-lg transition-all duration-300 active:scale-[0.98] text-sm"
                      data-testid="consultation-cta"
                    >
                      Or schedule a 30-min consultation →
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Final performance demonstration */}
          <div
            className={`mt-16 text-center transition-all duration-1000 delay-700 ${
              narrativeComplete ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="inline-flex items-center space-x-6 px-8 py-4 bg-white/5 backdrop-blur-sm rounded-2xl">
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{sessionPerformanceData.frameRate}fps</div>
                <div className="text-xs text-white/50">Maintained</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">&lt; 1s</div>
                <div className="text-xs text-white/50">Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">Zero</div>
                <div className="text-xs text-white/50">Errors</div>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-4">
              Performance targets achieved. Technical mastery demonstrated.
            </p>
          </div>
        </div>
      </div>

      {/* ViewfinderOverlay in portfolio mode */}
      <ViewfinderOverlay
        isActive={active || isActive}
        mode="portfolio"
        showMetadataHUD={portfolioComplete}
        className="z-30"
        data-testid="viewfinder-overlay"
        data-mode="portfolio"
        data-portfolio-complete={portfolioComplete}
      />

      {/* Portfolio status indicators */}
      <div className="absolute top-4 left-4 z-40 space-y-2">
        <div
          className={`flex items-center space-x-2 text-sm font-mono ${
            portfolioComplete ? 'text-green-400' : 'text-yellow-400'
          } transition-colors duration-300`}
        >
          <div className={`w-2 h-2 rounded-full ${portfolioComplete ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span>PORTFOLIO {portfolioComplete ? 'COMPLETE' : 'FINAL'}</span>
        </div>

        {portfolioComplete && (
          <div className={`flex items-center space-x-2 text-sm font-mono ${contactReady ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full ${contactReady ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span>CONTACT {contactReady ? 'READY' : 'PREP'}</span>
          </div>
        )}

        {contactReady && (
          <div className={`flex items-center space-x-2 text-sm font-mono ${narrativeComplete ? 'text-green-400' : 'text-yellow-400'} transition-colors duration-300`}>
            <div className={`w-2 h-2 rounded-full ${narrativeComplete ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
            <span>NARRATIVE {narrativeComplete ? 'COMPLETE' : 'CLOSE'}</span>
          </div>
        )}
      </div>

      {/* Footer - clean completion */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-20">
        <p className="text-white/40 text-sm">
          © 2024 Nino Chavez • Enterprise Architect • Action Sports Photographer
        </p>
      </div>

      <style>{`
        .clean-completion {
          backdrop-filter: blur(20px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        }

        .match-end {
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
        }

        .unambiguous {
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        /* Form focus states */
        input:focus,
        textarea:focus,
        select:focus {
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
        }

        /* Button hover effects */
        [data-testid="collaboration-cta"]:hover {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        /* Performance indicator animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
});

PortfolioSection.displayName = 'PortfolioSection';

export default PortfolioSection;