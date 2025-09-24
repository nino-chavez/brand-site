
import React from 'react';
import type { SectionId } from '../types';
import { SECTIONS } from '../constants';

interface FloatingNavProps {
    onNavigate: (id: SectionId) => void;
    activeSection: string | null;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ onNavigate, activeSection }) => {
    return (
        <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block pr-6">
            <ul className="space-y-4">
                {SECTIONS.map(section => (
                    <li key={section.id} className="flex items-center justify-end group">
                         <span className="absolute right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-brand-violet text-white text-xs px-2 py-1 rounded-md capitalize">
                            {section.title}
                        </span>
                        <button
                            onClick={() => onNavigate(section.id)}
                            aria-label={`Go to ${section.title} section`}
                            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeSection === section.id ? 'bg-brand-violet border-brand-violet scale-125' : 'border-gray-500 hover:border-brand-violet'}`}
                        ></button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default FloatingNav;
