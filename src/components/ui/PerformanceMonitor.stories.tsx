import type { Meta, StoryObj } from '@storybook/react';
import PerformanceMonitor from './PerformanceMonitor';

const meta = {
  title: 'UI/PerformanceMonitor',
  component: PerformanceMonitor,
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
    frameRate: {
      control: { type: 'number' },
    },
    onPerformanceDegradation: {
    },
    onBatteryOptimization: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PerformanceMonitor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isActive: true,
    currentPhase: undefined,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};