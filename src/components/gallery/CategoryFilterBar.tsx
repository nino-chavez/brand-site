/**
 * CategoryFilterBar Component
 *
 * Filter chips for gallery categories (action-sports, technical)
 */

import React from 'react';
import type { CategoryFilter } from '../../types/gallery';

export interface CategoryFilterBarProps {
  categories: CategoryFilter[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);
  const activeCount = activeCategory
    ? categories.find(cat => cat.id === activeCategory)?.count || totalCount
    : totalCount;

  return (
    <div className="category-filter-bar" role="toolbar" aria-label="Filter gallery by category">
      {/* Screen reader announcement for filter changes */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {activeCategory === null
          ? `Showing all ${totalCount} images`
          : `Showing ${activeCount} ${categories.find(cat => cat.id === activeCategory)?.label} images`
        }
      </div>
      {/* All categories chip */}
      <button
        className={`filter-chip ${activeCategory === null ? 'active' : ''}`}
        onClick={() => onCategoryChange(null)}
        aria-pressed={activeCategory === null}
        aria-label={`Show all ${totalCount} images`}
      >
        <span className="chip-icon" aria-hidden="true">🖼️</span>
        <span className="chip-label">All</span>
        <span className="chip-count" aria-hidden="true">{totalCount}</span>
      </button>

      {/* Category-specific chips */}
      {categories.map((category) => (
        <button
          key={category.id}
          className={`filter-chip ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.id)}
          aria-pressed={activeCategory === category.id}
          aria-label={`Show ${category.count} ${category.label} images`}
        >
          <span className="chip-icon" aria-hidden="true">{category.icon}</span>
          <span className="chip-label">{category.label}</span>
          <span className="chip-count" aria-hidden="true">{category.count}</span>
        </button>
      ))}

      <style>{`
        .category-filter-bar {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 0.5rem 0;
        }

        .filter-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(30, 30, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .filter-chip:hover {
          background: rgba(40, 40, 50, 0.9);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .filter-chip:active {
          transform: translateY(0);
        }

        .filter-chip.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: rgba(59, 130, 246, 0.6);
          color: rgba(59, 130, 246, 1);
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
        }

        .filter-chip.active .chip-icon {
          filter: brightness(1.2);
        }

        .filter-chip:focus {
          outline: 2px solid rgba(59, 130, 246, 0.8);
          outline-offset: 2px;
        }

        .filter-chip:focus:not(:focus-visible) {
          outline: none;
        }

        .chip-icon {
          font-size: 1.125rem;
          line-height: 1;
        }

        .chip-label {
          line-height: 1;
        }

        .chip-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.5rem;
          height: 1.5rem;
          padding: 0 0.375rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1;
        }

        .filter-chip.active .chip-count {
          background: rgba(59, 130, 246, 0.3);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .category-filter-bar {
            gap: 0.5rem;
          }

          .filter-chip {
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }

          .chip-icon {
            font-size: 1rem;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .filter-chip {
            transition: none;
          }

          .filter-chip:hover {
            transform: none;
          }

          .filter-chip:active {
            transform: none;
          }
        }

        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </div>
  );
};