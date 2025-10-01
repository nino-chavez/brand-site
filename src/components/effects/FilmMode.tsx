/**
 * FilmMode - Black & White Film Easter Egg
 *
 * Activates when user enters the Konami code.
 * Applies vintage black & white film effect with grain.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 4
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useKonamiCode } from '../../hooks/useKonamiCode';

export const FilmMode: React.FC = () => {
  const [isFilmMode, setIsFilmMode] = useState(false);

  // Apply/remove body class when film mode changes
  useEffect(() => {
    if (isFilmMode) {
      document.body.classList.add('film-mode');
    } else {
      document.body.classList.remove('film-mode');
    }

    return () => {
      document.body.classList.remove('film-mode');
    };
  }, [isFilmMode]);

  const activateFilmMode = useCallback(() => {
    setIsFilmMode((prev) => !prev); // Toggle on each activation

    // Show notification
    console.log(
      `%c🎬 FILM MODE ${!isFilmMode ? 'ACTIVATED' : 'DEACTIVATED'}!`,
      'color: #ffffff; background: #000000; font-size: 16px; font-weight: bold; padding: 8px 16px; border-radius: 4px;'
    );

    // Optional: Show visual toast notification
    const toast = document.createElement('div');
    toast.textContent = `🎬 Film Mode ${!isFilmMode ? 'Activated' : 'Deactivated'}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  }, [isFilmMode]);

  useKonamiCode(activateFilmMode);

  return (
    <>
      {/* Inject film mode styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        @keyframes filmGrain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }

        body.film-mode {
          filter: grayscale(1) contrast(1.1) brightness(0.95);
        }

        body.film-mode::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.08;
          background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
          animation: filmGrain 0.5s steps(10) infinite;
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          body.film-mode::after {
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default FilmMode;
