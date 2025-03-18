import axios, { AxiosError } from 'axios'; // v1.3.4
import {
  ErrorType,
  ErrorCode,
  AppError,
  NetworkError,
  AuthenticationError,
  ValidationError,
  ServerError,
  ClientError,
  UnknownError,
  ErrorHandlerOptions,
  ApiErrorResponse
} from '../types/error.types';
import { getErrorMessage } from '../constants/errorMessages';
import { isRetryableError, retry, incrementRetryCount } from './retry-logic';

/**
 * Maps any error to a typed AppError based on its properties and structure
 * @param error - Any error object to be mapped
 * @returns A properly typed application error
 */
export const mapErrorToAppError = (error: any): AppError => {
  // If it's already an AppError, return it
  if (
    error &&
    typeof error === 'object' &&
    'type' in error &&
    Object.values(ErrorType).includes(error.type as ErrorType)
  ) {
    return error as AppError;
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data as any;
    const message = responseData?.error?.message || axiosError.message;
    
    // Network errors (no response)
    if (!axiosError.response) {
      return createNetworkError(
        axiosError,
        axiosError.code === 'ECONNABORTED' ? ErrorCode.TIMEOUT : ErrorCode.CONNECTION_ERROR,
        message
      );
    }

    // Authentication errors (401, 403)
    if (status === 401 || status === 403) {
      return createAuthenticationError(
        status,
        status === 401 ? ErrorCode.INVALID_API_KEY : ErrorCode.MISSING_API_KEY,
        message
      );
    }

    // Validation errors (400, 422)
    if (status === 400 || status === 422) {
      return createValidationError(
        responseData?.error || {},
        message
      );
    }

    // Rate limiting (429)
    if (status === 429) {
      return createServerError(
        status,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        message
      );
    }

    // Server errors (500+)
    if (status && status >= 500) {
      return createServerError(
        status,
        ErrorCode.SERVER_ERROR,
        message
      );
    }

    // Other HTTP errors
    return createClientError(
      status || 400,
      ErrorCode.UNKNOWN_ERROR,
      message
    );
  }

  // Handle non-Axios errors
  return createUnknownError(
    error instanceof Error ? error : new Error(String(error)),
    error instanceof Error ? error.message : String(error)
  );
};

/**
 * Creates a NetworkError object with appropriate properties
 * @param originalError - Original error that caused the network error
 * @param code - Specific error code (CONNECTION_ERROR or TIMEOUT)
 * @param message - Error message
 * @returns A properly formatted network error
 */
export const createNetworkError = (
  originalError: Error,
  code: ErrorCode,
  message: string
): NetworkError => {
  return {
    type: ErrorType.NETWORK,
    code,
    message: message || getErrorMessage(ErrorType.NETWORK, code),
    timestamp: Date.now(),
    retryable: true,
    retryCount: 0,
    originalError: originalError || null
  };
};

/**
 * Creates an AuthenticationError object with appropriate properties
 * @param statusCode - HTTP status code
 * @param code - Specific error code (INVALID_API_KEY or MISSING_API_KEY)
 * @param message - Error message
 * @returns A properly formatted authentication error
 */
export const createAuthenticationError = (
  statusCode: number,
  code: ErrorCode,
  message: string
): AuthenticationError => {
  return {
    type: ErrorType.AUTHENTICATION,
    code,
    message: message || getErrorMessage(ErrorType.AUTHENTICATION, code),
    timestamp: Date.now(),
    statusCode
  };
};

/**
 * Creates a ValidationError object with appropriate properties
 * @param apiError - Error object from API response
 * @param message - Error message
 * @returns A properly formatted validation error
 */
export const createValidationError = (
  apiError: any,
  message: string
): ValidationError => {
  const fieldErrors: Record<string, string> = {};
  const field = apiError.field;
  
  // If there's a field specified, add it to fieldErrors
  if (field) {
    fieldErrors[field] = message || getErrorMessage(ErrorType.VALIDATION, ErrorCode.INVALID_INPUT, field);
  }

  return {
    type: ErrorType.VALIDATION,
    code: ErrorCode.INVALID_INPUT,
    message: message || getErrorMessage(ErrorType.VALIDATION, ErrorCode.INVALID_INPUT),
    timestamp: Date.now(),
    field,
    fieldErrors
  };
};

/**
 * Creates a ServerError object with appropriate properties
 * @param statusCode - HTTP status code
 * @param code - Specific error code (SERVER_ERROR or RATE_LIMIT_EXCEEDED)
 * @param message - Error message
 * @returns A properly formatted server error
 */
export const createServerError = (
  statusCode: number,
  code: ErrorCode,
  message: string
): ServerError => {
  return {
    type: ErrorType.SERVER,
    code,
    message: message || getErrorMessage(ErrorType.SERVER, code),
    timestamp: Date.now(),
    statusCode,
    // Rate limit errors are always retryable, server errors are generally retryable
    retryable: code === ErrorCode.RATE_LIMIT_EXCEEDED || statusCode >= 500
  };
};

/**
 * Creates a ClientError object with appropriate properties
 * @param statusCode - HTTP status code
 * @param code - Specific error code
 * @param message - Error message
 * @returns A properly formatted client error
 */
export const createClientError = (
  statusCode: number,
  code: ErrorCode,
  message: string
): ClientError => {
  return {
    type: ErrorType.CLIENT,
    code,
    message: message || getErrorMessage(ErrorType.CLIENT, code),
    timestamp: Date.now(),
    statusCode
  };
};

/**
 * Creates an UnknownError object for unclassified errors
 * @param originalError - Original error object
 * @param message - Error message
 * @returns A properly formatted unknown error
 */
export const createUnknownError = (
  originalError: Error,
  message: string
): UnknownError => {
  return {
    type: ErrorType.UNKNOWN,
    code: ErrorCode.UNKNOWN_ERROR,
    message: message || originalError.message || getErrorMessage(ErrorType.UNKNOWN, ErrorCode.UNKNOWN_ERROR),
    timestamp: Date.now(),
    originalError
  };
};

/**
 * Processes an error with optional retry logic and callbacks
 * @param error - The error to process
 * @param options - Options for error handling and retry behavior
 * @returns A rejected promise with the processed error
 */
export const handleError = async (
  error: any,
  options: ErrorHandlerOptions = {
    retry: true,
    maxRetries: 3,
    onRetry: () => {},
    onError: () => {}
  }
): Promise<never> => {
  // Map error to AppError type
  const appError = mapErrorToAppError(error);
  
  // Call onError callback if provided
  if (options.onError) {
    options.onError(appError);
  }
  
  // If retry is enabled and the error is retryable
  if (options.retry && isRetryableError(appError)) {
    // For network errors, check retry count
    if (appError.type === ErrorType.NETWORK) {
      const networkError = appError as NetworkError;
      
      // Only retry if we haven't exceeded maximum retries
      if (networkError.retryCount < options.maxRetries) {
        // Increment retry count
        incrementRetryCount(appError);
        
        // Call onRetry callback if provided
        if (options.onRetry) {
          options.onRetry(networkError, networkError.retryCount);
        }
      }
    }
    
    // For server errors that are retryable
    if (appError.type === ErrorType.SERVER && (appError as ServerError).retryable) {
      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(appError, 0); // No built-in retry count for server errors
      }
    }
  }
  
  // Return a rejected promise with the processed error
  return Promise.reject(appError);
};

/**
 * Extracts error information from an API error response
 * @param response - API response object
 * @returns Object containing extracted error details
 */
export const extractErrorFromResponse = (response: any): { code: string; message: string; field?: string } => {
  const defaultError = {
    code: ErrorCode.UNKNOWN_ERROR,
    message: getErrorMessage(ErrorType.UNKNOWN, ErrorCode.UNKNOWN_ERROR)
  };
  
  if (!response || !response.data || !response.data.error) {
    return defaultError;
  }
  
  const { code, message, field } = response.data.error;
  
  return {
    code: code || defaultError.code,
    message: message || defaultError.message,
    field
  };
};