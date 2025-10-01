import type { Meta, StoryObj } from '@storybook/react';
import Section from './Section';

const meta = {
  title: 'Layout/Section',
  component: Section,
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
    id: {
      control: 'text',
    },
    setRef: {
    },
    className: {
      control: 'text',
    },
    children: {
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'id',
    setRef: () => console.log('setRef'),
    children: undefined,
  },
};

