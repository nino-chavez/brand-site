/**
 * Production Build Optimization Configuration for LightboxCanvas System
 *
 * This configuration optimizes the build process for the spatial navigation
 * canvas system, focusing on 60fps performance and efficient asset delivery.
 */

const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',

  // Performance-optimized entry points
  entry: {
    // Core canvas system
    'lightbox-canvas': './src/core/LightboxCanvas.ts',

    // Spatial navigation utilities
    'spatial-navigation': './src/navigation/SpatialNavigator.ts',

    // Camera movement controllers
    'camera-controls': './src/camera/CameraControllers.ts',

    // Visual effects system
    'visual-effects': './src/effects/VisualEffectsController.ts',

    // Accessibility layer
    'accessibility': './src/accessibility/AccessibilityManager.ts',

    // Polyfills (separate bundle for conditional loading)
    'polyfills': './src/polyfills/index.ts'
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]',
    clean: true,
    publicPath: '/assets/',

    // Enable module federation for potential micro-frontend architecture
    library: {
      type: 'module'
    },

    // Optimize for modern browsers while maintaining compatibility
    environment: {
      arrowFunction: true,
      bigIntLiteral: false,
      const: true,
      destructuring: true,
      dynamicImport: true,
      forOf: true,
      module: true
    }
  },

  // Advanced code splitting strategy
  optimization: {
    minimize: true,
    minimizer: [
      // JavaScript optimization
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            // Canvas-specific optimizations
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.warn'], // Remove non-error console calls
            passes: 2, // Multiple passes for better optimization

            // Performance-critical optimizations
            unsafe_arrows: true,
            unsafe_methods: true,
            unsafe_math: true,

            // Canvas-specific dead code elimination
            dead_code: true,
            unused: true
          },
          mangle: {
            // Preserve specific canvas API names
            reserved: [
              'requestAnimationFrame',
              'cancelAnimationFrame',
              'IntersectionObserver',
              'ResizeObserver'
            ]
          },
          format: {
            comments: false
          }
        }
      }),

      // CSS optimization
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              // Remove unused CSS (important for canvas system)
              discardUnused: true,

              // Optimize animations and transitions
              reduceTransforms: true,

              // Merge similar rules
              mergeLonghand: true,
              mergeRules: true
            }
          ]
        }
      }),

      // Image optimization for spatial navigation assets
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.sharpMinify,
          options: {
            encodeOptions: {
              jpeg: {
                quality: 85,
                progressive: true
              },
              webp: {
                quality: 85,
                effort: 6
              },
              png: {
                quality: 85,
                progressive: true,
                compressionLevel: 9
              }
            }
          }
        },
        generator: [
          // Generate WebP versions for modern browsers
          {
            preset: 'webp-custom-name',
            implementation: ImageMinimizerPlugin.sharpGenerate,
            options: {
              encodeOptions: {
                webp: {
                  quality: 85,
                  effort: 6
                }
              }
            }
          }
        ]
      })
    ],

    // Advanced chunk splitting for canvas system
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000, // Optimal for HTTP/2

      cacheGroups: {
        // Core canvas vendor libraries
        canvasVendor: {
          test: /[\\/]node_modules[\\/](three|konva|fabric|pixi\.js)[\\/]/,
          name: 'canvas-vendor',
          priority: 20,
          chunks: 'all'
        },

        // Animation and performance libraries
        animationVendor: {
          test: /[\\/]node_modules[\\/](gsap|lottie|framer-motion)[\\/]/,
          name: 'animation-vendor',
          priority: 19,
          chunks: 'all'
        },

        // General vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          priority: 10,
          chunks: 'all'
        },

        // Common canvas utilities
        canvasCommon: {
          name: 'canvas-common',
          minChunks: 2,
          priority: 15,
          chunks: 'all',
          test: /[\\/]src[\\/](canvas|spatial|camera)[\\/]/
        },

        // Accessibility features (can be loaded conditionally)
        accessibility: {
          name: 'accessibility',
          test: /[\\/]src[\\/]accessibility[\\/]/,
          priority: 18,
          chunks: 'all'
        },

        // Visual effects (can be loaded based on device capability)
        effects: {
          name: 'effects',
          test: /[\\/]src[\\/]effects[\\/]/,
          priority: 17,
          chunks: 'all'
        }
      }
    },

    // Runtime chunk for better caching
    runtimeChunk: {
      name: 'runtime'
    },

    // Tree shaking configuration
    usedExports: true,
    sideEffects: [
      '**/*.css',
      '**/*.scss',
      '**/polyfills/**',
      '**/src/effects/**/*.ts' // Visual effects may have side effects
    ]
  },

  // Module resolution optimizations
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      // Optimize common imports
      '@canvas': path.resolve(__dirname, '../src/canvas'),
      '@spatial': path.resolve(__dirname, '../src/spatial'),
      '@camera': path.resolve(__dirname, '../src/camera'),
      '@effects': path.resolve(__dirname, '../src/effects'),
      '@accessibility': path.resolve(__dirname, '../src/accessibility'),
      '@utils': path.resolve(__dirname, '../src/utils')
    },

    // Prefer ES modules for better tree shaking
    mainFields: ['module', 'main']
  },

  module: {
    rules: [
      // TypeScript with optimizations
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Speed up build
              compilerOptions: {
                // Production optimizations
                removeComments: true,
                declaration: false,
                declarationMap: false,
                sourceMap: false,

                // Canvas system optimizations
                target: 'ES2020',
                module: 'ESNext',
                moduleResolution: 'node'
              }
            }
          }
        ],
        exclude: /node_modules/
      },

      // CSS with extraction and optimization
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: '[hash:base64:5]' // Shorter class names in production
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer'],
                  ['cssnano', {
                    preset: ['default', {
                      // Canvas-specific CSS optimizations
                      calc: true,
                      colormin: true,
                      convertValues: true,
                      discardComments: { removeAll: true },
                      discardDuplicates: true,
                      discardEmpty: true,
                      mergeRules: true,
                      minifyFontValues: true,
                      minifySelectors: true,
                      normalizeCharset: true,
                      reduceTransforms: true
                    }]
                  }]
                ]
              }
            }
          }
        ]
      },

      // Asset optimization
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb - inline small assets
          }
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]'
        }
      },

      // Font optimization
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash:8][ext]'
        }
      }
    ]
  },

  plugins: [
    // Extract CSS to separate files
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),

    // Gzip compression
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),

    // Brotli compression for modern browsers
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11
      },
      threshold: 8192,
      minRatio: 0.8
    }),

    // Environment variables for production
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.CANVAS_PERFORMANCE_MODE': JSON.stringify('optimized'),
      'process.env.ENABLE_VISUAL_EFFECTS': JSON.stringify('adaptive'),
      'process.env.DEBUG_SPATIAL_NAVIGATION': JSON.stringify('false')
    }),

    // Bundle analysis (conditional)
    ...(process.env.ANALYZE === 'true' ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json'
      })
    ] : []),

    // Performance budget warnings
    new webpack.performance.hints = 'warning',
    new webpack.performance.maxAssetSize = 300000, // 300kb per asset
    new webpack.performance.maxEntrypointSize = 400000 // 400kb per entry point
  ],

  // Performance optimization settings
  performance: {
    hints: 'warning',
    maxAssetSize: 300000,
    maxEntrypointSize: 400000,
    assetFilter: function(assetFilename) {
      // Only check performance for JS and CSS files
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    }
  },

  // Cache configuration for faster subsequent builds
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '../.webpack-cache'),
    buildDependencies: {
      config: [__filename]
    }
  },

  // Exclude source maps in production for security and performance
  devtool: false,

  // Target modern browsers for optimal performance
  target: ['web', 'es2020']
};

// Export performance budget configuration
module.exports.performanceBudget = {
  // Total JavaScript budget
  javascript: 400, // KB

  // Total CSS budget
  css: 100, // KB

  // Individual asset budgets
  assets: {
    'lightbox-canvas': 150, // KB - Core canvas system
    'spatial-navigation': 80, // KB - Navigation utilities
    'camera-controls': 60, // KB - Camera controllers
    'visual-effects': 100, // KB - Effects system (conditional loading)
    'accessibility': 40, // KB - Accessibility features
    'vendor': 200 // KB - Third-party libraries
  },

  // Performance thresholds
  thresholds: {
    warning: 0.8, // Warn at 80% of budget
    error: 1.0    // Error at 100% of budget
  }
};

// Export build optimization metrics
module.exports.optimizationTargets = {
  // Performance targets
  performance: {
    firstContentfulPaint: 1.5, // seconds
    timeToInteractive: 3.0,     // seconds
    cumulativeLayoutShift: 0.1, // CLS score
    firstInputDelay: 100        // milliseconds
  },

  // Canvas-specific targets
  canvas: {
    initialRenderTime: 200,     // milliseconds
    frameRate: 60,              // fps
    memoryUsage: 50,            // MB maximum
    animationLatency: 16.67     // milliseconds (60fps frame time)
  },

  // Accessibility targets
  accessibility: {
    screenReaderLatency: 200,   // milliseconds
    keyboardResponseTime: 100,  // milliseconds
    focusIndicatorDelay: 50     // milliseconds
  }
};