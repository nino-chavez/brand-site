import React from 'react';
import { useUnifiedGameFlow } from '../../contexts/UnifiedGameFlowContext';
import type { SectionId } from '../../types';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

export default function MobileBottomNav() {
  const { state, actions } = useUnifiedGameFlow();
  const currentSection = state.currentSection;

  const navItems: NavItem[] = [
    {
      id: 'frame',
      label: 'Projects',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'focus',
      label: 'About',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'portfolio',
      label: 'Connect',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  const handleNavigate = (sectionId: SectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    actions.navigateToSection(sectionId);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50
                 bg-black/90 backdrop-blur-xl border-t border-white/10
                 safe-area-inset-bottom"
      aria-label="Mobile primary navigation"
    >
      <div className="grid grid-cols-3 max-w-screen-sm mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`
              flex flex-col items-center justify-center
              min-h-[48px] min-w-[48px] py-4 px-4 transition-colors
              ${currentSection === item.id
                ? 'text-violet-400 bg-violet-400/10'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }
            `}
            aria-label={`Navigate to ${item.label}`}
            aria-current={currentSection === item.id ? 'page' : undefined}
          >
            <span className="mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
