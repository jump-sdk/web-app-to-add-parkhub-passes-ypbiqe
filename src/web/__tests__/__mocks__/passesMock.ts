import { Pass, PassStatus, PassSpotType } from '../../src/types/pass.types';
import { ParkHubPass, CreatePassResponse } from '../../src/types/api.types';
import { createSuccessResponse } from './apiResponseMock';
import { mockEvents } from './eventsMock';
import { ApiResponse } from '../../src/types/common.types';

/**
 * Creates a mock Pass object with customizable properties
 * @param overrides - Optional properties to override default values
 * @returns A complete mock Pass object
 */
export function createMockPass(overrides: Partial<Pass> = {}): Pass {
  const id = overrides.id || `P${Math.floor(10000 + Math.random() * 90000)}`;
  const createdAt = overrides.createdAt || new Date(2023, 8, 1, 14, 30); // Default: Sep 1, 2023, 2:30 PM
  
  const defaultPass: Pass = {
    id,
    eventId: overrides.eventId || 'EV12345',
    accountId: 'ABC123',
    barcode: `BC${100000 + parseInt(id.substring(1), 10)}`,
    customerName: 'John Smith',
    spotType: PassSpotType.REGULAR,
    lotId: 'LOT-A',
    createdAt,
    formattedCreatedAt: createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: PassStatus.ACTIVE,
    event: mockEvents.find(event => event.id === (overrides.eventId || 'EV12345')) || null
  };

  return { ...defaultPass, ...overrides };
}

/**
 * Creates a mock ParkHubPass object as it would be returned from the API
 * @param overrides - Optional properties to override default values
 * @returns A complete mock ParkHubPass object
 */
export function createMockParkHubPass(overrides: Partial<ParkHubPass> = {}): ParkHubPass {
  const id = overrides.id || `P${Math.floor(10000 + Math.random() * 90000)}`;
  const createdAt = overrides.createdAt || new Date(2023, 8, 1, 14, 30).toISOString(); // Default: Sep 1, 2023, 2:30 PM
  
  const defaultPass: ParkHubPass = {
    id,
    eventId: overrides.eventId || 'EV12345',
    accountId: 'ABC123',
    barcode: `BC${100000 + parseInt(id.substring(1), 10)}`,
    customerName: 'John Smith',
    spotType: 'Regular',
    lotId: 'LOT-A',
    createdAt,
    status: 'active'
  };

  return { ...defaultPass, ...overrides };
}

/**
 * Creates a mock API response containing an array of ParkHubPass objects
 * @param passes - Array of ParkHubPass objects to include in the response
 * @returns A standardized API response containing the provided passes
 */
export function createMockPassResponse(passes: ParkHubPass[]): ApiResponse<ParkHubPass[]> {
  return createSuccessResponse(passes);
}

/**
 * Creates a mock API response for pass creation
 * @param passId - ID of the created pass
 * @returns A standardized API response for pass creation
 */
export function createMockPassCreationResponse(passId: string): ApiResponse<CreatePassResponse> {
  return createSuccessResponse({
    success: true,
    passId
  });
}

/**
 * Generates an array of mock Pass objects for a specific event with the specified count
 * @param eventId - The event ID to associate with the passes
 * @param count - Number of mock passes to generate
 * @returns Array of mock Pass objects
 */
export function generateMockPasses(eventId: string, count: number): Pass[] {
  const passes: Pass[] = [];
  const event = mockEvents.find(event => event.id === eventId) || null;
  
  for (let i = 0; i < count; i++) {
    const id = `P${98760 + i}`;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Random date within the last 30 days
    
    // Create some variety in the passes
    const pass = createMockPass({
      id,
      eventId,
      barcode: `BC${100000 + i}`,
      customerName: ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Williams', 'David Brown'][i % 5],
      spotType: [PassSpotType.REGULAR, PassSpotType.VIP, PassSpotType.PREMIUM][i % 3],
      lotId: ['LOT-A', 'LOT-B', 'LOT-C'][i % 3],
      createdAt,
      status: [PassStatus.ACTIVE, PassStatus.INACTIVE, PassStatus.USED, PassStatus.CANCELLED][i % 4],
      event
    });
    
    passes.push(pass);
  }
  
  return passes;
}

/**
 * Default array of mock Pass objects for testing
 */
export const mockPasses: Pass[] = [
  createMockPass({
    id: 'P98765',
    eventId: 'EV12345',
    barcode: 'BC100001',
    customerName: 'John Smith',
    spotType: PassSpotType.VIP,
    lotId: 'LOT-A',
    createdAt: new Date(2023, 8, 1, 14, 30), // Sep 1, 2023, 2:30 PM
    status: PassStatus.ACTIVE
  }),
  createMockPass({
    id: 'P98766',
    eventId: 'EV12345',
    barcode: 'BC100002',
    customerName: 'Jane Doe',
    spotType: PassSpotType.REGULAR,
    lotId: 'LOT-B',
    createdAt: new Date(2023, 8, 2, 9, 15), // Sep 2, 2023, 9:15 AM
    status: PassStatus.ACTIVE
  }),
  createMockPass({
    id: 'P98767',
    eventId: 'EV12345',
    barcode: 'BC100003',
    customerName: 'Bob Johnson',
    spotType: PassSpotType.PREMIUM,
    lotId: 'LOT-A',
    createdAt: new Date(2023, 8, 3, 11, 45), // Sep 3, 2023, 11:45 AM
    status: PassStatus.ACTIVE
  }),
  createMockPass({
    id: 'P98768',
    eventId: 'EV12346',
    barcode: 'BC100004',
    customerName: 'Alice Williams',
    spotType: PassSpotType.REGULAR,
    lotId: 'LOT-C',
    createdAt: new Date(2023, 8, 5, 16, 20), // Sep 5, 2023, 4:20 PM
    status: PassStatus.ACTIVE
  }),
  createMockPass({
    id: 'P98769',
    eventId: 'EV12346',
    barcode: 'BC100005',
    customerName: 'David Brown',
    spotType: PassSpotType.VIP,
    lotId: 'LOT-B',
    createdAt: new Date(2023, 8, 6, 10, 0), // Sep 6, 2023, 10:00 AM
    status: PassStatus.ACTIVE
  })
];

/**
 * Default array of mock ParkHubPass objects for testing API responses
 */
export const mockParkHubPasses: ParkHubPass[] = mockPasses.map(pass => ({
  id: pass.id,
  eventId: pass.eventId,
  accountId: pass.accountId,
  barcode: pass.barcode,
  customerName: pass.customerName,
  spotType: pass.spotType,
  lotId: pass.lotId,
  createdAt: pass.createdAt.toISOString(),
  status: pass.status
}));