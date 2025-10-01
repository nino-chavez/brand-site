import type { Meta, StoryObj } from '@storybook/react';
import FloatingNav from './FloatingNav';

const meta = {
  title: 'UI/FloatingNav',
  component: FloatingNav,
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
    onNavigate: {
    },
    activeSection: {
    },
  },
} satisfies Meta<typeof FloatingNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onNavigate: () => console.log('onNavigate'),
    activeSection: undefined,
  },
};

