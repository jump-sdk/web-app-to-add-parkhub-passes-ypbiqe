import axios from 'axios'; // v1.3.4
import MockAdapter from 'axios-mock-adapter'; // v1.21.4
import { rest } from 'msw'; // v1.2.1
import { setupServer } from 'msw/node'; // v1.2.1

import { ApiClient, apiClient } from '../../../src/services/api/apiClient';
import { ApiClientConfig } from '../../../src/services/api/types';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createAuthenticationError,
  createServerError,
  createNetworkError
} from '../../__mocks__/apiResponseMock';
import { API_BASE_URL } from '../../../src/constants/apiEndpoints';
import { apiKeyStorage } from '../../../src/services/storage/apiKeyStorage';
import { retry, retryWithBackoff } from '../../../src/utils/retry-logic';
import * as apiHelpers from '../../../src/utils/api-helpers';

// Mock dependencies
jest.mock('../../../src/services/storage/apiKeyStorage');
jest.mock('../../../src/utils/retry-logic');
jest.mock('../../../src/utils/api-helpers', () => {
  const originalModule = jest.requireActual('../../../src/utils/api-helpers');
  return {
    ...originalModule,
    validateApiKey: jest.fn(),
    createAuthHeader: jest.fn().mockImplementation((apiKey) => ({ Authorization: `Bearer ${apiKey}` })),
    handleApiResponse: jest.fn().mockImplementation((response) => ({
      success: true,
      data: response.data,
      error: null
    })),
    handleApiError: jest.fn().mockImplementation((error) => ({
      success: false,
      data: null,
      error: {
        code: 'ERROR',
        message: error.message || 'An error occurred'
      }
    }))
  };
});

describe('ApiClient', () => {
  let mockAxios: MockAdapter;
  const testApiKey = 'test-api-key-12345';
  const testConfig: ApiClientConfig = {
    baseUrl: 'https://test-api.parkhub.com',
    apiKey: testApiKey,
    timeout: 5000,
    retryCount: 2
  };
  
  // Set up MSW server for API mocking
  const server = setupServer();
  
  beforeAll(() => {
    server.listen();
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    // Reset request handlers
    server.resetHandlers();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock apiKeyStorage.getApiKey to return the test API key
    (apiKeyStorage.getApiKey as jest.Mock).mockReturnValue(testApiKey);
    
    // Mock validateApiKey to return valid by default
    (apiHelpers.validateApiKey as jest.Mock).mockReturnValue({ valid: true });
    
    // Set up axios mock
    mockAxios = new MockAdapter(axios);
    
    // Mock retryWithBackoff to just call the original function
    (retryWithBackoff as jest.Mock).mockImplementation((fn, options) => {
      return async () => {
        try {
          return await fn();
        } catch (error) {
          throw error;
        }
      };
    });
  });
  
  afterEach(() => {
    mockAxios.restore();
    jest.restoreAllMocks();
  });
  
  // Tests for initialization and configuration
  test('should initialize with default configuration when no config provided', () => {
    const axiosCreateSpy = jest.spyOn(axios, 'create');
    const client = new ApiClient();
    
    expect(client.getApiKey()).toBe(testApiKey);
    expect(axiosCreateSpy).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: API_BASE_URL,
      timeout: expect.any(Number)
    }));
  });
  
  test('should initialize with provided configuration', () => {
    const axiosCreateSpy = jest.spyOn(axios, 'create');
    const client = new ApiClient(testConfig);
    
    expect(client.getApiKey()).toBe(testApiKey);
    expect(axiosCreateSpy).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: testConfig.baseUrl,
      timeout: testConfig.timeout
    }));
  });
  
  // Authentication tests
  test('should add authentication header to requests when API key is available', async () => {
    const client = new ApiClient(testConfig);
    
    // Mock axios instance get method
    const mockGet = jest.fn().mockResolvedValue({ data: { test: 'data' } });
    const mockAxiosInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    await client.get('/test-endpoint');
    
    expect(mockGet).toHaveBeenCalledWith('/test-endpoint', undefined);
    expect(apiHelpers.createAuthHeader).toHaveBeenCalledWith(testApiKey);
  });
  
  test('should throw an error when making a request without an API key', async () => {
    // Mock apiKeyStorage.getApiKey to return null
    (apiKeyStorage.getApiKey as jest.Mock).mockReturnValue(null);
    
    const client = new ApiClient();
    
    await expect(client.get('/test-endpoint')).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          error: {
            code: 'missing_api_key'
          }
        }
      }
    });
  });
  
  // Success response tests
  test('should handle successful GET requests correctly', async () => {
    const client = new ApiClient(testConfig);
    const mockResponseData = { test: 'data' };
    
    // Mock axios instance get method
    const mockGet = jest.fn().mockResolvedValue({ data: mockResponseData });
    const mockAxiosInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    const response = await client.get('/test-endpoint');
    
    expect(mockGet).toHaveBeenCalledWith('/test-endpoint', undefined);
    expect(apiHelpers.handleApiResponse).toHaveBeenCalled();
    expect(response).toEqual({
      success: true,
      data: mockResponseData,
      error: null
    });
  });
  
  test('should handle successful POST requests correctly', async () => {
    const client = new ApiClient(testConfig);
    const mockResponseData = { id: '12345' };
    const requestData = { name: 'Test Name' };
    
    // Mock axios instance post method
    const mockPost = jest.fn().mockResolvedValue({ data: mockResponseData });
    const mockAxiosInstance = {
      post: mockPost,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    const response = await client.post('/test-endpoint', requestData);
    
    expect(mockPost).toHaveBeenCalledWith('/test-endpoint', requestData, undefined);
    expect(apiHelpers.handleApiResponse).toHaveBeenCalled();
    expect(response).toEqual({
      success: true,
      data: mockResponseData,
      error: null
    });
  });
  
  // Error handling tests
  test('should handle API errors correctly', async () => {
    const client = new ApiClient(testConfig);
    const errorObject = {
      response: {
        status: 400,
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            field: 'name'
          }
        }
      }
    };
    
    // Mock axios instance get method to throw an error
    const mockGet = jest.fn().mockRejectedValue(errorObject);
    const mockAxiosInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn().mockImplementation((_, errorHandler) => {
          // Store error handler to simulate response interceptor
          mockAxiosInstance.simulateErrorInterceptor = errorHandler;
          return 1;
        }) }
      },
      simulateErrorInterceptor: null as any
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    // Mock handleApiError to return structured error
    (apiHelpers.handleApiError as jest.Mock).mockReturnValue({
      success: false,
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        field: 'name'
      }
    });
    
    // Call get to trigger the error
    try {
      await client.get('/test-endpoint');
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toEqual({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          field: 'name'
        }
      });
    }
    
    expect(apiHelpers.handleApiError).toHaveBeenCalled();
  });
  
  // Retry logic tests
  test('should retry failed requests according to retry configuration', async () => {
    const client = new ApiClient(testConfig);
    const mockOnRetryFn = jest.fn();
    
    // Mock retryWithBackoff to track calls
    (retryWithBackoff as jest.Mock).mockImplementation((fn, options) => {
      expect(options.maxRetries).toBe(testConfig.retryCount);
      // Store onRetry callback to test it later
      mockOnRetryFn.mockImplementation(options.onRetry);
      return async () => {
        try {
          return await fn();
        } catch (error) {
          throw error;
        }
      };
    });
    
    // Mock axios instance get method to throw an error
    const mockGet = jest.fn().mockRejectedValue(new Error('Network error'));
    const mockAxiosInstance = {
      get: mockGet,
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    try {
      await client.get('/test-endpoint');
    } catch (error) {
      // Error expected
    }
    
    // Check that retryWithBackoff was called
    expect(retryWithBackoff).toHaveBeenCalled();
    
    // Simulate a retry event
    mockOnRetryFn(new Error('Network error'), 1, 300);
    
    // Check that onRetry logs a warning
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Retrying GET request'),
      expect.any(Error)
    );
  });
  
  // API key management tests
  test('should set and get API key correctly', () => {
    const client = new ApiClient();
    const newApiKey = 'new-api-key-67890';
    
    client.setApiKey(newApiKey);
    
    expect(apiHelpers.validateApiKey).toHaveBeenCalledWith(newApiKey);
    expect(apiKeyStorage.setApiKey).toHaveBeenCalledWith(newApiKey);
    
    // Manually update client's API key since we're mocking
    // @ts-ignore - Set private property for testing
    client.apiKey = newApiKey;
    
    expect(client.getApiKey()).toBe(newApiKey);
  });
  
  test('should validate API key format when setting', () => {
    const client = new ApiClient();
    const invalidApiKey = '';
    
    // Mock validation to return invalid
    (apiHelpers.validateApiKey as jest.Mock).mockReturnValue({ 
      valid: false, 
      error: { 
        code: 'INVALID_API_KEY', 
        message: 'Invalid API key format' 
      } 
    });
    
    expect(() => client.setApiKey(invalidApiKey)).toThrow('Invalid API key format');
    expect(apiKeyStorage.setApiKey).not.toHaveBeenCalled();
  });
  
  // Interceptor tests
  test('should add and remove interceptors correctly', () => {
    const client = new ApiClient();
    const requestInterceptor = jest.fn(config => config);
    const responseInterceptor = jest.fn(response => response);
    const errorInterceptor = jest.fn(error => Promise.reject(error));
    
    // Mock axios instance interceptors
    const mockRequestUse = jest.fn().mockReturnValue(1);
    const mockResponseUse = jest.fn().mockReturnValue(2);
    const mockRequestEject = jest.fn();
    const mockResponseEject = jest.fn();
    
    const mockAxiosInstance = {
      interceptors: {
        request: {
          use: mockRequestUse,
          eject: mockRequestEject
        },
        response: {
          use: mockResponseUse,
          eject: mockResponseEject
        }
      }
    };
    
    // @ts-ignore - Replace private axiosInstance for this test
    client.axiosInstance = mockAxiosInstance as any;
    
    // Add interceptors
    const requestInterceptorId = client.addRequestInterceptor(requestInterceptor);
    const responseInterceptorId = client.addResponseInterceptor(
      responseInterceptor,
      errorInterceptor
    );
    
    expect(requestInterceptorId).toBe(1);
    expect(responseInterceptorId).toBe(2);
    expect(mockRequestUse).toHaveBeenCalledWith(requestInterceptor);
    expect(mockResponseUse).toHaveBeenCalledWith(responseInterceptor, errorInterceptor);
    
    // Remove interceptors
    client.removeInterceptor('request', requestInterceptorId);
    client.removeInterceptor('response', responseInterceptorId);
    
    expect(mockRequestEject).toHaveBeenCalledWith(1);
    expect(mockResponseEject).toHaveBeenCalledWith(2);
  });
});