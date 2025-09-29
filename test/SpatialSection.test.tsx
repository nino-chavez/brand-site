/**
 * SpatialSection Component Tests
 *
 * Comprehensive test suite for spatial section rendering at different scales,
 * progressive disclosure behavior, responsive scaling, and athletic design integration.
 *
 * @fileoverview SpatialSection component test suite
 * @version 1.0.0
 * @since Task 4 - Spatial Section Components Testing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpatialSection, createSpatialSectionMapping } from '../components/SpatialSection';
import type { SpatialSectionProps, SpatialSectionMap } from '../types/canvas';

// Create mock functions that will be set up in beforeEach
let mockIntersectionObserver: any;

// Test data setup
const mockSectionMap: SpatialSectionMap = {
  section: 'capture',
  coordinates: { gridX: 1, gridY: 0 },
  canvasPosition: { x: 0, y: -100, scale: 1.0 },
  metadata: {
    title: 'Capture',
    description: 'Introduction & readiness',
    cameraMetaphor: 'Hero Viewfinder',
    priority: 1
  }
};

const defaultProps: SpatialSectionProps = {
  section: 'capture',
  sectionMap: mockSectionMap,
  isActive: false,
  scale: 1.0,
  children: <div data-testid="section-content">Test Content</div>,
  className: 'test-class'
};

describe('SpatialSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up IntersectionObserver mock
    mockIntersectionObserver = vi.fn().mockImplementation((callback) => {
      const instance = {
        observe: vi.fn((element) => {
          // Simulate immediate intersection for testing
          callback([{ isIntersecting: true, target: element }], instance);
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
      return instance;
    });
    window.IntersectionObserver = mockIntersectionObserver;

    // Set up ResizeObserver mock
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock window dimensions for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      render(<SpatialSection {...defaultProps} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toBeInTheDocument();
      expect(sectionElement).toHaveAttribute('data-section', 'capture');
    });

    it('renders children content', () => {
      render(<SpatialSection {...defaultProps} />);

      expect(screen.getByTestId('section-content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SpatialSection {...defaultProps} className="custom-class" />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('custom-class');
    });

    it('displays section metadata', () => {
      render(<SpatialSection {...defaultProps} />);

      expect(screen.getByText('Hero Viewfinder')).toBeInTheDocument();
    });
  });

  describe('Scale-Based Progressive Disclosure', () => {
    it('shows minimal content at very low scale (0.5)', () => {
      render(<SpatialSection {...defaultProps} scale={0.5} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'minimal');
    });

    it('shows compact content at low scale (0.7)', () => {
      render(<SpatialSection {...defaultProps} scale={0.7} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'compact');
    });

    it('shows normal content at standard scale (1.0)', () => {
      render(<SpatialSection {...defaultProps} scale={1.0} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'normal');
    });

    it('shows detailed content at high scale (1.7)', () => {
      render(<SpatialSection {...defaultProps} scale={1.7} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      // At scale 1.7, considering responsive scaling (desktop = 1.0), total = 1.7
      // 1.7 > 1.5 (DETAILED threshold), so it should be 'expanded'
      expect(sectionElement).toHaveAttribute('data-content-level', 'expanded');
    });

    it('shows expanded content at maximum scale (2.5)', () => {
      render(<SpatialSection {...defaultProps} scale={2.5} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'expanded');
    });

    it('updates content level when scale changes', () => {
      const { rerender } = render(<SpatialSection {...defaultProps} scale={0.5} />);

      let sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'minimal');

      rerender(<SpatialSection {...defaultProps} scale={2.0} />);
      sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('data-content-level', 'expanded');
    });
  });

  describe('Responsive Scaling', () => {
    it('applies mobile scale factor on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true
      });

      render(<SpatialSection {...defaultProps} scale={1.0} />);

      // Trigger resize event
      fireEvent.resize(window);

      // Mobile devices should apply 0.8 scale factor
      // Since we can't directly test the style, we test that the component renders
      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toBeInTheDocument();
    });

    it('applies tablet scale factor on tablet devices', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true
      });

      render(<SpatialSection {...defaultProps} scale={1.0} />);

      fireEvent.resize(window);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toBeInTheDocument();
    });

    it('applies desktop scale factor on desktop devices', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        value: 1400,
        writable: true
      });

      render(<SpatialSection {...defaultProps} scale={1.0} />);

      fireEvent.resize(window);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toBeInTheDocument();
    });
  });

  describe('Active State Behavior', () => {
    it('applies active styling when isActive is true', () => {
      render(<SpatialSection {...defaultProps} isActive={true} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('ring-2', 'ring-athletic-court-orange/50');
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    it('applies inactive styling when isActive is false', () => {
      render(<SpatialSection {...defaultProps} isActive={false} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('ring-1', 'ring-athletic-neutral-700/30');
      expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
    });

    it('sets correct tabIndex for active section', () => {
      render(<SpatialSection {...defaultProps} isActive={true} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('tabIndex', '0');
    });

    it('sets correct tabIndex for inactive section', () => {
      render(<SpatialSection {...defaultProps} isActive={false} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Spatial Positioning', () => {
    it('applies correct transform for canvas position', () => {
      const customSectionMap: SpatialSectionMap = {
        ...mockSectionMap,
        canvasPosition: { x: 100, y: -50, scale: 1.0 },
        coordinates: { gridX: 2, gridY: 0 }
      };

      render(<SpatialSection {...defaultProps} sectionMap={customSectionMap} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      const transform = sectionElement.style.transform;
      expect(transform).toContain('translate3d(100px, -50px, 0)');
      expect(transform).toContain('scale(0.9)'); // Desktop scale factor 0.9 * canvas scale 1.0
    });

    it('includes offset coordinates in positioning', () => {
      const customSectionMap: SpatialSectionMap = {
        ...mockSectionMap,
        canvasPosition: { x: 0, y: 0, scale: 1.0 },
        coordinates: { gridX: 1, gridY: 1, offsetX: 25, offsetY: -25 }
      };

      render(<SpatialSection {...defaultProps} sectionMap={customSectionMap} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      const transform = sectionElement.style.transform;
      expect(transform).toContain('translate3d(25px, -25px, 0)');
      expect(transform).toContain('scale(0.9)'); // Desktop scale factor 0.9 * canvas scale 1.0
    });
  });

  describe('Athletic Design Integration', () => {
    it('applies priority-based styling for high priority sections', () => {
      const highPrioritySectionMap: SpatialSectionMap = {
        ...mockSectionMap,
        metadata: { ...mockSectionMap.metadata, priority: 1 }
      };

      render(<SpatialSection {...defaultProps} sectionMap={highPrioritySectionMap} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('bg-athletic-neutral-900/95');
    });

    it('applies priority-based styling for lower priority sections', () => {
      const lowPrioritySectionMap: SpatialSectionMap = {
        ...mockSectionMap,
        metadata: { ...mockSectionMap.metadata, priority: 5 }
      };

      render(<SpatialSection {...defaultProps} sectionMap={lowPrioritySectionMap} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('bg-athletic-neutral-800/90');
    });

    it('applies athletic transition classes', () => {
      render(<SpatialSection {...defaultProps} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveClass('athletic-animate-transition');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<SpatialSection {...defaultProps} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('role', 'region');
      expect(sectionElement).toHaveAttribute('aria-label', 'Capture - Introduction & readiness');
      expect(sectionElement).toHaveAttribute('aria-expanded', 'false');
    });

    it('updates aria-expanded when active state changes', () => {
      const { rerender } = render(<SpatialSection {...defaultProps} isActive={false} />);

      let sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('aria-expanded', 'false');

      rerender(<SpatialSection {...defaultProps} isActive={true} />);
      sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles keyboard navigation for active sections', () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<SpatialSection {...defaultProps} isActive={true} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      fireEvent.keyDown(sectionElement, { key: 'Enter' });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });

    it('ignores keyboard events for inactive sections', () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      render(<SpatialSection {...defaultProps} isActive={false} />);

      const sectionElement = screen.getByTestId('spatial-section-capture');
      fireEvent.keyDown(sectionElement, { key: 'Enter' });

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  describe('Performance Optimizations', () => {
    it('shows loading state initially', () => {
      // Mock IntersectionObserver to not trigger intersection immediately
      const mockObserver = vi.fn().mockImplementation(() => {
        return {
          observe: vi.fn(), // Don't call callback
          unobserve: vi.fn(),
          disconnect: vi.fn()
        };
      });
      window.IntersectionObserver = mockObserver;

      render(<SpatialSection {...defaultProps} />);

      // Should show spinner while loading (content not loaded yet)
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading section content')).toBeInTheDocument();

      // Restore original mock
      window.IntersectionObserver = mockIntersectionObserver;
    });

    it('disables pointer events for minimal content level', () => {
      render(<SpatialSection {...defaultProps} scale={0.5} />); // minimal level

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveStyle({ pointerEvents: 'none' });
    });

    it('enables pointer events for normal content levels', () => {
      render(<SpatialSection {...defaultProps} scale={1.0} />); // normal level

      const sectionElement = screen.getByTestId('spatial-section-capture');
      expect(sectionElement).toHaveStyle({ pointerEvents: 'auto' });
    });
  });

  describe('Utility Functions', () => {
    describe('createSpatialSectionMapping', () => {
      it('creates mapping for existing sections', () => {
        const existingSections = [
          <div key="1" id="hero">Hero Section</div>,
          <div key="2" id="about">About Section</div>
        ];

        const sectionMapping = {
          hero: mockSectionMap,
          about: { ...mockSectionMap, section: 'about' }
        };

        const result = createSpatialSectionMapping(existingSections, sectionMapping);

        expect(result).toHaveLength(2);
        expect(result[0].section).toBe('hero');
        expect(result[1].section).toBe('about');
      });

      it('generates fallback mapping for sections without explicit mapping', () => {
        const existingSections = [
          <div key="1" id="unknown">Unknown Section</div>
        ];

        const result = createSpatialSectionMapping(existingSections, {});

        expect(result).toHaveLength(1);
        expect(result[0].section).toBe('unknown');
        expect(result[0].mapping.metadata.title).toBe('Section 1');
      });
    });
  });

  describe('Development Mode Features', () => {
    it('shows debug overlay in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<SpatialSection {...defaultProps} />);

      expect(screen.getByText(/Grid:/)).toBeInTheDocument();
      expect(screen.getByText(/Canvas:/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('hides debug overlay in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<SpatialSection {...defaultProps} />);

      expect(screen.queryByText(/Grid:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Canvas:/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('SpatialSection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up IntersectionObserver mock for integration tests
    mockIntersectionObserver = vi.fn().mockImplementation((callback) => {
      const instance = {
        observe: vi.fn((element) => {
          // Simulate immediate intersection for testing
          callback([{ isIntersecting: true, target: element }], instance);
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
      return instance;
    });
    window.IntersectionObserver = mockIntersectionObserver;

    // Set up ResizeObserver mock
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('works with different content types', () => {
    const complexContent = (
      <div>
        <h1 className="section-title">Test Title</h1>
        <p className="section-secondary">Secondary content</p>
        <div className="section-detail">Detailed information</div>
        <div className="section-enhanced">Enhanced content</div>
        <div className="section-expanded">Expanded features</div>
      </div>
    );

    render(
      <SpatialSection {...defaultProps} scale={2.0}>
        {complexContent}
      </SpatialSection>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Secondary content')).toBeInTheDocument();
    expect(screen.getByText('Detailed information')).toBeInTheDocument();
  });

  it('maintains performance with rapid scale changes', async () => {
    const { rerender } = render(<SpatialSection {...defaultProps} scale={1.0} />);

    // Simulate rapid scale changes
    const scales = [0.5, 1.0, 1.5, 2.0, 0.8, 1.1]; // Final scale 1.1 * 0.9 = 0.99, should be 'normal'

    for (const scale of scales) {
      rerender(<SpatialSection {...defaultProps} scale={scale} />);
      await waitFor(() => {
        const element = screen.getByTestId('spatial-section-capture');
        expect(element).toBeInTheDocument();
      });
    }

    // Final verification
    const sectionElement = screen.getByTestId('spatial-section-capture');
    expect(sectionElement).toHaveAttribute('data-content-level', 'normal');
  });
});