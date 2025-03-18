import { useState, useCallback } from 'react'; // v18.2.0
import { ApiResponse, ApiStatus, ApiError } from '../types/common.types';
import { useErrorHandler } from './useErrorHandler';
import { useNotificationContext } from '../context/NotificationContext';
import { AppError } from '../types/error.types';

/**
 * Options for configuring the mutation behavior
 */
interface MutationOptions<TData, TResult> {
  /** Whether to show a success notification on successful mutation */
  showSuccessNotification?: boolean;
  /** Custom success message for notification */
  successMessage?: string;
  /** Whether to reset the mutation state after successful mutation */
  resetOnSuccess?: boolean;
  /** Callback function to run on successful mutation */
  onSuccess?: (data: TResult) => void;
  /** Callback function to run on error */
  onError?: (error: AppError) => void;
}

/**
 * Result object returned by the useMutation hook
 */
interface MutationResult<TData, TResult> {
  /** Function to execute the mutation with data */
  mutate: (data: TData) => Promise<ApiResponse<TResult>>;
  /** Current status of the mutation */
  status: ApiStatus;
  /** Data returned by successful mutation */
  data: TResult | null;
  /** Error from failed mutation */
  error: AppError | null;
  /** Function to reset mutation state */
  reset: () => void;
  /** Whether the mutation is currently loading */
  isLoading: boolean;
  /** Whether the mutation completed successfully */
  isSuccess: boolean;
  /** Whether the mutation encountered an error */
  isError: boolean;
}

/**
 * A custom hook for performing data mutations with the ParkHub API with loading states and error handling
 * 
 * @param mutationFn - Function that performs the actual API mutation
 * @param options - Optional configuration options for the mutation
 * @returns Object containing mutation state, data, and execution function
 */
export const useMutation = <TData = unknown, TResult = unknown>(
  mutationFn: (data: TData) => Promise<ApiResponse<TResult>>,
  options?: MutationOptions<TData, TResult>
): MutationResult<TData, TResult> => {
  // Initialize state
  const [data, setData] = useState<TResult | null>(null);
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  
  // Get error handling functions
  const { handleError, error, clearError } = useErrorHandler();
  
  // Get notification functions
  const { showSuccess } = useNotificationContext();
  
  /**
   * Resets the mutation state back to its initial values
   */
  const reset = useCallback(() => {
    setData(null);
    setStatus(ApiStatus.IDLE);
    clearError();
  }, [clearError]);
  
  /**
   * Executes the mutation function with the provided data
   * @param mutationData - The data to pass to the mutation function
   * @returns Promise with the mutation result
   */
  const mutate = useCallback(async (mutationData: TData): Promise<ApiResponse<TResult>> => {
    // Set loading state
    setStatus(ApiStatus.LOADING);
    clearError();
    
    try {
      // Execute the mutation
      const response = await mutationFn(mutationData);
      
      // Handle successful response
      if (response.success && response.data) {
        setData(response.data);
        setStatus(ApiStatus.SUCCESS);
        
        // Show success notification if configured
        if (options?.showSuccessNotification) {
          showSuccess(options.successMessage || 'Operation completed successfully');
        }
        
        // Call onSuccess callback if provided
        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }
        
        // Reset state if configured
        if (options?.resetOnSuccess) {
          // Schedule reset to happen after the current execution
          setTimeout(reset, 0);
        }
        
        return response;
      } 
      
      // Handle API error response
      setStatus(ApiStatus.ERROR);
      handleError(response.error || { message: 'Unknown error occurred' });
      
      // Call onError callback if provided
      if (options?.onError && error) {
        options.onError(error);
      }
      
      return response;
    } catch (err) {
      // Handle unexpected errors
      setStatus(ApiStatus.ERROR);
      handleError(err);
      
      // Call onError callback if provided
      if (options?.onError && error) {
        options.onError(error);
      }
      
      // Return a generic error response
      return {
        success: false,
        data: null,
        error: {
          code: 'unknown_error',
          message: err instanceof Error ? err.message : 'An unknown error occurred'
        }
      };
    }
  }, [mutationFn, options, showSuccess, handleError, error, clearError, reset]);
  
  // Return mutation result
  return {
    mutate,
    status,
    data,
    error,
    reset,
    isLoading: status === ApiStatus.LOADING,
    isSuccess: status === ApiStatus.SUCCESS,
    isError: status === ApiStatus.ERROR
  };
};

export default useMutation;