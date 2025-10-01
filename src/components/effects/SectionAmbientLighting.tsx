/**
 * SectionAmbientLighting - Section-based Ambient Lighting Effect
 *
 * Applies subtle ambient lighting effects to sections as they
 * become active in the viewport. Creates a sophisticated visual
 * flow through the page.
 *
 * @version 1.0.0
 * @since WOW Factor Phase 3
 */

import { useEffect } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export const SectionAmbientLighting: React.FC = () => {
  const activeSection = useActiveSection();

  useEffect(() => {
    // Remove 'active' class from all sections
    const sections = document.querySelectorAll('section[data-section]');
    sections.forEach((section) => {
      section.classList.remove('active');
    });

    // Add 'active' class to current section
    const currentSection = document.querySelector(`section[data-section="${activeSection}"]`);
    if (currentSection) {
      currentSection.classList.add('active');
    }
  }, [activeSection]);

  return null; // This is a purely behavioral component
};

export default SectionAmbientLighting;
