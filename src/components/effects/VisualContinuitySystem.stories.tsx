import type { Meta, StoryObj } from '@storybook/react';
import VisualContinuitySystem from './VisualContinuitySystem';

const meta = {
  title: 'Effects/VisualContinuitySystem',
  component: VisualContinuitySystem,
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
    currentPhase: {
    },
    previousPhase: {
    },
    transitionProgress: {
      control: { type: 'number' },
    },
    isTransitioning: {
      control: 'boolean',
    },
    visualIntensity: {
      control: { type: 'number' },
    },
    onTransitionComplete: {
    },
    onContinuityMetrics: {
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof VisualContinuitySystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPhase: undefined,
    transitionProgress: 0,
    isTransitioning: true,
    visualIntensity: 0,
  },
};


export const Transitioning: Story = {
  args: {
    isTransitioning: true,
  },
};