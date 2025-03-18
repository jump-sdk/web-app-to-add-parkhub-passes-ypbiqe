import { eventsApi, EventsApi } from '../../../src/services/api/eventsApi';
import { apiClient } from '../../../src/services/api/apiClient';
import { ParkHubEvent, GetEventsParams } from '../../../src/types/api.types';
import { LANDMARK_ID, buildEventsUrl } from '../../../src/constants/apiEndpoints';
import { mockParkHubEvents, createMockEventResponse } from '../../__mocks__/eventsMock';
import { 
  createSuccessResponse, 
  createErrorResponse,
  createAuthenticationError, 
  createServerError 
} from '../../__mocks__/apiResponseMock';

// Mock the apiClient
jest.mock('../../../src/services/api/apiClient', () => ({
  get: jest.fn(),
  setApiKey: jest.fn()
}));

describe('EventsApi', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Set a valid API key on the apiClient
    apiClient.setApiKey('test-api-key');
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.resetAllMocks();
  });

  test('should retrieve events successfully', async () => {
    // Arrange
    const mockResponse = createSuccessResponse(mockParkHubEvents);
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Act
    const result = await eventsApi.getEvents();

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/events'));
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockParkHubEvents);
    expect(result.error).toBeNull();
  });

  test('should retrieve events with custom parameters', async () => {
    // Arrange
    const customParams: GetEventsParams = {
      landMarkId: 'custom-landmark-id',
      dateFrom: '2023-01-01T00:00:00.000Z'
    };
    const mockResponse = createSuccessResponse(mockParkHubEvents);
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);
    const expectedUrl = buildEventsUrl(customParams);

    // Act
    const result = await eventsApi.getEvents(customParams);

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith(expectedUrl);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockParkHubEvents);
  });

  test('should handle authentication errors', async () => {
    // Arrange
    const authError = createAuthenticationError();
    (apiClient.get as jest.Mock).mockRejectedValueOnce(authError);

    // Act & Assert
    await expect(eventsApi.getEvents()).rejects.toEqual(expect.objectContaining({
      code: 'AUTH_ERROR',
    }));
  });

  test('should handle server errors', async () => {
    // Arrange
    const serverError = createServerError();
    (apiClient.get as jest.Mock).mockRejectedValueOnce(serverError);

    // Act & Assert
    await expect(eventsApi.getEvents()).rejects.toEqual(expect.objectContaining({
      code: 'SERVER_ERROR',
    }));
  });

  test('should handle network errors', async () => {
    // Arrange
    const networkError = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValueOnce(networkError);

    // Act & Assert
    await expect(eventsApi.getEvents()).rejects.toEqual(expect.objectContaining({
      code: 'NETWORK_ERROR',
    }));
  });

  test('should handle empty response', async () => {
    // Arrange
    const emptyResponse = createSuccessResponse<ParkHubEvent[]>([]);
    (apiClient.get as jest.Mock).mockResolvedValueOnce(emptyResponse);

    // Act
    const result = await eventsApi.getEvents();

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });

  test('should use default parameters when none provided', async () => {
    // Arrange
    const mockResponse = createSuccessResponse(mockParkHubEvents);
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    // Act
    const result = await eventsApi.getEvents();

    // Assert
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining(LANDMARK_ID));
    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('dateFrom='));
    expect(result.success).toBe(true);
  });

  test('should be able to instantiate EventsApi class', () => {
    // Act
    const api = new EventsApi();

    // Assert
    expect(api).toBeInstanceOf(EventsApi);
    expect(typeof api.getEvents).toBe('function');
  });
});