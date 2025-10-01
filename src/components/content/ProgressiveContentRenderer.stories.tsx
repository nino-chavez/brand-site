import type { Meta, StoryObj } from '@storybook/react';
import ProgressiveContentRenderer from './ProgressiveContentRenderer';

const meta = {
  title: 'Content/ProgressiveContentRenderer',
  component: ProgressiveContentRenderer,
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
    contentLevel: {
    },
    isActive: {
      control: 'boolean',
    },
    hasLoadedContent: {
      control: 'boolean',
    },
    children: {
    },
    metadata: {
    },
    onContentLoad: {
    },
    debugMode: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ProgressiveContentRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    contentLevel: undefined,
    isActive: true,
    hasLoadedContent: true,
    children: undefined,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const LoadedContent: Story = {
  args: {
    hasLoadedContent: true,
  },
};

export const DebugMode: Story = {
  args: {
    debugMode: true,
  },
};