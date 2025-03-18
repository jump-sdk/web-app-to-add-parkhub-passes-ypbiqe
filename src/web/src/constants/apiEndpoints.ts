/**
 * Constants and utility functions for ParkHub API endpoints
 * @version 1.0.0
 */

/**
 * ParkHub API base URL
 */
export const API_BASE_URL = "https://api.parkhub.com";

/**
 * Default landmark ID for ParkHub API requests
 */
export const LANDMARK_ID = "7fc72127-c601-46f3-849b-0fdea9f370ae";

/**
 * ParkHub API endpoint paths
 */
export const ENDPOINTS = {
  /**
   * Events endpoint path with landMarkId placeholder
   */
  EVENTS: "/events/{landMarkId}",
  
  /**
   * Passes endpoint path with landMarkId placeholder
   */
  PASSES: "/{landMarkId}/passes",
  
  /**
   * Pass creation endpoint path with landMarkId placeholder
   */
  CREATE_PASS: "/{landMarkId}/passes"
};

/**
 * Parameters for the events endpoint URL
 */
interface EventsUrlParams {
  /**
   * Optional landmark ID (defaults to LANDMARK_ID)
   */
  landMarkId?: string;
  
  /**
   * Optional date from which to retrieve events (formatted as ISO string)
   */
  dateFrom?: string;
}

/**
 * Parameters for the passes endpoint URL
 */
interface PassesUrlParams {
  /**
   * Event ID for which to retrieve passes (required)
   */
  eventId: string;
  
  /**
   * Optional landmark ID (defaults to LANDMARK_ID)
   */
  landMarkId?: string;
}

/**
 * Builds the complete URL for the events endpoint with query parameters
 * @param params - Parameters for the events endpoint
 * @returns Complete URL for the events endpoint
 */
export const buildEventsUrl = (params: EventsUrlParams = {}): string => {
  const { landMarkId = LANDMARK_ID, dateFrom } = params;
  
  if (!landMarkId || landMarkId.trim() === '') {
    throw new Error('landMarkId is required for building events URL');
  }
  
  // Replace landMarkId placeholder in the endpoint
  let endpoint = ENDPOINTS.EVENTS.replace('{landMarkId}', landMarkId);
  
  // Add query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('landMarkId', landMarkId); // Including landMarkId in query params as per API spec
  if (dateFrom && dateFrom.trim() !== '') {
    queryParams.append('dateFrom', dateFrom);
  }
  
  return `${API_BASE_URL}${endpoint}?${queryParams.toString()}`;
};

/**
 * Builds the complete URL for retrieving passes for a specific event
 * @param params - Parameters for the passes endpoint
 * @returns Complete URL for the passes endpoint
 * @throws Error if eventId is not provided
 */
export const buildPassesUrl = (params: PassesUrlParams): string => {
  const { eventId, landMarkId = LANDMARK_ID } = params;
  
  if (!eventId || eventId.trim() === '') {
    throw new Error('eventId is required for building passes URL');
  }
  
  if (!landMarkId || landMarkId.trim() === '') {
    throw new Error('landMarkId is required for building passes URL');
  }
  
  // Replace landMarkId placeholder in the endpoint
  let endpoint = ENDPOINTS.PASSES.replace('{landMarkId}', landMarkId);
  
  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('landMarkId', landMarkId); // Including landMarkId in query params as per API spec
  queryParams.append('eventId', eventId);
  
  return `${API_BASE_URL}${endpoint}?${queryParams.toString()}`;
};

/**
 * Builds the complete URL for creating a new parking pass
 * @returns Complete URL for the pass creation endpoint
 */
export const buildCreatePassUrl = (): string => {
  // Replace landMarkId placeholder in the endpoint
  let endpoint = ENDPOINTS.CREATE_PASS.replace('{landMarkId}', LANDMARK_ID);
  
  return `${API_BASE_URL}${endpoint}`;
};