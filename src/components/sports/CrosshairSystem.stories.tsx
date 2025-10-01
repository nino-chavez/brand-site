import type { Meta, StoryObj } from '@storybook/react';
import CrosshairSystem from './CrosshairSystem';

const meta = {
  title: 'Sports/CrosshairSystem',
  component: CrosshairSystem,
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
    position: {
    },
    isActive: {
      control: 'boolean',
    },
    focusRadius: {
      control: { type: 'number' },
    },
    crosshairStyle: {
    },
    focusRingStyle: {
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'contrast', 'neon'],
    },
    showGrid: {
      control: 'boolean',
    },
    showRuleOfThirds: {
      control: 'boolean',
    },
    centerAlignment: {
      control: 'boolean',
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof CrosshairSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    position: undefined,
  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Grid: Story = {
  args: {
    showGrid: true,
  },
};

export const RuleOfThirds: Story = {
  args: {
    showRuleOfThirds: true,
  },
};

export const CenterAlignment: Story = {
  args: {
    centerAlignment: true,
  },
};

export const Light: Story = {
  args: {
    theme: 'light',
  },
};

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
};

export const Contrast: Story = {
  args: {
    theme: 'contrast',
  },
};

export const Neon: Story = {
  args: {
    theme: 'neon',
  },
};