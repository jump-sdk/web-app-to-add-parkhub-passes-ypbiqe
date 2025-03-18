/**
 * API Types and Interfaces
 * 
 * This file defines the TypeScript interfaces and types for the API service layer
 * of the ParkHub Passes Creation Web Application. It serves as a central repository
 * for API-related type definitions used by the API client and service implementations,
 * ensuring type safety and consistency across API interactions.
 */

import { ApiResponse, ApiError } from '../../types/common.types';
import { LANDMARK_ID } from '../../constants/apiEndpoints';
import { AxiosRequestConfig } from 'axios'; // version ^1.3.4

/**
 * Interface representing an event from the ParkHub API
 */
export interface ParkHubEvent {
  /** Unique identifier for the event */
  id: string;
  /** Name of the event */
  name: string;
  /** Date and time of the event (ISO format) */
  date: string;
  /** Venue where the event takes place */
  venue: string;
  /** Current status of the event */
  status: string;
  /** Any additional details provided by the API */
  additionalDetails?: Record<string, any>;
}

/**
 * Interface representing a parking pass from the ParkHub API
 */
export interface ParkHubPass {
  /** Unique identifier for the pass */
  id: string;
  /** ID of the event this pass is for */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for this pass */
  barcode: string;
  /** Name of the customer this pass is for */
  customerName: string;
  /** Type of parking spot (Regular, VIP, Premium) */
  spotType: string;
  /** ID of the parking lot */
  lotId: string;
  /** Creation date and time (ISO format) */
  createdAt: string;
  /** Current status of the pass */
  status: string;
  /** Any additional details provided by the API */
  additionalDetails?: Record<string, any>;
}

/**
 * Enum for valid parking spot types
 */
export enum SpotType {
  REGULAR = 'Regular',
  VIP = 'VIP',
  PREMIUM = 'Premium'
}

/**
 * Parameters for the get events API request
 */
export interface GetEventsParams {
  /** Landmark ID to filter events by */
  landMarkId: string;
  /** Date from which to retrieve events (ISO format) */
  dateFrom: string;
}

/**
 * Parameters for the get passes API request
 */
export interface GetPassesParams {
  /** Landmark ID to filter passes by */
  landMarkId: string;
  /** Event ID to filter passes by */
  eventId: string;
}

/**
 * Request body for creating a new parking pass
 */
export interface CreatePassRequest {
  /** ID of the event this pass is for */
  eventId: string;
  /** Account ID to associate with this pass */
  accountId: string;
  /** Unique barcode for this pass */
  barcode: string;
  /** Name of the customer this pass is for */
  customerName: string;
  /** Type of parking spot */
  spotType: string;
  /** ID of the parking lot */
  lotId: string;
}

/**
 * Response from the create pass API endpoint
 */
export interface CreatePassResponse {
  /** Indicates whether the creation was successful */
  success: boolean;
  /** ID of the newly created pass if successful */
  passId?: string;
  /** Error information if creation failed */
  error?: ApiError;
}

/**
 * Result of a batch pass creation operation
 */
export interface BatchPassCreationResult {
  /** Array of successfully created passes */
  successful: Array<{ passId: string; barcode: string; customerName: string }>;
  /** Array of passes that failed to be created */
  failed: Array<{ barcode: string; customerName: string; error: ApiError }>;
  /** Total number of successfully created passes */
  totalSuccess: number;
  /** Total number of passes that failed to be created */
  totalFailed: number;
}

/**
 * Configuration options for the API client
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of times to retry failed requests */
  retryCount: number;
}

/**
 * Interface for the API client implementation
 */
export interface ApiClientInterface {
  /**
   * Perform a GET request
   * @param url The URL to request
   * @param config Optional Axios request configuration
   * @returns Promise resolving to an API response
   */
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Perform a POST request
   * @param url The URL to request
   * @param data The data to send
   * @param config Optional Axios request configuration
   * @returns Promise resolving to an API response
   */
  post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  
  /**
   * Set the API key for authentication
   * @param apiKey The API key
   */
  setApiKey(apiKey: string): void;
  
  /**
   * Get the current API key
   * @returns The current API key or null if not set
   */
  getApiKey(): string | null;
}

/**
 * Interface for the events API service
 */
export interface EventsApiInterface {
  /**
   * Get all events from the ParkHub system
   * @param params Optional parameters for filtering events
   * @returns Promise resolving to an API response containing events
   */
  getEvents(params?: GetEventsParams): Promise<ApiResponse<ParkHubEvent[]>>;
}

/**
 * Interface for the passes API service
 */
export interface PassesApiInterface {
  /**
   * Get all passes for a specific event
   * @param params Parameters including the event ID
   * @returns Promise resolving to an API response containing passes
   */
  getPassesForEvent(params: GetPassesParams): Promise<ApiResponse<ParkHubPass[]>>;
  
  /**
   * Create a new parking pass
   * @param data Pass creation request data
   * @returns Promise resolving to an API response containing the creation result
   */
  createPass(data: CreatePassRequest): Promise<ApiResponse<CreatePassResponse>>;
  
  /**
   * Create multiple parking passes
   * @param data Array of pass creation requests
   * @returns Promise resolving to a batch creation result
   */
  createMultiplePasses(data: CreatePassRequest[]): Promise<BatchPassCreationResult>;
}

/**
 * Type for request interceptor functions
 */
export type ApiRequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Type for response interceptor functions
 */
export type ApiResponseInterceptor = (
  response: any
) => any | Promise<any>;

/**
 * Type for error interceptor functions
 */
export type ApiErrorInterceptor = (
  error: any
) => any;