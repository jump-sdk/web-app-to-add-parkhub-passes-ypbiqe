import { act, waitFor } from '@testing-library/react'; // v14.0.0
import { renderHook, RenderHookResult } from '@testing-library/react-hooks'; // v8.0.1

import { useEvents } from '../../src/hooks/useEvents';
import { renderHookWithProviders, mockApiServices } from '../../src/utils/testing';
import { eventsApi } from '../../src/services/api/eventsApi';
import {
  mockEvents,
  mockParkHubEvents,
  createMockEvent,
  createMockEventResponse
} from '../__mocks__/eventsMock';
import {
  createSuccessResponse,
  createErrorResponse,
  createServerError,
  createNetworkError
} from '../__mocks__/apiResponseMock';
import { 
  Event, 
  EventStatus, 
  EventSortField, 
  EventFilterOptions, 
  EventSortOptions, 
  PaginationConfig 
} from '../../src/types/event.types';
import { SortDirection } from '../../src/types/common.types';

describe('useEvents hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch events successfully', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Initially, it should be in loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that loading is false
    expect(result.current.loading).toBe(false);
    // Verify that error is null
    expect(result.current.error).toBeNull();
    // Verify that events array contains the expected number of events
    expect(result.current.events.length).toEqual(mockParkHubEvents.length);
    
    // Verify that events are properly mapped from ParkHub format to application format
    const firstEvent = result.current.events[0];
    expect(firstEvent.id).toEqual(mockParkHubEvents[0].id);
    expect(firstEvent.name).toEqual(mockParkHubEvents[0].name);
    expect(firstEvent.venue).toEqual(mockParkHubEvents[0].venue);
    expect(firstEvent.status).toBeDefined();
    expect(firstEvent.formattedDate).toBeDefined();
    expect(firstEvent.formattedTime).toBeDefined();
  });

  it('should handle API errors', async () => {
    // Mock eventsApi.getEvents to return an error response
    const errorResponse = createServerError();
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockRejectedValue(errorResponse)
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that loading is false
    expect(result.current.loading).toBe(false);
    // Verify that error is not null
    expect(result.current.error).not.toBeNull();
    // Verify that events array is empty
    expect(result.current.events).toEqual([]);
  });

  it('should filter events by status', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setFilterOptions with a status filter
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        status: EventStatus.ACTIVE
      });
    });

    // Verify that filteredEvents only contains events with the specified status
    expect(result.current.filteredEvents.every(event => event.status === EventStatus.ACTIVE)).toBe(true);
  });

  it('should filter events by venue', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setFilterOptions with a venue filter
    const venueToFilter = 'Stadium1';
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        venue: venueToFilter
      });
    });

    // Verify that filteredEvents only contains events with the specified venue
    expect(result.current.filteredEvents.every(event => 
      event.venue.toLowerCase().includes(venueToFilter.toLowerCase())
    )).toBe(true);
  });

  it('should filter events by date range', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setFilterOptions with dateFrom and dateTo filters
    const dateFrom = new Date(2023, 9, 16); // Oct 16, 2023
    const dateTo = new Date(2023, 10, 17); // Nov 17, 2023
    
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        dateFrom,
        dateTo
      });
    });

    // Verify that filteredEvents only contains events within the specified date range
    expect(result.current.filteredEvents.every(event => 
      event.date >= dateFrom && event.date <= dateTo
    )).toBe(true);
  });

  it('should filter events by search term', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setFilterOptions with a searchTerm filter
    const searchTerm = 'Football';
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        searchTerm
      });
    });

    // Verify that filteredEvents only contains events matching the search term in name or venue
    expect(result.current.filteredEvents.every(event => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    )).toBe(true);
  });

  it('should sort events by date', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setSortOptions with field=DATE and direction=ASC
    act(() => {
      result.current.setSortOptions({
        field: EventSortField.DATE,
        direction: SortDirection.ASC
      });
    });

    // Verify that filteredEvents are sorted by date in ascending order
    for (let i = 1; i < result.current.filteredEvents.length; i++) {
      expect(result.current.filteredEvents[i - 1].date.getTime() <= result.current.filteredEvents[i].date.getTime()).toBe(true);
    }

    // Call setSortOptions with field=DATE and direction=DESC
    act(() => {
      result.current.setSortOptions({
        field: EventSortField.DATE,
        direction: SortDirection.DESC
      });
    });

    // Verify that filteredEvents are sorted by date in descending order
    for (let i = 1; i < result.current.filteredEvents.length; i++) {
      expect(result.current.filteredEvents[i - 1].date.getTime() >= result.current.filteredEvents[i].date.getTime()).toBe(true);
    }
  });

  it('should sort events by name', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call setSortOptions with field=NAME and direction=ASC
    act(() => {
      result.current.setSortOptions({
        field: EventSortField.NAME,
        direction: SortDirection.ASC
      });
    });

    // Verify that filteredEvents are sorted by name in ascending order
    for (let i = 1; i < result.current.filteredEvents.length; i++) {
      expect(result.current.filteredEvents[i - 1].name.localeCompare(result.current.filteredEvents[i].name)).toBeLessThanOrEqual(0);
    }

    // Call setSortOptions with field=NAME and direction=DESC
    act(() => {
      result.current.setSortOptions({
        field: EventSortField.NAME,
        direction: SortDirection.DESC
      });
    });

    // Verify that filteredEvents are sorted by name in descending order
    for (let i = 1; i < result.current.filteredEvents.length; i++) {
      expect(result.current.filteredEvents[i - 1].name.localeCompare(result.current.filteredEvents[i].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it('should paginate events correctly', async () => {
    // Mock eventsApi.getEvents to return a successful response with a large number of mockParkHubEvents
    const largeEventSet = Array.from({ length: 25 }, (_, i) => 
      createMockEvent({ id: `EV${10001 + i}`, name: `Event ${i + 1}` })
    );
    
    const largeEventSetParkHub = largeEventSet.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date.toISOString(),
      venue: event.venue,
      status: event.status
    }));

    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(largeEventSetParkHub))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that paginatedEvents contains the first page of events
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.pagination.totalItems).toBe(largeEventSet.length);
    expect(result.current.pagination.totalPages).toBe(Math.ceil(largeEventSet.length / 10));
    expect(result.current.paginatedEvents.length).toBe(10);

    // Call setPagination to change the page
    act(() => {
      result.current.setPagination({ page: 2 });
    });

    // Verify that paginatedEvents contains the correct page of events
    expect(result.current.pagination.page).toBe(2);
    expect(result.current.paginatedEvents.length).toBe(10);
    expect(result.current.paginatedEvents[0]).toBe(result.current.filteredEvents[10]);

    // Call setPagination to change the page size
    act(() => {
      result.current.setPagination({ pageSize: 5 });
    });

    // Verify that paginatedEvents contains the correct number of events
    expect(result.current.pagination.pageSize).toBe(5);
    expect(result.current.pagination.totalPages).toBe(Math.ceil(largeEventSet.length / 5));
    expect(result.current.paginatedEvents.length).toBe(5);
  });

  it('should select an event correctly', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Call selectEvent with an event ID
    const eventToSelect = mockEvents[0].id;
    act(() => {
      result.current.selectEvent(eventToSelect);
    });

    // Verify that selectedEventId is set to the specified ID
    expect(result.current.selectedEventId).toBe(eventToSelect);

    // Call selectEvent with null
    act(() => {
      result.current.selectEvent(null);
    });

    // Verify that selectedEventId is null
    expect(result.current.selectedEventId).toBeNull();
  });

  it('should refetch events when refetch is called', async () => {
    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    const mockGetEvents = jest.fn()
      .mockResolvedValueOnce(createSuccessResponse(mockParkHubEvents))
      .mockResolvedValueOnce(createSuccessResponse([mockParkHubEvents[0], mockParkHubEvents[1]])); // Different set of events
    
    mockApiServices({
      eventsApi: {
        getEvents: mockGetEvents
      }
    });

    // Render the useEvents hook using renderHookWithProviders
    const { result } = renderHookWithProviders(() => useEvents());

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.events.length).toBe(mockParkHubEvents.length);

    // Update the mock to return a different set of events
    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Verify that events array is updated with the new data
    expect(result.current.events.length).toBe(2);
    expect(mockGetEvents).toHaveBeenCalledTimes(2);
  });

  it('should initialize with provided filter options', async () => {
    // Create initial filter options
    const initialFilterOptions: EventFilterOptions = {
      status: EventStatus.ACTIVE,
      venue: 'Stadium1',
      dateFrom: new Date(2023, 9, 1),
      dateTo: new Date(2023, 10, 30),
      searchTerm: null
    };

    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook with initialFilterOptions
    const { result } = renderHookWithProviders(() => 
      useEvents(initialFilterOptions, undefined, undefined)
    );

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that filterOptions match the provided initial options
    expect(result.current.filterOptions).toEqual(initialFilterOptions);

    // Verify that filteredEvents are filtered according to the initial options
    expect(result.current.filteredEvents.every(event => 
      event.status === EventStatus.ACTIVE &&
      event.venue.includes('Stadium1') &&
      event.date >= initialFilterOptions.dateFrom! &&
      event.date <= initialFilterOptions.dateTo!
    )).toBe(true);
  });

  it('should initialize with provided sort options', async () => {
    // Create initial sort options
    const initialSortOptions: EventSortOptions = {
      field: EventSortField.NAME,
      direction: SortDirection.ASC
    };

    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook with initialSortOptions
    const { result } = renderHookWithProviders(() => 
      useEvents(undefined, initialSortOptions, undefined)
    );

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that sortOptions match the provided initial options
    expect(result.current.sortOptions).toEqual(initialSortOptions);

    // Verify that filteredEvents are sorted according to the initial options
    for (let i = 1; i < result.current.filteredEvents.length; i++) {
      expect(result.current.filteredEvents[i - 1].name.localeCompare(result.current.filteredEvents[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should initialize with provided pagination config', async () => {
    // Create initial pagination config
    const initialPagination: PaginationConfig = {
      page: 2,
      pageSize: 2,
      totalItems: 0, // This will be calculated by the hook
      totalPages: 1  // This will be calculated by the hook
    };

    // Mock eventsApi.getEvents to return a successful response with mockParkHubEvents
    mockApiServices({
      eventsApi: {
        getEvents: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubEvents))
      }
    });

    // Render the useEvents hook with initialPagination
    const { result } = renderHookWithProviders(() => 
      useEvents(undefined, undefined, initialPagination)
    );

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Verify that pagination matches the provided initial config
    expect(result.current.pagination.page).toBe(initialPagination.page);
    expect(result.current.pagination.pageSize).toBe(initialPagination.pageSize);
    expect(result.current.pagination.totalItems).toBe(mockParkHubEvents.length);
    expect(result.current.pagination.totalPages).toBe(Math.ceil(mockParkHubEvents.length / initialPagination.pageSize));

    // Verify that paginatedEvents reflect the initial pagination settings
    expect(result.current.paginatedEvents.length).toBe(
      Math.min(initialPagination.pageSize, Math.max(0, mockParkHubEvents.length - (initialPagination.page - 1) * initialPagination.pageSize))
    );
  });
});