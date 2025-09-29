/**
 * Projects Content Adapter Tests
 *
 * Tests intelligent project presentation with progressive technical detail disclosure,
 * relevance scoring, and technical depth toggles
 * Phase 2: Core Implementation - Task 6: Projects Section Smart Showcase
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsContentAdapter } from '../../components/ProjectsContentAdapter';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';

// Mock the useContentLevelManager hook
vi.mock('../../hooks/useContentLevelManager');

const mockedUseContentLevelManager = vi.mocked(useContentLevelManager);

describe('ProjectsContentAdapter', () => {
  const mockActions = {
    updateCanvasPosition: vi.fn(),
    setContentLevel: vi.fn(),
    trackInteraction: vi.fn(),
    resetEngagement: vi.fn(),
    getOptimizedThresholds: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock return value
    mockedUseContentLevelManager.mockReturnValue({
      currentLevel: ContentLevel.SUMMARY,
      previousLevel: null,
      isTransitioning: false,
      actions: mockActions
    });
  });

  describe('Progressive Disclosure Levels', () => {
    it('should show only most relevant project at preview level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.PREVIEW} />);

      expect(screen.getByText('Featured Work')).toBeInTheDocument();
      expect(screen.getByText('PREVIEW LEVEL')).toBeInTheDocument();
      expect(screen.getByText('Signature projects showcasing innovation and impact')).toBeInTheDocument();

      // Should show only one project (most relevant)
      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards).toHaveLength(1);
    });

    it('should show top 2 projects at summary level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      expect(screen.getByText('Project Portfolio')).toBeInTheDocument();
      expect(screen.getByText('SUMMARY LEVEL')).toBeInTheDocument();
      expect(screen.getByText('Key projects demonstrating technical leadership and business value')).toBeInTheDocument();

      // Should show top 2 projects
      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards).toHaveLength(2);
    });

    it('should show all projects at detailed level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.getByText('Complete Project Portfolio')).toBeInTheDocument();
      expect(screen.getByText('DETAILED LEVEL')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive showcase with technical architecture and implementation details')).toBeInTheDocument();

      // Should show all projects
      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards).toHaveLength(3);
    });

    it('should show technical details and analytics at technical level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('Technical Project Deep Dive')).toBeInTheDocument();
      expect(screen.getByText('TECHNICAL LEVEL')).toBeInTheDocument();
      expect(screen.getByText('Full technical implementation details, code examples, and architecture decisions')).toBeInTheDocument();

      // Should show analytics section
      expect(screen.getByText('Project Portfolio Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Technical Depth Toggle', () => {
    it('should show technical depth toggle at detailed level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.getByText('business')).toBeInTheDocument();
      expect(screen.getByText('technical')).toBeInTheDocument();
      expect(screen.getByText('implementation')).toBeInTheDocument();
    });

    it('should show technical depth toggle at technical level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('business')).toBeInTheDocument();
      expect(screen.getByText('technical')).toBeInTheDocument();
      expect(screen.getByText('implementation')).toBeInTheDocument();
    });

    it('should not show technical depth toggle at lower levels', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.PREVIEW} />);

      expect(screen.queryByText('business')).not.toBeInTheDocument();
      expect(screen.queryByText('technical')).not.toBeInTheDocument();
      expect(screen.queryByText('implementation')).not.toBeInTheDocument();
    });

    it('should switch modes when toggle buttons are clicked', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const technicalButton = screen.getByText('technical');
      fireEvent.click(technicalButton);

      expect(mockActions.trackInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: expect.objectContaining({
            type: 'project'
          })
        })
      );
    });

    it('should disable implementation mode at detailed level when not available', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const implementationButton = screen.getByText('implementation');
      expect(implementationButton).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(implementationButton).toBeDisabled();
    });
  });

  describe('Project Relevance Scoring', () => {
    it('should show relevance scores for projects', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      // Should show relevance percentage badges
      expect(screen.getByText(/\d+% match/)).toBeInTheDocument();
    });

    it('should adapt to viewer behavior preferences', () => {
      const viewerBehavior = {
        interests: ['ai', 'technical'],
        timeSpent: {},
        interactionDepth: 'deep' as const,
        preferredTechnologies: ['TypeScript', 'React'],
        engagementHistory: []
      };

      render(
        <ProjectsContentAdapter
          forcedLevel={ContentLevel.SUMMARY}
          viewerBehavior={viewerBehavior}
        />
      );

      // Should show projects with adjusted relevance scores
      expect(screen.getByText(/\d+% match/)).toBeInTheDocument();
    });

    it('should sort projects by relevance score', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards).toHaveLength(3);

      // Projects should be sorted by relevance (highest first)
      expect(projectCards[0]).toHaveAttribute('data-testid', 'project-card-agentic-development');
    });
  });

  describe('Project Card Interactions', () => {
    it('should track project selection when card is clicked', () => {
      const onProjectInteraction = vi.fn();
      render(
        <ProjectsContentAdapter
          forcedLevel={ContentLevel.SUMMARY}
          onProjectInteraction={onProjectInteraction}
        />
      );

      const projectCard = screen.getByTestId('project-card-agentic-development');
      fireEvent.click(projectCard);

      expect(onProjectInteraction).toHaveBeenCalledWith(
        'agentic-development',
        'project_select',
        expect.any(Object)
      );
    });

    it('should show action links for projects with URLs', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      // Should show demo, source code, and case study links where available
      expect(screen.getByText('Live Demo →')).toBeInTheDocument();
      expect(screen.getByText('Source Code →')).toBeInTheDocument();
      expect(screen.getByText('Case Study →')).toBeInTheDocument();
    });

    it('should track link interactions separately', () => {
      const onProjectInteraction = vi.fn();
      render(
        <ProjectsContentAdapter
          forcedLevel={ContentLevel.SUMMARY}
          onProjectInteraction={onProjectInteraction}
        />
      );

      const demoLink = screen.getByText('Live Demo →');
      fireEvent.click(demoLink);

      expect(onProjectInteraction).toHaveBeenCalledWith(
        'agentic-development',
        'demo_access',
        expect.any(Object)
      );
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should show breadcrumbs when project is selected', async () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const projectCard = screen.getByTestId('project-card-agentic-development');
      fireEvent.click(projectCard);

      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Agentic Software Development Platform')).toBeInTheDocument();
      });
    });

    it('should handle breadcrumb navigation clicks', async () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const projectCard = screen.getByTestId('project-card-agentic-development');
      fireEvent.click(projectCard);

      await waitFor(() => {
        const projectsLink = screen.getByText('Projects');
        fireEvent.click(projectsLink);
        // Should navigate back to project list
      });
    });
  });

  describe('Content Mode Rendering', () => {
    it('should show business content in business mode', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      // Business mode should show business overview and ROI
      expect(screen.getByText(/Revolutionary AI-driven platform/)).toBeInTheDocument();
      expect(screen.getByText(/340% ROI within 12 months/)).toBeInTheDocument();
    });

    it('should show technical content when switching to technical mode', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const technicalButton = screen.getByText('technical');
      fireEvent.click(technicalButton);

      // Technical mode should show architecture and technologies
      expect(screen.getByText('Key Technologies')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });

    it('should show implementation content at technical level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      const implementationButton = screen.getByText('implementation');
      fireEvent.click(implementationButton);

      // Implementation mode should show code examples and metrics
      expect(screen.getByText('Key Improvements')).toBeInTheDocument();
    });
  });

  describe('Canvas Position Integration', () => {
    it('should handle canvas position updates', () => {
      const canvasPosition: CanvasPosition = { x: 100, y: 200, scale: 1.5 };
      render(<ProjectsContentAdapter canvasPosition={canvasPosition} />);

      expect(mockActions.updateCanvasPosition).toHaveBeenCalledWith(canvasPosition);
    });

    it('should handle forced level changes', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(mockActions.setContentLevel).toHaveBeenCalledWith(ContentLevel.TECHNICAL);
    });
  });

  describe('Performance Analytics', () => {
    it('should show analytics at technical level', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('Project Portfolio Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('AI Projects')).toBeInTheDocument();
      expect(screen.getByText('Avg Relevance')).toBeInTheDocument();
    });

    it('should not show analytics at lower levels', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.queryByText('Project Portfolio Analytics')).not.toBeInTheDocument();
    });

    it('should show correct analytics counts', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      // Should show 3 total projects
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Visual Styling and Transitions', () => {
    it('should apply transition classes when transitioning', () => {
      mockedUseContentLevelManager.mockReturnValue({
        currentLevel: ContentLevel.DETAILED,
        previousLevel: ContentLevel.SUMMARY,
        isTransitioning: true,
        actions: mockActions
      });

      render(<ProjectsContentAdapter />);

      // Should apply transition styles to the main container
      const projectsDisplay = document.querySelector('.projects-content-adapter > div');
      expect(projectsDisplay).toHaveClass('opacity-75', 'scale-[0.99]');
    });

    it('should apply level-specific styling', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      const levelIndicator = screen.getByText('TECHNICAL LEVEL');
      expect(levelIndicator).toHaveClass('bg-purple-900/40', 'text-purple-200');
    });

    it('should apply custom className when provided', () => {
      render(<ProjectsContentAdapter className="custom-projects-adapter" />);

      const adapter = document.querySelector('.projects-content-adapter');
      expect(adapter).toHaveClass('custom-projects-adapter');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper heading hierarchy', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Complete Project Portfolio');

      const projectHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(projectHeadings.length).toBeGreaterThan(0);
      expect(projectHeadings[0]).toHaveTextContent('Agentic Software Development Platform');
    });

    it('should have clickable elements with proper interaction patterns', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const projectCard = screen.getByTestId('project-card-agentic-development');
      expect(projectCard).toHaveClass('cursor-pointer');

      const actionLinks = screen.getAllByText(/→$/);
      actionLinks.forEach(link => {
        expect(link.closest('button')).toBeInTheDocument();
      });
    });
  });

  describe('Engagement Tracking', () => {
    it('should track engagement analytics when provided', () => {
      const onEngagementTracking = vi.fn();
      render(
        <ProjectsContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          onEngagementTracking={onEngagementTracking}
        />
      );

      const projectCard = screen.getByTestId('project-card-agentic-development');
      fireEvent.click(projectCard);

      expect(mockActions.trackInteraction).toHaveBeenCalled();
    });

    it('should track different interaction types', () => {
      const onProjectInteraction = vi.fn();
      render(
        <ProjectsContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          onProjectInteraction={onProjectInteraction}
        />
      );

      // Test mode toggle tracking
      const technicalButton = screen.getByText('technical');
      fireEvent.click(technicalButton);

      expect(onProjectInteraction).toHaveBeenCalledWith(
        'none',
        'mode_toggle',
        expect.objectContaining({
          mode: 'technical'
        })
      );
    });
  });

  describe('Development Mode Features', () => {
    it('should show debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.getByText(/🚧 Development Debug Info/)).toBeInTheDocument();
      expect(screen.getByText(/Current Level:/)).toBeInTheDocument();
      expect(screen.getByText('Transitioning: No')).toBeInTheDocument();
      expect(screen.getByText(/Visible Projects:/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug info in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.queryByText(/🚧 Development Debug Info/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance Modes', () => {
    it('should disable animations in low performance mode', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} performanceMode="low" />);

      const projectCard = screen.getByTestId('project-card-agentic-development');
      expect(projectCard).not.toHaveClass('transform', 'hover:scale-[1.02]');
    });

    it('should enable animations in high performance mode', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.DETAILED} performanceMode="high" />);

      const projectCard = screen.getByTestId('project-card-agentic-development');
      expect(projectCard).toHaveClass('transform');
    });
  });

  describe('Project Data Structure', () => {
    it('should display project metadata correctly', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      // Should show category, priority, and completion date
      expect(screen.getByText('ai')).toBeInTheDocument();
      expect(screen.getByText('high Priority')).toBeInTheDocument();
      expect(screen.getByText('2024-03')).toBeInTheDocument();
    });

    it('should handle projects without certain URLs gracefully', () => {
      render(<ProjectsContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      // Some projects may not have all URL types - component should handle gracefully
      const projectCards = screen.getAllByTestId(/project-card-/);
      expect(projectCards.length).toBeGreaterThan(0);
    });
  });
});