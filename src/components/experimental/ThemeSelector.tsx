import React, { useState, useEffect } from 'react';
import { useThemeSwitcher, useThemeMetadata } from '../../contexts/ExperimentalLayoutContext';
import type { DesignTheme } from '../../types/experimental';
import { THEME_ICONS, THEME_METADATA } from '../../types/experimental';

interface ThemeSelectorProps {
  position?: 'top-right' | 'bottom-sheet';
  className?: string;
}

// Theme preview colors and gradients
const THEME_PREVIEWS: Record<DesignTheme, { gradient: string; accent: string }> = {
  'glassmorphism': {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    accent: '#00f2fe',
  },
  'bento-grid': {
    gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    accent: '#8b5cf6',
  },
  'neumorphism': {
    gradient: 'linear-gradient(135deg, #e0e5ec 0%, #d5dae3 100%)',
    accent: '#a3b1c6',
  },
  'neobrutalism': {
    gradient: 'linear-gradient(135deg, #fff 0%, #fff 100%)',
    accent: '#FFD700',
  },
  'retrofuturism': {
    gradient: 'linear-gradient(135deg, #000 0%, #1a1a2e 100%)',
    accent: '#00FFFF',
  },
  'bold-minimalism': {
    gradient: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
    accent: '#000',
  },
};

export default function ThemeSelector({
  position = 'top-right',
  className = '',
}: ThemeSelectorProps) {
  const { currentTheme, availableThemes, switchToTheme, isTransitioning } = useThemeSwitcher();
  const currentMetadata = useThemeMetadata(currentTheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTheme, setHoveredTheme] = useState<DesignTheme | null>(null);

  // Update URL when theme changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', currentTheme);
    window.history.replaceState({}, '', url.toString());
  }, [currentTheme]);

  const handleThemeClick = (theme: DesignTheme) => {
    if (theme !== currentTheme && !isTransitioning) {
      switchToTheme(theme);
      setIsExpanded(false);

      // Track theme selection (analytics placeholder)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'theme_switch', {
          event_category: 'engagement',
          event_label: theme,
          previous_theme: currentTheme,
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, theme: DesignTheme) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleThemeClick(theme);
    }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', currentTheme);

    if (navigator.share) {
      navigator.share({
        title: `Nino Chavez Portfolio - ${currentMetadata?.name} Theme`,
        text: `Check out this ${currentMetadata?.name} design theme!`,
        url: url.toString(),
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url.toString());
      });
    } else {
      navigator.clipboard.writeText(url.toString());
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div
      className={`theme-selector ${position} ${className} ${isExpanded ? 'expanded' : ''}`}
      role="region"
      aria-label="Design theme selector"
    >
      {/* Trigger button - Camera mode dial inspired */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="theme-selector-trigger"
        aria-expanded={isExpanded}
        aria-label={`Current theme: ${currentMetadata?.name}. Click to change theme.`}
        disabled={isTransitioning}
      >
        <span className="theme-icon" aria-hidden="true">
          {THEME_ICONS[currentTheme]}
        </span>
        <span className="theme-name">{currentMetadata?.name}</span>
        <span className="expand-icon" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Theme options panel */}
      {isExpanded && (
        <div className="theme-options" role="menu">
          <div className="theme-options-header">
            <h3 className="text-sm font-semibold">Select Design Theme</h3>
            <button
              type="button"
              onClick={handleShare}
              className="share-button"
              aria-label="Share current theme"
              title="Share this theme"
            >
              🔗
            </button>
          </div>
          <div className="theme-grid">
            {availableThemes.map((theme) => {
              const isActive = theme.id === currentTheme;
              const preview = THEME_PREVIEWS[theme.id];
              const isHovered = hoveredTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeClick(theme.id)}
                  onKeyDown={(e) => handleKeyDown(e, theme.id)}
                  onMouseEnter={() => setHoveredTheme(theme.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  className={`theme-option ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                  role="menuitem"
                  aria-label={`${theme.name} theme${isActive ? ' (current)' : ''}`}
                  aria-current={isActive}
                  disabled={isTransitioning}
                >
                  {/* Theme Preview */}
                  <div
                    className="theme-preview"
                    style={{ background: preview.gradient }}
                    aria-hidden="true"
                  >
                    <div
                      className="theme-preview-accent"
                      style={{ background: preview.accent }}
                    />
                  </div>

                  {/* Theme Info */}
                  <div className="theme-info">
                    <div className="theme-header">
                      <span className="theme-option-icon" aria-hidden="true">
                        {theme.icon}
                      </span>
                      <span className="theme-option-name">{theme.name}</span>
                      {isActive && (
                        <span className="theme-option-indicator" aria-hidden="true">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="theme-description">{theme.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .theme-selector {
          position: fixed;
          z-index: 100;
        }

        .theme-selector.top-right {
          top: 5rem;
          right: 1rem;
        }

        @media (min-width: 768px) {
          .theme-selector.top-right {
            top: 6rem;
            right: 2rem;
          }
        }

        .theme-selector-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-selector-trigger:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.9);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .theme-selector-trigger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .theme-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        .theme-name {
          display: none;
        }

        @media (min-width: 768px) {
          .theme-name {
            display: inline;
          }
        }

        .expand-icon {
          font-size: 0.75rem;
          margin-left: 0.25rem;
        }

        .theme-options {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 380px;
          max-width: calc(100vw - 2rem);
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 80vh;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .theme-options-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .theme-options-header h3 {
          color: white;
          font-weight: 600;
          margin: 0;
        }

        .share-button {
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.375rem;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .share-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .theme-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }

        .theme-option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid transparent;
          border-radius: 0.75rem;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .theme-option::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .theme-option:hover:not(:disabled)::before {
          opacity: 1;
        }

        .theme-option:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .theme-option.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        .theme-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .theme-preview {
          width: 60px;
          height: 60px;
          border-radius: 0.5rem;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
        }

        .theme-option.hovered .theme-preview {
          transform: scale(1.05);
        }

        .theme-preview-accent {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          border-radius: 0.25rem 0 0.5rem 0;
        }

        .theme-info {
          flex: 1;
          min-width: 0;
        }

        .theme-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .theme-option-icon {
          font-size: 1.25rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .theme-option-name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .theme-option-indicator {
          color: #8b5cf6;
          font-size: 1rem;
          font-weight: bold;
        }

        .theme-description {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Focus styles for accessibility */
        .theme-selector-trigger:focus,
        .theme-option:focus {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }

        /* Mobile optimizations */
        @media (max-width: 767px) {
          .theme-selector.top-right {
            top: auto;
            bottom: 5rem;
            right: 1rem;
            left: 1rem;
          }

          .theme-options {
            right: auto;
            left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
