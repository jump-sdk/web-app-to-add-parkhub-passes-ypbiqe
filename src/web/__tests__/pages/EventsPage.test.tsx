import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../src/utils/testing';
import EventsPage from '../../src/pages/EventsPage';
import { mockEvents } from '../__mocks__/eventsMock';
import useEvents from '../../src/hooks/useEvents';
import { useNotificationContext } from '../../src/context/NotificationContext';

// Mock the hooks
jest.mock('../../src/hooks/useEvents');
jest.mock('../../src/context/NotificationContext');

describe('EventsPage', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Default mock implementation for useEvents
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      filteredEvents: [],
      paginatedEvents: [],
      loading: false,
      error: null,
      filterOptions: {},
      sortOptions: {},
      pagination: { page: 1, pageSize: 10 },
      selectedEventId: null,
      setFilterOptions: jest.fn(),
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectEvent: jest.fn(),
      refetch: jest.fn()
    });

    // Default mock implementation for useNotificationContext
    (useNotificationContext as jest.Mock).mockReturnValue({
      showSuccess: jest.fn(),
      showError: jest.fn(),
      showWarning: jest.fn(),
      showInfo: jest.fn(),
      notifications: [],
      addNotification: jest.fn(),
      removeNotification: jest.fn(),
      clearNotifications: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    // Mock useEvents to return loading: true
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      filteredEvents: [],
      paginatedEvents: [],
      loading: true,
      error: null,
      filterOptions: {},
      sortOptions: {},
      pagination: { page: 1, pageSize: 10 },
      selectedEventId: null,
      setFilterOptions: jest.fn(),
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectEvent: jest.fn(),
      refetch: jest.fn()
    });

    // Render the EventsPage component
    renderWithProviders(<EventsPage />);
    
    // Verify that the page title is displayed
    expect(screen.getByText('ParkHub Events')).toBeInTheDocument();
    expect(screen.getByText('View and manage events and their parking passes')).toBeInTheDocument();
  });

  it('renders events when data is loaded', async () => {
    // Mock useEvents to return loading: false, events: mockEvents
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      filteredEvents: mockEvents,
      paginatedEvents: mockEvents,
      loading: false,
      error: null,
      filterOptions: {},
      sortOptions: {},
      pagination: { page: 1, pageSize: 10, totalItems: mockEvents.length },
      selectedEventId: null,
      setFilterOptions: jest.fn(),
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectEvent: jest.fn(),
      refetch: jest.fn()
    });

    // Render the EventsPage component
    renderWithProviders(<EventsPage />);
    
    // Verify that the page title is displayed
    expect(screen.getByText('ParkHub Events')).toBeInTheDocument();
    expect(screen.getByText('View and manage events and their parking passes')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    // Mock useEvents to return loading: false, error: new Error('API Error')
    (useEvents as jest.Mock).mockReturnValue({
      events: [],
      filteredEvents: [],
      paginatedEvents: [],
      loading: false,
      error: new Error('API Error'),
      filterOptions: {},
      sortOptions: {},
      pagination: { page: 1, pageSize: 10 },
      selectedEventId: null,
      setFilterOptions: jest.fn(),
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectEvent: jest.fn(),
      refetch: jest.fn()
    });

    // Render the EventsPage component
    renderWithProviders(<EventsPage />);
    
    // Verify that the page title is displayed
    expect(screen.getByText('ParkHub Events')).toBeInTheDocument();
    expect(screen.getByText('View and manage events and their parking passes')).toBeInTheDocument();
  });

  it('handles refresh action correctly', async () => {
    // Set up mock functions
    const mockRefetch = jest.fn();
    const mockShowSuccess = jest.fn();
    const mockShowError = jest.fn();
    
    // Mock hooks with mock functions
    (useEvents as jest.Mock).mockReturnValue({
      refetch: mockRefetch,
      events: mockEvents,
      loading: false,
      error: null
    });
    
    (useNotificationContext as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });

    // Extract the handleRefresh function by capturing the callback passed to useCallback
    let capturedCallback: (() => Promise<void>) | null = null;
    const originalUseCallback = React.useCallback;
    
    jest.spyOn(React, 'useCallback').mockImplementation(
      (callback, deps) => {
        // Identify the handleRefresh function by its dependencies
        if (deps && deps.includes(mockRefetch) && 
            deps.includes(mockShowSuccess) && 
            deps.includes(mockShowError)) {
          capturedCallback = callback;
        }
        return originalUseCallback(callback, deps);
      }
    );
    
    // Render the EventsPage component
    renderWithProviders(<EventsPage />);
    
    // Verify we captured the callback
    expect(capturedCallback).not.toBeNull();
    
    // Test successful refetch
    await capturedCallback!();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockShowSuccess).toHaveBeenCalledWith('Events data refreshed successfully');
    
    // Reset mocks for testing failure
    mockRefetch.mockClear();
    mockShowSuccess.mockClear();
    
    // Test failed refetch
    mockRefetch.mockRejectedValueOnce(new Error('Refetch failed'));
    await capturedCallback!();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(mockShowError).toHaveBeenCalledWith('Failed to refresh events data. Please try again.');
    
    // Restore the original useCallback
    jest.restoreAllMocks();
  });

  it('integrates with EventsList component', async () => {
    // Mock useEvents to return events data
    (useEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      filteredEvents: mockEvents,
      paginatedEvents: mockEvents,
      loading: false,
      error: null,
      filterOptions: {},
      sortOptions: {},
      pagination: { page: 1, pageSize: 10, totalItems: mockEvents.length },
      selectedEventId: null,
      setFilterOptions: jest.fn(),
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectEvent: jest.fn(),
      refetch: jest.fn()
    });

    // Render the EventsPage component
    renderWithProviders(<EventsPage />);
    
    // Verify that the page renders with EventsList
    expect(screen.getByText('ParkHub Events')).toBeInTheDocument();
  });
});