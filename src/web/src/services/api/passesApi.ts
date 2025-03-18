import { ApiResponse } from '../../types/common.types';
import {
  ParkHubPass,
  GetPassesParams,
  CreatePassRequest,
  CreatePassResponse,
  PassesApiInterface,
  BatchPassCreationResult
} from './types';
import { apiClient } from './apiClient';
import {
  LANDMARK_ID,
  buildPassesUrl,
  buildCreatePassUrl
} from '../../constants/apiEndpoints';
import { mapErrorToAppError } from '../../utils/error-handling';

/**
 * Implementation of the Passes API service for retrieving and creating
 * parking passes in the ParkHub system
 */
class PassesApi implements PassesApiInterface {
  /**
   * Retrieves a list of passes for a specific event from the ParkHub API
   * @param params - Parameters containing the event ID and optional landmark ID
   * @returns Promise resolving to an API response containing an array of ParkHub passes
   * @throws Error if eventId is not provided
   */
  public async getPassesForEvent(params: GetPassesParams): Promise<ApiResponse<ParkHubPass[]>> {
    // Validate that eventId is provided
    if (!params.eventId || params.eventId.trim() === '') {
      throw new Error('Event ID is required for retrieving passes');
    }

    // Ensure landMarkId is set if not provided
    const passesParams: GetPassesParams = {
      ...params,
      landMarkId: params.landMarkId || LANDMARK_ID
    };

    try {
      // Build the passes URL
      const url = buildPassesUrl(passesParams);

      // Make the API request
      return await apiClient.get<ParkHubPass[]>(url);
    } catch (error) {
      // Let the error bubble up - apiClient already handles error transformation
      throw error;
    }
  }

  /**
   * Creates a new parking pass in the ParkHub system
   * @param data - Pass creation request data
   * @returns Promise resolving to an API response containing the creation result
   * @throws Error if required fields are missing
   */
  public async createPass(data: CreatePassRequest): Promise<ApiResponse<CreatePassResponse>> {
    // Validate that required fields are present
    if (!this.validatePassData(data)) {
      throw new Error('Missing required fields for pass creation');
    }

    try {
      // Build the create pass URL
      const url = buildCreatePassUrl();

      // Make the API request
      return await apiClient.post<CreatePassResponse>(url, data);
    } catch (error) {
      // Let the error bubble up - apiClient already handles error transformation
      throw error;
    }
  }

  /**
   * Creates multiple parking passes in the ParkHub system
   * @param passesData - Array of pass creation requests
   * @returns Promise resolving to a summary of the batch creation results
   * @throws Error if no passes are provided
   */
  public async createMultiplePasses(passesData: CreatePassRequest[]): Promise<BatchPassCreationResult> {
    // Validate that we have passes to create
    if (!Array.isArray(passesData) || passesData.length === 0) {
      throw new Error('At least one pass is required for batch creation');
    }

    // Initialize result tracking
    const result: BatchPassCreationResult = {
      successful: [],
      failed: [],
      totalSuccess: 0,
      totalFailed: 0
    };

    // Process passes in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < passesData.length; i += batchSize) {
      const batch = passesData.slice(i, i + batchSize);
      
      // Process this batch concurrently
      await Promise.all(
        batch.map(async (passData) => {
          try {
            // Create the pass (validation is handled inside createPass)
            const response = await this.createPass(passData);

            // Check if creation was successful
            if (response.success && response.data && response.data.passId) {
              // Add to successful creations
              result.successful.push({
                passId: response.data.passId,
                barcode: passData.barcode,
                customerName: passData.customerName
              });
              result.totalSuccess++;
            } else {
              // Add to failed creations
              result.failed.push({
                barcode: passData.barcode,
                customerName: passData.customerName,
                error: response.error || {
                  code: 'unknown_error',
                  message: 'Unknown error occurred during pass creation'
                }
              });
              result.totalFailed++;
            }
          } catch (error) {
            // Handle errors - map to a standard format if possible
            let errorObject;
            try {
              // Attempt to map the error to an application error
              const appError = mapErrorToAppError(error);
              errorObject = {
                code: appError.code || 'unknown_error',
                message: appError.message || 'An unexpected error occurred',
                field: appError.type === 'validation' ? (appError as any).field : undefined
              };
            } catch (mappingError) {
              // Fallback error object if mapping fails
              errorObject = {
                code: 'unknown_error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
              };
            }
            
            // Add to failed creations
            result.failed.push({
              barcode: passData.barcode,
              customerName: passData.customerName,
              error: errorObject
            });
            result.totalFailed++;
          }
        })
      );
    }

    return result;
  }

  /**
   * Validates that a pass creation request contains all required fields
   * @param data - Pass creation request to validate
   * @returns True if all required fields are present, false otherwise
   * @private
   */
  private validatePassData(data: CreatePassRequest): boolean {
    // Check that all required fields are present and non-empty
    return Boolean(
      data &&
      typeof data === 'object' &&
      data.eventId && typeof data.eventId === 'string' && data.eventId.trim() !== '' &&
      data.accountId && typeof data.accountId === 'string' && data.accountId.trim() !== '' &&
      data.barcode && typeof data.barcode === 'string' && data.barcode.trim() !== '' &&
      data.customerName && typeof data.customerName === 'string' && data.customerName.trim() !== '' &&
      data.spotType && typeof data.spotType === 'string' && data.spotType.trim() !== '' &&
      data.lotId && typeof data.lotId === 'string' && data.lotId.trim() !== ''
    );
  }
}

// Export the class and a singleton instance
export { PassesApi };
export const passesApi = new PassesApi();
export default passesApi;