
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
        <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/90 backdrop-blur-md shadow-2xl' : 'bg-black/20 backdrop-blur-sm'}`} style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <button onClick={() => onNavigate('hero')} className="text-2xl font-bold tracking-wider text-white transition-all duration-300 hover:text-brand-violet hover:scale-105" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8)' }}>
                    NINO CHAVEZ
                </button>
                <nav className="hidden md:flex items-center space-x-8">
                    {SECTIONS.slice(1, 7).map((section, index) => (
                        <button
                            key={section.id}
                            onClick={() => onNavigate(section.id)}
                            className={`capitalize text-sm font-semibold transition-all duration-300 hover:scale-105 ${activeSection === section.id ? 'text-brand-violet' : 'text-white/90 hover:text-white'}`}
                            style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)' }}
                        >
                            <span className="text-brand-violet/90 mr-1" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' }}>0{index + 1}</span> {section.title}
                        </button>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;
