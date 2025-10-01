import type { Meta, StoryObj } from '@storybook/react';
import MetadataPanel from './MetadataPanel';

const meta = {
  title: 'Gallery/MetadataPanel',
  component: MetadataPanel,
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
    isOpen: {
      control: 'boolean',
    },
    onClose: {
    },
  },
} satisfies Meta<typeof MetadataPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: undefined,
    isOpen: true,
    onClose: () => console.log('onClose'),
  },
};


export const Open: Story = {
  args: {
    isOpen: true,
  },
};