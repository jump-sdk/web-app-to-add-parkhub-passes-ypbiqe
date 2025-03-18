/**
 * Error handling types for the ParkHub Passes Creation Web Application.
 * This file defines TypeScript types and interfaces for categorizing, creating,
 * and processing different types of errors throughout the application.
 */

import { ApiError } from './common.types';

/**
 * Enum defining the categories of errors that can occur in the application.
 */
export enum ErrorType {
  /** Network-related errors like connection failures */
  NETWORK = 'network',
  /** Authentication errors such as invalid API key */
  AUTHENTICATION = 'authentication',
  /** Validation errors for form inputs or API requests */
  VALIDATION = 'validation',
  /** Server-side errors from the ParkHub API */
  SERVER = 'server',
  /** Client-side errors like bad requests */
  CLIENT = 'client',
  /** Unclassified errors that don't fit other categories */
  UNKNOWN = 'unknown'
}

/**
 * Enum defining specific error codes for different error scenarios.
 */
export enum ErrorCode {
  /** Network connection failure */
  CONNECTION_ERROR = 'connection_error',
  /** Request timeout */
  TIMEOUT = 'timeout',
  /** API key is invalid */
  INVALID_API_KEY = 'invalid_api_key',
  /** API key is missing */
  MISSING_API_KEY = 'missing_api_key',
  /** Invalid input data */
  INVALID_INPUT = 'invalid_input',
  /** Barcode already exists */
  DUPLICATE_BARCODE = 'duplicate_barcode',
  /** Event not found */
  EVENT_NOT_FOUND = 'event_not_found',
  /** ParkHub server error */
  SERVER_ERROR = 'server_error',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  /** Unclassified error */
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Base interface for all application error types with common properties.
 */
export interface BaseErrorInterface {
  /** Category of the error */
  type: ErrorType;
  /** Specific error code */
  code: ErrorCode;
  /** Human-readable error message */
  message: string;
  /** Timestamp when the error occurred */
  timestamp: number;
}

/**
 * Interface for network-related errors like connection failures or timeouts.
 */
export interface NetworkError extends BaseErrorInterface {
  type: ErrorType.NETWORK;
  /** Whether this error can be automatically retried */
  retryable: boolean;
  /** Number of retry attempts made so far */
  retryCount: number;
  /** Original error object if available */
  originalError: Error | null;
}

/**
 * Interface for authentication errors like invalid or missing API keys.
 */
export interface AuthenticationError extends BaseErrorInterface {
  type: ErrorType.AUTHENTICATION;
  /** HTTP status code (typically 401) */
  statusCode: number;
}

/**
 * Interface for validation errors with field-specific error messages.
 */
export interface ValidationError extends BaseErrorInterface {
  type: ErrorType.VALIDATION;
  /** Name of the field with an error (if applicable) */
  field?: string;
  /** Map of field names to error messages */
  fieldErrors: Record<string, string>;
}

/**
 * Interface for server-side errors like internal server errors or rate limiting.
 */
export interface ServerError extends BaseErrorInterface {
  type: ErrorType.SERVER;
  /** HTTP status code (typically 5xx) */
  statusCode: number;
  /** Whether this error can be automatically retried */
  retryable: boolean;
}

/**
 * Interface for client-side errors like resource not found or bad requests.
 */
export interface ClientError extends BaseErrorInterface {
  type: ErrorType.CLIENT;
  /** HTTP status code (typically 4xx) */
  statusCode: number;
}

/**
 * Interface for unclassified errors that don't fit other categories.
 */
export interface UnknownError extends BaseErrorInterface {
  type: ErrorType.UNKNOWN;
  /** Original error object if available */
  originalError: Error | null;
}

/**
 * Union type of all possible application error types for comprehensive error handling.
 */
export type AppError = 
  | NetworkError 
  | AuthenticationError 
  | ValidationError 
  | ServerError 
  | ClientError 
  | UnknownError;

/**
 * Interface for standardized API error responses from the ParkHub API.
 */
export interface ApiErrorResponse {
  /** Indicates the request was unsuccessful */
  success: boolean;
  /** Error details */
  error: ApiError;
}

/**
 * Interface for configuring error handling behavior including retry options.
 */
export interface ErrorHandlerOptions {
  /** Whether to retry failed requests */
  retry: boolean;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Callback function called before a retry attempt */
  onRetry: (error: AppError, retryCount: number) => void;
  /** Callback function called when an error occurs and won't be retried */
  onError: (error: AppError) => void;
}