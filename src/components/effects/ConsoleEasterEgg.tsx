/**
 * ConsoleEasterEgg - Hidden Message for Curious Developers
 *
 * Displays ASCII art and friendly message in browser console.
 * Shows personality and attention to detail.
 *
 * @version 1.0.0
 * @since WOW Factor Implementation
 */

import { useEffect } from 'react';

export const ConsoleEasterEgg: React.FC = () => {
  useEffect(() => {
    // Only run once on mount
    console.log(`
%c
██████╗ ███████╗██╗  ██╗██╗███╗   ██╗██████╗     ████████╗██╗  ██╗███████╗
██╔══██╗██╔════╝██║  ██║██║████╗  ██║██╔══██╗    ╚══██╔══╝██║  ██║██╔════╝
██████╔╝█████╗  ███████║██║██╔██╗ ██║██║  ██║       ██║   ███████║█████╗
██╔══██╗██╔══╝  ██╔══██║██║██║╚██╗██║██║  ██║       ██║   ██╔══██║██╔══╝
██████╔╝███████╗██║  ██║██║██║ ╚████║██████╔╝       ██║   ██║  ██║███████╗
╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝        ╚═╝   ╚═╝  ╚═╝╚══════╝

██╗     ███████╗███╗   ██╗███████╗
██║     ██╔════╝████╗  ██║██╔════╝
██║     █████╗  ██╔██╗ ██║███████╗
██║     ██╔══╝  ██║╚██╗██║╚════██║
███████╗███████╗██║ ╚████║███████║
╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝

%cHey there, fellow developer! 👋
%cLooks like you're curious about how this was built.

%cThis site is crafted with:
%c• React 19 + TypeScript for type-safe components
%c• Vite for lightning-fast dev experience
%c• Custom design system with photography metaphors
%c• Intersection Observer for scroll animations
%c• RequestAnimationFrame for 60fps interactions

%cThe photography metaphor isn't just visual—it's architectural:
%c"Capture" → Requirements gathering
%c"Focus" → Problem definition
%c"Frame" → Solution design
%c"Exposure" → Implementation
%c"Develop" → Iteration & refinement
%c"Portfolio" → Showcase results

%cWant to chat about software architecture, design systems, or action sports photography?
%c📧 nino@ninochavez.com
%c🔗 linkedin.com/in/ninochavez
%c🐙 github.com/ninochavez

%cP.S. - Try the Konami code for a surprise: %c↑ ↑ ↓ ↓ ← → ← → B A
    `,
      // Title styling
      'color: #8b5cf6; font-weight: bold;',
      // Greeting
      'color: #06b6d4; font-size: 18px; font-weight: bold; margin-top: 20px;',
      'color: #ffffff; font-size: 14px;',
      // Tech stack header
      'color: #f97316; font-size: 14px; font-weight: bold; margin-top: 12px;',
      // Tech stack items
      'color: #ffffff; font-size: 13px;',
      'color: #ffffff; font-size: 13px;',
      'color: #ffffff; font-size: 13px;',
      'color: #ffffff; font-size: 13px;',
      'color: #ffffff; font-size: 13px;',
      // Metaphor header
      'color: #10b981; font-size: 14px; font-weight: bold; margin-top: 12px;',
      // Metaphor items
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      'color: #ffffff; font-size: 13px; font-family: monospace;',
      // Contact header
      'color: #f97316; font-size: 14px; font-weight: bold; margin-top: 12px;',
      // Contact items
      'color: #8b5cf6; font-size: 13px;',
      'color: #8b5cf6; font-size: 13px;',
      'color: #8b5cf6; font-size: 13px;',
      // Easter egg hint
      'color: #10b981; font-size: 12px; font-style: italic; margin-top: 12px;',
      'color: #ffffff; font-size: 12px; font-family: monospace; font-weight: bold;'
    );
  }, []);

  return null; // This component doesn't render anything
};

export default ConsoleEasterEgg;
