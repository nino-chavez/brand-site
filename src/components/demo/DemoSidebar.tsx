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
    <aside className="w-64 border-r border-white/10 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">
          Categories
        </h2>

        <nav className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick?.(category.id)}
              className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
                activeCategory === category.id
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.title}</span>
              </div>
              <span className="text-xs text-white/40 font-mono">{category.count}</span>
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2 text-sm">
            <button className="w-full px-3 py-2 rounded-lg text-left text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors">
              Export Test Data
            </button>
            <button className="w-full px-3 py-2 rounded-lg text-left text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors">
              Capture Screenshots
            </button>
            <button className="w-full px-3 py-2 rounded-lg text-left text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors">
              Performance Monitor
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DemoSidebar;
