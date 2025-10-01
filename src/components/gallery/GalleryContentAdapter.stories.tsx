import type { Meta, StoryObj } from '@storybook/react';
import GalleryContentAdapter from './GalleryContentAdapter';

const meta = {
  title: 'Gallery/GalleryContentAdapter',
  component: GalleryContentAdapter,
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
    className: {
      control: 'text',
    },
    onLoadError: {
    },
  },
} satisfies Meta<typeof GalleryContentAdapter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  },
};

