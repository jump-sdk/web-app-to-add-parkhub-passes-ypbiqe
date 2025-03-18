/**
 * Service responsible for authentication-related API operations in the ParkHub Passes Creation Web Application.
 * Handles API key validation, verification, and management, providing a centralized interface
 * for authentication operations used throughout the application.
 * 
 * @version 1.0.0
 */

import { AxiosRequestConfig } from 'axios'; // v1.3.4
import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/common.types';
import { apiKeyStorage } from '../storage/apiKeyStorage';
import { validateApiKey } from '../../utils/api-helpers';
import { API_BASE_URL } from '../../constants/apiEndpoints';

/**
 * Verifies that an API key is valid by making a test request to the ParkHub API
 * 
 * @param apiKey - The API key to verify
 * @returns Promise resolving to an API response indicating whether the API key is valid
 */
const verifyApiKey = async (apiKey: string): Promise<ApiResponse<boolean>> => {
  // First validate the API key format
  const validation = validateApiKey(apiKey);
  if (!validation.valid) {
    return {
      success: false,
      data: null,
      error: validation.error
    };
  }

  // Store the original API key to restore it later
  const originalApiKey = apiClient.getApiKey();

  try {
    // Temporarily set the API key for the test request
    apiClient.setApiKey(apiKey);

    // Make a lightweight request to test the API key
    // We use the events endpoint with a limit=1 parameter to minimize data transfer
    const config: AxiosRequestConfig = {
      params: { limit: 1 }
    };

    // Execute the request - if it succeeds, the API key is valid
    const response = await apiClient.get<any>(`${API_BASE_URL}/healthcheck`, config);
    
    return {
      success: true,
      data: true,
      error: null
    };
  } catch (error) {
    // If the error is authentication-related, the API key is invalid
    return {
      success: false,
      data: null,
      error: {
        code: 'invalid_api_key',
        message: 'The API key provided is invalid or has expired. Please check your API key and try again.'
      }
    };
  } finally {
    // Restore the original API key
    if (originalApiKey) {
      apiClient.setApiKey(originalApiKey);
    } else {
      // If there was no original API key, clear the temporary one
      apiClient.setApiKey('');
    }
  }
};

/**
 * Validates and stores an API key securely
 * 
 * @param apiKey - The API key to store
 * @returns Promise resolving to an API response indicating whether the API key was stored successfully
 */
const storeApiKey = async (apiKey: string): Promise<ApiResponse<boolean>> => {
  // First verify the API key is valid
  const verificationResult = await verifyApiKey(apiKey);
  
  // If verification failed, return the error response
  if (!verificationResult.success) {
    return verificationResult;
  }
  
  // Store the API key securely
  const storageResult = apiKeyStorage.setApiKey(apiKey);
  
  // Set the API key in the API client for future requests
  if (storageResult) {
    apiClient.setApiKey(apiKey);
  }
  
  return {
    success: storageResult,
    data: storageResult,
    error: storageResult ? null : {
      code: 'storage_error',
      message: 'Failed to securely store the API key. Please check browser storage permissions.'
    }
  };
};

/**
 * Removes the stored API key
 * 
 * @returns True if removal was successful, false otherwise
 */
const removeApiKey = (): boolean => {
  // Remove the API key from storage
  const result = apiKeyStorage.removeApiKey();
  
  // Clear the API key in the API client
  if (result) {
    try {
      apiClient.setApiKey('');
      return true;
    } catch (error) {
      console.error('Error clearing API key from client:', error);
      return false;
    }
  }
  
  return result;
};

/**
 * Retrieves the current API key
 * 
 * @returns The current API key or null if not set
 */
const getApiKey = (): string | null => {
  return apiClient.getApiKey();
};

/**
 * Checks if a valid API key is currently available
 * 
 * @returns Promise resolving to true if a valid API key is available, false otherwise
 */
const hasValidApiKey = async (): Promise<boolean> => {
  // Get the current API key
  const apiKey = getApiKey();
  
  // If no API key is available, return false
  if (!apiKey) {
    return false;
  }
  
  // Verify the API key by making a test request
  const verificationResult = await verifyApiKey(apiKey);
  
  // Return true if verification succeeded, false otherwise
  return verificationResult.success;
};

/**
 * Service for authentication-related operations in the application
 */
export const authApi = {
  verifyApiKey,
  storeApiKey,
  removeApiKey,
  getApiKey,
  hasValidApiKey
};

export default authApi;