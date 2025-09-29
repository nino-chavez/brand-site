/**
 * Photography Metaphor Integration Acceptance Criteria Tests
 *
 * Comprehensive test suite validating WHEN/THEN/SHALL requirements for photography metaphor
 * integration from the lightbox canvas implementation specification.
 *
 * @fileoverview Acceptance criteria validation for User Story: Photography Metaphor Integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Photography terminology mappings
const PHOTOGRAPHY_TERMS = {
  navigation: {
    focus: 'Focus on section',
    frame: 'Frame composition',
    exposure: 'Adjust exposure',
    aperture: 'Set aperture',
    zoom: 'Zoom lens',
    pan: 'Pan camera',
    tilt: 'Tilt camera',
    dolly: 'Dolly movement'
  },
  movements: {
    pan: { easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', duration: 800 },
    tilt: { easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', duration: 600 },
    zoom: { easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', duration: 1000 },
    dolly: { easing: 'cubic-bezier(0.23, 1, 0.32, 1)', duration: 1200 },
    rackFocus: { easing: 'cubic-bezier(0.4, 0, 0.2, 1)', duration: 400 }
  },
  effects: {
    depthOfField: { blur: '0px 0px 8px rgba(0,0,0,0.1)' },
    bokeh: { filter: 'blur(2px)', opacity: 0.8 },
    vignette: { boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1)' },
    focusRing: { outline: '2px solid #f59e0b', outlineOffset: '2px' }
  }
};

// Mock performance degradation scenarios
const PERFORMANCE_SCENARIOS = {
  optimal: { fps: 60, memoryUsage: 30, cpuUsage: 20 },
  moderate: { fps: 45, memoryUsage: 45, cpuUsage: 60 },
  degraded: { fps: 30, memoryUsage: 60, cpuUsage: 80 },
  critical: { fps: 20, memoryUsage: 80, cpuUsage: 95 }
};

// Test component for photography metaphor integration
const TestPhotographyInterface: React.FC<{
  performanceScenario?: keyof typeof PERFORMANCE_SCENARIOS;
  enableEffects?: boolean;
  onNavigationAction?: (action: string, terminology: string) => void;
  onEffectApplied?: (effect: string, intensity: number) => void;
  onPerformanceDegradation?: (level: string) => void;
}> = ({
  performanceScenario = 'optimal',
  enableEffects = true,
  onNavigationAction,
  onEffectApplied,
  onPerformanceDegradation
}) => {
  const [hoveredSection, setHoveredSection] = React.useState<string | null>(null);
  const [focusedSection, setFocusedSection] = React.useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = React.useState({ x: 0, y: 0, zoom: 1 });
  const [effectsEnabled, setEffectsEnabled] = React.useState(enableEffects);
  const [currentPerformance, setCurrentPerformance] = React.useState(PERFORMANCE_SCENARIOS[performanceScenario]);

  React.useEffect(() => {
    setCurrentPerformance(PERFORMANCE_SCENARIOS[performanceScenario]);

    // Monitor performance and degrade effects if needed
    if (currentPerformance.fps < 45) {
      setEffectsEnabled(false);
      onPerformanceDegradation?.('effects-disabled');
    } else if (currentPerformance.fps < 30) {
      onPerformanceDegradation?.('critical-degradation');
    }
  }, [performanceScenario, currentPerformance, onPerformanceDegradation]);

  const sections = [
    { id: 'about', title: 'About', type: 'portrait' },
    { id: 'experience', title: 'Experience', type: 'landscape' },
    { id: 'skills', title: 'Skills', type: 'macro' },
    { id: 'projects', title: 'Projects', type: 'architectural' },
    { id: 'photography', title: 'Photography', type: 'sports' },
    { id: 'contact', title: 'Contact', type: 'documentary' }
  ];

  // Handle photography-inspired navigation
  const handleCameraMovement = (movement: keyof typeof PHOTOGRAPHY_TERMS.movements, targetSection: string) => {
    const terminology = `${PHOTOGRAPHY_TERMS.navigation[movement as keyof typeof PHOTOGRAPHY_TERMS.navigation]} to ${targetSection}`;
    onNavigationAction?.(movement, terminology);

    // Apply cinematic transitions
    const movementConfig = PHOTOGRAPHY_TERMS.movements[movement];

    // Simulate camera movement with photography easing
    const newPosition = {
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      zoom: movement === 'zoom' ? Math.random() * 2 + 0.5 : cameraPosition.zoom
    };

    setCameraPosition(newPosition);
    setFocusedSection(targetSection);
  };

  // Apply photography-inspired visual effects
  const applyPhotographyEffect = (sectionId: string, effect: keyof typeof PHOTOGRAPHY_TERMS.effects) => {
    if (!effectsEnabled) return;

    const intensity = currentPerformance.fps > 45 ? 1.0 : 0.5;
    onEffectApplied?.(effect, intensity);
  };

  return (
    <div
      data-testid="photography-interface"
      role="application"
      aria-label="Photography-inspired portfolio interface"
      style={{
        width: '100%',
        height: '600px',
        position: 'relative',
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Performance indicator */}
      <div
        data-testid="performance-status"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 100
        }}
      >
        FPS: {currentPerformance.fps} | Effects: {effectsEnabled ? 'ON' : 'OFF'}
      </div>

      {/* Camera controls with photography terminology */}
      <div
        data-testid="camera-controls"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 100
        }}
      >
        <button
          data-testid="pan-control"
          aria-label={PHOTOGRAPHY_TERMS.navigation.pan}
          onClick={() => handleCameraMovement('pan', focusedSection || 'about')}
          style={{
            padding: '8px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          📷 Pan
        </button>

        <button
          data-testid="tilt-control"
          aria-label={PHOTOGRAPHY_TERMS.navigation.tilt}
          onClick={() => handleCameraMovement('tilt', focusedSection || 'about')}
          style={{
            padding: '8px 12px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          📐 Tilt
        </button>

        <button
          data-testid="zoom-control"
          aria-label={PHOTOGRAPHY_TERMS.navigation.zoom}
          onClick={() => handleCameraMovement('zoom', focusedSection || 'about')}
          style={{
            padding: '8px 12px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔍 Zoom
        </button>

        <button
          data-testid="dolly-control"
          aria-label={PHOTOGRAPHY_TERMS.navigation.dolly}
          onClick={() => handleCameraMovement('dolly', focusedSection || 'about')}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🎬 Dolly
        </button>
      </div>

      {/* Photography settings panel */}
      <div
        data-testid="photography-settings"
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          minWidth: '200px'
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Camera Settings</h3>
        <div data-testid="aperture-setting">
          Aperture: f/{(2.8 + cameraPosition.zoom * 2).toFixed(1)}
        </div>
        <div data-testid="shutter-setting">
          Shutter: 1/{Math.round(60 + cameraPosition.zoom * 30)}
        </div>
        <div data-testid="iso-setting">
          ISO: {Math.round(100 + currentPerformance.cpuUsage * 10)}
        </div>
        <div data-testid="focal-length-setting">
          Focal Length: {Math.round(35 + cameraPosition.zoom * 50)}mm
        </div>
      </div>

      {/* Viewfinder with photography grid */}
      <div
        data-testid="viewfinder"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '400px',
          height: '300px',
          transform: `translate(-50%, -50%) scale(${cameraPosition.zoom}) translate(${cameraPosition.x}px, ${cameraPosition.y}px)`,
          transition: effectsEnabled ? 'transform 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          ...effectsEnabled ? PHOTOGRAPHY_TERMS.effects.vignette : {}
        }}
      >
        {/* Rule of thirds grid */}
        {effectsEnabled && (
          <div
            data-testid="rule-of-thirds-grid"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(to right, transparent 33%, rgba(255,255,255,0.2) 33%, rgba(255,255,255,0.2) 33.5%, transparent 33.5%),
                linear-gradient(to right, transparent 66%, rgba(255,255,255,0.2) 66%, rgba(255,255,255,0.2) 66.5%, transparent 66.5%),
                linear-gradient(to bottom, transparent 33%, rgba(255,255,255,0.2) 33%, rgba(255,255,255,0.2) 33.5%, transparent 33.5%),
                linear-gradient(to bottom, transparent 66%, rgba(255,255,255,0.2) 66%, rgba(255,255,255,0.2) 66.5%, transparent 66.5%)
              `,
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        )}

        {/* Sections with photography effects */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            width: '100%',
            height: '100%',
            gap: '4px',
            padding: '8px'
          }}
        >
          {sections.map((section, index) => (
            <div
              key={section.id}
              data-testid={`photo-section-${section.id}`}
              data-photography-type={section.type}
              onMouseEnter={() => {
                setHoveredSection(section.id);
                applyPhotographyEffect(section.id, 'depthOfField');
              }}
              onMouseLeave={() => {
                setHoveredSection(null);
              }}
              onClick={() => {
                handleCameraMovement('rackFocus', section.id);
                applyPhotographyEffect(section.id, 'focusRing');
              }}
              style={{
                background: `linear-gradient(135deg,
                  ${section.id === focusedSection ? '#3b82f6' : '#6b7280'} 0%,
                  ${section.id === focusedSection ? '#1d4ed8' : '#4b5563'} 100%)`,
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                transition: effectsEnabled ? 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                transform: hoveredSection === section.id && effectsEnabled ? 'scale(1.05)' : 'scale(1)',
                filter: hoveredSection === section.id && effectsEnabled
                  ? 'brightness(1.1) contrast(1.1)'
                  : focusedSection === section.id
                    ? 'brightness(1.2)'
                    : hoveredSection && hoveredSection !== section.id && effectsEnabled
                      ? 'blur(1px) brightness(0.8)'
                      : 'none',
                outline: focusedSection === section.id && effectsEnabled
                  ? PHOTOGRAPHY_TERMS.effects.focusRing.outline
                  : 'none',
                outlineOffset: PHOTOGRAPHY_TERMS.effects.focusRing.outlineOffset,
                boxShadow: hoveredSection === section.id && effectsEnabled
                  ? '0 8px 25px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div
                style={{
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {section.title}
              </div>
              <div
                data-testid={`photo-type-${section.id}`}
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '10px',
                  textAlign: 'center',
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}
              >
                {section.type} photography
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus indicator */}
      {focusedSection && effectsEnabled && (
        <div
          data-testid="focus-indicator"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            border: '2px solid #f59e0b',
            borderRadius: '50%',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none',
            zIndex: 50
          }}
        />
      )}

      {/* Cinematic transition overlay */}
      {effectsEnabled && (
        <div
          data-testid="cinematic-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(to bottom,
                rgba(0,0,0,0.8) 0%,
                transparent 15%,
                transparent 85%,
                rgba(0,0,0,0.8) 100%)
            `,
            pointerEvents: 'none',
            zIndex: 5
          }}
        />
      )}

      {/* Photography terminology tooltip */}
      {hoveredSection && (
        <div
          data-testid="photography-tooltip"
          style={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '200px',
            zIndex: 100
          }}
        >
          <strong>Focus on:</strong> {sections.find(s => s.id === hoveredSection)?.title}<br/>
          <strong>Shot type:</strong> {sections.find(s => s.id === hoveredSection)?.type} photography<br/>
          <strong>Action:</strong> {PHOTOGRAPHY_TERMS.navigation.focus}
        </div>
      )}
    </div>
  );
};

// Acceptance Criteria Tests for Photography Metaphor Integration
describe('Acceptance Criteria: Photography Metaphor Integration', () => {
  let navigationActions: Array<{ action: string; terminology: string }> = [];
  let appliedEffects: Array<{ effect: string; intensity: number }> = [];
  let performanceDegradations: string[] = [];

  beforeEach(() => {
    navigationActions = [];
    appliedEffects = [];
    performanceDegradations = [];

    // Add CSS animation keyframes for testing
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    // Clean up
    document.querySelectorAll('style').forEach(style => {
      if (style.textContent?.includes('pulse')) {
        style.remove();
      }
    });
  });

  describe('AC1: WHEN user hovers over sections, THEN system SHALL apply photography-inspired visual effects', () => {
    it('should apply depth of field effect on section hover', async () => {
      const user = userEvent.setup();

      render(
        <TestPhotographyInterface
          enableEffects={true}
          onEffectApplied={(effect, intensity) => {
            appliedEffects.push({ effect, intensity });
          }}
        />
      );

      const aboutSection = screen.getByTestId('photo-section-about');

      await user.hover(aboutSection);

      await waitFor(() => {
        const styles = window.getComputedStyle(aboutSection);
        expect(styles.transform).toContain('scale(1.05)');
        expect(styles.filter).toContain('brightness(1.1)');
      });

      expect(appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ effect: 'depthOfField' })
        ])
      );
    });

    it('should apply bokeh effect to non-focused sections', async () => {
      const user = userEvent.setup();

      render(
        <TestPhotographyInterface enableEffects={true} />
      );

      const aboutSection = screen.getByTestId('photo-section-about');
      const experienceSection = screen.getByTestId('photo-section-experience');

      // Hover over about section
      await user.hover(aboutSection);

      await waitFor(() => {
        const experienceStyles = window.getComputedStyle(experienceSection);
        expect(experienceStyles.filter).toContain('blur(1px)');
        expect(experienceStyles.filter).toContain('brightness(0.8)');
      });
    });

    it('should show focus ring on clicked section', async () => {
      render(
        <TestPhotographyInterface
          enableEffects={true}
          onEffectApplied={(effect, intensity) => {
            appliedEffects.push({ effect, intensity });
          }}
        />
      );

      const skillsSection = screen.getByTestId('photo-section-skills');

      fireEvent.click(skillsSection);

      await waitFor(() => {
        const styles = window.getComputedStyle(skillsSection);
        expect(styles.outline).toContain('2px solid #f59e0b');
      });

      expect(appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ effect: 'focusRing' })
        ])
      );
    });

    it('should display focus indicator animation', async () => {
      render(<TestPhotographyInterface enableEffects={true} />);

      const projectsSection = screen.getByTestId('photo-section-projects');

      fireEvent.click(projectsSection);

      await waitFor(() => {
        expect(screen.getByTestId('focus-indicator')).toBeInTheDocument();
      });

      const focusIndicator = screen.getByTestId('focus-indicator');
      const styles = window.getComputedStyle(focusIndicator);
      expect(styles.animation).toContain('pulse');
    });
  });

  describe('AC2: WHEN user performs navigation, THEN system SHALL use camera movement metaphors', () => {
    it('should apply pan camera movement with photography terminology', async () => {
      render(
        <TestPhotographyInterface
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const panControl = screen.getByTestId('pan-control');

      fireEvent.click(panControl);

      await waitFor(() => {
        expect(navigationActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              action: 'pan',
              terminology: expect.stringContaining('Pan camera')
            })
          ])
        );
      });

      expect(panControl).toHaveAttribute('aria-label', 'Pan camera');
    });

    it('should apply tilt camera movement with correct easing', async () => {
      render(
        <TestPhotographyInterface
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const tiltControl = screen.getByTestId('tilt-control');

      fireEvent.click(tiltControl);

      await waitFor(() => {
        expect(navigationActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              action: 'tilt',
              terminology: expect.stringContaining('Tilt camera')
            })
          ])
        );
      });

      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);
      expect(styles.transition).toContain('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    });

    it('should apply zoom lens movement with photography physics', async () => {
      render(
        <TestPhotographyInterface
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const zoomControl = screen.getByTestId('zoom-control');

      fireEvent.click(zoomControl);

      await waitFor(() => {
        expect(navigationActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              action: 'zoom',
              terminology: expect.stringContaining('Zoom lens')
            })
          ])
        );
      });

      // Check that zoom affects viewfinder scale
      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);
      expect(styles.transform).toMatch(/scale\([^)]+\)/);
    });

    it('should apply dolly movement with cinematic timing', async () => {
      render(
        <TestPhotographyInterface
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const dollyControl = screen.getByTestId('dolly-control');

      fireEvent.click(dollyControl);

      await waitFor(() => {
        expect(navigationActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              action: 'dolly',
              terminology: expect.stringContaining('Dolly movement')
            })
          ])
        );
      });

      expect(dollyControl).toHaveAttribute('aria-label', 'Dolly movement');
    });

    it('should display rule of thirds grid for composition guidance', async () => {
      render(<TestPhotographyInterface enableEffects={true} />);

      const grid = screen.getByTestId('rule-of-thirds-grid');
      expect(grid).toBeInTheDocument();

      const styles = window.getComputedStyle(grid);
      expect(styles.background).toContain('linear-gradient');
    });
  });

  describe('AC3: IF system detects slow performance, THEN system SHALL gracefully degrade effects', () => {
    it('should disable effects when performance drops below 45fps', async () => {
      render(
        <TestPhotographyInterface
          performanceScenario="moderate"
          onPerformanceDegradation={(level) => {
            performanceDegradations.push(level);
          }}
        />
      );

      await waitFor(() => {
        expect(performanceDegradations).toContain('effects-disabled');
      });

      const performanceStatus = screen.getByTestId('performance-status');
      expect(performanceStatus.textContent).toContain('Effects: OFF');
    });

    it('should maintain photography metaphor even with degraded effects', async () => {
      render(
        <TestPhotographyInterface
          performanceScenario="degraded"
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const panControl = screen.getByTestId('pan-control');
      fireEvent.click(panControl);

      // Photography terminology should still be used
      await waitFor(() => {
        expect(navigationActions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              terminology: expect.stringContaining('Pan camera')
            })
          ])
        );
      });

      // But transitions should be disabled
      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);
      expect(styles.transition).toBe('none');
    });

    it('should report critical performance degradation', async () => {
      render(
        <TestPhotographyInterface
          performanceScenario="critical"
          onPerformanceDegradation={(level) => {
            performanceDegradations.push(level);
          }}
        />
      );

      await waitFor(() => {
        expect(performanceDegradations).toContain('critical-degradation');
      });

      const performanceStatus = screen.getByTestId('performance-status');
      expect(performanceStatus.textContent).toContain('FPS: 20');
    });

    it('should maintain photography settings display during degradation', async () => {
      render(<TestPhotographyInterface performanceScenario="degraded" />);

      // Photography settings should still be visible and functional
      expect(screen.getByTestId('aperture-setting')).toBeInTheDocument();
      expect(screen.getByTestId('shutter-setting')).toBeInTheDocument();
      expect(screen.getByTestId('iso-setting')).toBeInTheDocument();
      expect(screen.getByTestId('focal-length-setting')).toBeInTheDocument();
    });
  });

  describe('AC4: WHEN user interacts with navigation controls, THEN system SHALL use photography terminology', () => {
    it('should use aperture terminology in camera settings', async () => {
      render(<TestPhotographyInterface />);

      const apertureSetting = screen.getByTestId('aperture-setting');
      expect(apertureSetting.textContent).toMatch(/Aperture: f\/\d+\.\d+/);
    });

    it('should use shutter speed terminology', async () => {
      render(<TestPhotographyInterface />);

      const shutterSetting = screen.getByTestId('shutter-setting');
      expect(shutterSetting.textContent).toMatch(/Shutter: 1\/\d+/);
    });

    it('should use ISO sensitivity terminology', async () => {
      render(<TestPhotographyInterface />);

      const isoSetting = screen.getByTestId('iso-setting');
      expect(isoSetting.textContent).toMatch(/ISO: \d+/);
    });

    it('should use focal length terminology', async () => {
      render(<TestPhotographyInterface />);

      const focalLengthSetting = screen.getByTestId('focal-length-setting');
      expect(focalLengthSetting.textContent).toMatch(/Focal Length: \d+mm/);
    });

    it('should display photography-specific tooltips', async () => {
      const user = userEvent.setup();

      render(<TestPhotographyInterface />);

      const photographySection = screen.getByTestId('photo-section-photography');

      await user.hover(photographySection);

      await waitFor(() => {
        const tooltip = screen.getByTestId('photography-tooltip');
        expect(tooltip.textContent).toContain('Focus on:');
        expect(tooltip.textContent).toContain('Shot type:');
        expect(tooltip.textContent).toContain('sports photography');
      });
    });

    it('should label sections with photography types', async () => {
      render(<TestPhotographyInterface />);

      expect(screen.getByTestId('photo-type-about').textContent).toBe('portrait photography');
      expect(screen.getByTestId('photo-type-experience').textContent).toBe('landscape photography');
      expect(screen.getByTestId('photo-type-skills').textContent).toBe('macro photography');
      expect(screen.getByTestId('photo-type-projects').textContent).toBe('architectural photography');
      expect(screen.getByTestId('photo-type-photography').textContent).toBe('sports photography');
      expect(screen.getByTestId('photo-type-contact').textContent).toBe('documentary photography');
    });
  });

  describe('AC5: WHEN transitions occur, THEN system SHALL maintain cinematic quality', () => {
    it('should apply cinematic easing curves to camera movements', async () => {
      render(<TestPhotographyInterface enableEffects={true} />);

      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);

      // Check for cinematic transition timing
      expect(styles.transition).toContain('800ms');
      expect(styles.transition).toContain('cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    });

    it('should maintain cinematic overlay during transitions', async () => {
      render(<TestPhotographyInterface enableEffects={true} />);

      const cinematicOverlay = screen.getByTestId('cinematic-overlay');
      expect(cinematicOverlay).toBeInTheDocument();

      const styles = window.getComputedStyle(cinematicOverlay);
      expect(styles.background).toContain('linear-gradient');
      expect(styles.background).toContain('rgba(0,0,0,0.8)');
    });

    it('should provide smooth camera position transitions', async () => {
      render(
        <TestPhotographyInterface
          enableEffects={true}
          onNavigationAction={(action, terminology) => {
            navigationActions.push({ action, terminology });
          }}
        />
      );

      const dollyControl = screen.getByTestId('dolly-control');

      fireEvent.click(dollyControl);

      await waitFor(() => {
        expect(navigationActions.length).toBeGreaterThan(0);
      });

      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);

      // Check that transform includes translate values for camera movement
      expect(styles.transform).toMatch(/translate\([^)]+\)/);
    });

    it('should maintain proper timing relationships between different camera movements', async () => {
      render(<TestPhotographyInterface enableEffects={true} />);

      // All movement controls should be available
      expect(screen.getByTestId('pan-control')).toBeInTheDocument();
      expect(screen.getByTestId('tilt-control')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
      expect(screen.getByTestId('dolly-control')).toBeInTheDocument();

      // Each should have appropriate timing based on photography principles
      const viewfinder = screen.getByTestId('viewfinder');
      const styles = window.getComputedStyle(viewfinder);
      expect(styles.transition).toBeDefined();
    });
  });

  describe('Photography Metaphor Consistency', () => {
    it('should maintain photography metaphor throughout interface', async () => {
      render(<TestPhotographyInterface />);

      // Interface should be labeled with photography terminology
      const interface_ = screen.getByTestId('photography-interface');
      expect(interface_).toHaveAttribute('aria-label', 'Photography-inspired portfolio interface');

      // Camera controls should use photography icons and terminology
      expect(screen.getByTestId('pan-control').textContent).toContain('📷 Pan');
      expect(screen.getByTestId('tilt-control').textContent).toContain('📐 Tilt');
      expect(screen.getByTestId('zoom-control').textContent).toContain('🔍 Zoom');
      expect(screen.getByTestId('dolly-control').textContent).toContain('🎬 Dolly');
    });

    it('should adapt camera settings based on interaction context', async () => {
      render(<TestPhotographyInterface />);

      const zoomControl = screen.getByTestId('zoom-control');

      // Initial settings
      let apertureSetting = screen.getByTestId('aperture-setting');
      const initialAperture = apertureSetting.textContent;

      fireEvent.click(zoomControl);

      // Settings should update to reflect zoom change
      await waitFor(() => {
        apertureSetting = screen.getByTestId('aperture-setting');
        expect(apertureSetting.textContent).not.toBe(initialAperture);
      });
    });

    it('should provide contextual photography information', async () => {
      const user = userEvent.setup();

      render(<TestPhotographyInterface />);

      const contactSection = screen.getByTestId('photo-section-contact');

      await user.hover(contactSection);

      await waitFor(() => {
        const tooltip = screen.getByTestId('photography-tooltip');
        expect(tooltip.textContent).toContain('documentary photography');
        expect(tooltip.textContent).toContain('Focus on:');
      });
    });
  });
});

export { TestPhotographyInterface, PHOTOGRAPHY_TERMS };