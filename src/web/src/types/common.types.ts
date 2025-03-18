/**
 * Common TypeScript type definitions for the ParkHub Passes Creation Web Application.
 * This file contains shared interfaces and enums used throughout the application
 * for consistent API integration and error handling.
 */

/**
 * Generic interface for standardized API responses.
 * @template T The type of data returned by the API
 */
export interface ApiResponse<T = any> {
  /** Indicates whether the API request was successful */
  success: boolean;
  /** The data returned by the API, null if unsuccessful */
  data: T | null;
  /** Error information if the request failed, null if successful */
  error: ApiError | null;
}

/**
 * Standard error structure for API errors.
 */
export interface ApiError {
  /** Error code string for error identification */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional field name associated with the error (for validation errors) */
  field?: string;
}

/**
 * Enum representing possible states of an API request.
 */
export enum ApiStatus {
  /** Initial state, no request has been made yet */
  IDLE = 'idle',
  /** Request is in progress */
  LOADING = 'loading',
  /** Request completed successfully */
  SUCCESS = 'success',
  /** Request failed */
  ERROR = 'error'
}

/**
 * Configuration options for data fetching operations.
 */
export interface QueryOptions {
  /** Whether the query should be enabled (auto-fetched) */
  enabled: boolean;
  /** Whether to retry failed requests */
  retry: boolean;
  /** Maximum number of retry attempts */
  retryCount: number;
  /** Time (in milliseconds) that data should remain in cache */
  cacheTime: number;
}

/**
 * Result object returned by data fetching hooks.
 * @template T The type of data returned by the query
 */
export interface QueryResult<T = any> {
  /** The data returned by the query, null if unavailable */
  data: T | null;
  /** Current status of the query */
  status: ApiStatus;
  /** Error information if the query failed, null otherwise */
  error: ApiError | null;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  /** Convenience flag indicating if the query is loading */
  isLoading: boolean;
  /** Convenience flag indicating if the query was successful */
  isSuccess: boolean;
  /** Convenience flag indicating if the query failed */
  isError: boolean;
}

/**
 * Enum for sort direction in tables and lists.
 */
export enum SortDirection {
  /** Ascending order (A-Z, 0-9) */
  ASC = 'asc',
  /** Descending order (Z-A, 9-0) */
  DESC = 'desc'
}

/**
 * Interface for pagination state and options.
 */
export interface PaginationOptions {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Interface for sorting options in tables and lists.
 */
export interface SortOptions {
  /** Field/column to sort by */
  field: string;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Interface for filtering options in tables and lists.
 */
export interface FilterOptions {
  /** Field to filter on */
  field: string;
  /** Filter value */
  value: string | number | boolean;
}

/**
 * Generic key-value pair interface for various data structures.
 */
export interface KeyValuePair {
  /** Key identifier */
  key: string;
  /** Associated value */
  value: any;
}

/**
 * Interface for select/dropdown options in forms.
 */
export interface SelectOption {
  /** Option value (used internally) */
  value: string;
  /** Display label for the option */
  label: string;
}

/**
 * Interface for table column configuration.
 */
export interface TableColumn {
  /** Unique column identifier */
  id: string;
  /** Display label for the column header */
  label: string;
  /** Data field name this column displays */
  field: string;
  /** Whether this column can be sorted */
  sortable: boolean;
  /** Column width (CSS value, number for pixels, or undefined for auto) */
  width?: string | number;
}