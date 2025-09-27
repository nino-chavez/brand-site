import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import components to test integration
import { SportsSequenceController } from '../components/SportsSequenceController';
import { PhaseSpecificSportsContent } from '../components/PhaseSpecificSportsContent';
import { VisualContinuitySystem } from '../components/VisualContinuitySystem';
import { VolleyballPhase } from '../hooks/useVolleyballTiming';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
global.performance.now = mockPerformanceNow;

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = vi.fn();

// Test data
const TEST_PHASES: VolleyballPhase[] = ['setup', 'anticipation', 'approach', 'spike', 'impact', 'follow-through'];

// Integration test wrapper component
interface VolleyballSystemWrapperProps {
  initialPhase?: VolleyballPhase;
  autoProgress?: boolean;
  onSystemEvent?: (event: SystemEvent) => void;
}

interface SystemEvent {
  type: 'phase-change' | 'sync-update' | 'intensity-change' | 'transition-complete' | 'content-load' | 'continuity-metrics';
  phase?: VolleyballPhase;
  data?: any;
  timestamp: number;
}

const VolleyballSystemWrapper: React.FC<VolleyballSystemWrapperProps> = ({
  initialPhase = 'setup',
  autoProgress = false,
  onSystemEvent
}) => {
  const [currentPhase, setCurrentPhase] = React.useState<VolleyballPhase>(initialPhase);
  const [previousPhase, setPreviousPhase] = React.useState<VolleyballPhase | undefined>();
  const [phaseProgress, setPhaseProgress] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(autoProgress);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [transitionProgress, setTransitionProgress] = React.useState(0);
  const [leftViewportFrame, setLeftViewportFrame] = React.useState(0);
  const [rightViewportFrame, setRightViewportFrame] = React.useState(0);
  const [visualIntensity, setVisualIntensity] = React.useState(0.2);

  // Auto-progress simulation
  React.useEffect(() => {
    if (!autoProgress || !isPlaying) return;

    const progressInterval = setInterval(() => {
      setPhaseProgress(prev => {
        const newProgress = Math.min(prev + 0.02, 1.0);
        if (newProgress >= 1.0) {
          // Move to next phase
          const currentIndex = TEST_PHASES.indexOf(currentPhase);
          if (currentIndex < TEST_PHASES.length - 1) {
            const nextPhase = TEST_PHASES[currentIndex + 1];
            setPreviousPhase(currentPhase);
            setCurrentPhase(nextPhase);
            setPhaseProgress(0);
            setIsTransitioning(true);
            setTransitionProgress(0);

            onSystemEvent?.({
              type: 'phase-change',
              phase: nextPhase,
              data: { from: currentPhase, to: nextPhase },
              timestamp: performance.now()
            });

            // Simulate transition
            setTimeout(() => {
              setIsTransitioning(false);
              setTransitionProgress(0);
            }, 300);
          } else {
            setIsPlaying(false);
          }
          return 0;
        }
        return newProgress;
      });

      // Update viewport frames
      setLeftViewportFrame(prev => prev + 1);
      setRightViewportFrame(prev => prev + (Math.random() > 0.9 ? 2 : 1)); // Simulate slight drift
    }, 50);

    return () => clearInterval(progressInterval);
  }, [autoProgress, isPlaying, currentPhase, onSystemEvent]);

  // Handle sync updates
  const handleSyncUpdate = React.useCallback((syncData: any) => {
    onSystemEvent?.({
      type: 'sync-update',
      data: syncData,
      timestamp: performance.now()
    });
  }, [onSystemEvent]);

  // Handle intensity changes
  const handleIntensityChange = React.useCallback((intensity: number) => {
    setVisualIntensity(intensity);
    onSystemEvent?.({
      type: 'intensity-change',
      data: { intensity },
      timestamp: performance.now()
    });
  }, [onSystemEvent]);

  // Handle transition completion
  const handleTransitionComplete = React.useCallback((phase: VolleyballPhase) => {
    onSystemEvent?.({
      type: 'transition-complete',
      phase,
      timestamp: performance.now()
    });
  }, [onSystemEvent]);

  // Handle content load
  const handleContentLoad = React.useCallback((contentId: string) => {
    onSystemEvent?.({
      type: 'content-load',
      data: { contentId },
      timestamp: performance.now()
    });
  }, [onSystemEvent]);

  // Handle continuity metrics
  const handleContinuityMetrics = React.useCallback((metrics: any) => {
    onSystemEvent?.({
      type: 'continuity-metrics',
      data: metrics,
      timestamp: performance.now()
    });
  }, [onSystemEvent]);

  const technicalContext = React.useMemo(() => ({
    concept: `Technical Phase: ${currentPhase}`,
    complexity: Math.min(1.0, phaseProgress + 0.3),
    performance: visualIntensity,
    scalability: Math.min(1.0, phaseProgress + 0.2),
    reliability: 0.85
  }), [currentPhase, phaseProgress, visualIntensity]);

  return (
    <div className="volleyball-system-wrapper" style={{ width: '800px', height: '600px' }}>
      <VisualContinuitySystem
        currentPhase={currentPhase}
        previousPhase={previousPhase}
        transitionProgress={transitionProgress}
        isTransitioning={isTransitioning}
        visualIntensity={visualIntensity}
        onTransitionComplete={handleTransitionComplete}
        onContinuityMetrics={handleContinuityMetrics}
      >
        <SportsSequenceController
          currentPhase={currentPhase}
          phaseProgress={phaseProgress}
          isPlaying={isPlaying}
          leftViewportFrame={leftViewportFrame}
          rightViewportFrame={rightViewportFrame}
          onSyncUpdate={handleSyncUpdate}
          onIntensityChange={handleIntensityChange}
        >
          <PhaseSpecificSportsContent
            phase={currentPhase}
            progress={phaseProgress}
            intensity={visualIntensity}
            isVisible={true}
            technicalContext={technicalContext}
            onContentLoad={handleContentLoad}
          />
        </SportsSequenceController>
      </VisualContinuitySystem>

      {/* Test controls */}
      <div className="test-controls" style={{ marginTop: '20px' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          data-testid="play-pause-button"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => {
            const currentIndex = TEST_PHASES.indexOf(currentPhase);
            if (currentIndex < TEST_PHASES.length - 1) {
              setPreviousPhase(currentPhase);
              setCurrentPhase(TEST_PHASES[currentIndex + 1]);
              setPhaseProgress(0);
            }
          }}
          data-testid="next-phase-button"
        >
          Next Phase
        </button>
        <div data-testid="current-phase">{currentPhase}</div>
        <div data-testid="phase-progress">{Math.round(phaseProgress * 100)}%</div>
        <div data-testid="visual-intensity">{Math.round(visualIntensity * 100)}%</div>
      </div>
    </div>
  );
};

describe('Volleyball System Integration Tests', () => {
  let systemEvents: SystemEvent[] = [];

  beforeEach(() => {
    systemEvents = [];
    vi.useFakeTimers();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16); // 60fps
      return 1;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Component Integration', () => {
    it('should render all components together without errors', () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          onSystemEvent={handleSystemEvent}
        />
      );

      // Verify all components render
      expect(screen.getByTestId('current-phase')).toHaveTextContent('setup');
      expect(screen.getByTestId('phase-progress')).toHaveTextContent('0%');
      expect(screen.getByTestId('visual-intensity')).toBeInTheDocument();
      expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();
    });

    it('should handle phase transitions correctly across all components', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          onSystemEvent={handleSystemEvent}
        />
      );

      // Trigger phase transition
      fireEvent.click(screen.getByTestId('next-phase-button'));

      await waitFor(() => {
        expect(screen.getByTestId('current-phase')).toHaveTextContent('anticipation');
      });

      // Verify phase change events
      const phaseChangeEvents = systemEvents.filter(e => e.type === 'phase-change');
      expect(phaseChangeEvents).toHaveLength(1);
      expect(phaseChangeEvents[0].phase).toBe('anticipation');
    });

    it('should maintain synchronization across all subsystems', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      // Start playback
      fireEvent.click(screen.getByTestId('play-pause-button'));

      // Let system run for a while
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const syncEvents = systemEvents.filter(e => e.type === 'sync-update');
        expect(syncEvents.length).toBeGreaterThan(10);

        // Verify sync events contain proper data structure
        const lastSyncEvent = syncEvents[syncEvents.length - 1];
        expect(lastSyncEvent.data).toHaveProperty('drift');
        expect(lastSyncEvent.data).toHaveProperty('correctionApplied');
        expect(lastSyncEvent.data).toHaveProperty('sharedTimeline');
      });
    });
  });

  describe('End-to-End Sequence Flow', () => {
    it('should complete full volleyball sequence with proper timing', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      // Start auto-progression
      fireEvent.click(screen.getByTestId('play-pause-button'));

      // Fast-forward through complete sequence
      act(() => {
        vi.advanceTimersByTime(30000); // 30 seconds should be enough for full sequence
      });

      await waitFor(() => {
        const phaseChangeEvents = systemEvents.filter(e => e.type === 'phase-change');
        // Should have transitioned through all phases
        expect(phaseChangeEvents.length).toBeGreaterThanOrEqual(5);

        // Verify proper phase progression
        const phases = phaseChangeEvents.map(e => e.phase);
        expect(phases).toContain('anticipation');
        expect(phases).toContain('approach');
        expect(phases).toContain('spike');
        expect(phases).toContain('impact');
        expect(phases).toContain('follow-through');
      });
    });

    it('should maintain visual continuity throughout sequence', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      fireEvent.click(screen.getByTestId('play-pause-button'));

      act(() => {
        vi.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        const continuityEvents = systemEvents.filter(e => e.type === 'continuity-metrics');
        expect(continuityEvents.length).toBeGreaterThan(0);

        // Verify continuity quality metrics
        const lastContinuityEvent = continuityEvents[continuityEvents.length - 1];
        expect(lastContinuityEvent.data).toHaveProperty('overallScore');
        expect(lastContinuityEvent.data.overallScore).toBeGreaterThan(0.7);
      });
    });

    it('should build emotional intensity toward impact phase', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      fireEvent.click(screen.getByTestId('play-pause-button'));

      // Record intensity changes throughout sequence
      const intensityReadings: { phase: string; intensity: number; timestamp: number }[] = [];

      act(() => {
        for (let i = 0; i < 300; i++) { // 15 seconds
          vi.advanceTimersByTime(50);
          const currentPhase = screen.getByTestId('current-phase').textContent || 'unknown';
          const intensityText = screen.getByTestId('visual-intensity').textContent || '0%';
          const intensity = parseInt(intensityText.replace('%', '')) / 100;

          intensityReadings.push({
            phase: currentPhase,
            intensity,
            timestamp: i * 50
          });
        }
      });

      await waitFor(() => {
        expect(intensityReadings.length).toBeGreaterThan(100);

        // Verify intensity builds toward impact
        const setupIntensity = intensityReadings.find(r => r.phase === 'setup')?.intensity || 0;
        const impactIntensity = intensityReadings.find(r => r.phase === 'impact')?.intensity || 0;

        expect(impactIntensity).toBeGreaterThan(setupIntensity);
        expect(impactIntensity).toBeGreaterThan(0.8);
      });
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle frame drift and maintain synchronization', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="approach"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      fireEvent.click(screen.getByTestId('play-pause-button'));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        const syncEvents = systemEvents.filter(e => e.type === 'sync-update');
        const driftCorrections = syncEvents.filter(e => e.data?.correctionApplied);

        // Should have detected and corrected drift
        expect(driftCorrections.length).toBeGreaterThan(0);

        // Verify drift values are reasonable
        driftCorrections.forEach(event => {
          expect(event.data.drift).toBeLessThan(10); // Max 10 frame drift
        });
      });
    });

    it('should gracefully handle content loading failures', async () => {
      // Mock image loading failure
      const originalImage = global.Image;
      global.Image = class {
        onerror: ((this: HTMLImageElement, ev: Event | string) => any) | null = null;
        onload: ((this: HTMLImageElement, ev: Event) => any) | null = null;

        constructor() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror('Load failed');
            }
          }, 100);
        }
      } as any;

      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="impact"
          onSystemEvent={handleSystemEvent}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should still function even with content loading failures
        expect(screen.getByTestId('current-phase')).toHaveTextContent('impact');
      });

      // Restore original Image constructor
      global.Image = originalImage;
    });

    it('should maintain performance under high load conditions', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      // Simulate high frame rate and intensive transitions
      mockRequestAnimationFrame.mockImplementation((callback) => {
        setTimeout(callback, 8); // 120fps
        return 1;
      });

      render(
        <VolleyballSystemWrapper
          initialPhase="spike"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      fireEvent.click(screen.getByTestId('play-pause-button'));

      const startTime = performance.now();

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        const continuityEvents = systemEvents.filter(e => e.type === 'continuity-metrics');

        if (continuityEvents.length > 0) {
          const lastEvent = continuityEvents[continuityEvents.length - 1];
          // Performance impact should remain reasonable
          expect(lastEvent.data.performanceImpact).toBeLessThan(0.8);
        }
      });
    });
  });

  describe('Responsive and Accessibility', () => {
    it('should maintain functionality across different viewport sizes', async () => {
      const sizes = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1200, height: 800 }  // Desktop
      ];

      for (const size of sizes) {
        const handleSystemEvent = (event: SystemEvent) => {
          systemEvents.push(event);
        };

        // Mock viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: size.height,
        });

        const { unmount } = render(
          <VolleyballSystemWrapper
            initialPhase="setup"
            onSystemEvent={handleSystemEvent}
          />
        );

        // Verify component renders at this size
        expect(screen.getByTestId('current-phase')).toBeInTheDocument();
        expect(screen.getByTestId('play-pause-button')).toBeInTheDocument();

        // Test phase transition
        fireEvent.click(screen.getByTestId('next-phase-button'));

        await waitFor(() => {
          expect(screen.getByTestId('current-phase')).toHaveTextContent('anticipation');
        });

        unmount();
      }
    });

    it('should provide proper accessibility features', () => {
      render(
        <VolleyballSystemWrapper initialPhase="setup" />
      );

      // Verify controls are accessible
      const playButton = screen.getByTestId('play-pause-button');
      expect(playButton).toBeInTheDocument();
      expect(playButton).toBeEnabled();

      const nextButton = screen.getByTestId('next-phase-button');
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toBeEnabled();

      // Verify status information is available
      expect(screen.getByTestId('current-phase')).toBeInTheDocument();
      expect(screen.getByTestId('phase-progress')).toBeInTheDocument();
    });
  });

  describe('System State Consistency', () => {
    it('should maintain consistent state across all components during complex interactions', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="setup"
          onSystemEvent={handleSystemEvent}
        />
      );

      // Perform rapid phase changes
      const phases = ['anticipation', 'approach', 'spike', 'impact'];
      for (const expectedPhase of phases) {
        fireEvent.click(screen.getByTestId('next-phase-button'));

        await waitFor(() => {
          expect(screen.getByTestId('current-phase')).toHaveTextContent(expectedPhase);
        });

        // Brief wait to allow system to stabilize
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      // Verify final state consistency
      const finalPhaseChangeEvents = systemEvents.filter(e => e.type === 'phase-change');
      expect(finalPhaseChangeEvents.length).toBe(4);
      expect(finalPhaseChangeEvents[finalPhaseChangeEvents.length - 1].phase).toBe('impact');
    });

    it('should handle pause/resume correctly during transitions', async () => {
      const handleSystemEvent = (event: SystemEvent) => {
        systemEvents.push(event);
      };

      render(
        <VolleyballSystemWrapper
          initialPhase="approach"
          autoProgress={true}
          onSystemEvent={handleSystemEvent}
        />
      );

      // Start playback
      fireEvent.click(screen.getByTestId('play-pause-button'));

      // Let it run briefly
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Pause during transition
      fireEvent.click(screen.getByTestId('play-pause-button'));

      // Wait a bit
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Resume
      fireEvent.click(screen.getByTestId('play-pause-button'));

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        // System should still be functional
        expect(screen.getByTestId('current-phase')).toBeInTheDocument();

        // Should have received some sync updates even with pause/resume
        const syncEvents = systemEvents.filter(e => e.type === 'sync-update');
        expect(syncEvents.length).toBeGreaterThan(5);
      });
    });
  });
});

// Helper function to create mock system events
function createMockSystemEvent(type: SystemEvent['type'], data?: any): SystemEvent {
  return {
    type,
    data,
    timestamp: performance.now()
  };
}

// Extended matchers
declare global {
  namespace Vi {
    interface Assertion<T = any> {
      toBeWithinRange(min: number, max: number): T;
      toHaveValidSyncData(): T;
      toHaveValidContinuityMetrics(): T;
    }
  }
}

expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () => `expected ${received} to be within range ${min}-${max}`,
      pass
    };
  },

  toHaveValidSyncData(received: any) {
    const hasRequiredFields = received &&
      typeof received.drift === 'number' &&
      typeof received.correctionApplied === 'boolean' &&
      received.sharedTimeline &&
      typeof received.sharedTimeline.frameRate === 'number';

    return {
      message: () => `expected sync data to have valid structure`,
      pass: hasRequiredFields
    };
  },

  toHaveValidContinuityMetrics(received: any) {
    const hasValidMetrics = received &&
      typeof received.overallScore === 'number' &&
      received.overallScore >= 0 && received.overallScore <= 1 &&
      typeof received.transitionSmoothness === 'number' &&
      typeof received.visualCoherence === 'number' &&
      typeof received.performanceImpact === 'number';

    return {
      message: () => `expected continuity metrics to have valid structure and values`,
      pass: hasValidMetrics
    };
  }
});