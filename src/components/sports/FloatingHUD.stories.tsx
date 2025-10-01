import type { Meta, StoryObj } from '@storybook/react';
import FloatingHUD from './FloatingHUD';

const meta = {
  title: 'Sports/FloatingHUD',
  component: FloatingHUD,
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
    activeSection: {
    },
    onNavigate: {
    },
    className: {
      control: 'text',
    },
  },
} satisfies Meta<typeof FloatingHUD>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeSection: undefined,
    onNavigate: () => console.log('onNavigate'),
  },
};

