import type { Meta, StoryObj } from '@storybook/react';
import PhaseSpecificSportsContent from './PhaseSpecificSportsContent';

const meta = {
  title: 'Sports/PhaseSpecificSportsContent',
  component: PhaseSpecificSportsContent,
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
    phase: {
    },
    progress: {
      control: { type: 'number' },
    },
    intensity: {
      control: { type: 'number' },
    },
    isVisible: {
      control: 'boolean',
    },
    technicalContext: {
    },
    onContentLoad: {
    },
    onEmotionalResonance: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PhaseSpecificSportsContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    phase: undefined,
    progress: 0,
    intensity: 0,
    isVisible: true,
    technicalContext: undefined,
  },
};


export const Visible: Story = {
  args: {
    isVisible: true,
  },
};