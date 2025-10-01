import type { Meta, StoryObj } from '@storybook/react';
import ExperienceContentAdapter from './ExperienceContentAdapter';

const meta = {
  title: 'Content/ExperienceContentAdapter',
  component: ExperienceContentAdapter,
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
    canvasPosition: {
    },
    forcedLevel: {
    },
    viewerContext: {
    },
    abTestVariant: {
      control: 'text',
    },
    onExperienceInteraction: {
    },
    className: {
      control: 'text',
    },
    performanceMode: {
      control: 'select',
      options: ['high', 'balanced', 'low'],
    },
  },
} satisfies Meta<typeof ExperienceContentAdapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const High: Story = {
  args: {
    performanceMode: 'high',
  },
};

export const Balanced: Story = {
  args: {
    performanceMode: 'balanced',
  },
};

export const Low: Story = {
  args: {
    performanceMode: 'low',
  },
};