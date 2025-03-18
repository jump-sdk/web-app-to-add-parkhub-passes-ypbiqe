import { useCallback, useState } from 'react'; // v18.2.0
import { AppError, ErrorType, ErrorHandlerOptions } from '../types/error.types';
import { mapErrorToAppError, handleError } from '../utils/error-handling';
import { getErrorMessage } from '../constants/errorMessages';
import { isRetryableError, retry } from '../utils/retry-logic';
import { useNotificationContext } from '../context/NotificationContext';

/**
 * Custom hook that provides standardized error handling functionality for API operations
 * throughout the application. Integrates with the notification system to display user-friendly
 * error messages and implements retry logic for transient failures.
 * 
 * @param options - Optional configuration for error handling behavior
 * @returns Object containing error handling functions and state
 */
export const useErrorHandler = (options?: ErrorHandlerOptions) => {
  // Get notification functions from context
  const { showError, showWarning, showInfo } = useNotificationContext();
  
  // State to track the current error
  const [error, setError] = useState<AppError | null>(null);
  
  /**
   * Handles API errors with standardized processing, notifications, and retry logic
   * @param error - The error to handle
   */
  const handleError = useCallback((error: any) => {
    // Map any error to our standardized AppError type
    const appError = mapErrorToAppError(error);
    
    // Display appropriate notification based on error type
    switch (appError.type) {
      case ErrorType.AUTHENTICATION:
        showWarning(
          `API Key Error: ${appError.message}. Please update your API key to continue using the application.`,
          { autoClose: false }
        );
        break;
        
      case ErrorType.NETWORK:
        showError(
          `Network Error: ${appError.message}. Please check your connection and try again.`,
          { 
            autoClose: true,
            duration: 5000
          }
        );
        break;
        
      case ErrorType.VALIDATION:
        showError(
          `Validation Error: ${appError.message}. Please review and correct your input.`,
          {
            autoClose: true,
            duration: 6000
          }
        );
        break;
        
      case ErrorType.SERVER:
        showError(
          `Server Error: ${appError.message}. The ParkHub service may be experiencing issues.`,
          {
            autoClose: false
          }
        );
        break;
        
      default:
        showError(
          `Error: ${appError.message}`,
          {
            autoClose: false
          }
        );
    }
    
    // Update error state
    setError(appError);
    
    // Process the error with the handleError utility, which includes retry logic
    return handleError(appError, {
      retry: options?.retry !== false,
      maxRetries: options?.maxRetries || 3,
      onRetry: (error, retryCount) => {
        showInfo(`Retrying... Attempt ${retryCount} of ${options?.maxRetries || 3}`);
        
        if (options?.onRetry) {
          options.onRetry(error, retryCount);
        }
      },
      onError: (finalError) => {
        if (options?.onError) {
          options.onError(finalError);
        }
      }
    });
  }, [options, showError, showWarning, showInfo]);
  
  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    handleError,
    error,
    clearError
  };
};

export default useErrorHandler;