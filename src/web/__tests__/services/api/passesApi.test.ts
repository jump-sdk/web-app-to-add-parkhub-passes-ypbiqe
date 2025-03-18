import { passesApi, PassesApi } from '../../../src/services/api/passesApi';
import { apiClient } from '../../../src/services/api/apiClient';
import { 
  ParkHubPass, 
  GetPassesParams, 
  CreatePassRequest, 
  CreatePassResponse, 
  BatchPassCreationResult 
} from '../../../src/services/api/types';
import { 
  LANDMARK_ID, 
  buildPassesUrl, 
  buildCreatePassUrl 
} from '../../../src/constants/apiEndpoints';
import { 
  mockParkHubPasses, 
  createMockParkHubPass, 
  createMockPassCreationResponse 
} from '../../__mocks__/passesMock';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createValidationError, 
  createServerError 
} from '../../__mocks__/apiResponseMock';

// Mock the apiClient
jest.mock('../../../src/services/api/apiClient');

describe('PassesApi', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup standard mocks
    (apiClient.get as jest.Mock) = jest.fn();
    (apiClient.post as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  // Tests for getPassesForEvent
  describe('getPassesForEvent', () => {
    it('should retrieve passes for a specific event', async () => {
      // Mock API client to return successful response
      (apiClient.get as jest.Mock).mockResolvedValue(createSuccessResponse(mockParkHubPasses));

      // Call the method with a valid event ID
      const params: GetPassesParams = {
        eventId: 'EV12345',
        landMarkId: LANDMARK_ID
      };
      const result = await passesApi.getPassesForEvent(params);

      // Verify API client was called correctly
      expect(apiClient.get).toHaveBeenCalledWith(buildPassesUrl(params));
      
      // Verify result contains expected data
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockParkHubPasses);
      expect(result.error).toBeNull();
    });

    it('should throw an error if eventId is not provided', async () => {
      // Call the method with missing eventId
      const params: Partial<GetPassesParams> = {
        landMarkId: LANDMARK_ID
      };
      
      // Should throw an error about missing event ID
      await expect(passesApi.getPassesForEvent(params as GetPassesParams)).rejects.toThrow(
        'Event ID is required for retrieving passes'
      );
      
      // Verify API client was not called
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should handle API errors correctly', async () => {
      // Mock API client to return error response
      const errorResponse = createErrorResponse({ code: 'error_code', message: 'API error' });
      (apiClient.get as jest.Mock).mockResolvedValue(errorResponse);

      // Call the method with a valid event ID
      const params: GetPassesParams = {
        eventId: 'EV12345',
        landMarkId: LANDMARK_ID
      };
      const result = await passesApi.getPassesForEvent(params);

      // Verify API client was called correctly
      expect(apiClient.get).toHaveBeenCalledWith(buildPassesUrl(params));
      
      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  // Tests for createPass
  describe('createPass', () => {
    it('should create a new pass successfully', async () => {
      // Mock passData for testing
      const passData: CreatePassRequest = {
        eventId: 'EV12345',
        accountId: 'ACC123',
        barcode: 'BC100001',
        customerName: 'John Doe',
        spotType: 'Regular',
        lotId: 'LOT-A'
      };
      
      // Mock API client to return successful response
      const passId = 'P12345';
      const successResponse = createMockPassCreationResponse(passId);
      (apiClient.post as jest.Mock).mockResolvedValue(successResponse);

      // Call the method
      const result = await passesApi.createPass(passData);

      // Verify API client was called correctly
      expect(apiClient.post).toHaveBeenCalledWith(buildCreatePassUrl(), passData);
      
      // Verify result contains expected data
      expect(result.success).toBe(true);
      expect(result.data?.passId).toBe(passId);
      expect(result.error).toBeNull();
    });

    it('should validate pass data before submission', async () => {
      // Mock invalid passData (missing required fields)
      const passData: Partial<CreatePassRequest> = {
        eventId: 'EV12345',
        // Missing other required fields
      };
      
      // Should throw an error about missing required fields
      await expect(passesApi.createPass(passData as CreatePassRequest)).rejects.toThrow(
        'Missing required fields for pass creation'
      );
      
      // Verify API client was not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should handle API errors correctly', async () => {
      // Mock valid passData
      const passData: CreatePassRequest = {
        eventId: 'EV12345',
        accountId: 'ACC123',
        barcode: 'BC100001',
        customerName: 'John Doe',
        spotType: 'Regular',
        lotId: 'LOT-A'
      };
      
      // Mock API client to return error response
      const errorResponse = createErrorResponse({ code: 'error_code', message: 'API error' });
      (apiClient.post as jest.Mock).mockResolvedValue(errorResponse);

      // Call the method
      const result = await passesApi.createPass(passData);

      // Verify API client was called correctly
      expect(apiClient.post).toHaveBeenCalledWith(buildCreatePassUrl(), passData);
      
      // Verify error handling
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toEqual(errorResponse.error);
    });
  });

  // Tests for createMultiplePasses
  describe('createMultiplePasses', () => {
    it('should create multiple passes successfully', async () => {
      // Mock array of pass data
      const passesData: CreatePassRequest[] = [
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100002',
          customerName: 'Jane Smith',
          spotType: 'VIP',
          lotId: 'LOT-B'
        }
      ];
      
      // Mock API client to return successful responses
      const successResponse1 = createMockPassCreationResponse('P12345');
      const successResponse2 = createMockPassCreationResponse('P12346');
      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce(successResponse1)
        .mockResolvedValueOnce(successResponse2);

      // Call the method
      const result = await passesApi.createMultiplePasses(passesData);

      // Verify API client was called correctly for each pass
      expect(apiClient.post).toHaveBeenNthCalledWith(1, buildCreatePassUrl(), passesData[0]);
      expect(apiClient.post).toHaveBeenNthCalledWith(2, buildCreatePassUrl(), passesData[1]);
      
      // Verify result contains expected data
      expect(result.totalSuccess).toBe(2);
      expect(result.totalFailed).toBe(0);
      expect(result.successful.length).toBe(2);
      expect(result.failed.length).toBe(0);
      expect(result.successful[0].passId).toBe('P12345');
      expect(result.successful[1].passId).toBe('P12346');
    });

    it('should handle partial success correctly', async () => {
      // Mock array of pass data
      const passesData: CreatePassRequest[] = [
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100002',
          customerName: 'Jane Smith',
          spotType: 'VIP',
          lotId: 'LOT-B'
        }
      ];
      
      // Mock API client to return success for first pass and error for second
      const successResponse = createMockPassCreationResponse('P12345');
      const errorResponse = createErrorResponse({ code: 'duplicate_barcode', message: 'Barcode already exists' });
      (apiClient.post as jest.Mock)
        .mockResolvedValueOnce(successResponse)
        .mockResolvedValueOnce(errorResponse);

      // Call the method
      const result = await passesApi.createMultiplePasses(passesData);

      // Verify result contains expected data
      expect(result.totalSuccess).toBe(1);
      expect(result.totalFailed).toBe(1);
      expect(result.successful.length).toBe(1);
      expect(result.failed.length).toBe(1);
      expect(result.successful[0].passId).toBe('P12345');
      expect(result.failed[0].barcode).toBe('BC100002');
      expect(result.failed[0].error.code).toBe('duplicate_barcode');
    });

    it('should throw an error if an empty array is provided', async () => {
      // Call the method with an empty array
      await expect(passesApi.createMultiplePasses([])).rejects.toThrow(
        'At least one pass is required for batch creation'
      );
      
      // Verify API client was not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  // Tests for validatePassData (private method)
  describe('validatePassData', () => {
    it('should return true for valid pass data', () => {
      // Create a new instance to access the private method
      const passesApiInstance = new PassesApi();
      
      // Create valid pass data
      const validPassData: CreatePassRequest = {
        eventId: 'EV12345',
        accountId: 'ACC123',
        barcode: 'BC100001',
        customerName: 'John Doe',
        spotType: 'Regular',
        lotId: 'LOT-A'
      };
      
      // Call the private method using type assertion
      const result = (passesApiInstance as any).validatePassData(validPassData);
      
      // Verify result
      expect(result).toBe(true);
    });

    it('should return false for invalid pass data', () => {
      // Create a new instance to access the private method
      const passesApiInstance = new PassesApi();
      
      // Create test cases with various invalid data
      const testCases = [
        // Missing eventId
        {
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        // Missing accountId
        {
          eventId: 'EV12345',
          barcode: 'BC100001',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        // Empty barcode
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: '',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        // Null customerName
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: null,
          spotType: 'Regular',
          lotId: 'LOT-A'
        },
        // Missing spotType
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: 'John Doe',
          lotId: 'LOT-A'
        },
        // Empty lotId
        {
          eventId: 'EV12345',
          accountId: 'ACC123',
          barcode: 'BC100001',
          customerName: 'John Doe',
          spotType: 'Regular',
          lotId: ' '
        },
        // Not an object
        'not an object'
      ];
      
      // Test each case
      testCases.forEach(testCase => {
        const result = (passesApiInstance as any).validatePassData(testCase);
        expect(result).toBe(false);
      });
    });
  });
});