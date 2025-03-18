import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'; // v1.3.4
import { ApiResponse, ApiError } from '../../types/common.types';
import { 
  ApiClientConfig, 
  ApiClientInterface, 
  ApiRequestInterceptor, 
  ApiResponseInterceptor, 
  ApiErrorInterceptor 
} from './types';
import { 
  createAuthHeader, 
  handleApiResponse, 
  handleApiError, 
  validateApiKey 
} from '../../utils/api-helpers';
import { mapErrorToAppError } from '../../utils/error-handling';
import { retry, retryWithBackoff } from '../../utils/retry-logic';
import { API_BASE_URL } from '../../constants/apiEndpoints';
import { apiKeyStorage } from '../storage/apiKeyStorage';

/**
 * Default configuration for the API client.
 */
const DEFAULT_CONFIG: Partial<ApiClientConfig> = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
  retryCount: 3
};

/**
 * Implementation of the API client interface that handles communication with the ParkHub API.
 * Provides methods for making HTTP requests, managing API keys, and handling errors with retry logic.
 */
export class ApiClient implements ApiClientInterface {
  private axiosInstance: AxiosInstance;
  private config: ApiClientConfig;
  private apiKey: string | null;

  /**
   * Initializes the API client with configuration and sets up interceptors.
   * @param config - Configuration options for the API client
   */
  constructor(config: Partial<ApiClientConfig> = {}) {
    // Merge provided config with default config
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    } as ApiClientConfig;

    // Initialize API key from storage or config
    this.apiKey = apiKeyStorage.getApiKey() || this.config.apiKey || null;

    // Create axios instance with baseUrl and timeout
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout
    });

    // Set up interceptors
    this.setupAuthInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Performs a GET request to the specified URL with retry logic.
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to a standardized API response
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.validateApiKeyAvailability();

    // Wrap the axios get request with retry logic
    return retryWithBackoff(
      async () => {
        const response = await this.axiosInstance.get<T>(url, config);
        return handleApiResponse<T>(response);
      },
      {
        maxRetries: this.config.retryCount,
        onRetry: (error, retryCount, delayMs) => {
          console.warn(`Retrying GET request to ${url} (${retryCount}/${this.config.retryCount}) after ${delayMs}ms due to error:`, error);
        }
      }
    )();
  }

  /**
   * Performs a POST request to the specified URL with retry logic.
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to a standardized API response
   */
  public async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.validateApiKeyAvailability();

    // Wrap the axios post request with retry logic
    return retryWithBackoff(
      async () => {
        const response = await this.axiosInstance.post<T>(url, data, config);
        return handleApiResponse<T>(response);
      },
      {
        maxRetries: this.config.retryCount,
        onRetry: (error, retryCount, delayMs) => {
          console.warn(`Retrying POST request to ${url} (${retryCount}/${this.config.retryCount}) after ${delayMs}ms due to error:`, error);
        }
      }
    )();
  }

  /**
   * Performs a PUT request to the specified URL with retry logic.
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to a standardized API response
   */
  public async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.validateApiKeyAvailability();

    // Wrap the axios put request with retry logic
    return retryWithBackoff(
      async () => {
        const response = await this.axiosInstance.put<T>(url, data, config);
        return handleApiResponse<T>(response);
      },
      {
        maxRetries: this.config.retryCount,
        onRetry: (error, retryCount, delayMs) => {
          console.warn(`Retrying PUT request to ${url} (${retryCount}/${this.config.retryCount}) after ${delayMs}ms due to error:`, error);
        }
      }
    )();
  }

  /**
   * Performs a DELETE request to the specified URL with retry logic.
   * @param url - The URL to request
   * @param config - Optional Axios request configuration
   * @returns Promise resolving to a standardized API response
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    this.validateApiKeyAvailability();

    // Wrap the axios delete request with retry logic
    return retryWithBackoff(
      async () => {
        const response = await this.axiosInstance.delete<T>(url, config);
        return handleApiResponse<T>(response);
      },
      {
        maxRetries: this.config.retryCount,
        onRetry: (error, retryCount, delayMs) => {
          console.warn(`Retrying DELETE request to ${url} (${retryCount}/${this.config.retryCount}) after ${delayMs}ms due to error:`, error);
        }
      }
    )();
  }

  /**
   * Sets the API key for authentication and stores it securely.
   * @param apiKey - The API key to set
   */
  public setApiKey(apiKey: string): void {
    // Validate the API key format
    const validation = validateApiKey(apiKey);
    if (!validation.valid) {
      throw new Error(validation.error?.message || 'Invalid API key format');
    }

    // Store the API key
    apiKeyStorage.setApiKey(apiKey);
    this.apiKey = apiKey;
  }

  /**
   * Retrieves the current API key.
   * @returns The current API key or null if not set
   */
  public getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Adds a request interceptor to the axios instance.
   * @param interceptor - The request interceptor function
   * @returns Interceptor ID that can be used to remove the interceptor
   */
  public addRequestInterceptor(interceptor: ApiRequestInterceptor): number {
    return this.axiosInstance.interceptors.request.use(interceptor);
  }

  /**
   * Adds a response interceptor to the axios instance.
   * @param interceptor - The response interceptor function
   * @param errorInterceptor - The error interceptor function
   * @returns Interceptor ID that can be used to remove the interceptor
   */
  public addResponseInterceptor(
    interceptor: ApiResponseInterceptor,
    errorInterceptor: ApiErrorInterceptor
  ): number {
    return this.axiosInstance.interceptors.response.use(interceptor, errorInterceptor);
  }

  /**
   * Removes an interceptor by its ID.
   * @param type - The type of interceptor to remove ('request' or 'response')
   * @param id - The ID of the interceptor to remove
   */
  public removeInterceptor(type: string, id: number): void {
    if (type === 'request') {
      this.axiosInstance.interceptors.request.eject(id);
    } else if (type === 'response') {
      this.axiosInstance.interceptors.response.eject(id);
    }
  }

  /**
   * Sets up the authentication interceptor for adding API key to requests.
   * @private
   */
  private setupAuthInterceptor(): void {
    this.addRequestInterceptor(config => {
      if (this.apiKey) {
        // Add Authorization header with API key
        const authHeader = createAuthHeader(this.apiKey);
        config.headers = {
          ...config.headers,
          ...authHeader
        };
      }
      return config;
    });
  }

  /**
   * Sets up the response interceptor for standardizing API responses.
   * @private
   */
  private setupResponseInterceptor(): void {
    this.addResponseInterceptor(
      // Success handler
      (response: AxiosResponse) => {
        return response;
      },
      // Error handler
      (error: any) => {
        // Transform the error using the error handling utility
        const apiError = handleApiError(error);
        
        // If it's an authentication error, clear the API key
        if (
          apiError.error &&
          (apiError.error.code === 'invalid_api_key' || apiError.error.code === 'missing_api_key')
        ) {
          this.apiKey = null;
        }
        
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Validates that an API key is available for requests.
   * @private
   * @returns True if API key is available, throws error otherwise
   */
  private validateApiKeyAvailability(): boolean {
    if (!this.apiKey) {
      const error = mapErrorToAppError({
        response: {
          status: 401,
          data: {
            error: {
              code: 'missing_api_key',
              message: 'No API key found. Please enter your ParkHub API key to continue.'
            }
          }
        }
      });
      throw error;
    }
    return true;
  }
}

/**
 * Singleton instance of the ApiClient for application-wide use.
 */
export const apiClient = new ApiClient();

export default apiClient;