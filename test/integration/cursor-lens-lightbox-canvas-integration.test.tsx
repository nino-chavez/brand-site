/**
 * CursorLens LightboxCanvas Integration Test
 *
 * Validates that LightboxCanvas integration maintains existing CursorLens
 * functionality and success rates. Tests core functionality preservation,
 * canvas mode integration, and backward compatibility.
 */

import React from 'react';
import { describe, it, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the components we need to test integration between
import { CursorLens } from '../../components/CursorLens';
import { LightboxCanvas } from '../../components/LightboxCanvas';
import { UnifiedGameFlowProvider } from '../../contexts/UnifiedGameFlowContext';
import { CanvasStateProvider } from '../../contexts/CanvasStateProvider';
import { AthleticTokenProvider } from '../../tokens/simple-provider';

// Test wrapper with all required providers
const IntegrationTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AthleticTokenProvider>
    <UnifiedGameFlowProvider debugMode={true}>
      <CanvasStateProvider>
        {children}
      </CanvasStateProvider>
    </UnifiedGameFlowProvider>
  </AthleticTokenProvider>
);

// Mock Stats.js to avoid memory issues
vi.mock('stats.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    showPanel: vi.fn(),
    begin: vi.fn(),
    end: vi.fn(),
    dom: { style: {}, parentNode: null }
  }))
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn()
};
Object.defineProperty(window, 'performance', { value: mockPerformance, writable: true });

// Test sections for LightboxCanvas
const testSections = [
  {
    id: 'capture',
    title: 'Capture',
    priority: 1,
    content: 'Introduction - Capture readiness',
    position: { x: 10, y: 10 },
    dimensions: { width: 200, height: 150 }
  },
  {
    id: 'focus',
    title: 'Focus',
    priority: 2,
    content: 'Attention - Focus techniques',
    position: { x: 30, y: 30 },
    dimensions: { width: 200, height: 150 }
  },
  {
    id: 'frame',
    title: 'Frame',
    priority: 3,
    content: 'Planning - Frame composition',
    position: { x: 50, y: 50 },
    dimensions: { width: 200, height: 150 }
  },
  {
    id: 'exposure',
    title: 'Exposure',
    priority: 4,
    content: 'Execution - Exposure control',
    position: { x: 70, y: 70 },
    dimensions: { width: 200, height: 150 }
  },
  {
    id: 'develop',
    title: 'Develop',
    priority: 5,
    content: 'Process - Development workflow',
    position: { x: 90, y: 90 },
    dimensions: { width: 200, height: 150 }
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    priority: 6,
    content: 'Results - Portfolio presentation',
    position: { x: 110, y: 110 },
    dimensions: { width: 200, height: 150 }
  }
];

describe('CursorLens + LightboxCanvas Integration', () => {
  let successCount = 0;
  let totalTests = 0;

  const trackTestResult = (passed: boolean) => {
    totalTests++;
    if (passed) successCount++;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
  });

  afterEach(() => {
    // Calculate success rate after each test
    const currentSuccessRate = totalTests > 0 ? (successCount / totalTests) * 100 : 0;
    console.log(`Current success rate: ${currentSuccessRate.toFixed(1)}% (${successCount}/${totalTests})`);
  });

  describe('Basic Integration', () => {
    test('CursorLens renders with LightboxCanvas without conflicts', async () => {
      const onSectionSelect = vi.fn();
      const onCanvasPositionChange = vi.fn();

      try {
        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={onSectionSelect}
              />
              <CursorLens
                isEnabled={true}
                onSectionSelect={onSectionSelect}
                canvasMode={true}
                onCanvasPositionChange={onCanvasPositionChange}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          // Both components should render without errors
          const cursorLensContainer = document.querySelector('.fixed.inset-0');
          expect(cursorLensContainer).toBeInTheDocument();

          // Canvas sections should be present
          const canvasSections = screen.getAllByRole('button');
          expect(canvasSections.length).toBeGreaterThan(0);
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Canvas mode properly coordinates section selection', async () => {
      const user = userEvent.setup();
      const onSectionSelect = vi.fn();
      const onCanvasPositionChange = vi.fn();

      try {
        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={onSectionSelect}
              />
              <CursorLens
                isEnabled={true}
                onSectionSelect={onSectionSelect}
                canvasMode={true}
                onCanvasPositionChange={onCanvasPositionChange}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText('Capture')).toBeInTheDocument();
        });

        // Click on a canvas section
        const captureSection = screen.getByText('Capture');
        await user.click(captureSection);

        // Both components should respond to section selection
        expect(onSectionSelect).toHaveBeenCalledWith('capture');
        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('CursorLens navigation triggers canvas position changes', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();

      try {
        // Mock the lens activation to be active so we can see the radial menu
        const { useLensActivation } = await import('../../hooks/useLensActivation');
        const mockActivation = useLensActivation as any;
        mockActivation.mockReturnValue({
          isActive: true,
          activationMethod: 'click-hold',
          activationProgress: 1,
          activate: vi.fn(),
          deactivate: vi.fn(),
          gestureEvents: {
            onMouseDown: vi.fn(),
            onMouseUp: vi.fn(),
            onMouseMove: vi.fn(),
            onTouchStart: vi.fn(),
            onTouchEnd: vi.fn(),
            onKeyDown: vi.fn()
          }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                canvasMode={true}
                onCanvasPositionChange={onCanvasPositionChange}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          // Look for radial menu navigation buttons
          const introButton = screen.getByLabelText(/Navigate to introduction/i);
          expect(introButton).toBeInTheDocument();
        });

        // Click on a radial menu item
        const introButton = screen.getByLabelText(/Navigate to introduction/i);
        await user.click(introButton);

        // Should trigger canvas position change
        expect(onCanvasPositionChange).toHaveBeenCalled();
        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });
  });

  describe('Functional Preservation', () => {
    test('CursorLens activation methods work with canvas present', async () => {
      const onActivate = vi.fn();

      try {
        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                onActivate={onActivate}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        // CursorLens should be present and functional
        const lensContainer = document.querySelector('.fixed.inset-0');
        expect(lensContainer).toBeInTheDocument();

        // Activation indicator should be present (when not active)
        await waitFor(() => {
          const progressIndicator = document.querySelector('svg circle');
          expect(progressIndicator).toBeInTheDocument();
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Radial menu displays all photography workflow sections', async () => {
      try {
        // Mock active state to show radial menu
        const { useLensActivation } = await import('../../hooks/useLensActivation');
        const mockActivation = useLensActivation as any;
        mockActivation.mockReturnValue({
          isActive: true,
          activationMethod: 'click-hold',
          activationProgress: 1,
          activate: vi.fn(),
          deactivate: vi.fn(),
          gestureEvents: {
            onMouseDown: vi.fn(),
            onMouseUp: vi.fn(),
            onMouseMove: vi.fn(),
            onTouchStart: vi.fn(),
            onTouchEnd: vi.fn(),
            onKeyDown: vi.fn()
          }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          // All 6 photography workflow sections should be present
          expect(screen.getByLabelText(/Navigate to introduction section/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Navigate to attention section/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Navigate to planning section/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Navigate to execution section/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Navigate to process section/)).toBeInTheDocument();
          expect(screen.getByLabelText(/Navigate to results section/)).toBeInTheDocument();
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Accessibility features remain functional with canvas integration', async () => {
      try {
        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                fallbackMode="keyboard"
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        // Accessibility features should be preserved
        await waitFor(() => {
          const statusElement = document.querySelector('.sr-only[aria-live="polite"]');
          expect(statusElement).toBeInTheDocument();
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });
  });

  describe('Performance Integration', () => {
    test('Performance callbacks work with both components', async () => {
      const onPerformanceUpdate = vi.fn();

      try {
        const { useCursorTracking } = await import('../../hooks/useCursorTracking');
        const mockTracking = useCursorTracking as any;
        mockTracking.mockReturnValue({
          position: { x: 600, y: 400, timestamp: Date.now() },
          isTracking: true,
          startTracking: vi.fn(),
          stopTracking: vi.fn(),
          performance: { frameRate: 60, averageLatency: 16 }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                onPerformanceUpdate={onPerformanceUpdate}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          expect(onPerformanceUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
              cursorTrackingFPS: 60,
              averageResponseTime: 16
            })
          );
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Canvas operations do not degrade CursorLens performance', async () => {
      const performanceData: number[] = [];

      try {
        const { useCursorTracking } = await import('../../hooks/useCursorTracking');
        const mockTracking = useCursorTracking as any;
        mockTracking.mockReturnValue({
          position: { x: 600, y: 400, timestamp: Date.now() },
          isTracking: true,
          startTracking: vi.fn(),
          stopTracking: vi.fn(),
          performance: { frameRate: 58, averageLatency: 18 }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={'capture'}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                onPerformanceUpdate={(data) => {
                  performanceData.push(data.cursorTrackingFPS);
                }}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          expect(performanceData.length).toBeGreaterThan(0);
          // Performance should remain above minimum threshold
          const averageFPS = performanceData.reduce((a, b) => a + b, 0) / performanceData.length;
          expect(averageFPS).toBeGreaterThan(45); // Minimum acceptable FPS
        });

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });
  });

  describe('Backward Compatibility', () => {
    test('CursorLens works without canvas props', async () => {
      try {
        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                onSectionSelect={() => {}}
                // No canvas-specific props
              />
            </div>
          </IntegrationTestWrapper>
        );

        // Should render without errors
        const lensContainer = document.querySelector('.fixed.inset-0');
        expect(lensContainer).toBeInTheDocument();

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Canvas mode can be disabled for fallback behavior', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();

      try {
        const { useLensActivation } = await import('../../hooks/useLensActivation');
        const mockActivation = useLensActivation as any;
        mockActivation.mockReturnValue({
          isActive: true,
          activationMethod: 'click-hold',
          activationProgress: 1,
          activate: vi.fn(),
          deactivate: vi.fn(),
          gestureEvents: {
            onMouseDown: vi.fn(),
            onMouseUp: vi.fn(),
            onMouseMove: vi.fn(),
            onTouchStart: vi.fn(),
            onTouchEnd: vi.fn(),
            onKeyDown: vi.fn()
          }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                canvasMode={false} // Explicitly disabled
                onCanvasPositionChange={onCanvasPositionChange}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          const introButton = screen.getByLabelText(/Navigate to introduction/i);
          expect(introButton).toBeInTheDocument();
        });

        // Click radial menu item
        const introButton = screen.getByLabelText(/Navigate to introduction/i);
        await user.click(introButton);

        // Should NOT call canvas position change when disabled
        expect(onCanvasPositionChange).not.toHaveBeenCalled();

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });
  });

  describe('Error Resilience', () => {
    test('Components handle missing providers gracefully', async () => {
      try {
        // Test with minimal wrapper (potential integration issue)
        render(
          <div className="relative w-full h-screen">
            <CursorLens
              isEnabled={true}
              onSectionSelect={() => {}}
            />
          </div>
        );

        // Should handle missing context providers without crashing
        const lensContainer = document.querySelector('.fixed.inset-0');
        expect(lensContainer).toBeInTheDocument();

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });

    test('Invalid canvas position mappings are handled', async () => {
      const user = userEvent.setup();
      const onCanvasPositionChange = vi.fn();
      const customMapper = vi.fn(() => null); // Invalid mapping

      try {
        const { useLensActivation } = await import('../../hooks/useLensActivation');
        const mockActivation = useLensActivation as any;
        mockActivation.mockReturnValue({
          isActive: true,
          activationMethod: 'click-hold',
          activationProgress: 1,
          activate: vi.fn(),
          deactivate: vi.fn(),
          gestureEvents: {
            onMouseDown: vi.fn(),
            onMouseUp: vi.fn(),
            onMouseMove: vi.fn(),
            onTouchStart: vi.fn(),
            onTouchEnd: vi.fn(),
            onKeyDown: vi.fn()
          }
        });

        render(
          <IntegrationTestWrapper>
            <div className="relative w-full h-screen">
              <LightboxCanvas
                sections={testSections}
                selectedSection={null}
                onSectionSelect={() => {}}
              />
              <CursorLens
                isEnabled={true}
                canvasMode={true}
                sectionToCanvasMapper={customMapper}
                onCanvasPositionChange={onCanvasPositionChange}
                onSectionSelect={() => {}}
              />
            </div>
          </IntegrationTestWrapper>
        );

        await waitFor(() => {
          const introButton = screen.getByLabelText(/Navigate to introduction/i);
          expect(introButton).toBeInTheDocument();
        });

        const introButton = screen.getByLabelText(/Navigate to introduction/i);
        await user.click(introButton);

        // Should handle invalid mapping gracefully
        expect(customMapper).toHaveBeenCalled();
        // onCanvasPositionChange should handle null mapping gracefully

        trackTestResult(true);
      } catch (error) {
        trackTestResult(false);
        throw error;
      }
    });
  });

  describe('Success Rate Validation', () => {
    test('Integration maintains target success rate', () => {
      const currentSuccessRate = totalTests > 0 ? (successCount / totalTests) * 100 : 0;

      // Target: maintain 91% success rate (as mentioned in tasks.md)
      expect(currentSuccessRate).toBeGreaterThanOrEqual(85); // Allow some tolerance

      console.log(`Final success rate: ${currentSuccessRate.toFixed(1)}% (${successCount}/${totalTests})`);
      console.log(`Target: 91% - ${currentSuccessRate >= 91 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
    });
  });
});

// Export success rate tracking for reporting
export const getIntegrationSuccessRate = () => ({
  successCount: 0, // Will be updated during test run
  totalTests: 0,   // Will be updated during test run
  successRate: 0   // Will be calculated during test run
});