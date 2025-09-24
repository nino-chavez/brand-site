
import React from 'react';
import type { SectionId } from '../types';

interface HeroSectionProps {
    setRef: (el: HTMLDivElement | null) => void;
    onNavigate: (id: SectionId) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ setRef, onNavigate }) => {
    return (
        <section id="hero" ref={setRef} className="min-h-screen flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-violet rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-subtle-float motion-safe:animate-subtle-float motion-reduce:animate-none"></div>
            <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-subtle-float motion-safe:animate-subtle-float motion-reduce:animate-none animation-delay-3000"></div>
            
            <div className="relative z-10 p-6 motion-safe:animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase">
                    Nino Chavez
                </h1>
                <p className="mt-4 text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto">
                    Enterprise Architect, Software Engineer & Action Photographer
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button onClick={() => onNavigate('work')} className="bg-brand-violet text-white font-semibold px-8 py-3 rounded-md transition-transform duration-300 hover:scale-105 hover:bg-violet-500">
                        View My Work
                    </button>
                    <button onClick={() => onNavigate('contact')} className="border-2 border-brand-violet text-brand-violet font-semibold px-8 py-3 rounded-md transition-all duration-300 hover:scale-105 hover:bg-brand-violet hover:text-white">
                        Get In Touch
                    </button>
                </div>
            </div>
             <button
                onClick={() => onNavigate('about')}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
                aria-label="Scroll to about section"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
        </section>
    );
};

export default HeroSection;
