
import React from 'react';
import { useScrollAnimation, getAnimationClasses, useAnimationWithEffects } from '../../hooks/useScrollAnimation';

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

    // Section-specific color classes for ambient lighting
    const sectionColorMap: Record<string, string> = {
        'work': 'section-portfolio',
        'about': 'section-focus',
        'contact': 'section-develop',
        'experience': 'section-exposure'
    };
    const sectionColorClass = sectionColorMap[id] || '';

    // Get user animation preferences
    const { getClasses } = useAnimationWithEffects();

    // Scroll animation
    const { elementRef, isVisible } = useScrollAnimation({
        threshold: 0.05,
        rootMargin: '0px 0px 50px 0px',
        triggerOnce: true
    });

    // Combine refs
    const combineRefs = (el: HTMLDivElement | null) => {
        setRef(el);
        elementRef.current = el;
    };

    return (
        <section
            id={id}
            ref={combineRefs}
            className={`min-h-screen w-full flex items-center justify-center ${paddingClass} ${className} ${sectionColorClass} ${isAboutSection ? 'bg-gradient-to-b from-brand-dark via-brand-dark to-gray-900' : ''}`}
            data-section={id}
        >
            <div className={`container mx-auto px-6 ${getClasses(isVisible)}`}>
                {children}
            </div>
        </section>
    );
};

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getClasses } = useAnimationWithEffects();
    const { elementRef, isVisible } = useScrollAnimation({
        threshold: 0.5,
        triggerOnce: true
    });

    return (
        <h2
            ref={elementRef as React.RefObject<HTMLHeadingElement>}
            className={`text-4xl md:text-5xl font-bold text-center mb-12 lg:mb-16 text-gradient-violet ${getClasses(isVisible)}`}
        >
            <span className="text-gradient-orange">/</span> {children}
        </h2>
    );
};

export default Section;
