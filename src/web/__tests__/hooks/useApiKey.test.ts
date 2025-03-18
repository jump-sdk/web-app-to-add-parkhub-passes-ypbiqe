import { renderHook, act, waitFor } from '@testing-library/react-hooks'; // ^8.0.1
import { useApiKey } from '../../src/hooks/useApiKey';
import { apiKeyStorage } from '../../src/services/storage/apiKeyStorage';
import { ErrorType, ErrorCode } from '../../src/types/error.types';
import { renderHookWithProviders } from '../../src/utils/testing';
import { mockLocalStorage, resetMockStorage } from '../__mocks__/mockStorage';
import { API_KEY } from '../../src/constants/storageKeys';

// Mock the apiKeyStorage methods
jest.mock('../../src/services/storage/apiKeyStorage', () => ({
  getApiKey: jest.fn(),
  setApiKey: jest.fn(),
  removeApiKey: jest.fn(),
  validateApiKey: jest.fn(),
  hasApiKey: jest.fn()
}));

describe('useApiKey', () => {
  beforeEach(() => {
    // Reset mock storage before each test
    resetMockStorage();
    
    // Mock window.localStorage with our mockLocalStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Mock apiKeyStorage methods
    jest.spyOn(apiKeyStorage, 'getApiKey');
    jest.spyOn(apiKeyStorage, 'setApiKey');
    jest.spyOn(apiKeyStorage, 'removeApiKey');
    jest.spyOn(apiKeyStorage, 'validateApiKey');
    jest.spyOn(apiKeyStorage, 'hasApiKey');
    
    // Clear all previous mock implementations
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocked functions
    jest.restoreAllMocks();
    resetMockStorage();
  });

  it('should initialize with loading state and null API key', () => {
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Check initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.apiKey).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should load API key from storage on mount', async () => {
    // Setup mock to return an API key
    const testApiKey = 'test-api-key-123456789abcdef';
    (apiKeyStorage.getApiKey as jest.Mock).mockReturnValue(testApiKey);
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Check the loaded API key
    expect(result.current.apiKey).toBe(testApiKey);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(apiKeyStorage.getApiKey).toHaveBeenCalled();
  });

  it('should handle error when loading API key fails', async () => {
    // Setup mock to throw an error
    (apiKeyStorage.getApiKey as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load API key');
    });
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Check the error state
    expect(result.current.apiKey).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.current.error?.code).toBe(ErrorCode.MISSING_API_KEY);
  });

  it('should set API key in storage', async () => {
    // Setup mock to return success
    const testApiKey = 'test-api-key-123456789abcdef';
    (apiKeyStorage.validateApiKey as jest.Mock).mockReturnValue(true);
    (apiKeyStorage.setApiKey as jest.Mock).mockReturnValue(true);
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Call setApiKey
    act(() => {
      result.current.setApiKey(testApiKey);
    });
    
    // Check that the API key was set
    expect(apiKeyStorage.setApiKey).toHaveBeenCalledWith(testApiKey);
    expect(result.current.apiKey).toBe(testApiKey);
  });

  it('should handle error when setting API key fails', async () => {
    // Setup mocks
    const testApiKey = 'test-api-key-123456789abcdef';
    (apiKeyStorage.validateApiKey as jest.Mock).mockReturnValue(true);
    (apiKeyStorage.setApiKey as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to store API key');
    });
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Call setApiKey
    act(() => {
      result.current.setApiKey(testApiKey);
    });
    
    // Check the error state
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.current.error?.code).toBe(ErrorCode.INVALID_API_KEY);
  });

  it('should remove API key from storage', async () => {
    // Setup mocks
    const testApiKey = 'test-api-key-123456789abcdef';
    (apiKeyStorage.getApiKey as jest.Mock).mockReturnValue(testApiKey);
    (apiKeyStorage.removeApiKey as jest.Mock).mockReturnValue(true);
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Call removeApiKey
    act(() => {
      result.current.removeApiKey();
    });
    
    // Check that the API key was removed
    expect(apiKeyStorage.removeApiKey).toHaveBeenCalled();
    expect(result.current.apiKey).toBeNull();
  });

  it('should handle error when removing API key fails', async () => {
    // Setup mocks
    const testApiKey = 'test-api-key-123456789abcdef';
    (apiKeyStorage.getApiKey as jest.Mock).mockReturnValue(testApiKey);
    (apiKeyStorage.removeApiKey as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to remove API key');
    });
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Call removeApiKey
    act(() => {
      result.current.removeApiKey();
    });
    
    // Check the error state
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.current.error?.code).toBe(ErrorCode.MISSING_API_KEY);
    expect(result.current.apiKey).toBe(testApiKey); // API key should remain unchanged
  });

  it('should validate API key format', async () => {
    // Setup mocks for valid and invalid keys
    (apiKeyStorage.validateApiKey as jest.Mock).mockImplementation((apiKey) => {
      return apiKey === 'valid-api-key';
    });
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Call validateApiKey with valid and invalid keys
    const validResult = result.current.validateApiKey('valid-api-key');
    const invalidResult = result.current.validateApiKey('invalid-key');
    
    // Check validation results
    expect(validResult).toBe(true);
    expect(invalidResult).toBe(false);
    expect(apiKeyStorage.validateApiKey).toHaveBeenCalledTimes(2);
    expect(apiKeyStorage.validateApiKey).toHaveBeenCalledWith('valid-api-key');
    expect(apiKeyStorage.validateApiKey).toHaveBeenCalledWith('invalid-key');
  });

  it('should check if API key exists in storage', async () => {
    // Setup mocks
    (apiKeyStorage.hasApiKey as jest.Mock).mockReturnValue(true);
    
    // Render the hook
    const { result } = renderHookWithProviders(() => useApiKey());
    
    // Wait for loading to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Check hasApiKey returns true
    expect(result.current.hasApiKey()).toBe(true);
    expect(apiKeyStorage.hasApiKey).toHaveBeenCalled();
    
    // Change the mock to return false and check again
    (apiKeyStorage.hasApiKey as jest.Mock).mockReturnValue(false);
    expect(result.current.hasApiKey()).toBe(false);
  });
});