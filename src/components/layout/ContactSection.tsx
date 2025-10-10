
import React from 'react';
import Section, { SectionTitle } from './Section';
import { SOCIAL_LINKS } from '../../constants';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface ContactSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ setRef }) => {
    const emailBtnRef = useMagneticEffect<HTMLAnchorElement>({ strength: 0.4, radius: 100 });
    const scheduleBtnRef = useMagneticEffect<HTMLAnchorElement>({ strength: 0.3, radius: 80 });
    const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

    return (
        <Section id="contact" setRef={setRef}>
            <div
                ref={elementRef as React.RefObject<HTMLDivElement>}
                className={`max-w-screen-lg mx-auto transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
                }`}
            >
                {/* Split Layout: Main CTA Left, Credibility Sidebar Right */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16">
                    {/* Left Column: Primary Action */}
                    <div className="text-center lg:text-left">
                        <SectionTitle className="text-left">Start a Conversation</SectionTitle>

                        {/* Value Proposition */}
                        <p className="text-xl md:text-2xl text-gray-50 mb-4 font-semibold leading-snug">
                            Enterprise infrastructure consulting for commerce transformations.
                            From Fortune 500 to growth-stage platforms.
                        </p>

                        {/* Trust Signals */}
                        <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <svg className="w-5 h-5 text-brand-violet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span className="font-medium">24-hour response</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <svg className="w-5 h-5 text-brand-violet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <span className="font-medium">Next availability: Nov 2025</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <svg className="w-5 h-5 text-brand-violet" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="font-medium">NDA provided</span>
                            </div>
                        </div>

                        {/* Primary CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
                            <a
                                ref={emailBtnRef}
                                href="mailto:hello@nino.photos"
                                className="btn-primary btn-magnetic inline-flex items-center justify-center gap-3 text-lg px-8 py-4 min-h-[56px] font-semibold"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M2 6l10 7 10-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                hello@nino.photos
                            </a>
                            <a
                                ref={scheduleBtnRef}
                                href="https://cal.com/nino-chavez"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-3 px-6 py-4 min-h-[56px] text-base font-medium text-gray-200 bg-transparent border-2 border-gray-700 rounded-xl hover:border-brand-violet hover:bg-brand-violet/10 transition-all duration-300 btn-magnetic"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Schedule 30-min consultation
                            </a>
                        </div>

                        {/* What to Expect */}
                        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 mb-8">
                            <h4 className="text-base font-semibold text-gray-100 mb-4">What to Expect</h4>
                            <ol className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-full text-sm font-semibold text-gray-200">1</span>
                                    <div>
                                        <strong className="block text-sm text-gray-200 mb-1">Send inquiry</strong>
                                        <p className="text-sm text-gray-400 leading-relaxed">Share your project context and timeline</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-full text-sm font-semibold text-gray-200">2</span>
                                    <div>
                                        <strong className="block text-sm text-gray-200 mb-1">Initial response (24h)</strong>
                                        <p className="text-sm text-gray-400 leading-relaxed">We'll confirm fit and suggest next steps</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex items-center justify-center w-8 h-8 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-full text-sm font-semibold text-gray-200">3</span>
                                    <div>
                                        <strong className="block text-sm text-gray-200 mb-1">Discovery call</strong>
                                        <p className="text-sm text-gray-400 leading-relaxed">30-min technical discussion (NDA provided)</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Right Column: Credibility Sidebar */}
                    <div>
                        <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 mb-6">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Verify Experience</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://www.linkedin.com/in/nino-chavez/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-300 hover:text-brand-violet transition-colors duration-200 group"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        <div className="flex-1">
                                            <span className="block text-sm font-medium group-hover:text-brand-violet transition-colors">LinkedIn</span>
                                            <span className="block text-xs text-gray-500">20 years at Fortune 500 retailers</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/nino-chavez"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-300 hover:text-brand-violet transition-colors duration-200 group"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                        <div className="flex-1">
                                            <span className="block text-sm font-medium group-hover:text-brand-violet transition-colors">GitHub</span>
                                            <span className="block text-xs text-gray-500">Open-source contributions</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://blog.nino.photos"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-300 hover:text-brand-violet transition-colors duration-200 group"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <div className="flex-1">
                                            <span className="block text-sm font-medium group-hover:text-brand-violet transition-colors">Blog</span>
                                            <span className="block text-xs text-gray-500">Architecture insights</span>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://gallery.nino.photos"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-gray-300 hover:text-brand-violet transition-colors duration-200 group"
                                    >
                                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                                            <path d="M21 15l-5-5L5 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <div className="flex-1">
                                            <span className="block text-sm font-medium group-hover:text-brand-violet transition-colors">Gallery</span>
                                            <span className="block text-xs text-gray-500">Action sports photography</span>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-sm text-gray-500 border-t border-gray-800 pt-8 mt-16 text-center">
                    <p>&copy; {new Date().getFullYear()} Nino Chavez. All rights reserved.</p>
                </footer>
            </div>
        </Section>
    );
};

export default ContactSection;
