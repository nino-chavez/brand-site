/**
 * ViewfinderController - Smart Viewfinder Management
 *
 * Manages viewfinder display based on user preferences and scroll position.
 * Integrates with EffectsContext for user control.
 *
 * @version 1.0.0
 * @since Hybrid Viewfinder Approach
 */

import React from 'react';
import { useEffects } from '../../contexts/EffectsContext';
import { useViewfinderVisibility } from '../../hooks/useViewfinderVisibility';
import ViewfinderMetadata from './ViewfinderMetadata';

export const ViewfinderController: React.FC = () => {
  const { settings } = useEffects();
  const visibility = useViewfinderVisibility();

  // Don't render if user disabled viewfinder
  if (!settings.enableViewfinder) {
    return null;
  }

  return (
    <ViewfinderMetadata
      currentSection={visibility.currentSection}
      visible={visibility.showMetadata}
      position="top-left"
      className="transition-opacity duration-500"
      style={{ opacity: visibility.opacity }}
    />
  );
};

export default ViewfinderController;
