/**
 * DemoSidebar - Navigation sidebar for demo harness
 *
 * Provides quick navigation to component categories
 * and filtering options.
 */

import React from 'react';

interface DemoSidebarProps {
  categories: { id: string; title: string; icon: string; count: number }[];
  activeCategory?: string;
  onCategoryClick?: (categoryId: string) => void;
}

export const DemoSidebar: React.FC<DemoSidebarProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
}) => {
  return (
    <aside className="w-64 border-r border-white/10 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto" data-testid="demo-sidebar">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">
          Categories
        </h2>

        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick?.(category.id)}
              className={`relative w-full px-3 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-violet-500/30 text-violet-300 border-l-4 border-violet-400 pl-2'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80 hover:translate-x-0.5 border-l-4 border-transparent'
              }`}
              data-testid={`sidebar-${category.id}`}
              data-active={activeCategory === category.id}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.title}</span>
              </div>
              <span className={`text-xs font-mono ${activeCategory === category.id ? 'text-violet-300/80' : 'text-white/40'}`}>{category.count}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DemoSidebar;
