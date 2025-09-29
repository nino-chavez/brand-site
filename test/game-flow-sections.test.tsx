/**
 * @deprecated Traditional Layout System Tests
 *
 * These tests are deprecated as part of the canvas layout transition.
 * Traditional section components (CaptureSection, FocusSection, etc.) are being
 * replaced by Content Adapters in the canvas system.
 *
 * Status: DEPRECATED - Will be removed in Phase 3
 * Replacement: Canvas layout integration tests in tests/e2e/canvas-layout.spec.ts
 *
 * See: TEST-DEPRECATION-ASSESSMENT.md for migration strategy
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CaptureSection } from '../components/sections/CaptureSection';
import { FocusSection } from '../components/sections/FocusSection';
import { FrameSection } from '../components/sections/FrameSection';
import { ExposureSection } from '../components/sections/ExposureSection';
import { DevelopSection } from '../components/sections/DevelopSection';
import { PortfolioSection } from '../components/sections/PortfolioSection';
import { GameFlowProvider } from '../hooks/useGameFlowState';

describe('Game Flow Sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CaptureSection (Hero Transformation)', () => {
    it('should render with minimalist hero focus', () => {
      render(
        <GameFlowProvider>
          <CaptureSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      // Should show title, role, and primary CTA only
      expect(screen.getByTestId('hero-title')).toBeInTheDocument();
      expect(screen.getByTestId('hero-role')).toBeInTheDocument();
      expect(screen.getByTestId('primary-cta')).toBeInTheDocument();

      // Should NOT show complex overlays
      expect(screen.queryByTestId('technical-stats-overlay')).not.toBeInTheDocument();
    });

    it('should integrate ViewfinderOverlay in clean mode', () => {
      render(
        <GameFlowProvider>
          <CaptureSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const viewfinder = screen.getByTestId('viewfinder-overlay');
      expect(viewfinder).toHaveAttribute('data-mode', 'hero-clean');
      expect(viewfinder).toHaveAttribute('data-show-metadata-hud', 'false');
    });

    it('should trigger capture sequence on CTA interaction', async () => {
      const onSectionReady = vi.fn();

      render(
        <GameFlowProvider>
          <CaptureSection active={true} progress={0} onSectionReady={onSectionReady} />
        </GameFlowProvider>
      );

      const ctaButton = screen.getByTestId('primary-cta');
      fireEvent.click(ctaButton);

      await waitFor(() => {
        expect(screen.getByTestId('capture-sequence')).toHaveClass('active');
      });

      // Should call onSectionReady after animation
      await waitFor(() => {
        expect(onSectionReady).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should support "View Work" call-to-action scroll initiation', () => {
      render(
        <GameFlowProvider>
          <CaptureSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const viewWorkCta = screen.getByTestId('view-work-cta');
      expect(viewWorkCta).toHaveTextContent(/view work/i);

      fireEvent.click(viewWorkCta);

      // Should trigger scroll to next section
      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('FocusSection (About Transformation)', () => {
    it('should remove Technical Profile overlay', () => {
      render(
        <GameFlowProvider>
          <FocusSection active={true} progress={0} depthOfField={0.5} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      // Old floating overlay should not exist
      expect(screen.queryByTestId('floating-technical-profile')).not.toBeInTheDocument();
    });

    it('should integrate technical profile into About narrative', () => {
      render(
        <GameFlowProvider>
          <FocusSection active={true} progress={0} depthOfField={0.5} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      // Technical profile should be integrated within content
      expect(screen.getByTestId('integrated-stats-card')).toBeInTheDocument();
      expect(screen.getByTestId('about-narrative')).toContainElement(
        screen.getByTestId('technical-stack-inline')
      );
    });

    it('should use athletic stats metaphor for credentials', () => {
      render(
        <GameFlowProvider>
          <FocusSection active={true} progress={0} depthOfField={0.5} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      const statsCard = screen.getByTestId('athletic-stats-card');
      expect(statsCard).toHaveClass('sports-statistics-style');

      // Should display experience as athletic achievements
      expect(screen.getByTestId('experience-stat')).toHaveTextContent(/20\+ years/i);
      expect(screen.getByTestId('team-scale-stat')).toHaveTextContent(/100\+ resources/i);
    });

    it('should animate stats card into view on scroll progress', async () => {
      const { rerender } = render(
        <GameFlowProvider>
          <FocusSection active={false} progress={0} depthOfField={0} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      let statsCard = screen.getByTestId('athletic-stats-card');
      expect(statsCard).toHaveClass('hidden');

      // Rerender with section becoming active and progress
      rerender(
        <GameFlowProvider>
          <FocusSection active={true} progress={0.3} depthOfField={0.8} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      await waitFor(() => {
        statsCard = screen.getByTestId('athletic-stats-card');
        expect(statsCard).toHaveClass('animate-in');
      });
    });
  });

  describe('FrameSection (Projects Transformation)', () => {
    it('should display projects in high-fidelity sequences', () => {
      render(
        <GameFlowProvider>
          <FrameSection active={true} progress={0} exposureSettings={{
            aperture: 2.8,
            shutterSpeed: 250,
            iso: 800,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const projectSequence = screen.getByTestId('project-sequence');
      expect(projectSequence).toHaveClass('high-fidelity');

      // Should not show overwhelming technical details initially
      expect(screen.queryByTestId('detailed-tech-specs')).not.toBeInTheDocument();
    });

    it('should trigger side-panel for project technical details', async () => {
      render(
        <GameFlowProvider>
          <FrameSection active={true} progress={0} exposureSettings={{
            aperture: 2.8,
            shutterSpeed: 250,
            iso: 800,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const projectCard = screen.getAllByTestId('project-card')[0];
      fireEvent.click(projectCard);

      await waitFor(() => {
        const sidePanel = screen.getByTestId('project-tech-side-panel');
        expect(sidePanel).toHaveClass('slide-in');
        expect(sidePanel).toBeInTheDocument();
      });
    });

    it('should maintain main project visibility with non-modal side-panel', async () => {
      render(
        <GameFlowProvider>
          <FrameSection active={true} progress={0} exposureSettings={{
            aperture: 2.8,
            shutterSpeed: 250,
            iso: 800,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const projectCard = screen.getAllByTestId('project-card')[0];
      fireEvent.click(projectCard);

      await waitFor(() => {
        const sidePanel = screen.getByTestId('project-tech-side-panel');
        const mainSequence = screen.getByTestId('project-sequence');

        // Both should be visible simultaneously
        expect(sidePanel).toBeVisible();
        expect(mainSequence).toBeVisible();
        expect(mainSequence).not.toHaveClass('blurred');
      });
    });

    it('should show project-specific technical stack in side panel', async () => {
      render(
        <GameFlowProvider>
          <FrameSection active={true} progress={0} exposureSettings={{
            aperture: 2.8,
            shutterSpeed: 250,
            iso: 800,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const projectCard = screen.getAllByTestId('project-card')[0];
      fireEvent.click(projectCard);

      await waitFor(() => {
        const sidePanel = screen.getByTestId('project-tech-side-panel');
        expect(sidePanel).toContainElement(screen.getByTestId('project-specific-stack'));
        expect(sidePanel).toContainElement(screen.getByTestId('architectural-rationale'));
      });
    });
  });

  describe('ExposureSection (Insights Transformation)', () => {
    it('should style as athletic training log', () => {
      render(
        <GameFlowProvider>
          <ExposureSection active={true} progress={0} exposureSettings={{
            aperture: 4,
            shutterSpeed: 125,
            iso: 400,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const insightsContainer = screen.getByTestId('insights-container');
      expect(insightsContainer).toHaveClass('training-log-aesthetic');
    });

    it('should emphasize scannability and readability', () => {
      render(
        <GameFlowProvider>
          <ExposureSection active={true} progress={0} exposureSettings={{
            aperture: 4,
            shutterSpeed: 125,
            iso: 400,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const articlePreviews = screen.getAllByTestId('article-preview');
      articlePreviews.forEach(preview => {
        expect(preview).toHaveClass('scannable-typography');
        expect(preview).toHaveClass('high-readability');
      });
    });

    it('should use camera-shutter transitions between articles', async () => {
      render(
        <GameFlowProvider>
          <ExposureSection active={true} progress={0} exposureSettings={{
            aperture: 4,
            shutterSpeed: 125,
            iso: 400,
            exposureCompensation: 0
          }} onExposureAdjust={vi.fn()} />
        </GameFlowProvider>
      );

      const nextArticleButton = screen.getByTestId('next-article');
      fireEvent.click(nextArticleButton);

      await waitFor(() => {
        expect(screen.getByTestId('shutter-transition')).toHaveClass('active');
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-article')).toHaveAttribute('data-article-index', '1');
      }, { timeout: 1000 });
    });
  });

  describe('DevelopSection (Gallery Transformation)', () => {
    it('should implement high-speed optimized image loading', async () => {
      render(
        <GameFlowProvider>
          <DevelopSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const gallery = screen.getByTestId('optimized-gallery');
      expect(gallery).toHaveClass('high-speed-loading');

      // Should load images progressively
      await waitFor(() => {
        const images = screen.getAllByTestId('gallery-image');
        expect(images.length).toBeGreaterThan(0);

        images.forEach(img => {
          expect(img).toHaveAttribute('loading', 'lazy');
          expect(img).toHaveClass('optimized');
        });
      });
    });

    it('should demonstrate technical capability through performance', async () => {
      const performanceSpy = vi.spyOn(performance, 'mark');

      render(
        <GameFlowProvider performanceTracking={true}>
          <DevelopSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      await waitFor(() => {
        expect(performanceSpy).toHaveBeenCalledWith('gallery-load-start');
      });

      // Gallery should load within performance targets
      const loadMetrics = screen.getByTestId('gallery-performance-metrics');
      await waitFor(() => {
        const loadTime = loadMetrics.getAttribute('data-load-time');
        expect(Number(loadTime)).toBeLessThan(500); // High-speed target
      });
    });

    it('should provide instant responsiveness for interactions', () => {
      render(
        <GameFlowProvider>
          <DevelopSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const galleryImage = screen.getAllByTestId('gallery-image')[0];

      // Interaction should be immediate (no delay)
      const startTime = performance.now();
      fireEvent.click(galleryImage);
      const responseTime = performance.now() - startTime;

      expect(responseTime).toBeLessThan(16); // Sub-frame response
      expect(galleryImage).toHaveClass('selected');
    });
  });

  describe('PortfolioSection (Contact Transformation)', () => {
    it('should provide clean completion interface', () => {
      render(
        <GameFlowProvider>
          <PortfolioSection active={true} progress={1} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const contactForm = screen.getByTestId('contact-form');
      expect(contactForm).toHaveClass('clean-completion');
      expect(contactForm).toHaveClass('match-end');
    });

    it('should have clear CTAs for collaboration', () => {
      render(
        <GameFlowProvider>
          <PortfolioSection active={true} progress={1} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      const collaborationCta = screen.getByTestId('collaboration-cta');
      expect(collaborationCta).toHaveTextContent(/start collaboration/i);
      expect(collaborationCta).toHaveClass('unambiguous');

      const consultationCta = screen.getByTestId('consultation-cta');
      expect(consultationCta).toHaveTextContent(/schedule consultation/i);
    });

    it('should maintain performance consistency through final section', async () => {
      render(
        <GameFlowProvider performanceTracking={true}>
          <PortfolioSection active={true} progress={1} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      // Final section should maintain same performance standards
      const performanceMetrics = screen.getByTestId('section-performance');

      await waitFor(() => {
        const frameRate = performanceMetrics.getAttribute('data-frame-rate');
        expect(Number(frameRate)).toBeGreaterThanOrEqual(58);
      });
    });

    it('should complete the Game Flow narrative arc', () => {
      render(
        <GameFlowProvider>
          <PortfolioSection active={true} progress={1} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      // Should show narrative completion elements
      expect(screen.getByTestId('journey-complete')).toBeInTheDocument();
      expect(screen.getByTestId('narrative-conclusion')).toHaveTextContent(/the match concludes/i);
    });
  });

  describe('Section Integration', () => {
    it('should share consistent camera metaphor language', () => {
      const sections = [
        <CaptureSection key="capture" active={true} progress={0} onSectionReady={vi.fn()} />,
        <FocusSection key="focus" active={false} progress={0} depthOfField={0} onFocusLock={vi.fn()} />,
        <FrameSection key="frame" active={false} progress={0} exposureSettings={{
          aperture: 2.8, shutterSpeed: 250, iso: 800, exposureCompensation: 0
        }} onExposureAdjust={vi.fn()} />
      ];

      sections.forEach((section, index) => {
        render(
          <GameFlowProvider>
            {section}
          </GameFlowProvider>
        );

        // Each section should have camera-inspired terminology
        const sectionContainer = screen.getByTestId(`${['capture', 'focus', 'frame'][index]}-section`);
        expect(sectionContainer).toHaveAttribute('data-camera-metaphor', 'true');
      });
    });

    it('should maintain state consistency across section changes', async () => {
      const { rerender } = render(
        <GameFlowProvider>
          <CaptureSection active={true} progress={0} onSectionReady={vi.fn()} />
        </GameFlowProvider>
      );

      // Initial state should be tracked
      expect(screen.getByTestId('capture-section')).toHaveAttribute('data-active', 'true');

      // Switch to focus section
      rerender(
        <GameFlowProvider>
          <FocusSection active={true} progress={0.2} depthOfField={0.8} onFocusLock={vi.fn()} />
        </GameFlowProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('focus-section')).toHaveAttribute('data-active', 'true');
        expect(screen.getByTestId('focus-section')).toHaveAttribute('data-progress', '0.2');
      });
    });
  });
});