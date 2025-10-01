
import React from 'react';
import Section, { SectionTitle } from './Section';
import { SOCIAL_LINKS } from '../../constants';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';

interface ContactSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const ContactSection: React.FC<ContactSectionProps> = ({ setRef }) => {
    return (
        <Section id="contact" setRef={setRef}>
            <div className="text-center max-w-3xl mx-auto">
                <SectionTitle>Let's Connect</SectionTitle>
                <p className="text-lg text-gray-300 mb-8">
                    I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Whether you're interested in my technical expertise or my creative work, feel free to reach out.
                </p>
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
                                    <link.icon className="w-8 h-8" />
                                </a>
                            );
                        };
                        return <SocialLink key={link.name} />;
                    })}
                </div>
                <footer className="text-sm text-gray-500 border-t border-gray-800 pt-8 mt-12">
                    <p>&copy; {new Date().getFullYear()} Nino Chavez. All rights reserved.</p>
                    <p className="mt-2">Built with Generative AI, React, and Tailwind CSS.</p>
                </footer>
            </div>
        </Section>
    );
};

export default ContactSection;
