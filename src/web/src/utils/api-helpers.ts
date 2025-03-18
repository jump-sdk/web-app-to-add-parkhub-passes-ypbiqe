import { AxiosResponse } from 'axios'; // v1.3.4
import { ApiResponse, ApiError } from '../types/common.types';
import { ErrorType, ErrorCode } from '../types/error.types';
import { mapErrorToAppError } from './error-handling';

/**
 * Utility functions for API operations that standardize API request/response handling,
 * authentication, error processing, and response transformation.
 * 
 * These functions are used by the API client and service layers to ensure consistent
 * API interaction patterns throughout the application.
 */

/**
 * Creates an Authorization header with the provided API key
 * @param apiKey - API key for ParkHub authentication
 * @returns Object containing the Authorization header
 */
export const createAuthHeader = (apiKey: string): Record<string, string> => {
  // Ensure the API key is valid
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return {};
  }
  
  // Return the Authorization header in Bearer token format
  return {
    Authorization: `Bearer ${apiKey.trim()}`
  };
};

/**
 * Transforms an Axios response into a standardized ApiResponse format
 * @param response - Axios response object
 * @returns A standardized API response object
 */
export const handleApiResponse = <T = any>(response: AxiosResponse<any>): ApiResponse<T> => {
  const data = response.data;
  
  // If the response already has a success property, assume it's already in ApiResponse format
  if (data && typeof data.success === 'boolean') {
    return data as ApiResponse<T>;
  }
  
  // Otherwise, transform it into ApiResponse format
  return {
    success: true,
    data: data as T,
    error: null
  };
};

/**
 * Transforms an API error into a standardized ApiResponse format
 * @param error - Error from API request
 * @returns A standardized API error response object
 */
export const handleApiError = (error: any): ApiResponse<never> => {
  // Map the raw error to our application error type
  const appError = mapErrorToAppError(error);
  
  // Extract relevant information for the API error
  const apiError: ApiError = {
    code: appError.code,
    message: appError.message,
    // Include field information for validation errors
    field: appError.type === ErrorType.VALIDATION ? (appError as any).field : undefined
  };
  
  // Return a standardized error response
  return {
    success: false,
    data: null,
    error: apiError
  };
};

/**
 * Builds a query string from an object of parameters
 * @param params - Object containing query parameters
 * @returns A URL query string starting with '?' if not empty
 */
export const buildQueryParams = (
  params: Record<string, string | number | boolean | undefined>
): string => {
  // Filter out undefined values
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
  // Create URLSearchParams object
  const searchParams = new URLSearchParams();
  
  // Add each parameter to the URLSearchParams object
  Object.entries(filteredParams).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  
  const queryString = searchParams.toString();
  
  // Return with leading '?' if not empty
  return queryString ? `?${queryString}` : '';
};

/**
 * Validates that an API key is present and properly formatted
 * @param apiKey - API key to validate
 * @returns Validation result with optional error
 */
export const validateApiKey = (
  apiKey: string | null | undefined
): { valid: boolean; error?: ApiError } => {
  // Check if API key is missing or empty
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return {
      valid: false,
      error: {
        code: ErrorCode.MISSING_API_KEY,
        message: 'No API key found. Please enter your ParkHub API key to continue.'
      }
    };
  }
  
  // If API key is present but invalid format (could implement specific checks here)
  // This is a placeholder for potential future validation rules
  // if (!apiKey.match(/expected-pattern/)) {
  //   return {
  //     valid: false,
  //     error: {
  //       code: ErrorCode.INVALID_API_KEY,
  //       message: 'The API key provided is invalid. Please check your API key and try again.'
  //     }
  //   };
  // }
  
  return { valid: true };
};

/**
 * Formats a date object into the string format expected by the ParkHub API
 * @param date - Date to format
 * @returns Formatted date string in ISO format
 */
export const formatDateForApi = (date: Date): string => {
  // Return the date in ISO format for consistent API communication
  return date.toISOString();
};

/**
 * Parses a date string from the API into a Date object
 * @param dateString - Date string from API
 * @returns Parsed Date object
 */
export const parseApiDate = (dateString: string): Date => {
  // Create a new Date object from the string
  return new Date(dateString);
};