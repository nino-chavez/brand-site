import type { Meta, StoryObj } from '@storybook/react';
import InteractivePauseSystem from './InteractivePauseSystem';

const meta = {
  title: 'Sports/InteractivePauseSystem',
  component: InteractivePauseSystem,
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
    isActive: {
      control: 'boolean',
    },
    currentPhase: {
    },
    onPauseToggle: {
    },
    onGlobalPause: {
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof InteractivePauseSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isActive: true,
    currentPhase: undefined,
    onPauseToggle: () => console.log('onPauseToggle'),
    onGlobalPause: () => console.log('onGlobalPause'),
    children: undefined,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};