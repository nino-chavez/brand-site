
import React from 'react';

interface SectionProps {
    id: string;
    setRef: (el: HTMLDivElement | null) => void;
    className?: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, setRef, className = '', children }) => {
    // Add extra padding for about section to create smooth transition from hero
    const isAboutSection = id === 'about';
    const paddingClass = isAboutSection ? 'py-32 lg:py-40' : 'py-20 lg:py-32';

    return (
        <section
            id={id}
            ref={setRef}
            className={`min-h-screen w-full flex items-center justify-center ${paddingClass} ${className} ${isAboutSection ? 'bg-gradient-to-b from-brand-dark via-brand-dark to-gray-900' : ''}`}
        >
            <div className="container mx-auto px-6">
                {children}
            </div>
        </section>
    );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 lg:mb-16 text-gradient-violet">
        <span className="text-gradient-orange">/</span> {children}
    </h2>
);

export default Section;
