import type { Meta, StoryObj } from '@storybook/react';
import ViewfinderErrorBoundary from './ViewfinderErrorBoundary';

const meta = {
  title: 'Layout/ViewfinderErrorBoundary',
  component: ViewfinderErrorBoundary,
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
    children: {
    },
    fallback: {
    },
    onError: {
    },
    resetOnPropsChange: {
      control: 'boolean',
    },
    resetKeys: {
    },
  },
} satisfies Meta<typeof ViewfinderErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: undefined,
  },
};


export const ResetOnPropsChange: Story = {
  args: {
    resetOnPropsChange: true,
  },
};