import type { Meta, StoryObj } from '@storybook/react';
import AthleticScoreboard from './AthleticScoreboard';

const meta = {
  title: 'Sports/AthleticScoreboard',
  component: AthleticScoreboard,
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
    showIcons: {
      control: 'boolean',
    },
    variant: {
      control: 'select',
      options: ['header', 'floating', 'mobile'],
    },
  },
} satisfies Meta<typeof AthleticScoreboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeSection: undefined,
    onNavigate: () => console.log('onNavigate'),
  },
};


export const Icons: Story = {
  args: {
    showIcons: true,
  },
};

export const Header: Story = {
  args: {
    variant: 'header',
  },
};

export const Floating: Story = {
  args: {
    variant: 'floating',
  },
};

export const Mobile: Story = {
  args: {
    variant: 'mobile',
  },
};