import type { Config } from '@jest/types'; // v29.5.0

/**
 * Jest configuration for the ParkHub Passes Creation Web Application
 * Configures test environment, patterns, transformations, and coverage settings
 */
export default (): Config.InitialOptions => {
  return {
    // Use ts-jest preset for TypeScript support
    preset: 'ts-jest',
    
    // Use jsdom environment to simulate browser for testing React components
    testEnvironment: 'jsdom',
    
    // Define where to look for test files
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    
    // Files to run before tests
    setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
    
    // Test file patterns
    testMatch: [
      '**/__tests__/**/*.test.ts?(x)',
      '**/?(*.)+(spec|test).ts?(x)'
    ],
    
    // Define transformers for different file types
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
      '^.+\\.jsx?$': 'ts-jest'
    },
    
    // Module name mappings for imports
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.ts'
    },
    
    // File extensions to consider
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    
    // Files to collect coverage from
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.tsx',
      '!src/vite-env.d.ts',
      '!src/react-app-env.d.ts'
    ],
    
    // Coverage thresholds for different parts of the application
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      './src/components/': {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85
      },
      './src/services/': {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      }
    },
    
    // Coverage report formats
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Paths to ignore during tests
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
    
    // Plugins for watch mode
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ],
    
    // Global settings for ts-jest
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json',
        isolatedModules: true
      }
    },
    
    // Reset, clear, and restore mocks for clean testing
    resetMocks: true,
    clearMocks: true,
    restoreMocks: true,
    
    // Verbose output for detailed test information
    verbose: true,
    
    // Timeout for tests (in milliseconds)
    testTimeout: 10000,
    
    // Control the number of workers for parallel testing
    maxWorkers: '50%'
  };
};