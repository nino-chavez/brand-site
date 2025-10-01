import type { Meta, StoryObj } from '@storybook/react';
import ViewfinderOverlay from './ViewfinderOverlay';

const meta = {
  title: 'Layout/ViewfinderOverlay',
  component: ViewfinderOverlay,
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
    className: {
      control: 'text',
    },
    onCapture: {
    },
    mode: {
      control: 'select',
      options: ['standard', 'hero'],
    },
    showMetadataHUD: {
      control: 'boolean',
    },
    isMinimized: {
      control: 'boolean',
    },
    onToggleMinimized: {
    },
    profileVisible: {
      control: 'boolean',
    },
    onHideProfile: {
    },
  },
} satisfies Meta<typeof ViewfinderOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};


export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const MetadataHUD: Story = {
  args: {
    showMetadataHUD: true,
  },
};

export const Minimized: Story = {
  args: {
    isMinimized: true,
  },
};

export const ProfileVisible: Story = {
  args: {
    profileVisible: true,
  },
};

export const Standard: Story = {
  args: {
    mode: 'standard',
  },
};

export const Hero: Story = {
  args: {
    mode: 'hero',
  },
};