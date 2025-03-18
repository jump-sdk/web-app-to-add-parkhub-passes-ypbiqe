/**
 * Provides utility functions for creating standardized mock API responses for testing purposes.
 * This file contains factory functions that generate mock API responses with consistent
 * structure matching the application's ApiResponse interface, allowing tests to simulate
 * successful responses, error responses, and various edge cases when testing components
 * and services that interact with the ParkHub API.
 */

import { ApiResponse, ApiError, ApiStatus } from '../../src/types/common.types';

/**
 * Creates a mock successful API response with the provided data
 * @param data - The data to include in the success response
 * @returns A standardized successful API response containing the provided data
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null
  };
}

/**
 * Creates a mock error API response with the provided error details
 * @param error - The API error details to include in the response
 * @returns A standardized error API response containing the provided error
 */
export function createErrorResponse<T>(error: ApiError): ApiResponse<T> {
  return {
    success: false,
    data: null,
    error
  };
}

/**
 * Creates a mock API error object with the specified properties
 * @param code - The error code string
 * @param message - The error message
 * @param field - Optional field name associated with the error (for validation errors)
 * @returns A standardized API error object
 */
export function createApiError(code: string, message: string, field?: string): ApiError {
  return {
    code,
    message,
    ...(field && { field })
  };
}

/**
 * Creates a mock authentication error response
 * @returns A standardized API response for authentication errors
 */
export function createAuthenticationError<T>(): ApiResponse<T> {
  const error = createApiError('AUTH_ERROR', 'Invalid or missing API key');
  return createErrorResponse<T>(error);
}

/**
 * Creates a mock validation error response for form field validation failures
 * @param field - The field name that failed validation
 * @param message - The validation error message
 * @returns A standardized API response for validation errors
 */
export function createValidationError<T>(field: string, message: string): ApiResponse<T> {
  const error = createApiError('VALIDATION_ERROR', message, field);
  return createErrorResponse<T>(error);
}

/**
 * Creates a mock server error response
 * @returns A standardized API response for server errors
 */
export function createServerError<T>(): ApiResponse<T> {
  const error = createApiError('SERVER_ERROR', 'Internal server error');
  return createErrorResponse<T>(error);
}

/**
 * Creates a mock network error response
 * @returns A standardized API response for network errors
 */
export function createNetworkError<T>(): ApiResponse<T> {
  const error = createApiError('NETWORK_ERROR', 'Network error occurred');
  return createErrorResponse<T>(error);
}

/**
 * Creates a mock successful API response with empty data (null)
 * @returns A standardized successful API response with null data
 */
export function createEmptyResponse<T>(): ApiResponse<T> {
  return createSuccessResponse<T>(null as unknown as T);
}

/**
 * Collection of common API error objects for testing
 */
export const mockApiErrors = {
  authentication: createApiError('AUTH_ERROR', 'Invalid or missing API key'),
  validation: createApiError('VALIDATION_ERROR', 'Invalid input data'),
  server: createApiError('SERVER_ERROR', 'Internal server error'),
  network: createApiError('NETWORK_ERROR', 'Network error occurred'),
  notFound: createApiError('NOT_FOUND', 'Resource not found')
};