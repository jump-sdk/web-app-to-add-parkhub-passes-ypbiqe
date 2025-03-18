import React, { ReactElement } from 'react'; // v18.2.0
import { render, screen, waitFor, within, waitForElementToBeRemoved as tlWaitForElementToBeRemoved } from '@testing-library/react'; // v14.0.0
import userEvent from '@testing-library/user-event'; // v14.4.3
import { renderHook } from '@testing-library/react-hooks'; // v8.0.1

import { ApiKeyProvider } from '../context/ApiKeyContext';
import { NotificationProvider } from '../context/NotificationContext';
import { apiKeyStorage } from '../services/storage/apiKeyStorage';
import { apiServices } from '../services/api';

/**
 * Renders a React component with all necessary context providers for testing
 * 
 * This function wraps the provided UI component with all required context providers
 * to enable proper testing of components that depend on these contexts.
 * 
 * @param ui - The React component to render
 * @param options - Optional render options
 * @returns Object containing render result, user event instance, and helper functions
 */
export const renderWithProviders = (
  ui: ReactElement,
  options = {}
) => {
  // Create wrapper with all required providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ApiKeyProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ApiKeyProvider>
    );
  };

  // Set up options with the wrapper
  const customOptions = {
    wrapper: AllTheProviders,
    ...options,
  };

  // Render the component with the wrapper
  const renderResult = render(ui, customOptions);
  
  // Create user event instance for simulating user interactions
  const user = userEvent.setup();

  // Return render result, user event instance, and helper functions
  return {
    ...renderResult,
    user,
    // Helper function to find elements within a specific container
    findByRoleWithin: (container: HTMLElement, role: string, options?: any) => 
      within(container).findByRole(role, options),
    // Helper function to wait for loading state to disappear
    waitForLoadingToFinish: () => 
      waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument())
  };
};

/**
 * Renders a React hook with all necessary context providers for testing
 * 
 * This function wraps the provided hook with all required context providers
 * to enable proper testing of hooks that depend on these contexts.
 * 
 * @param hook - The hook function to render
 * @param options - Optional render options
 * @returns Result of renderHook with the hook wrapped in necessary providers
 */
export const renderHookWithProviders = (
  hook: any,
  options = {}
) => {
  // Create wrapper with all required providers
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ApiKeyProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ApiKeyProvider>
    );
  };

  // Set up options with the wrapper
  const customOptions = {
    wrapper: AllTheProviders,
    ...options,
  };

  // Render the hook with the wrapper
  return renderHook(hook, customOptions);
};

/**
 * Mocks the API key storage service for testing
 * 
 * This function mocks the getApiKey and setApiKey functions of the apiKeyStorage
 * service to facilitate testing of components that interact with API keys.
 * 
 * @param apiKey - The API key to return when getApiKey is called
 */
export const mockApiKey = (apiKey: string): void => {
  // Mock getApiKey to return the provided API key
  jest.spyOn(apiKeyStorage, 'getApiKey').mockImplementation(() => apiKey);
  
  // Mock setApiKey to return true (successful)
  jest.spyOn(apiKeyStorage, 'setApiKey').mockImplementation(() => true);
};

/**
 * Mocks the API services for testing
 * 
 * This function mocks specific API services with custom implementations
 * to facilitate testing of components that interact with these services.
 * 
 * @param mockImplementations - Object mapping service names to mock implementations
 */
export const mockApiServices = (mockImplementations: Record<string, any>): void => {
  // For each service in mockImplementations, mock the corresponding service in apiServices
  Object.entries(mockImplementations).forEach(([serviceName, mockImpl]) => {
    if (serviceName in apiServices) {
      const originalService = apiServices[serviceName as keyof typeof apiServices];
      
      // Save original methods
      const originalMethods = { ...originalService };
      
      // Mock methods provided in mockImpl
      Object.entries(mockImpl).forEach(([methodName, mockFn]) => {
        if (methodName in originalService) {
          jest.spyOn(originalService, methodName as keyof typeof originalService)
            .mockImplementation(mockFn);
        }
      });
      
      // Return to original implementation when test completes
      afterEach(() => {
        Object.entries(originalMethods).forEach(([methodName, originalFn]) => {
          if (jest.isMockFunction(originalService[methodName as keyof typeof originalService])) {
            jest.spyOn(originalService, methodName as keyof typeof originalService)
              .mockImplementation(originalFn);
          }
        });
      });
    }
  });
};

/**
 * Waits for an element to be removed from the DOM
 * 
 * This is a re-export of Testing Library's waitForElementToBeRemoved function
 * 
 * @param callback - Function that returns the element to wait for
 * @param options - Optional configuration options
 * @returns Promise that resolves when the element is removed
 */
export const waitForElementToBeRemoved = tlWaitForElementToBeRemoved;

/**
 * Creates a mock implementation of localStorage for testing
 * 
 * This function creates a mock localStorage object that can be used
 * in tests where localStorage is needed but not available in the test environment.
 * 
 * @returns Mock localStorage object with get, set, and remove methods
 */
export const createMockLocalStorage = (): Storage => {
  // Create a new Map to store key-value pairs
  const store = new Map<string, string>();
  
  // Return a mock localStorage object
  return {
    getItem: (key: string): string | null => {
      return store.get(key) || null;
    },
    setItem: (key: string, value: string): void => {
      store.set(key, value);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
    clear: (): void => {
      store.clear();
    },
    key: (index: number): string | null => {
      return Array.from(store.keys())[index] || null;
    },
    length: 0, // This will be a getter in a real implementation
    get length() {
      return store.size;
    }
  };
};