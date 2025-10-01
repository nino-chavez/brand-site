import type { Meta, StoryObj } from '@storybook/react';
import TimingController from './TimingController';

const meta = {
  title: 'Sports/TimingController',
  component: TimingController,
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
    phaseProgress: {
      control: { type: 'number' },
    },
    onFrameUpdate: {
    },
    onPerformanceDegradation: {
    },
    children: {
    },
  },
} satisfies Meta<typeof TimingController>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isActive: true,
    currentPhase: undefined,
    phaseProgress: 0,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};