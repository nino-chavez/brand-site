import type { Meta, StoryObj } from '@storybook/react';
import SimplifiedGameFlowContainer from './SimplifiedGameFlowContainer';

const meta = {
  title: 'Sports/SimplifiedGameFlowContainer',
  component: SimplifiedGameFlowContainer,
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
    performanceMode: {
      control: 'select',
      options: ['high', 'balanced', 'low', 'accessible'],
    },
    debugMode: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof SimplifiedGameFlowContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const DebugMode: Story = {
  args: {
    debugMode: true,
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

export const Accessible: Story = {
  args: {
    performanceMode: 'accessible',
  },
};