import type { Meta, StoryObj } from '@storybook/react';
import ExifMetadata from './ExifMetadata';

const meta = {
  title: 'UI/ExifMetadata',
  component: ExifMetadata,
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
    isVisible: {
      control: 'boolean',
    },
    data: {
    },
    displayMode: {
      control: 'select',
      options: ['camera', 'technical', 'capture', 'all'],
    },
    theme: {
      control: 'select',
      options: ['dark', 'light', 'camera'],
    },
    fadeInDelay: {
      control: { type: 'number' },
    },
    positioning: {
      control: 'select',
      options: ['relative', 'smart', 'fixed'],
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof ExifMetadata>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    position: undefined,
    isVisible: true,
  },
};


export const Visible: Story = {
  args: {
    isVisible: true,
  },
};

export const Camera: Story = {
  args: {
    displayMode: 'camera',
  },
};

export const Technical: Story = {
  args: {
    displayMode: 'technical',
  },
};

export const Capture: Story = {
  args: {
    displayMode: 'capture',
  },
};

export const All: Story = {
  args: {
    displayMode: 'all',
  },
};

export const Dark: Story = {
  args: {
    theme: 'dark',
  },
};

export const Light: Story = {
  args: {
    theme: 'light',
  },
};

export const Camera: Story = {
  args: {
    theme: 'camera',
  },
};

export const Relative: Story = {
  args: {
    positioning: 'relative',
  },
};

export const Smart: Story = {
  args: {
    positioning: 'smart',
  },
};

export const Fixed: Story = {
  args: {
    positioning: 'fixed',
  },
};