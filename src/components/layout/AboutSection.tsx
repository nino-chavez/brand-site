
import React from 'react';
import Section, { SectionTitle } from './Section';

interface AboutSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ setRef }) => {
    return (
        <Section id="focus" setRef={setRef}>
            <div className="grid lg:grid-cols-5 gap-12 items-center">
                <div className="lg:col-span-2">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
                         <img src="https://picsum.photos/seed/profile/800/800" alt="Nino Chavez" className="w-full h-full object-cover"/>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <SectionTitle>About Me</SectionTitle>
                    <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                        <p>
                            I'm an Enterprise Architect and Managing Consultant with a deep-rooted passion for software engineering. My career is a blend of high-level strategic thinking and hands-on technical implementation, helping businesses navigate complex digital transformations. I thrive on architecting scalable, resilient systems that drive innovation.
                        </p>
                        <p>
                            Beyond the world of code and cloud, I'm an avid action sports photographer, specializing in volleyball. This creative outlet sharpens my eye for detail and timing, skills that surprisingly translate back to my technical work. Capturing the peak of the action is a challenge I relish.
                        </p>
                        <p>
                            Recently, I've dived headfirst into the realm of Generative AI, applying agentic development principles to build smarter, more autonomous software. This website is a testament to that exploration, a launchpad for both my professional and creative endeavors.
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default AboutSection;
