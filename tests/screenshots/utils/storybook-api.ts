/**
 * Storybook API Client
 *
 * Connects to a running Storybook instance to discover stories dynamically.
 * This enables automatic component capture without manual configuration.
 */

import type { Page } from '@playwright/test';
import { captureConfig } from '../config/capture.config';

export interface StoryInfo {
  id: string;
  title: string;
  name: string;
  componentName: string;
  variant: string;
  args?: Record<string, any>;
}

export class StorybookAPI {
  private storiesCache: StoryInfo[] | null = null;

  /**
   * Discovers all stories from Storybook
   */
  async discoverStories(page: Page): Promise<StoryInfo[]> {
    if (this.storiesCache) {
      return this.storiesCache;
    }

    // Navigate to Storybook
    await page.goto(captureConfig.storybookUrl);

    // Wait for Storybook to load
    await page.waitForSelector('#storybook-root', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Extract stories from Storybook's internal API
    const stories = await page.evaluate(() => {
      // Access Storybook's internal store
      // Note: This relies on Storybook internals and may need adjustment
      // for different Storybook versions

      const storyStore = (window as any).__STORYBOOK_PREVIEW__?.storyStore;

      if (!storyStore) {
        console.error('Storybook store not found');
        return [];
      }

      const allStories: any[] = [];

      // Get all story entries
      const storyIndex = storyStore.storyIndex;
      if (!storyIndex) {
        console.error('Story index not found');
        return [];
      }

      Object.entries(storyIndex.entries || {}).forEach(([id, entry]: [string, any]) => {
        allStories.push({
          id,
          title: entry.title,
          name: entry.name,
        });
      });

      return allStories;
    });

    // Transform stories into our format
    this.storiesCache = stories.map((story: any) => {
      const componentName = this.extractComponentName(story.title);
      const variant = this.extractVariant(story.name);

      return {
        id: story.id,
        title: story.title,
        name: story.name,
        componentName,
        variant,
      };
    });

    console.log(`\n📚 Discovered ${this.storiesCache.length} stories\n`);

    return this.storiesCache;
  }

  /**
   * Gets story by ID
   */
  getStory(storyId: string): StoryInfo | undefined {
    return this.storiesCache?.find((s) => s.id === storyId);
  }

  /**
   * Gets stories for a specific component
   */
  getStoriesForComponent(componentName: string): StoryInfo[] {
    return this.storiesCache?.filter((s) => s.componentName === componentName) || [];
  }

  /**
   * Gets all unique component names
   */
  getComponentNames(): string[] {
    if (!this.storiesCache) return [];

    const names = new Set(this.storiesCache.map((s) => s.componentName));
    return Array.from(names).sort();
  }

  /**
   * Navigates to a specific story
   */
  async navigateToStory(page: Page, storyId: string): Promise<void> {
    const url = `${captureConfig.storybookUrl}/iframe.html?id=${storyId}&viewMode=story`;
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  /**
   * Gets story args from page
   */
  async getStoryArgs(page: Page): Promise<Record<string, any>> {
    return await page.evaluate(() => {
      const storyStore = (window as any).__STORYBOOK_PREVIEW__?.storyStore;
      if (!storyStore) return {};

      // Try to get current story context
      const context = (window as any).__STORYBOOK_PREVIEW__?.currentRender?.context;
      if (context?.args) {
        return context.args;
      }

      return {};
    });
  }

  /**
   * Extracts component name from story title
   * e.g., "Canvas/CameraController" -> "CameraController"
   */
  private extractComponentName(title: string): string {
    const parts = title.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Extracts variant from story name
   * e.g., "Low Performance" -> "lowPerformance"
   */
  private extractVariant(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  /**
   * Clears story cache
   */
  clearCache(): void {
    this.storiesCache = null;
  }
}

/**
 * Singleton instance
 */
export const storybookAPI = new StorybookAPI();
