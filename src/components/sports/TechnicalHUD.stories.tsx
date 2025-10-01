import type { Meta, StoryObj } from '@storybook/react';
import TechnicalHUD from './TechnicalHUD';

const meta = {
  title: 'Sports/TechnicalHUD',
  component: TechnicalHUD,
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
    variant: {
      control: 'select',
      options: ['header', 'floating', 'mobile'],
    },
  },
} satisfies Meta<typeof TechnicalHUD>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeSection: undefined,
    onNavigate: () => console.log('onNavigate'),
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