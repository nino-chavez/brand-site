import type { Meta, StoryObj } from '@storybook/react';
import ProjectsContentAdapter from './ProjectsContentAdapter';

const meta = {
  title: 'Content/ProjectsContentAdapter',
  component: ProjectsContentAdapter,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-unique', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
    forcedLevel: {
    },
    canvasPosition: {
    },
    viewerBehavior: {
    },
    onProjectInteraction: {
    },
    onEngagementTracking: {
    },
    performanceMode: {
      control: 'select',
      options: ['low', 'medium', 'high'],
    },
  },
} satisfies Meta<typeof ProjectsContentAdapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const Low: Story = {
  args: {
    performanceMode: 'low',
  },
};

export const Medium: Story = {
  args: {
    performanceMode: 'medium',
  },
};

export const High: Story = {
  args: {
    performanceMode: 'high',
  },
};