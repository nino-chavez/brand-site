
import React from 'react';
import Section, { SectionTitle } from './Section';

interface ReelSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
}

const ReelSection: React.FC<ReelSectionProps> = ({ setRef }) => {
    return (
        <Section id="reel" setRef={setRef}>
            <div className="text-center">
                <SectionTitle>Video Reel</SectionTitle>
                <div className="aspect-video max-w-4xl mx-auto bg-gray-900/50 border border-gray-700/50 rounded-lg flex items-center justify-center">
                     <p className="text-gray-400">Video content coming soon.</p>
                </div>
            </div>
        </Section>
    );
};

export default ReelSection;
