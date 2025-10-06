/**
 * Vite SSR Build Configuration
 *
 * Separate config for building server-side rendering bundles.
 * Run with: vite build --config vite.config.ssr.ts --ssr src/entry-server.tsx
 */

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createTokenPlugin } from './tokens/vite-plugin-tokens';

export default defineConfig({
  plugins: [react(), createTokenPlugin()],
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: './src/entry-server.tsx',
      output: {
        format: 'es',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@analytics': path.resolve(__dirname, './src/analytics'),
      '@monitoring': path.resolve(__dirname, './src/monitoring'),
      '@tokens': path.resolve(__dirname, './tokens'),
    },
  },
});
