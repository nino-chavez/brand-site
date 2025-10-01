import type { Meta, StoryObj } from '@storybook/react';
import SectionOrchestrator from './SectionOrchestrator';

const meta = {
  title: 'Layout/SectionOrchestrator',
  component: SectionOrchestrator,
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
    strategy: {
    },
    sectionStrategies: {
    },
    enablePerformanceOptimization: {
      control: 'boolean',
    },
    debugMode: {
      control: 'boolean',
    },
    onOrchestrationUpdate: {
    },
    children: {
    },
  },
} satisfies Meta<typeof SectionOrchestrator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: undefined,
  },
};


export const EnablePerformanceOptimization: Story = {
  args: {
    enablePerformanceOptimization: true,
  },
};

export const DebugMode: Story = {
  args: {
    debugMode: true,
  },
};