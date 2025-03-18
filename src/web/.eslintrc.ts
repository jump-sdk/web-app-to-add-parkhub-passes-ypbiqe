import type { Linter } from 'eslint'; // eslint: ^8.38.0

import '@typescript-eslint/eslint-plugin'; // @typescript-eslint/eslint-plugin: ^5.59.0
import '@typescript-eslint/parser'; // @typescript-eslint/parser: ^5.59.0
import 'eslint-config-prettier'; // eslint-config-prettier: ^8.8.0
import 'eslint-plugin-import'; // eslint-plugin-import: ^2.27.5
import 'eslint-plugin-jsx-a11y'; // eslint-plugin-jsx-a11y: ^6.7.1
import 'eslint-plugin-react'; // eslint-plugin-react: ^7.32.2
import 'eslint-plugin-react-hooks'; // eslint-plugin-react-hooks: ^4.6.0
import 'eslint-plugin-security'; // eslint-plugin-security: ^1.7.1

/**
 * ESLint configuration for the ParkHub Passes Creation Web Application
 * 
 * This configuration enforces code quality standards, consistent coding style,
 * and security best practices for the React frontend codebase.
 */
export const eslintConfig: Linter.Config = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'security',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // General code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-unused-vars': 'off', // Disabled in favor of TypeScript version
    
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'error', 
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // React specific rules
    'react/prop-types': 'off', // Not needed with TypeScript
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Accessibility rules
    'jsx-a11y/anchor-is-valid': [
      'error',
      { components: ['Link'], specialLink: ['to'] }
    ],
    
    // Import ordering
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ],
    
    // Security rule exceptions
    'security/detect-object-injection': 'off', // Too many false positives
    'security/detect-non-literal-fs-filename': 'off', // Not applicable to frontend
  },
  overrides: [
    {
      // Special rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'security/detect-object-injection': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules',
    'build',
    'dist',
    'coverage',
    'vite.config.ts',
    'setupTests.ts',
  ],
};