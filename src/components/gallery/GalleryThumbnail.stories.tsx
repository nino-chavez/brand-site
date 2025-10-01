import type { Meta, StoryObj } from '@storybook/react';
import GalleryThumbnail from './GalleryThumbnail';

const meta = {
  title: 'Gallery/GalleryThumbnail',
  component: GalleryThumbnail,
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
    image: {
    },
    onClick: {
    },
    index: {
      control: { type: 'number' },
    },
    totalCount: {
      control: { type: 'number' },
    },
  },
} satisfies Meta<typeof GalleryThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: undefined,
    onClick: () => console.log('onClick'),
  },
};

