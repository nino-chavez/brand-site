
import { useState, useEffect } from 'react';

const useScrollSpy = (elements: HTMLElement[], options: IntersectionObserverInit): string | null => {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        if (elements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, options);

        elements.forEach(element => {
            if (element) observer.observe(element);
        });

        return () => {
            elements.forEach(element => {
                if (element) observer.unobserve(element);
            });
        };
    }, [elements, options]);

    return activeSection;
};

export default useScrollSpy;
