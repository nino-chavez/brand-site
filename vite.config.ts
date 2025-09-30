import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createTokenPlugin } from './tokens/vite-plugin-tokens';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), createTokenPlugin()],
      build: {
        // Optimize bundle splitting
        rollupOptions: {
          output: {
            // Dynamic chunking based on patterns - more maintainable than hardcoded paths
            manualChunks(id: string) {
              // Split vendor dependencies more granularly for better caching
              if (id.includes('node_modules')) {
                // React core (largest dependency)
                if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                  return 'react-vendor';
                }
                // Other smaller vendor dependencies
                return 'vendor';
              }

              // Hero viewfinder components (largest feature) - now in src/components/layout/
              if (id.includes('src/components/layout/') &&
                  (id.includes('Viewfinder') || id.includes('ViewfinderOverlay') ||
                   id.includes('HeroSection') || id.includes('CleanHeroSection'))) {
                return 'hero-viewfinder';
              }

              // Legacy viewfinder sub-components
              if (id.includes('components/viewfinder/')) {
                return 'hero-viewfinder';
              }

              // Sports components - now in src/components/sports/
              if (id.includes('src/components/sports/') ||
                  (id.includes('components/') &&
                   (id.includes('Volleyball') || id.includes('Sports') ||
                    id.includes('Timing') || id.includes('Court') ||
                    id.includes('Interactive') || id.includes('Sequence')))) {
                return 'sports';
              }

              // Canvas system components - now in src/components/canvas/
              if (id.includes('src/components/canvas/') ||
                  (id.includes('src/') &&
                   (id.includes('LightboxCanvas') || id.includes('CameraController') ||
                    id.includes('SpatialSection') || id.includes('CursorLens')))) {
                return 'canvas-system';
              }

              // Canvas utilities and coordinate systems - now in src/utils/
              if (id.includes('src/utils/') &&
                  (id.includes('canvas') || id.includes('spatial') ||
                   id.includes('camera') || id.includes('coordinate'))) {
                return 'canvas-utils';
              }

              // UI framework components - now in src/components/ui/
              if (id.includes('src/components/ui/') ||
                  (id.includes('components/sections/') ||
                   id.includes('Navigation') || id.includes('Controls') || id.includes('HUD'))) {
                return 'ui';
              }

              // Return undefined for default chunk
              return undefined;
            }
          }
        },
        // Enable minification and compression
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production',
            pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
            passes: 3,
          },
          mangle: {
            safari10: true,
          },
        },
        // Chunk size warnings
        chunkSizeWarningLimit: 600,
        // Asset optimization
        assetsInlineLimit: 4096
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.TEST_MODE': JSON.stringify(env.TEST_MODE || mode === 'test' ? 'true' : 'false'),
        '__TEST_MODE__': JSON.stringify(env.TEST_MODE === 'true' || mode === 'test')
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
        }
      },
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./test/setup.ts'],
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist', '.git'],
        testTimeout: 30000, // 30 seconds for complex UI tests
        hookTimeout: 10000, // 10 seconds for setup/teardown
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          include: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/utils/**/*.{ts,tsx}'],
          exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'node_modules/**'],
        }
      }
    };
});