/**
 * TypeScript type definitions for the ParkHub API integration.
 * This file serves as the central type definition repository for all API-related
 * structures used throughout the application.
 * 
 * @version 1.0.0
 */

import { ApiResponse, ApiError } from './common.types';
import { LANDMARK_ID } from '../constants/apiEndpoints';

/**
 * Interface representing an event from the ParkHub API.
 */
export interface ParkHubEvent {
  /** Unique identifier for the event */
  id: string;
  /** Name of the event */
  name: string;
  /** Date and time of the event (ISO string format) */
  date: string;
  /** Venue where the event is taking place */
  venue: string;
  /** Current status of the event (e.g., "active", "cancelled") */
  status: string;
  /** Optional additional details as key-value pairs */
  additionalDetails?: Record<string, any>;
}

/**
 * Interface representing a parking pass from the ParkHub API.
 */
export interface ParkHubPass {
  /** Unique identifier for the pass */
  id: string;
  /** Event ID associated with this pass */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for the pass */
  barcode: string;
  /** Name of the customer associated with this pass */
  customerName: string;
  /** Type of parking spot (Regular, VIP, Premium) */
  spotType: string;
  /** Identifier for the parking lot */
  lotId: string;
  /** Timestamp when the pass was created (ISO string format) */
  createdAt: string;
  /** Current status of the pass (e.g., "active", "used") */
  status: string;
  /** Optional additional details as key-value pairs */
  additionalDetails?: Record<string, any>;
}

/**
 * Enum for valid parking spot types.
 */
export enum SpotType {
  /** Regular parking spot */
  REGULAR = 'Regular',
  /** VIP parking spot */
  VIP = 'VIP',
  /** Premium parking spot */
  PREMIUM = 'Premium'
}

/**
 * Parameters for the get events API request.
 */
export interface GetEventsParams {
  /** Landmark ID for which to retrieve events (defaults to LANDMARK_ID) */
  landMarkId: string;
  /** Date from which to retrieve events (ISO string format) */
  dateFrom: string;
}

/**
 * Parameters for the get passes API request.
 */
export interface GetPassesParams {
  /** Landmark ID for which to retrieve passes (defaults to LANDMARK_ID) */
  landMarkId: string;
  /** Event ID for which to retrieve passes */
  eventId: string;
}

/**
 * Request body for creating a new parking pass.
 */
export interface CreatePassRequest {
  /** Event ID associated with this pass */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for the pass */
  barcode: string;
  /** Name of the customer associated with this pass */
  customerName: string;
  /** Type of parking spot (Regular, VIP, Premium) */
  spotType: string;
  /** Identifier for the parking lot */
  lotId: string;
}

/**
 * Response from the create pass API endpoint.
 */
export interface CreatePassResponse {
  /** Indicates whether the pass creation was successful */
  success: boolean;
  /** ID of the created pass if successful */
  passId?: string;
  /** Error information if the creation failed */
  error?: ApiError;
}

/**
 * Result of a batch pass creation operation.
 */
export interface BatchPassCreationResult {
  /** Array of successfully created passes */
  successful: Array<{ passId: string; barcode: string; customerName: string }>;
  /** Array of failed pass creation attempts */
  failed: Array<{ barcode: string; customerName: string; error: ApiError }>;
  /** Total number of passes successfully created */
  totalSuccess: number;
  /** Total number of passes that failed to create */
  totalFailed: number;
}

/**
 * Configuration options for the API client.
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of retry attempts for failed requests */
  retryCount: number;
}

/**
 * Interface for the API client implementation.
 */
export interface ApiClientInterface {
  /**
   * Perform a GET request
   * @param url - The URL to request
   * @param config - Optional request configuration
   * @returns Promise resolving to the API response
   */
  get<T>(url: string, config?: any): Promise<ApiResponse<T>>;
  
  /**
   * Perform a POST request
   * @param url - The URL to request
   * @param data - The data to send in the request body
   * @param config - Optional request configuration
   * @returns Promise resolving to the API response
   */
  post<T>(url: string, data: any, config?: any): Promise<ApiResponse<T>>;
  
  /**
   * Set the API key for authentication
   * @param apiKey - The API key to use
   */
  setApiKey(apiKey: string): void;
  
  /**
   * Get the current API key
   * @returns The current API key or null if not set
   */
  getApiKey(): string | null;
}

/**
 * Interface for the events API service.
 */
export interface EventsApiInterface {
  /**
   * Get all events from the ParkHub API
   * @param params - Optional parameters for the request
   * @returns Promise resolving to the API response containing events
   */
  getEvents(params?: GetEventsParams): Promise<ApiResponse<ParkHubEvent[]>>;
}

/**
 * Interface for the passes API service.
 */
export interface PassesApiInterface {
  /**
   * Get all passes for a specific event
   * @param params - Parameters for the request
   * @returns Promise resolving to the API response containing passes
   */
  getPassesForEvent(params: GetPassesParams): Promise<ApiResponse<ParkHubPass[]>>;
  
  /**
   * Create a new parking pass
   * @param data - Pass data to create
   * @returns Promise resolving to the API response for the creation
   */
  createPass(data: CreatePassRequest): Promise<ApiResponse<CreatePassResponse>>;
  
  /**
   * Create multiple parking passes in a batch
   * @param data - Array of pass data to create
   * @returns Promise resolving to the batch creation result
   */
  createMultiplePasses(data: CreatePassRequest[]): Promise<BatchPassCreationResult>;
}

/**
 * Type for request interceptor functions.
 */
export type ApiRequestInterceptor = (config: any) => any | Promise<any>;

/**
 * Type for response interceptor functions.
 */
export type ApiResponseInterceptor = (response: any) => any | Promise<any>;

/**
 * Type for error interceptor functions.
 */
export type ApiErrorInterceptor = (error: any) => any;