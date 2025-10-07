
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
    const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

    return (
        <Section id="portfolio" setRef={setRef}>
            <div
                ref={elementRef as React.RefObject<HTMLDivElement>}
                className={`text-center max-w-3xl mx-auto transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
                }`}
            >
                <SectionTitle>Strategic Engagements</SectionTitle>
                <p className="text-xl text-gray-100 mb-4 font-medium">
                    Architected $10M+ commerce transformations for Fortune 500 retailers.
                    Two decades building enterprise platforms at global scale.
                </p>
                <p className="text-lg text-gray-300 mb-8">
                    Currently supporting Fortune 500 commerce transformations.
                    Accepting strategic architecture engagements for Q1 2026.
                </p>
                <p className="text-base text-gray-400 mb-12">
                    <a
                        href="https://blog.nino.photos"
                        className="text-brand-violet hover:text-brand-violet-light transition-colors duration-300 inline-flex items-center gap-2"
                    >
                        Read enterprise architecture insights →
                    </a>
                </p>

                {/* Primary CTA - Email */}
                <div className="mb-12">
                    <a
                        ref={emailBtnRef}
                        href="mailto:hello@nino.photos"
                        className="btn-primary btn-magnetic inline-block text-lg px-8 py-4"
                    >
                        hello@nino.photos
                    </a>
                </div>

                {/* Secondary - Social Links */}
                <div className="flex justify-center items-center gap-6 mb-12">
                    {SOCIAL_LINKS.map(link => {
                        const SocialLink = () => {
                            const linkRef = useMagneticEffect<HTMLAnchorElement>({ strength: 0.3, radius: 60 });
                            return (
                                <a
                                    ref={linkRef}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.name}
                                    className="text-gray-400 hover:text-brand-violet transition-colors duration-300 btn-magnetic"
                                >
                                    <link.icon className="w-6 h-6" />
                                </a>
                            );
                        };
                        return <SocialLink key={link.name} />;
                    })}
                </div>
                <footer className="text-sm text-gray-500 border-t border-gray-800 pt-8 mt-12">
                    <p>&copy; {new Date().getFullYear()} Nino Chavez. All rights reserved.</p>
                </footer>
            </div>
        </Section>
    );
};

export default ContactSection;
