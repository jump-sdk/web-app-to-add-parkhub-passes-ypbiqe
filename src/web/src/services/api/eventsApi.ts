import { ApiResponse } from '../../types/common.types';
import { ParkHubEvent, GetEventsParams, EventsApiInterface } from '../../types/api.types';
import { apiClient } from './apiClient';
import { LANDMARK_ID, buildEventsUrl } from '../../constants/apiEndpoints';
import { formatDateForApi } from '../../utils/api-helpers';
import { mapErrorToAppError } from '../../utils/error-handling';

/**
 * Implementation of the Events API service for retrieving game events from the ParkHub API
 */
export class EventsApi implements EventsApiInterface {
  /**
   * Retrieves a list of events from the ParkHub API
   * @param params - Optional parameters for filtering events
   * @returns Promise resolving to an API response containing an array of ParkHub events
   */
  public async getEvents(params?: GetEventsParams): Promise<ApiResponse<ParkHubEvent[]>> {
    // Set default parameters
    const defaultParams: GetEventsParams = {
      landMarkId: LANDMARK_ID,
      dateFrom: formatDateForApi(new Date()) // Default to current date
    };

    // Merge provided params with defaults
    const mergedParams: GetEventsParams = {
      ...defaultParams,
      ...(params || {})
    };

    // Build the API URL with parameters
    const url = buildEventsUrl(mergedParams);

    try {
      // Make the API request
      return await apiClient.get<ParkHubEvent[]>(url);
    } catch (error) {
      // If the error is something that apiClient doesn't handle, map it to an AppError
      throw mapErrorToAppError(error);
    }
  }
}

/**
 * Singleton instance of the Events API service for application-wide use
 */
export const eventsApi = new EventsApi();

export default eventsApi;