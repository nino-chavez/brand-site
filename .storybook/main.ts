import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@components': path.resolve(__dirname, '../src/components'),
          '@hooks': path.resolve(__dirname, '../src/hooks'),
          '@types': path.resolve(__dirname, '../src/types'),
          '@utils': path.resolve(__dirname, '../src/utils'),
          '@contexts': path.resolve(__dirname, '../src/contexts'),
          '@services': path.resolve(__dirname, '../src/services'),
          '@constants': path.resolve(__dirname, '../src/constants'),
          '@analytics': path.resolve(__dirname, '../src/analytics'),
          '@monitoring': path.resolve(__dirname, '../src/monitoring'),
          '@tokens': path.resolve(__dirname, '../tokens'),
        },
      },
      define: {
        'process.env.TEST_MODE': JSON.stringify('true'),
        '__TEST_MODE__': JSON.stringify('true'),
      },
    });
  },
};

export default config;