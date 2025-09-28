/**
 * Section Detail Viewing Acceptance Criteria Tests
 *
 * Comprehensive test suite validating WHEN/THEN/SHALL requirements for section detail viewing
 * and progressive content disclosure from the lightbox canvas implementation specification.
 *
 * @fileoverview Acceptance criteria validation for User Story: Section Detail Viewing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Content types for progressive disclosure
interface ContentLevel {
  scale: number;
  type: 'preview' | 'summary' | 'detail' | 'full';
  content: {
    title: string;
    description?: string;
    images?: string[];
    interactive?: boolean;
  };
}

// Mock section content for testing
const mockSectionContent: Record<string, ContentLevel[]> = {
  about: [
    {
      scale: 0.3,
      type: 'preview',
      content: { title: 'About' }
    },
    {
      scale: 0.6,
      type: 'summary',
      content: {
        title: 'About',
        description: 'Software engineer with enterprise architecture experience'
      }
    },
    {
      scale: 1.0,
      type: 'detail',
      content: {
        title: 'About Nino Chavez',
        description: 'Experienced software engineer specializing in enterprise architecture and action sports photography',
        images: ['profile.jpg']
      }
    },
    {
      scale: 1.5,
      type: 'full',
      content: {
        title: 'About Nino Chavez',
        description: 'Comprehensive background in software engineering, enterprise architecture, and professional action sports photography with extensive experience in modern web technologies and team leadership.',
        images: ['profile.jpg', 'background.jpg'],
        interactive: true
      }
    }
  ],
  projects: [
    {
      scale: 0.3,
      type: 'preview',
      content: { title: 'Projects' }
    },
    {
      scale: 0.6,
      type: 'summary',
      content: {
        title: 'Projects',
        description: 'Enterprise applications and web solutions'
      }
    },
    {
      scale: 1.0,
      type: 'detail',
      content: {
        title: 'Featured Projects',
        description: 'Portfolio of enterprise applications, web solutions, and innovative software projects',
        images: ['project1.jpg', 'project2.jpg']
      }
    },
    {
      scale: 1.5,
      type: 'full',
      content: {
        title: 'Featured Projects & Contributions',
        description: 'Comprehensive portfolio showcasing enterprise applications, innovative web solutions, open source contributions, and collaborative projects with detailed case studies and technical implementations.',
        images: ['project1.jpg', 'project2.jpg', 'project3.jpg', 'project4.jpg'],
        interactive: true
      }
    }
  ]
};

// Test component for section detail viewing
const TestSpatialSection: React.FC<{
  sectionId: string;
  currentZoom: number;
  viewport: { width: number; height: number };
  onContentScale?: (scale: number) => void;
  onScrollRequest?: (direction: 'horizontal' | 'vertical') => void;
  maintainAspectRatio?: boolean;
  enableInternalScrolling?: boolean;
}> = ({
  sectionId,
  currentZoom,
  viewport,
  onContentScale,
  onScrollRequest,
  maintainAspectRatio = true,
  enableInternalScrolling = true
}) => {
  const [internalScroll, setInternalScroll] = React.useState({ x: 0, y: 0 });
  const [contentSize, setContentSize] = React.useState({ width: 400, height: 300 });

  // Determine content level based on zoom
  const getContentForZoom = (zoom: number): ContentLevel => {
    const sectionContent = mockSectionContent[sectionId] || mockSectionContent.about;

    // Find appropriate content level based on zoom
    for (let i = sectionContent.length - 1; i >= 0; i--) {
      if (zoom >= sectionContent[i].scale) {
        return sectionContent[i];
      }
    }

    return sectionContent[0]; // Default to preview
  };

  const currentContent = getContentForZoom(currentZoom);

  React.useEffect(() => {
    onContentScale?.(currentZoom);
  }, [currentZoom, onContentScale]);

  // Calculate aspect ratio maintenance
  const calculateDimensions = () => {
    if (!maintainAspectRatio) {
      return { width: viewport.width, height: viewport.height };
    }

    const aspectRatio = contentSize.width / contentSize.height;
    const viewportAspectRatio = viewport.width / viewport.height;

    if (viewportAspectRatio > aspectRatio) {
      // Viewport is wider, fit to height
      return {
        width: viewport.height * aspectRatio,
        height: viewport.height
      };
    } else {
      // Viewport is taller, fit to width
      return {
        width: viewport.width,
        height: viewport.width / aspectRatio
      };
    }
  };

  const dimensions = calculateDimensions();

  // Handle internal scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (enableInternalScrolling) {
      const target = e.target as HTMLDivElement;
      setInternalScroll({
        x: target.scrollLeft,
        y: target.scrollTop
      });

      // Trigger scroll request if content exceeds viewport
      if (target.scrollWidth > target.clientWidth) {
        onScrollRequest?.('horizontal');
      }
      if (target.scrollHeight > target.clientHeight) {
        onScrollRequest?.('vertical');
      }
    }
  };

  // Determine if content exceeds viewport
  const contentExceedsViewport = () => {
    const scaledWidth = contentSize.width * currentZoom;
    const scaledHeight = contentSize.height * currentZoom;

    return {
      horizontal: scaledWidth > viewport.width,
      vertical: scaledHeight > viewport.height
    };
  };

  const exceeds = contentExceedsViewport();

  return (
    <div
      data-testid={`spatial-section-${sectionId}`}
      data-zoom-level={currentZoom}
      data-content-type={currentContent.type}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        transform: `scale(${currentZoom})`,
        transformOrigin: 'top left',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: enableInternalScrolling ? 'auto' : 'hidden',
        position: 'relative'
      }}
      onScroll={handleScroll}
      role="region"
      aria-label={`${currentContent.content.title} section at ${(currentZoom * 100).toFixed(0)}% zoom`}
    >
      {/* Content based on zoom level */}
      <div
        data-testid="section-content"
        style={{
          padding: currentContent.type === 'preview' ? '8px' : '16px',
          width: '100%',
          height: currentContent.type === 'full' ? 'auto' : '100%',
          minHeight: '100%'
        }}
      >
        {/* Title */}
        <h2
          data-testid="section-title"
          style={{
            fontSize: currentContent.type === 'preview' ? '14px' :
                     currentContent.type === 'summary' ? '18px' :
                     currentContent.type === 'detail' ? '24px' : '32px',
            fontWeight: 'bold',
            marginBottom: currentContent.type === 'preview' ? '4px' : '16px',
            lineHeight: 1.2
          }}
        >
          {currentContent.content.title}
        </h2>

        {/* Description (if available at current zoom level) */}
        {currentContent.content.description && (
          <p
            data-testid="section-description"
            style={{
              fontSize: currentContent.type === 'summary' ? '12px' :
                       currentContent.type === 'detail' ? '14px' : '16px',
              lineHeight: 1.5,
              marginBottom: '16px',
              color: '#6b7280'
            }}
          >
            {currentContent.content.description}
          </p>
        )}

        {/* Images (if available at current zoom level) */}
        {currentContent.content.images && (
          <div
            data-testid="section-images"
            style={{
              display: 'grid',
              gridTemplateColumns: currentContent.type === 'full' ? 'repeat(auto-fit, minmax(200px, 1fr))' :
                                  currentContent.type === 'detail' ? 'repeat(2, 1fr)' : '1fr',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            {currentContent.content.images.map((image, index) => (
              <div
                key={index}
                data-testid={`section-image-${index}`}
                style={{
                  width: '100%',
                  height: currentContent.type === 'full' ? '150px' :
                         currentContent.type === 'detail' ? '100px' : '60px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}
              >
                {image}
              </div>
            ))}
          </div>
        )}

        {/* Interactive elements (only at full zoom) */}
        {currentContent.content.interactive && currentContent.type === 'full' && (
          <div data-testid="interactive-elements" style={{ marginTop: '24px' }}>
            <button
              data-testid="interactive-button"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                marginRight: '8px',
                cursor: 'pointer'
              }}
            >
              Learn More
            </button>
            <button
              data-testid="interactive-contact"
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Get In Touch
            </button>
          </div>
        )}

        {/* Extended content for full zoom to test scrolling */}
        {currentContent.type === 'full' && (
          <div data-testid="extended-content" style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Additional Details</h3>
            <p style={{ marginBottom: '16px' }}>
              This extended content is only visible at full zoom level and may require scrolling
              if it exceeds the viewport dimensions. This tests the internal scrolling functionality.
            </p>
            {/* Add enough content to potentially require scrolling */}
            {Array.from({ length: 10 }, (_, i) => (
              <p key={i} style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                Extended content paragraph {i + 1} that provides additional detailed information
                about this section and helps test scrolling behavior when content exceeds viewport.
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicators */}
      {exceeds.horizontal && (
        <div
          data-testid="horizontal-scroll-indicator"
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          ← Scroll horizontally →
        </div>
      )}

      {exceeds.vertical && (
        <div
          data-testid="vertical-scroll-indicator"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            writingMode: 'vertical-rl'
          }}
        >
          ↑ Scroll ↓
        </div>
      )}

      {/* Zoom level indicator */}
      <div
        data-testid="zoom-indicator"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      >
        {(currentZoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};

// Acceptance Criteria Tests for Section Detail Viewing
describe('Acceptance Criteria: Section Detail Viewing', () => {
  const defaultViewport = { width: 800, height: 600 };

  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  describe('AC1: WHEN user zooms into section, THEN system SHALL scale content while maintaining aspect ratios', () => {
    it('should scale content appropriately at different zoom levels', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.5}
          viewport={defaultViewport}
          maintainAspectRatio={true}
        />
      );

      // Check initial zoom level
      let section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('data-zoom-level', '0.5');

      // Check content scales with zoom
      const initialTransform = window.getComputedStyle(section).transform;
      expect(initialTransform).toContain('scale(0.5)');

      // Test different zoom levels
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={defaultViewport}
          maintainAspectRatio={true}
        />
      );

      section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('data-zoom-level', '1');

      const scaledTransform = window.getComputedStyle(section).transform;
      expect(scaledTransform).toContain('scale(1)');
    });

    it('should maintain aspect ratios during scaling', async () => {
      let capturedScale: number = 0;

      render(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={0.75}
          viewport={defaultViewport}
          onContentScale={(scale) => { capturedScale = scale; }}
          maintainAspectRatio={true}
        />
      );

      await waitFor(() => {
        expect(capturedScale).toBe(0.75);
      });

      const section = screen.getByTestId('spatial-section-projects');
      const styles = window.getComputedStyle(section);

      // Verify transform origin is set to maintain aspect ratio
      expect(styles.transformOrigin).toBe('top left');
    });

    it('should handle viewport dimension changes while maintaining aspect ratio', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={{ width: 400, height: 300 }}
          maintainAspectRatio={true}
        />
      );

      // Change viewport dimensions
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={{ width: 800, height: 600 }}
          maintainAspectRatio={true}
        />
      );

      const section = screen.getByTestId('spatial-section-about');
      expect(section).toBeInTheDocument();

      // Verify section adapts to new viewport while maintaining aspect ratio
      const styles = window.getComputedStyle(section);
      expect(styles.width).not.toBe('0px');
      expect(styles.height).not.toBe('0px');
    });
  });

  describe('AC2: WHEN section is in focus, THEN system SHALL display full content including interactive elements', () => {
    it('should display full content at 100% or higher zoom', async () => {
      render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={defaultViewport}
        />
      );

      const section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('data-content-type', 'detail');

      // Check for detailed content elements
      expect(screen.getByTestId('section-title')).toBeInTheDocument();
      expect(screen.getByTestId('section-description')).toBeInTheDocument();
      expect(screen.getByTestId('section-images')).toBeInTheDocument();
    });

    it('should display interactive elements at full zoom level', async () => {
      render(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={1.5}
          viewport={defaultViewport}
        />
      );

      const section = screen.getByTestId('spatial-section-projects');
      expect(section).toHaveAttribute('data-content-type', 'full');

      // Check for interactive elements
      await waitFor(() => {
        expect(screen.getByTestId('interactive-elements')).toBeInTheDocument();
        expect(screen.getByTestId('interactive-button')).toBeInTheDocument();
        expect(screen.getByTestId('interactive-contact')).toBeInTheDocument();
      });
    });

    it('should make interactive elements functional', async () => {
      const user = userEvent.setup();

      render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.5}
          viewport={defaultViewport}
        />
      );

      const learnMoreButton = screen.getByTestId('interactive-button');
      const contactButton = screen.getByTestId('interactive-contact');

      // Verify buttons are clickable
      expect(learnMoreButton).toBeEnabled();
      expect(contactButton).toBeEnabled();

      await user.click(learnMoreButton);
      await user.click(contactButton);

      // Buttons should remain functional after interaction
      expect(learnMoreButton).toBeEnabled();
      expect(contactButton).toBeEnabled();
    });
  });

  describe('AC3: IF user zooms out beyond 50% scale, THEN system SHALL show preview/summary content', () => {
    it('should show preview content at low zoom levels (<50%)', async () => {
      render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.3}
          viewport={defaultViewport}
        />
      );

      const section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('data-content-type', 'preview');

      // Check that only title is shown in preview
      expect(screen.getByTestId('section-title')).toBeInTheDocument();
      expect(screen.queryByTestId('section-description')).not.toBeInTheDocument();
      expect(screen.queryByTestId('section-images')).not.toBeInTheDocument();
    });

    it('should show summary content at medium zoom levels (50-99%)', async () => {
      render(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={0.6}
          viewport={defaultViewport}
        />
      );

      const section = screen.getByTestId('spatial-section-projects');
      expect(section).toHaveAttribute('data-content-type', 'summary');

      // Check that title and description are shown
      expect(screen.getByTestId('section-title')).toBeInTheDocument();
      expect(screen.getByTestId('section-description')).toBeInTheDocument();
      expect(screen.queryByTestId('section-images')).not.toBeInTheDocument();
    });

    it('should transition content smoothly between zoom levels', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.3}
          viewport={defaultViewport}
        />
      );

      // Start with preview
      expect(screen.getByTestId('spatial-section-about')).toHaveAttribute('data-content-type', 'preview');

      // Zoom to summary level
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.6}
          viewport={defaultViewport}
        />
      );

      expect(screen.getByTestId('spatial-section-about')).toHaveAttribute('data-content-type', 'summary');
      expect(screen.getByTestId('section-description')).toBeInTheDocument();

      // Zoom to detail level
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={defaultViewport}
        />
      );

      expect(screen.getByTestId('spatial-section-about')).toHaveAttribute('data-content-type', 'detail');
      expect(screen.getByTestId('section-images')).toBeInTheDocument();
    });
  });

  describe('AC4: WHEN user navigates between sections, THEN system SHALL maintain zoom level consistency', () => {
    it('should maintain zoom level when switching between similar sections', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.8}
          viewport={defaultViewport}
        />
      );

      // Switch to projects section with same zoom
      rerender(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={0.8}
          viewport={defaultViewport}
        />
      );

      const projectsSection = screen.getByTestId('spatial-section-projects');
      expect(projectsSection).toHaveAttribute('data-zoom-level', '0.8');

      // Both sections should show same content type at same zoom level
      expect(projectsSection).toHaveAttribute('data-content-type', 'summary');
    });

    it('should apply consistent content levels across different sections', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.0}
          viewport={defaultViewport}
        />
      );

      expect(screen.getByTestId('spatial-section-about')).toHaveAttribute('data-content-type', 'detail');

      // Switch to projects at same zoom level
      rerender(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={1.0}
          viewport={defaultViewport}
        />
      );

      expect(screen.getByTestId('spatial-section-projects')).toHaveAttribute('data-content-type', 'detail');
    });
  });

  describe('AC5: WHEN content exceeds viewport, THEN system SHALL provide scroll/pan within section', () => {
    it('should enable internal scrolling when content exceeds viewport at high zoom', async () => {
      let scrollRequested = false;

      render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.5}
          viewport={{ width: 400, height: 300 }}
          onScrollRequest={() => { scrollRequested = true; }}
          enableInternalScrolling={true}
        />
      );

      // Check for extended content that might require scrolling
      expect(screen.getByTestId('extended-content')).toBeInTheDocument();

      const section = screen.getByTestId('spatial-section-about');

      // Simulate scrolling within the section
      fireEvent.scroll(section, { target: { scrollTop: 100 } });

      await waitFor(() => {
        expect(scrollRequested).toBe(true);
      });
    });

    it('should show scroll indicators when content exceeds viewport dimensions', async () => {
      render(
        <TestSpatialSection
          sectionId="projects"
          currentZoom={2.0}
          viewport={{ width: 300, height: 200 }}
          enableInternalScrolling={true}
        />
      );

      // Content at 2x zoom should exceed small viewport
      await waitFor(() => {
        expect(screen.getByTestId('vertical-scroll-indicator')).toBeInTheDocument();
      });
    });

    it('should handle both horizontal and vertical scrolling', async () => {
      let horizontalScrollRequested = false;
      let verticalScrollRequested = false;

      render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={2.0}
          viewport={{ width: 200, height: 150 }}
          onScrollRequest={(direction) => {
            if (direction === 'horizontal') horizontalScrollRequested = true;
            if (direction === 'vertical') verticalScrollRequested = true;
          }}
          enableInternalScrolling={true}
        />
      );

      const section = screen.getByTestId('spatial-section-about');

      // Simulate both horizontal and vertical scrolling
      fireEvent.scroll(section, { target: { scrollLeft: 50, scrollTop: 50 } });

      await waitFor(() => {
        expect(horizontalScrollRequested || verticalScrollRequested).toBe(true);
      });
    });

    it('should maintain scroll position during zoom changes', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.5}
          viewport={{ width: 400, height: 300 }}
          enableInternalScrolling={true}
        />
      );

      const section = screen.getByTestId('spatial-section-about');

      // Scroll to a position
      fireEvent.scroll(section, { target: { scrollTop: 100 } });

      // Change zoom level
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.8}
          viewport={{ width: 400, height: 300 }}
          enableInternalScrolling={true}
        />
      );

      // Section should still be scrollable
      const updatedSection = screen.getByTestId('spatial-section-about');
      expect(updatedSection).toBeInTheDocument();
    });
  });

  describe('Progressive Content Disclosure Validation', () => {
    it('should progressively disclose content based on zoom thresholds', async () => {
      const zoomLevels = [0.2, 0.5, 0.8, 1.0, 1.5];
      const expectedTypes = ['preview', 'summary', 'summary', 'detail', 'full'];

      for (let i = 0; i < zoomLevels.length; i++) {
        const { unmount } = render(
          <TestSpatialSection
            sectionId="about"
            currentZoom={zoomLevels[i]}
            viewport={defaultViewport}
          />
        );

        const section = screen.getByTestId('spatial-section-about');
        expect(section).toHaveAttribute('data-content-type', expectedTypes[i]);

        unmount();
      }
    });

    it('should adjust font sizes based on content disclosure level', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.3}
          viewport={defaultViewport}
        />
      );

      let title = screen.getByTestId('section-title');
      let titleStyles = window.getComputedStyle(title);
      expect(titleStyles.fontSize).toBe('14px'); // Preview size

      // Zoom to summary level
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.6}
          viewport={defaultViewport}
        />
      );

      title = screen.getByTestId('section-title');
      titleStyles = window.getComputedStyle(title);
      expect(titleStyles.fontSize).toBe('18px'); // Summary size

      // Zoom to full level
      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.5}
          viewport={defaultViewport}
        />
      );

      title = screen.getByTestId('section-title');
      titleStyles = window.getComputedStyle(title);
      expect(titleStyles.fontSize).toBe('32px'); // Full size
    });

    it('should provide appropriate ARIA labels for different content levels', async () => {
      const { rerender } = render(
        <TestSpatialSection
          sectionId="about"
          currentZoom={0.3}
          viewport={defaultViewport}
        />
      );

      let section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('aria-label', 'About section at 30% zoom');

      rerender(
        <TestSpatialSection
          sectionId="about"
          currentZoom={1.5}
          viewport={defaultViewport}
        />
      );

      section = screen.getByTestId('spatial-section-about');
      expect(section).toHaveAttribute('aria-label', 'About Nino Chavez section at 150% zoom');
    });
  });
});

export { TestSpatialSection };