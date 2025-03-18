/**
 * Barrel file for event-related components
 * 
 * This file exports all components and interfaces from the events directory,
 * allowing consumers to import multiple exports from a single path instead of
 * importing each component individually.
 * 
 * @example
 * // Instead of:
 * import EventItem from './components/events/EventItem';
 * import EventsList from './components/events/EventsList';
 * 
 * // You can use:
 * import { EventItem, EventsList } from './components/events';
 */

// Import component defaults
import EventItem from './EventItem';
import EventsFilter from './EventsFilter';
import EventsList from './EventsList';
import EventsTable from './EventsTable';

// Import interfaces
import { EventItemProps } from './EventItem';
import { EventsFilterProps } from './EventsFilter';
import { EventsListProps } from './EventsList';
import { EventsTableProps } from './EventsTable';

// Export all components
export { EventItem, EventsFilter, EventsList, EventsTable };

// Export all interfaces
export { EventItemProps, EventsFilterProps, EventsListProps, EventsTableProps };