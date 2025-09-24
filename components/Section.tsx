
import React from 'react';

interface SectionProps {
    id: string;
    setRef: (el: HTMLDivElement | null) => void;
    className?: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, setRef, className = '', children }) => {
    return (
        <section
            id={id}
            ref={setRef}
            className={`min-h-screen w-full flex items-center justify-center py-20 lg:py-32 ${className}`}
        >
            <div className="container mx-auto px-6">
                {children}
            </div>
        </section>
    );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 lg:mb-16">
        <span className="text-brand-violet">/</span> {children}
    </h2>
);

export default Section;
