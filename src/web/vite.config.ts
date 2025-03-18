import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [
      // Enable React support with Fast Refresh
      react(),
      // Resolve TypeScript path aliases
      tsconfigPaths(),
      // Make environment variables available in the app
      EnvironmentPlugin('all'),
    ],
    
    // Development server configuration
    server: {
      port: 3000,
      https: false,
      open: true,
      // Optional API proxy configuration for local development if needed
      // proxy: {
      //   '/api': {
      //     target: 'https://api.parkhub.com',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, '')
      //   }
      // }
    },
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: true,
      chunkSizeWarningLimit: 1600,
      // Optimize chunks for better loading performance
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code from application code
            vendor: ['react', 'react-dom', 'react-router-dom'],
            // Material UI in a separate chunk
            mui: ['@mui/material', '@mui/icons-material'],
            // Form libraries in a separate chunk
            forms: ['react-hook-form'],
          }
        }
      },
      // Apply different optimizations based on environment
      ...(isProd && {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    },
    
    // Resolve aliases for cleaner imports
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    
    // Define environment-specific variables (will be replaced at build time)
    define: {
      // Add any global constants here
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __IS_PROD__: isProd,
    },
    
    // Optimize dependencies for faster startup
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@mui/material'],
    },
  };
});