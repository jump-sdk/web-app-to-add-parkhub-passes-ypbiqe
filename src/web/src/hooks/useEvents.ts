import { useState, useEffect, useCallback, useMemo } from 'react'; // v18.2.0
import { useQuery } from './useQuery';
import { useErrorHandler } from './useErrorHandler';
import { eventsApi } from '../services/api/eventsApi';
import { 
  Event, 
  EventStatus, 
  EventSortField, 
  EventFilterOptions,
  EventSortOptions,
  PaginationConfig,
  EventsHookResult 
} from '../types/event.types';
import { ParkHubEvent } from '../types/api.types';
import { SortDirection, ApiStatus } from '../types/common.types';
import { formatDate, formatTime, parseDate } from '../utils/date-helpers';

/**
 * Maps a ParkHub API event to the application's Event model
 * @param parkHubEvent - Event data from the ParkHub API
 * @returns Mapped event with formatted date and time
 */
const mapParkHubEventToEvent = (parkHubEvent: ParkHubEvent): Event => {
  // Parse the date string from the ParkHub event
  const dateObj = parseDate(parkHubEvent.date) || new Date();
  
  // Format the date and time for display
  const formattedDate = formatDate(dateObj);
  const formattedTime = formatTime(dateObj);
  
  // Map status string to EventStatus enum
  let status: EventStatus;
  switch (parkHubEvent.status.toLowerCase()) {
    case 'inactive':
      status = EventStatus.INACTIVE;
      break;
    case 'completed':
      status = EventStatus.COMPLETED;
      break;
    case 'cancelled':
      status = EventStatus.CANCELLED;
      break;
    case 'active':
    default:
      status = EventStatus.ACTIVE; // Default to active if status is unknown
      break;
  }
  
  // Return a new Event object with all properties mapped
  return {
    id: parkHubEvent.id,
    name: parkHubEvent.name,
    date: dateObj,
    formattedDate,
    formattedTime,
    venue: parkHubEvent.venue,
    status
  };
};

/**
 * Filters events based on provided filter options
 * @param events - Array of events to filter
 * @param filterOptions - Filter criteria
 * @returns Filtered events array
 */
const filterEvents = (events: Event[], filterOptions?: EventFilterOptions): Event[] => {
  // Return all events if no filter options are provided
  if (!filterOptions) {
    return events;
  }
  
  return events.filter(event => {
    // Filter by status if specified
    if (filterOptions.status && event.status !== filterOptions.status) {
      return false;
    }
    
    // Filter by venue if specified
    if (filterOptions.venue && 
        !event.venue.toLowerCase().includes(filterOptions.venue.toLowerCase())) {
      return false;
    }
    
    // Filter by date range
    if (filterOptions.dateFrom && event.date < filterOptions.dateFrom) {
      return false;
    }
    
    if (filterOptions.dateTo) {
      const dateTo = new Date(filterOptions.dateTo);
      // Set to end of day for inclusive filtering
      dateTo.setHours(23, 59, 59, 999);
      if (event.date > dateTo) {
        return false;
      }
    }
    
    // Filter by search term across name and venue
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      const nameMatch = event.name.toLowerCase().includes(searchTerm);
      const venueMatch = event.venue.toLowerCase().includes(searchTerm);
      if (!nameMatch && !venueMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sorts events based on provided sort options
 * @param events - Array of events to sort
 * @param sortOptions - Sort criteria
 * @returns Sorted events array
 */
const sortEvents = (events: Event[], sortOptions?: EventSortOptions): Event[] => {
  // Return events as-is if no sort options are provided
  if (!sortOptions) {
    return events;
  }
  
  // Create a new array to avoid mutating the original
  const sortedEvents = [...events];
  
  // Sort by the specified field and direction
  sortedEvents.sort((a, b) => {
    let comparison = 0;
    
    switch (sortOptions.field) {
      case EventSortField.DATE:
        comparison = a.date.getTime() - b.date.getTime();
        break;
      case EventSortField.NAME:
        comparison = a.name.localeCompare(b.name);
        break;
      case EventSortField.VENUE:
        comparison = a.venue.localeCompare(b.venue);
        break;
      case EventSortField.STATUS:
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    
    // Apply the sort direction
    return sortOptions.direction === SortDirection.ASC ? comparison : -comparison;
  });
  
  return sortedEvents;
};

/**
 * Paginates events based on pagination configuration
 * @param events - Array of events to paginate
 * @param pagination - Pagination configuration
 * @returns Paginated events array
 */
const paginateEvents = (events: Event[], pagination?: PaginationConfig): Event[] => {
  // Return all events if no pagination config is provided
  if (!pagination) {
    return events;
  }
  
  // Calculate the start and end indices based on page and pageSize
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  
  // Slice the events array to get the current page of events
  return events.slice(startIndex, endIndex);
};

/**
 * Custom hook for managing events data, filtering, sorting, and pagination
 * 
 * @param initialFilterOptions - Initial filter options
 * @param initialSortOptions - Initial sort options
 * @param initialPagination - Initial pagination configuration
 * @returns Object containing events data and management functions
 */
export const useEvents = (
  initialFilterOptions?: EventFilterOptions,
  initialSortOptions?: EventSortOptions,
  initialPagination?: PaginationConfig
): EventsHookResult => {
  // Set up default values
  const defaultFilterOptions: EventFilterOptions = {
    status: null,
    venue: null,
    dateFrom: null,
    dateTo: null,
    searchTerm: null
  };
  
  const defaultSortOptions: EventSortOptions = {
    field: EventSortField.DATE,
    direction: SortDirection.DESC // Newest events first
  };
  
  const defaultPagination: PaginationConfig = {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  };
  
  // Initialize state with defaults merged with any provided initial values
  const [filterOptions, setFilterOptions] = useState<EventFilterOptions>({
    ...defaultFilterOptions,
    ...initialFilterOptions
  });
  
  const [sortOptions, setSortOptions] = useState<EventSortOptions>({
    ...defaultSortOptions,
    ...initialSortOptions
  });
  
  const [pagination, setPaginationState] = useState<PaginationConfig>({
    ...defaultPagination,
    ...initialPagination
  });
  
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Set up error handler
  const { handleError } = useErrorHandler();
  
  // Use the eventsApi service to fetch events
  // This leverages the useQuery hook for caching, loading state, and error handling
  const { 
    data,
    status,
    error,
    refetch
  } = useQuery<ParkHubEvent[]>('/events');
  
  // Map API response to application model
  const events = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.map(mapParkHubEventToEvent);
  }, [data]);
  
  // Apply filtering
  const filteredEvents = useMemo(() => {
    return filterEvents(events, filterOptions);
  }, [events, filterOptions]);
  
  // Apply sorting
  const sortedEvents = useMemo(() => {
    return sortEvents(filteredEvents, sortOptions);
  }, [filteredEvents, sortOptions]);
  
  // Update pagination whenever filtered results change
  useEffect(() => {
    setPaginationState(prev => ({
      ...prev,
      totalItems: filteredEvents.length,
      totalPages: Math.max(1, Math.ceil(filteredEvents.length / prev.pageSize))
    }));
  }, [filteredEvents]);
  
  // Apply pagination
  const paginatedEvents = useMemo(() => {
    return paginateEvents(sortedEvents, pagination);
  }, [sortedEvents, pagination]);
  
  // Pagination updater that preserves other pagination properties
  const setPagination = useCallback((newPaginationConfig: Partial<PaginationConfig>) => {
    setPaginationState(prev => ({
      ...prev,
      ...newPaginationConfig
    }));
  }, []);
  
  // Event selection handler
  const selectEvent = useCallback((eventId: string | null) => {
    setSelectedEventId(eventId);
  }, []);
  
  // Handle API errors
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);
  
  // Return the complete hook result with all data and functions
  return {
    events,
    filteredEvents,
    paginatedEvents,
    loading: status === ApiStatus.LOADING,
    error,
    filterOptions,
    sortOptions,
    pagination,
    selectedEventId,
    setFilterOptions,
    setSortOptions,
    setPagination,
    selectEvent,
    refetch
  };
};

export default useEvents;