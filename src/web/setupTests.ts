// Import Jest DOM matchers for DOM element assertions
import '@testing-library/jest-dom';
// Import MSW server setup function for API mocking
import { setupServer } from 'msw/node';
// Import Testing Library configuration function
import { configure } from '@testing-library/react';
// Import MSW request handlers for API mocking
import { handlers } from './__tests__/__mocks__/handlers';

// Configure React Testing Library with specified settings
configure({
  // Use data-testid attribute for element queries
  testIdAttribute: 'data-testid',
  // Set timeout for async utilities (5 seconds)
  asyncUtilTimeout: 5000
});

// Mock for window.matchMedia which is not implemented in JSDOM
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock for ResizeObserver which is not implemented in JSDOM
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Create MSW server instance with the imported handlers
const server = setupServer(...handlers);

// Configure MSW server lifecycle hooks for Jest
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());