import type { Meta, StoryObj } from '@storybook/react';
import MorphingTransition from './MorphingTransition';

const meta = {
  title: 'Effects/MorphingTransition',
  component: MorphingTransition,
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
    fromPhase: {
    },
    toPhase: {
    },
    progress: {
      control: { type: 'number' },
    },
    duration: {
      control: { type: 'number' },
    },
    easing: {
    },
    onComplete: {
    },
    children: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof MorphingTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fromPhase: undefined,
    toPhase: undefined,
    progress: 0,
    children: undefined,
  },
};

