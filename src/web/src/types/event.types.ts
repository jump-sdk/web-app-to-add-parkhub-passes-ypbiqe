import { SortDirection, PaginationOptions } from './common.types';
import { ParkHubEvent } from './api.types';
import React from 'react';

/**
 * Enum representing possible event statuses in the application.
 */
export enum EventStatus {
  /** Event is currently active */
  ACTIVE = 'active',
  /** Event is inactive */
  INACTIVE = 'inactive',
  /** Event has concluded */
  COMPLETED = 'completed',
  /** Event was cancelled */
  CANCELLED = 'cancelled'
}

/**
 * Enum representing possible fields for sorting events.
 */
export enum EventSortField {
  /** Sort by event date */
  DATE = 'date',
  /** Sort by event name */
  NAME = 'name',
  /** Sort by venue name */
  VENUE = 'venue',
  /** Sort by event status */
  STATUS = 'status'
}

/**
 * Interface representing an event in the application with formatted date and time.
 * This is the application's internal model converted from the ParkHubEvent API model.
 */
export interface Event {
  /** Unique identifier for the event */
  id: string;
  /** Name of the event */
  name: string;
  /** Date and time of the event as a Date object */
  date: Date;
  /** Formatted date string for display (e.g., "2023-10-15") */
  formattedDate: string;
  /** Formatted time string for display (e.g., "7:00 PM") */
  formattedTime: string;
  /** Venue where the event is taking place */
  venue: string;
  /** Current status of the event */
  status: EventStatus;
}

/**
 * Interface for filtering options specific to events.
 */
export interface EventFilterOptions {
  /** Filter by event status */
  status: EventStatus | null;
  /** Filter by venue */
  venue: string | null;
  /** Filter by start date */
  dateFrom: Date | null;
  /** Filter by end date */
  dateTo: Date | null;
  /** Filter by search term (searches in name and venue) */
  searchTerm: string | null;
}

/**
 * Interface for sorting options specific to events.
 */
export interface EventSortOptions {
  /** Field to sort by */
  field: EventSortField;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Interface for pagination configuration for events lists.
 * Extends the common PaginationOptions interface.
 */
export interface PaginationConfig extends PaginationOptions {
  // Any event-specific pagination properties could be added here
}

/**
 * Interface representing the complete state for events management.
 */
export interface EventsState {
  /** Complete list of events */
  events: Event[];
  /** Filtered list of events based on current filter options */
  filteredEvents: Event[];
  /** Paginated list of events to display */
  paginatedEvents: Event[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filter options */
  filterOptions: EventFilterOptions;
  /** Current sort options */
  sortOptions: EventSortOptions;
  /** Current pagination state */
  pagination: PaginationConfig;
  /** Currently selected event ID */
  selectedEventId: string | null;
}

/**
 * Interface representing the return value of the useEvents hook.
 */
export interface EventsHookResult {
  /** Complete list of events */
  events: Event[];
  /** Filtered list of events based on current filter options */
  filteredEvents: Event[];
  /** Paginated list of events to display */
  paginatedEvents: Event[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current filter options */
  filterOptions: EventFilterOptions;
  /** Current sort options */
  sortOptions: EventSortOptions;
  /** Current pagination state */
  pagination: PaginationConfig;
  /** Currently selected event ID */
  selectedEventId: string | null;
  /** Set filter options */
  setFilterOptions: (options: EventFilterOptions) => void;
  /** Set sort options */
  setSortOptions: (options: EventSortOptions) => void;
  /** Set pagination configuration */
  setPagination: (config: Partial<PaginationConfig>) => void;
  /** Select an event by ID */
  selectEvent: (eventId: string | null) => void;
  /** Refetch events data */
  refetch: () => Promise<void>;
}

/**
 * Interface for table column configuration specific to events.
 */
export interface EventTableColumn {
  /** Unique column identifier */
  id: string;
  /** Display label for column header */
  label: string;
  /** Field of the Event interface this column displays */
  field: keyof Event;
  /** Whether this column is sortable */
  sortable: boolean;
  /** Column width */
  width: string | number;
  /** Column text alignment */
  align: 'left' | 'right' | 'center';
  /** Optional formatter function for cell values */
  format?: (value: any, event: Event) => React.ReactNode;
}