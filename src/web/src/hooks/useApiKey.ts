import { useState, useEffect, useCallback } from 'react'; // ^18.2.0
import { apiKeyStorage } from '../services/storage/apiKeyStorage';
import { ErrorType, ErrorCode, AuthenticationError } from '../types/error.types';
import { createAuthenticationError } from '../utils/error-handling';

/**
 * Interface defining the return type of the useApiKey hook
 */
interface UseApiKeyResult {
  /** The current API key or null if not set */
  apiKey: string | null;
  /** Indicates if the API key is being loaded */
  loading: boolean;
  /** Authentication error if any occurred during API key operations */
  error: AuthenticationError | null;
  /** Function to set a new API key */
  setApiKey: (apiKey: string) => boolean;
  /** Function to remove the API key */
  removeApiKey: () => boolean;
  /** Function to validate an API key format */
  validateApiKey: (apiKey: string) => boolean;
  /** Function to check if an API key exists */
  hasApiKey: () => boolean;
}

/**
 * Custom hook for managing the ParkHub API key with loading and error states.
 * Provides a secure interface for storing, retrieving, validating, and removing API keys.
 * 
 * @returns Object containing API key state and management functions
 */
export const useApiKey = (): UseApiKeyResult => {
  // State for the API key
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  // Loading state for API key operations
  const [loading, setLoading] = useState<boolean>(true);
  // Error state for API key operations
  const [error, setError] = useState<AuthenticationError | null>(null);
  
  // Load API key on mount
  useEffect(() => {
    const loadApiKey = () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get API key from storage
        const storedApiKey = apiKeyStorage.getApiKey();
        setApiKeyState(storedApiKey);
      } catch (err) {
        // Handle any errors during retrieval
        setError(createAuthenticationError(
          401,
          ErrorCode.MISSING_API_KEY,
          'Failed to load API key from storage'
        ));
      } finally {
        setLoading(false);
      }
    };
    
    loadApiKey();
  }, []);
  
  /**
   * Sets a new API key in storage and updates state
   * @param newApiKey - The API key to store
   * @returns True if successful, false otherwise
   */
  const setNewApiKey = useCallback((newApiKey: string): boolean => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate API key format
      if (!apiKeyStorage.validateApiKey(newApiKey)) {
        setError(createAuthenticationError(
          401,
          ErrorCode.INVALID_API_KEY,
          'The provided API key format is invalid'
        ));
        return false;
      }
      
      // Store API key
      const success = apiKeyStorage.setApiKey(newApiKey);
      
      if (success) {
        setApiKeyState(newApiKey);
        return true;
      } else {
        setError(createAuthenticationError(
          401,
          ErrorCode.INVALID_API_KEY,
          'Failed to store API key'
        ));
        return false;
      }
    } catch (err) {
      setError(createAuthenticationError(
        401,
        ErrorCode.INVALID_API_KEY,
        'An error occurred while setting the API key'
      ));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Removes the API key from storage and updates state
   * @returns True if successful, false otherwise
   */
  const removeCurrentApiKey = useCallback((): boolean => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove API key from storage
      const success = apiKeyStorage.removeApiKey();
      
      if (success) {
        setApiKeyState(null);
        return true;
      } else {
        setError(createAuthenticationError(
          401,
          ErrorCode.MISSING_API_KEY,
          'Failed to remove API key'
        ));
        return false;
      }
    } catch (err) {
      setError(createAuthenticationError(
        401,
        ErrorCode.MISSING_API_KEY,
        'An error occurred while removing the API key'
      ));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Return the hook result with all API key management functionality
  return {
    apiKey,
    loading,
    error,
    setApiKey: setNewApiKey,
    removeApiKey: removeCurrentApiKey,
    validateApiKey: apiKeyStorage.validateApiKey,
    hasApiKey: apiKeyStorage.hasApiKey
  };
};

export default useApiKey;