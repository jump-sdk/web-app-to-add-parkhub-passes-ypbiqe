import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'; // v18.2.0
import { apiKeyStorage } from '../services/storage/apiKeyStorage';
import { useNotificationContext } from './NotificationContext';
import { apiClient } from '../services/api/apiClient';
import { 
  AuthenticationError, 
  ErrorType, 
  ErrorCode,
  createAuthenticationError
} from '../types/error.types';

/**
 * Interface defining the shape of the API key context
 */
interface ApiKeyContextType {
  /** Current API key value or null if not set */
  apiKey: string | null;
  /** Loading state for API key operations */
  loading: boolean;
  /** Error state for API key operations */
  error: AuthenticationError | null;
  /** Sets a new API key and stores it securely */
  setApiKey: (apiKey: string) => boolean;
  /** Removes the API key from storage */
  removeApiKey: () => boolean;
  /** Validates the format of an API key */
  validateApiKey: (apiKey: string) => boolean;
  /** Checks if an API key exists */
  hasApiKey: () => boolean;
}

/**
 * Props for the ApiKeyProvider component
 */
interface ApiKeyProviderProps {
  /** React children */
  children: ReactNode;
}

/**
 * Create the API key context with undefined as default value
 */
export const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

/**
 * Provider component that manages API key state and provides API key functions
 * 
 * This component encapsulates all API key management logic including:
 * - Loading the API key from secure storage
 * - Storing the API key securely with encryption
 * - Validating API key format
 * - Updating the API client with the current API key
 * - Handling errors related to API key operations
 * 
 * @param props Component props including children
 * @returns A React component that provides API key context
 */
export const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  // State to track API key, loading state, and error state
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthenticationError | null>(null);

  // Access notification context for showing messages
  const { showSuccess, showError } = useNotificationContext();

  // Load API key from storage on component mount
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setLoading(true);
        const storedApiKey = apiKeyStorage.getApiKey();
        
        if (storedApiKey) {
          // Update API client with the stored API key
          apiClient.setApiKey(storedApiKey);
          setApiKeyState(storedApiKey);
        }
        
        setError(null);
      } catch (err) {
        const authError = createAuthenticationError(
          401, 
          ErrorCode.INVALID_API_KEY, 
          'Failed to load API key from storage'
        );
        setError(authError);
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, []);

  /**
   * Sets the API key in storage and updates the context state
   * @param newApiKey The API key to set
   * @returns True if the API key was successfully set, false otherwise
   */
  const setApiKeyHandler = useCallback((newApiKey: string): boolean => {
    try {
      // Validate the API key format
      if (!apiKeyStorage.validateApiKey(newApiKey)) {
        const authError = createAuthenticationError(
          401, 
          ErrorCode.INVALID_API_KEY, 
          'Invalid API key format'
        );
        setError(authError);
        showError(authError);
        return false;
      }

      // Store the API key
      const result = apiKeyStorage.setApiKey(newApiKey);
      
      if (result) {
        // Update state and clear error
        setApiKeyState(newApiKey);
        setError(null);
        
        // Update API client with the new API key
        apiClient.setApiKey(newApiKey);
        
        showSuccess('API key saved successfully');
      } else {
        const authError = createAuthenticationError(
          401, 
          ErrorCode.INVALID_API_KEY, 
          'Failed to save API key'
        );
        setError(authError);
        showError(authError);
      }
      
      return result;
    } catch (err) {
      const authError = createAuthenticationError(
        401, 
        ErrorCode.INVALID_API_KEY, 
        'Error setting API key'
      );
      setError(authError);
      showError(authError);
      return false;
    }
  }, [showSuccess, showError]);

  /**
   * Removes the API key from storage and updates the context state
   * @returns True if the API key was successfully removed, false otherwise
   */
  const removeApiKeyHandler = useCallback((): boolean => {
    try {
      const result = apiKeyStorage.removeApiKey();
      
      if (result) {
        setApiKeyState(null);
        showSuccess('API key removed successfully');
      } else {
        showError('Failed to remove API key');
      }
      
      return result;
    } catch (err) {
      showError('Error removing API key');
      return false;
    }
  }, [showSuccess, showError]);

  /**
   * Validates the format of an API key
   * @param apiKey The API key to validate
   * @returns True if the API key format is valid, false otherwise
   */
  const validateApiKeyHandler = useCallback((apiKey: string): boolean => {
    return apiKeyStorage.validateApiKey(apiKey);
  }, []);

  /**
   * Checks if an API key exists in the context
   * @returns True if an API key exists, false otherwise
   */
  const hasApiKeyHandler = useCallback((): boolean => {
    return apiKey !== null;
  }, [apiKey]);

  // Create the context value object
  const contextValue: ApiKeyContextType = {
    apiKey,
    loading,
    error,
    setApiKey: setApiKeyHandler,
    removeApiKey: removeApiKeyHandler,
    validateApiKey: validateApiKeyHandler,
    hasApiKey: hasApiKeyHandler
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>
      {children}
    </ApiKeyContext.Provider>
  );
};

/**
 * Custom hook that provides access to the API key context
 * @returns The API key context value containing API key state and management functions
 * @throws Error if used outside of an ApiKeyProvider
 */
export const useApiKeyContext = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  
  if (context === undefined) {
    throw new Error('useApiKeyContext must be used within an ApiKeyProvider');
  }
  
  return context;
};