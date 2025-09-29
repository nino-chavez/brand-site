/**
 * About Content Adapter Tests
 *
 * Tests progressive content disclosure functionality for About section
 * Phase 3: Content Integration - Task 3: About Section Content Adapter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AboutContentAdapter } from '../../components/AboutContentAdapter';
import { ContentLevel } from '../../types/section-content';
import type { CanvasPosition } from '../../types/canvas';
import { useContentLevelManager } from '../../hooks/useContentLevelManager';

// Mock the useContentLevelManager hook
vi.mock('../../hooks/useContentLevelManager');

const mockedUseContentLevelManager = vi.mocked(useContentLevelManager);

describe('AboutContentAdapter', () => {
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
      currentLevel: ContentLevel.PREVIEW,
      previousLevel: null,
      isTransitioning: false,
      actions: mockActions
    });
  });

  describe('Content Level Rendering', () => {
    it('should render preview level content by default', () => {
      render(<AboutContentAdapter />);

      expect(screen.getByText('About Me')).toBeInTheDocument();
      expect(screen.getByText('PREVIEW')).toBeInTheDocument();
      expect(screen.getByText('30 sec')).toBeInTheDocument();
      expect(screen.getByText('Building scalable systems and exploring AI frontiers.')).toBeInTheDocument();
    });

    it('should render forced content level when provided', () => {
      render(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      expect(screen.getByText('About Me - Technical Deep Dive')).toBeInTheDocument();
      expect(screen.getByText('TECHNICAL')).toBeInTheDocument();
      expect(screen.getByText('3 min')).toBeInTheDocument();
      expect(screen.getByText('Technical Specializations')).toBeInTheDocument();
    });

    it('should display correct skill count for each level', () => {
      // Preview level - 3 skills
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText('Architecture')).toBeInTheDocument();
      expect(screen.getByText('AI')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();

      // Summary level - 5 skills
      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText('Enterprise Architecture')).toBeInTheDocument();
      expect(screen.getByText('Digital Transformation')).toBeInTheDocument();
      expect(screen.getByText('Generative AI')).toBeInTheDocument();

      // Technical level - 10 skills
      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText('Enterprise Architecture & Microservices Design')).toBeInTheDocument();
      expect(screen.getByText('Generative AI & Large Language Model Integration')).toBeInTheDocument();
    });

    it('should display correct paragraph count for each level', () => {
      // Preview - 1 paragraph
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText(/Building scalable systems/)).toBeInTheDocument();

      // Summary - 2 paragraphs
      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText(/Enterprise Architect and Managing Consultant/)).toBeInTheDocument();
      expect(screen.getByText(/action sports photographer/)).toBeInTheDocument();

      // Detailed - 3 paragraphs
      rerender(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText(/deep-rooted passion/)).toBeInTheDocument();
      expect(screen.getByText(/Beyond the world of code/)).toBeInTheDocument();
      expect(screen.getByText(/Recently, I've dived headfirst/)).toBeInTheDocument();

      // Technical - 4 paragraphs
      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText(/microservices ecosystems/)).toBeInTheDocument();
      expect(screen.getByText(/motion dynamics/)).toBeInTheDocument();
      expect(screen.getByText(/agentic development/)).toBeInTheDocument();
      expect(screen.getByText(/Technical specializations/)).toBeInTheDocument();
    });
  });

  describe('Content Level Progression', () => {
    it('should show appropriate skill section titles for each level', () => {
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText('Focus Areas')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText('Core Expertise')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText('Professional Skills')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText('Technical Specializations')).toBeInTheDocument();
    });

    it('should show progressive reading time estimates', () => {
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText('30 sec')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText('1 min')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText('2 min')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText('3 min')).toBeInTheDocument();
    });

    it('should show appropriate summary text for each level', () => {
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText('Enterprise Architect & AI Developer')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText('Enterprise Architect, Managing Consultant & AI Developer')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText('Enterprise Architect, Managing Consultant & Generative AI Developer')).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText('Enterprise Architect, Managing Consultant & AI Research Developer')).toBeInTheDocument();
    });
  });

  describe('User Interaction Tracking', () => {
    it('should call onInteraction when clicking title', () => {
      const onInteraction = vi.fn();
      render(<AboutContentAdapter onInteraction={onInteraction} />);

      fireEvent.click(screen.getByText('About Me'));

      expect(onInteraction).toHaveBeenCalledWith('title', 'click');
    });

    it('should call onInteraction when clicking paragraphs', () => {
      const onInteraction = vi.fn();
      render(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} onInteraction={onInteraction} />);

      const paragraph = screen.getByText(/Enterprise Architect and Managing Consultant/);
      fireEvent.click(paragraph);

      expect(onInteraction).toHaveBeenCalledWith('paragraph-0', 'click');
    });

    it('should call onInteraction when hovering over paragraphs', () => {
      const onInteraction = vi.fn();
      render(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} onInteraction={onInteraction} />);

      const paragraph = screen.getByText(/action sports photographer/);
      fireEvent.mouseEnter(paragraph);

      expect(onInteraction).toHaveBeenCalledWith('paragraph-1', 'hover');
    });

    it('should call onInteraction when clicking skills', () => {
      const onInteraction = vi.fn();
      render(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} onInteraction={onInteraction} />);

      fireEvent.click(screen.getByText('Enterprise Architecture'));

      expect(onInteraction).toHaveBeenCalledWith('skill-Enterprise Architecture', 'click');
    });

    it('should call onInteraction when hovering over skills', () => {
      const onInteraction = vi.fn();
      render(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} onInteraction={onInteraction} />);

      fireEvent.mouseEnter(screen.getByText('Generative AI'));

      expect(onInteraction).toHaveBeenCalledWith('skill-Generative AI', 'hover');
    });
  });

  describe('Canvas Position Integration', () => {
    it('should handle canvas position updates', () => {
      mockedUseContentLevelManager.mockReturnValue({
        currentLevel: ContentLevel.SUMMARY,
        previousLevel: ContentLevel.PREVIEW,
        isTransitioning: false,
        actions: mockActions
      });

      const canvasPosition: CanvasPosition = { x: 100, y: 200, scale: 1.5 };
      render(<AboutContentAdapter canvasPosition={canvasPosition} />);

      expect(mockActions.updateCanvasPosition).toHaveBeenCalledWith(canvasPosition);
    });

    it('should handle forced level changes', () => {
      mockedUseContentLevelManager.mockReturnValue({
        currentLevel: ContentLevel.PREVIEW,
        previousLevel: null,
        isTransitioning: false,
        actions: mockActions
      });

      render(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      expect(mockActions.setContentLevel).toHaveBeenCalledWith(ContentLevel.DETAILED);
    });
  });

  describe('Visual Styling and Transitions', () => {
    it('should apply transition classes when transitioning', () => {
      mockedUseContentLevelManager.mockReturnValue({
        currentLevel: ContentLevel.SUMMARY,
        previousLevel: ContentLevel.PREVIEW,
        isTransitioning: true,
        actions: mockActions
      });

      render(<AboutContentAdapter />);

      const contentDiv = document.querySelector('.about-content-adapter > div');
      expect(contentDiv).toHaveClass('opacity-75', 'scale-[0.98]');
    });

    it('should apply level-specific skill styling', () => {
      render(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);

      const skill = screen.getByText('Enterprise Architecture & Microservices Design');
      expect(skill).toHaveClass('bg-purple-900/40', 'text-purple-200', 'border-purple-700/50');
    });

    it('should apply custom className when provided', () => {
      render(<AboutContentAdapter className="custom-about-adapter" />);

      const adapter = document.querySelector('.about-content-adapter');
      expect(adapter).toHaveClass('custom-about-adapter');
    });
  });

  describe('Content Quality and Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('About Me');

      const skillsHeading = screen.getByRole('heading', { level: 3 });
      expect(skillsHeading).toHaveTextContent('Professional Skills');
    });

    it('should have interactive elements with proper cursor styling', () => {
      render(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);

      const paragraph = screen.getByText(/Enterprise Architect and Managing Consultant/);
      expect(paragraph).toHaveClass('cursor-pointer');

      const skill = screen.getByText('Enterprise Architecture');
      expect(skill).toHaveClass('cursor-pointer');
    });

    it('should provide meaningful content at each level', () => {
      // Each level should have substantive, distinct content
      const { rerender } = render(<AboutContentAdapter forcedLevel={ContentLevel.PREVIEW} />);
      expect(screen.getByText(/Building scalable systems/)).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.SUMMARY} />);
      expect(screen.getByText(/digital transformations/)).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.DETAILED} />);
      expect(screen.getByText(/deep-rooted passion/)).toBeInTheDocument();

      rerender(<AboutContentAdapter forcedLevel={ContentLevel.TECHNICAL} />);
      expect(screen.getByText(/microservices ecosystems/)).toBeInTheDocument();
    });
  });

  describe('Development Mode Features', () => {
    it('should show debug info in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<AboutContentAdapter />);

      expect(screen.getByText('Current Level: preview')).toBeInTheDocument();
      expect(screen.getByText('Transitioning: No')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug info in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<AboutContentAdapter />);

      expect(screen.queryByText('Current Level:')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});