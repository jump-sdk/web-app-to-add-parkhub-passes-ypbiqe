import { AppError, NetworkError, ServerError, ErrorType, ErrorCode } from '../types/error.types';

/**
 * Utility module for implementing retry logic with exponential backoff
 * for handling transient failures in API requests.
 * 
 * This is a critical component of the application's error handling and
 * resilience strategy, particularly for handling rate limiting and
 * network issues.
 * 
 * @version 1.0.0
 */

/**
 * Determines if an error should be retried based on its type and properties
 * @param error The application error to check
 * @returns True if the error is retryable, false otherwise
 */
export const isRetryableError = (error: AppError): boolean => {
  // Network errors can be retried if explicitly marked as retryable
  if (error.type === ErrorType.NETWORK && (error as NetworkError).retryable) {
    return true;
  }
  
  // Server errors can be retried if explicitly marked as retryable
  if (error.type === ErrorType.SERVER && (error as ServerError).retryable) {
    return true;
  }
  
  // Rate limit errors should always be retried with exponential backoff
  if (error.type === ErrorType.SERVER && error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
    return true;
  }
  
  return false;
};

/**
 * Calculates the delay time for exponential backoff based on retry count
 * @param retryCount Current retry attempt number (0-based)
 * @param baseDelay Base delay in milliseconds (default: 300ms)
 * @param maxDelay Maximum delay in milliseconds (default: 3000ms)
 * @returns Calculated delay time in milliseconds
 */
export const calculateBackoffDelay = (
  retryCount: number,
  baseDelay = 300,
  maxDelay = 3000
): number => {
  // Calculate exponential delay: baseDelay * (2 ^ retryCount)
  const exponentialDelay = baseDelay * Math.pow(2, retryCount);
  
  // Add random jitter (0-20% of calculated delay) to prevent synchronized retries
  const jitter = Math.random() * 0.2 * exponentialDelay;
  
  // Apply jitter and ensure delay doesn't exceed maximum
  return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Creates a promise that resolves after the specified delay time
 * @param ms Delay time in milliseconds
 * @returns Promise that resolves after the delay
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Increments the retry count on a retryable error object
 * @param error The error to update
 * @returns The error with incremented retry count
 */
export const incrementRetryCount = (error: AppError): AppError => {
  if (error.type === ErrorType.NETWORK) {
    const networkError = error as NetworkError;
    networkError.retryCount = (networkError.retryCount || 0) + 1;
  }
  return error;
};

/**
 * Executes a function with retry logic, automatically retrying on retryable errors
 * @param fn Function to execute
 * @param options Retry configuration options
 * @returns Promise that resolves with the function's result or rejects with an error
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (error: AppError, retryCount: number, delayMs: number) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 300,
    maxDelay = 3000,
    onRetry = () => {}
  } = options;

  const execute = async (retryCount = 0): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      const appError = error as AppError;
      
      // If error is not retryable or we've reached max retries, throw
      if (!isRetryableError(appError) || retryCount >= maxRetries) {
        throw appError;
      }
      
      // Increment retry count on error
      incrementRetryCount(appError);
      
      // Calculate backoff delay
      const delayMs = calculateBackoffDelay(retryCount, baseDelay, maxDelay);
      
      // Call onRetry callback if provided
      onRetry(appError, retryCount + 1, delayMs);
      
      // Wait for backoff delay
      await delay(delayMs);
      
      // Retry the operation
      return execute(retryCount + 1);
    }
  };
  
  return execute();
};

/**
 * Higher-order function that wraps a function with retry logic
 * @param fn Function to wrap with retry logic
 * @param options Retry configuration options
 * @returns Function wrapped with retry logic that preserves the original function signature
 */
export const retryWithBackoff = <T>(
  fn: (...args: any[]) => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (error: AppError, retryCount: number, delayMs: number) => void;
  } = {}
): ((...args: any[]) => Promise<T>) => {
  return (...args: any[]): Promise<T> => {
    return retry(() => fn(...args), options);
  };
};