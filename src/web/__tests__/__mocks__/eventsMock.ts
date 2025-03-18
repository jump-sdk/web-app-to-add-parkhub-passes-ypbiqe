import { Event, EventStatus } from '../../src/types/event.types';
import { ParkHubEvent } from '../../src/types/api.types';
import { createSuccessResponse } from './apiResponseMock';
import { ApiResponse } from '../../src/types/common.types';

/**
 * Creates a mock Event object with customizable properties
 * @param overrides - Optional properties to override default values
 * @returns A complete mock Event object
 */
export function createMockEvent(overrides: Partial<Event> = {}): Event {
  const id = overrides.id || `EV${Math.floor(10000 + Math.random() * 90000)}`;
  const date = overrides.date || new Date(2023, 9, 15, 19, 0); // Default: Oct 15, 2023, 7:00 PM
  
  const defaultEvent: Event = {
    id,
    name: 'Football vs. Rivals',
    date,
    formattedDate: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    formattedTime: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    venue: 'Stadium1',
    status: EventStatus.ACTIVE,
  };

  return { ...defaultEvent, ...overrides };
}

/**
 * Creates a mock ParkHubEvent object as it would be returned from the API
 * @param overrides - Optional properties to override default values
 * @returns A complete mock ParkHubEvent object
 */
export function createMockParkHubEvent(overrides: Partial<ParkHubEvent> = {}): ParkHubEvent {
  const id = overrides.id || `EV${Math.floor(10000 + Math.random() * 90000)}`;
  const date = overrides.date || new Date(2023, 9, 15, 19, 0).toISOString(); // Default: Oct 15, 2023, 7:00 PM
  
  const defaultEvent: ParkHubEvent = {
    id,
    name: 'Football vs. Rivals',
    date,
    venue: 'Stadium1',
    status: 'active',
  };

  return { ...defaultEvent, ...overrides };
}

/**
 * Creates a mock API response containing an array of ParkHubEvent objects
 * @param events - Array of ParkHubEvent objects to include in the response
 * @returns A standardized API response containing the provided events
 */
export function createMockEventResponse(events: ParkHubEvent[]): ApiResponse<ParkHubEvent[]> {
  return createSuccessResponse(events);
}

/**
 * Generates an array of mock Event objects with the specified count
 * @param count - Number of mock events to generate
 * @returns Array of mock Event objects
 */
export function generateMockEvents(count: number): Event[] {
  const events: Event[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i); // Each event is on a different day
    
    // Create some variety in the events
    const event = createMockEvent({
      id: `EV${10001 + i}`,
      name: `Event ${i + 1}`,
      date,
      venue: i % 3 === 0 ? 'Stadium1' : i % 3 === 1 ? 'Arena2' : 'Field3',
      status: i % 4 === 0 ? EventStatus.ACTIVE : 
              i % 4 === 1 ? EventStatus.INACTIVE : 
              i % 4 === 2 ? EventStatus.COMPLETED : 
              EventStatus.CANCELLED
    });
    
    events.push(event);
  }
  
  return events;
}

/**
 * Default array of mock Event objects for testing
 */
export const mockEvents: Event[] = [
  createMockEvent({
    id: 'EV12345',
    name: 'Football vs. Rivals',
    date: new Date(2023, 9, 15, 19, 0), // Oct 15, 2023, 7:00 PM
    venue: 'Stadium1',
    status: EventStatus.ACTIVE
  }),
  createMockEvent({
    id: 'EV12346',
    name: 'Concert: Rock Band',
    date: new Date(2023, 9, 22, 20, 0), // Oct 22, 2023, 8:00 PM
    venue: 'Stadium1',
    status: EventStatus.ACTIVE
  }),
  createMockEvent({
    id: 'EV12347',
    name: 'Basketball Tournament',
    date: new Date(2023, 10, 5, 18, 30), // Nov 5, 2023, 6:30 PM
    venue: 'Arena2',
    status: EventStatus.ACTIVE
  }),
  createMockEvent({
    id: 'EV12348',
    name: 'Baseball Championship',
    date: new Date(2023, 10, 12, 13, 0), // Nov 12, 2023, 1:00 PM
    venue: 'Field3',
    status: EventStatus.ACTIVE
  }),
  createMockEvent({
    id: 'EV12349',
    name: 'Soccer Match',
    date: new Date(2023, 10, 18, 15, 0), // Nov 18, 2023, 3:00 PM
    venue: 'Stadium1',
    status: EventStatus.ACTIVE
  })
];

/**
 * Default array of mock ParkHubEvent objects for testing API responses
 */
export const mockParkHubEvents: ParkHubEvent[] = mockEvents.map(event => ({
  id: event.id,
  name: event.name,
  date: event.date.toISOString(),
  venue: event.venue,
  status: event.status
}));