import type { Meta, StoryObj } from '@storybook/react';
import GalleryModal from './GalleryModal';

const meta = {
  title: 'Gallery/GalleryModal',
  component: GalleryModal,
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
    images: {
    },
    initialImageId: {
      control: 'text',
    },
    isOpen: {
      control: 'boolean',
    },
    onClose: {
    },
  },
} satisfies Meta<typeof GalleryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [],
    initialImageId: 'initialImageId',
    isOpen: true,
    onClose: () => console.log('onClose'),
  },
};


export const Open: Story = {
  args: {
    isOpen: true,
  },
};