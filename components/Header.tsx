
import React, { useState, useEffect } from 'react';
import type { SectionId } from '../types';
import { SECTIONS } from '../constants';

interface HeaderProps {
    onNavigate: (id: SectionId) => void;
    activeSection: string | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, activeSection }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('hero')} className="text-2xl font-bold tracking-wider text-white transition-colors hover:text-brand-violet">
                    NINO CHAVEZ
                </button>
                <nav className="hidden md:flex items-center space-x-8">
                    {SECTIONS.slice(1, 7).map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => onNavigate(section.id)}
                            className={`capitalize text-sm font-medium transition-colors duration-300 ${activeSection === section.id ? 'text-brand-violet' : 'text-gray-300 hover:text-white'}`}
                        >
                            <span className="text-brand-violet/80 mr-1">0{index + 1}</span> {section.title}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;
