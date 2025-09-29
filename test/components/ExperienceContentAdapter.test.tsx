/**
 * Experience Content Adapter Tests
 *
 * Tests progressive experience disclosure functionality with role-based content optimization
 * Phase 3: Content Integration - Task 5: Experience Section Adaptive Content
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExperienceContentAdapter } from '../../components/ExperienceContentAdapter';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';

// Mock the useContentLevelManager hook
vi.mock('../../hooks/useContentLevelManager');

const mockedUseContentLevelManager = vi.mocked(useContentLevelManager);

describe('ExperienceContentAdapter', () => {
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
    it('should show limited experience at preview level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.PREVIEW} />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('PREVIEW LEVEL')).toBeInTheDocument();
      expect(screen.getByText('10+ years experience')).toBeInTheDocument();

      // Should show summary information only
      expect(screen.getByText('Career overview and highlights')).toBeInTheDocument();
      expect(screen.getByText('Managing Consultant & Enterprise Architect')).toBeInTheDocument();
    });

    it('should show core roles at summary level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('SUMMARY LEVEL')).toBeInTheDocument();
      expect(screen.getByText('10+ years experience')).toBeInTheDocument();

      // Should show current and key previous role
      expect(screen.getByText('Independent Technology Consulting')).toBeInTheDocument();
      expect(screen.getByText('Managing Consultant & Enterprise Architect')).toBeInTheDocument();
      expect(screen.getByText('2021 - Present')).toBeInTheDocument();
    });

    it('should show all roles at detailed level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('DETAILED LEVEL')).toBeInTheDocument();
      expect(screen.getByText('10+ years experience')).toBeInTheDocument();

      // Should show all three roles
      expect(screen.getByText('Independent Technology Consulting')).toBeInTheDocument();
      expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument();
      expect(screen.getByText('StartupTech Inc')).toBeInTheDocument();
    });

    it('should show comprehensive experience at technical level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
      expect(screen.getByText('TECHNICAL LEVEL')).toBeInTheDocument();
      expect(screen.getByText('10+ years experience')).toBeInTheDocument();

      // Should show technical details and analytics
      expect(screen.getByText('Career Analytics')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
      expect(screen.getByText('Total Roles')).toBeInTheDocument();
    });
  });

  describe('A/B Testing Framework', () => {
    it('should render chronological variant by default', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      // Chronological should show most recent first
      const roleCards = screen.getAllByTestId(/experience-role-/);
      expect(roleCards[0]).toHaveTextContent('Slalom');
      expect(roleCards[1]).toHaveTextContent('Rightpoint');
    });

    it('should render impact-first variant when specified', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          abTestVariant={{
            id: 'impact_first',
            contentStrategy: 'impact_first',
            emphasisOn: 'achievements'
          }}
        />
      );

      // Should show impact-first variant indicator
      expect(screen.getByText('Impact-Driven')).toBeInTheDocument();
    });

    it('should render technical depth variant when specified', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.TECHNICAL}
          abTestVariant={{
            id: 'technical_depth',
            contentStrategy: 'skills_focused',
            emphasisOn: 'technical_depth'
          }}
        />
      );

      // Should show technical depth variant indicator
      expect(screen.getByText('Technical Leadership')).toBeInTheDocument();
    });

    it('should render narrative story variant when specified', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          abTestVariant={{
            id: 'narrative_story',
            contentStrategy: 'narrative_driven',
            emphasisOn: 'innovation'
          }}
        />
      );

      // Should show narrative variant indicator
      expect(screen.getByText('Career Narrative')).toBeInTheDocument();
    });
  });

  describe('Role Card Interactions', () => {
    it('should expand and show role details when clicked', async () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Impact')).toBeInTheDocument();
      });
    });

    it('should show technical tab at technical level', async () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      await waitFor(() => {
        expect(screen.getByText('Technical')).toBeInTheDocument();
      });
    });

    it('should switch between tabs when clicked', async () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      await waitFor(() => {
        const projectsTab = screen.getByText('Projects');
        fireEvent.click(projectsTab);

        expect(screen.getByText('Financial Services Platform Modernization')).toBeInTheDocument();
      });
    });

    it('should track role expansion interactions', async () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      expect(mockActions.trackInteraction).toHaveBeenCalledWith({
        type: 'click',
        target: {
          type: 'experience_role',
          id: 'slalom',
          contentLevel: ContentLevel.DETAILED
        },
        timing: {
          timestamp: expect.any(Number)
        },
        spatial: {
          canvasPosition: { x: 0, y: 0, scale: 1.0 },
          section: 'frame'
        }
      });
    });
  });

  describe('Viewer Context Adaptation', () => {
    it('should adapt content for technical viewers', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          viewerContext={{
            role: 'technical',
            interests: ['architecture', 'ai'],
            engagementPattern: 'deep_dive'
          }}
        />
      );

      // Should render successfully with technical viewer context
      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });

    it('should adapt content for business viewers', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.SUMMARY}
          viewerContext={{
            role: 'business',
            interests: ['strategy', 'transformation'],
            engagementPattern: 'overview'
          }}
        />
      );

      // Should render successfully with business viewer context
      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });

    it('should adapt content for leadership viewers', () => {
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          viewerContext={{
            role: 'leadership',
            interests: ['management', 'innovation'],
            engagementPattern: 'scanning'
          }}
        />
      );

      // Should render successfully with leadership viewer context
      expect(screen.getByText('Professional Experience')).toBeInTheDocument();
    });
  });

  describe('Canvas Position Integration', () => {
    it('should handle canvas position updates', () => {
      const canvasPosition: CanvasPosition = { x: 100, y: 200, scale: 1.5 };
      render(<ExperienceContentAdapter canvasPosition={canvasPosition} />);

      expect(mockActions.updateCanvasPosition).toHaveBeenCalledWith(canvasPosition);
    });

    it('should handle forced level changes', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(mockActions.setContentLevel).toHaveBeenCalledWith(ContentLevel.TECHNICAL);
    });

    it('should adapt to zoom levels for content optimization', () => {
      const canvasPosition: CanvasPosition = { x: 0, y: 0, scale: 2.0 };
      render(<ExperienceContentAdapter canvasPosition={canvasPosition} />);

      // At high zoom, should show more detailed content
      expect(mockActions.updateCanvasPosition).toHaveBeenCalledWith(canvasPosition);
    });
  });

  describe('Performance Analytics', () => {
    it('should show analytics at technical level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('Career Analytics')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
      expect(screen.getByText('8+ years')).toBeInTheDocument();
      expect(screen.getByText('Total Roles')).toBeInTheDocument();
      expect(screen.getByText('5+ years')).toBeInTheDocument();
      expect(screen.getByText('Major Projects')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
    });

    it('should not show analytics at lower levels', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.queryByText('Experience Performance Analytics')).not.toBeInTheDocument();
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

      render(<ExperienceContentAdapter />);

      // Should apply transition styles to the main container
      const experienceDisplay = document.querySelector('.experience-content-adapter > div');
      expect(experienceDisplay).toHaveClass('opacity-75', 'scale-[0.99]');
    });

    it('should apply level-specific styling', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      const levelIndicator = screen.getByText('TECHNICAL LEVEL');
      expect(levelIndicator).toHaveClass('bg-purple-900/40', 'text-purple-200');
    });

    it('should apply custom className when provided', () => {
      render(<ExperienceContentAdapter className="custom-experience-adapter" />);

      const adapter = document.querySelector('.experience-content-adapter');
      expect(adapter).toHaveClass('custom-experience-adapter');
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper heading hierarchy', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Professional Experience Journey');

      const roleHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(roleHeadings.length).toBeGreaterThan(0);
      expect(roleHeadings[0]).toHaveTextContent('Managing Consultant');
    });

    it('should have clickable elements with proper interaction patterns', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const roleCard = screen.getByTestId('experience-role-slalom');
      expect(roleCard).toHaveClass('cursor-pointer');
    });

    it('should provide meaningful content progression', () => {
      // Each level should have substantive, distinct content
      const { rerender } = render(<ExperienceContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText(/Career overview and highlights/)).toBeInTheDocument();

      rerender(<ExperienceContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText(/Leading enterprise digital transformation/)).toBeInTheDocument();

      rerender(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText(/Professional journey with project details/)).toBeInTheDocument();

      rerender(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText(/Complete career history with technical leadership/)).toBeInTheDocument();
    });
  });

  describe('Development Mode Features', () => {
    it('should show debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<ExperienceContentAdapter />);

      expect(screen.getByText(/Current Level:/)).toBeInTheDocument();
      expect(screen.getByText('Transitioning: No')).toBeInTheDocument();
      expect(screen.getByText(/AB Test Variant:/)).toBeInTheDocument();
      expect(screen.getByText(/Viewer Context:/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug info in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<ExperienceContentAdapter />);

      expect(screen.queryByText(/Current Level:/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Photography Metaphor Integration', () => {
    it('should show exposure mapping at technical level', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('Experience Exposure Mapping')).toBeInTheDocument();
      expect(screen.getByText('Wide Angle')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Telephoto')).toBeInTheDocument();
      expect(screen.getByText('Macro')).toBeInTheDocument();
    });

    it('should not show exposure mapping at lower levels', () => {
      render(<ExperienceContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(screen.queryByText('Experience Exposure Mapping')).not.toBeInTheDocument();
    });
  });

  describe('A/B Test Effectiveness Tracking', () => {
    it('should call onABTestInteraction when provided', async () => {
      const onABTestInteraction = vi.fn();
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          onABTestInteraction={onABTestInteraction}
        />
      );

      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      expect(onABTestInteraction).toHaveBeenCalledWith(
        'chronological',
        'role_expand',
        expect.objectContaining({
          roleId: 'managing-consultant-current',
          contentLevel: ContentLevel.DETAILED
        })
      );
    });

    it('should track different interaction types for A/B testing', async () => {
      const onABTestInteraction = vi.fn();
      render(
        <ExperienceContentAdapter
          forcedLevel={ContentLevel.DETAILED}
          onABTestInteraction={onABTestInteraction}
        />
      );

      // Expand role
      const slalomCard = screen.getByTestId('experience-role-managing-consultant-current');
      fireEvent.click(slalomCard);

      await waitFor(() => {
        // Click on tab
        const projectsTab = screen.getByText('Projects');
        fireEvent.click(projectsTab);

        expect(onABTestInteraction).toHaveBeenCalledWith(
          'chronological',
          'tab_switch',
          expect.objectContaining({
            roleId: 'managing-consultant-current',
            tabType: 'projects'
          })
        );
      });
    });
  });
});