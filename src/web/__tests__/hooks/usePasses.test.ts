import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { waitFor, act } from '@testing-library/react';
import { renderHookWithProviders, mockApiKey, mockApiServices } from '../../src/utils/testing';
import { usePasses } from '../../src/hooks/usePasses';
import { passesApi } from '../../src/services/api/passesApi';
import { Pass, PassStatus, PassSpotType, PassSortField, PassFilterOptions, PassSortOptions, PassFormData } from '../../src/types/pass.types';
import { SortDirection } from '../../src/types/common.types';
import { mockEvents } from '../__mocks__/eventsMock';
import { mockPasses, mockParkHubPasses, createMockPass } from '../__mocks__/passesMock';
import { createSuccessResponse, createErrorResponse, createApiError, mockApiErrors } from '../__mocks__/apiResponseMock';

describe('usePasses hook', () => {
  beforeEach(() => {
    // Set up the test environment with mocked API services
    mockApiKey('valid-api-key');
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createSuccessResponse(mockParkHubPasses)),
        createPass: jest.fn().mockResolvedValue(createSuccessResponse({
          success: true,
          passId: 'P98768'
        })),
        createMultiplePasses: jest.fn().mockResolvedValue({
          successful: [
            { passId: 'P98768', barcode: 'BC100004', customerName: 'Michael Williams' },
            { passId: 'P98769', barcode: 'BC100005', customerName: 'Sarah Johnson' }
          ],
          failed: [],
          totalSuccess: 2,
          totalFailed: 0
        })
      }
    });
  });

  afterEach(() => {
    // Clean up the test environment after each test
    jest.resetAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHookWithProviders(() => usePasses());

    expect(result.current.passes).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filterOptions).toEqual({
      status: null,
      spotType: null,
      lotId: null,
      searchTerm: null
    });
    expect(result.current.sortOptions).toEqual({
      field: PassSortField.CREATED_AT,
      direction: SortDirection.DESC
    });
    expect(result.current.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1
    });
  });

  it('should fetch passes when an event is selected', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Act - select an event
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Assert - should be loading
    expect(result.current.loading).toBe(true);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - should have passes
    expect(result.current.passes.length).toBeGreaterThan(0);
    expect(passesApi.getPassesForEvent).toHaveBeenCalledWith({
      eventId: 'EV12345',
      landMarkId: undefined
    });
  });

  it('should handle API errors when fetching passes', async () => {
    // Mock the API to return an error
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createErrorResponse(mockApiErrors.server))
      }
    });

    const { result } = renderHookWithProviders(() => usePasses());

    // Act - select an event
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - should have error and no passes
    expect(result.current.error).not.toBeNull();
    expect(result.current.passes).toEqual([]);
  });

  it('should filter passes based on filter options', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Setup with a mix of passes
    const mixedPasses = [
      createMockPass({ status: PassStatus.ACTIVE, spotType: PassSpotType.REGULAR }),
      createMockPass({ status: PassStatus.INACTIVE, spotType: PassSpotType.VIP }),
      createMockPass({ status: PassStatus.ACTIVE, spotType: PassSpotType.PREMIUM }),
      createMockPass({ status: PassStatus.USED, spotType: PassSpotType.REGULAR }),
    ];

    // Mock the API to return the mixed passes
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createSuccessResponse(
          mixedPasses.map(p => ({
            id: p.id,
            eventId: p.eventId,
            accountId: p.accountId,
            barcode: p.barcode,
            customerName: p.customerName,
            spotType: p.spotType,
            lotId: p.lotId,
            createdAt: p.createdAt.toISOString(),
            status: p.status
          }))
        ))
      }
    });

    // Act - select an event to load passes
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Act - filter by status
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        status: PassStatus.ACTIVE
      });
    });

    // Assert - should only have active passes
    expect(result.current.filteredPasses.every(p => p.status === PassStatus.ACTIVE)).toBe(true);

    // Act - filter by spot type
    act(() => {
      result.current.setFilterOptions({
        ...result.current.filterOptions,
        status: null,
        spotType: PassSpotType.REGULAR
      });
    });

    // Assert - should only have regular passes
    expect(result.current.filteredPasses.every(p => p.spotType === PassSpotType.REGULAR)).toBe(true);

    // Act - filter by search term
    const uniqueName = 'UniqueSearchName';
    const passWithUniqueName = createMockPass({ customerName: uniqueName });
    mixedPasses.push(passWithUniqueName);

    // Update the mock to include the new pass
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createSuccessResponse(
          mixedPasses.map(p => ({
            id: p.id,
            eventId: p.eventId,
            accountId: p.accountId,
            barcode: p.barcode,
            customerName: p.customerName,
            spotType: p.spotType,
            lotId: p.lotId,
            createdAt: p.createdAt.toISOString(),
            status: p.status
          }))
        ))
      }
    });

    // Refetch passes
    act(() => {
      result.current.refetch();
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Filter by the unique name
    act(() => {
      result.current.setFilterOptions({
        status: null,
        spotType: null,
        lotId: null,
        searchTerm: uniqueName
      });
    });

    // Assert - should only find the pass with the unique name
    expect(result.current.filteredPasses.length).toBe(1);
    expect(result.current.filteredPasses[0].customerName).toBe(uniqueName);
  });

  it('should sort passes based on sort options', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Setup with passes having different values for sorting
    const sortablePasses = [
      createMockPass({ barcode: 'BC100003', customerName: 'AAA Person' }),
      createMockPass({ barcode: 'BC100001', customerName: 'CCC Person' }),
      createMockPass({ barcode: 'BC100002', customerName: 'BBB Person' }),
    ];

    // Mock the API to return the sortable passes
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createSuccessResponse(
          sortablePasses.map(p => ({
            id: p.id,
            eventId: p.eventId,
            accountId: p.accountId,
            barcode: p.barcode,
            customerName: p.customerName,
            spotType: p.spotType,
            lotId: p.lotId,
            createdAt: p.createdAt.toISOString(),
            status: p.status
          }))
        ))
      }
    });

    // Act - select an event to load passes
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Act - sort by barcode ascending
    act(() => {
      result.current.setSortOptions({
        field: PassSortField.BARCODE,
        direction: SortDirection.ASC
      });
    });

    // Assert - should be sorted by barcode in ascending order
    expect(result.current.filteredPasses[0].barcode).toBe('BC100001');
    expect(result.current.filteredPasses[1].barcode).toBe('BC100002');
    expect(result.current.filteredPasses[2].barcode).toBe('BC100003');

    // Act - sort by customer name descending
    act(() => {
      result.current.setSortOptions({
        field: PassSortField.CUSTOMER_NAME,
        direction: SortDirection.DESC
      });
    });

    // Assert - should be sorted by customer name in descending order
    expect(result.current.filteredPasses[0].customerName).toBe('CCC Person');
    expect(result.current.filteredPasses[1].customerName).toBe('BBB Person');
    expect(result.current.filteredPasses[2].customerName).toBe('AAA Person');
  });

  it('should paginate passes based on pagination options', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Setup a large number of passes for pagination
    const manyPasses = Array.from({ length: 25 }, (_, i) => 
      createMockPass({ 
        id: `P${98000 + i}`,
        barcode: `BC${100000 + i}` 
      })
    );

    // Mock the API to return the many passes
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createSuccessResponse(
          manyPasses.map(p => ({
            id: p.id,
            eventId: p.eventId,
            accountId: p.accountId,
            barcode: p.barcode,
            customerName: p.customerName,
            spotType: p.spotType,
            lotId: p.lotId,
            createdAt: p.createdAt.toISOString(),
            status: p.status
          }))
        ))
      }
    });

    // Act - select an event to load passes
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Wait for the API call to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - default pagination should show first page with 10 items
    expect(result.current.paginatedPasses.length).toBe(10);
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.totalItems).toBe(25);
    expect(result.current.pagination.totalPages).toBe(3);

    // Act - change page
    act(() => {
      result.current.setPagination({ page: 2 });
    });

    // Assert - should show second page
    expect(result.current.pagination.page).toBe(2);
    expect(result.current.paginatedPasses.length).toBe(10);
    expect(result.current.paginatedPasses[0].id).toBe(manyPasses[10].id);

    // Act - change page size
    act(() => {
      result.current.setPagination({ page: 1, pageSize: 5 });
    });

    // Assert - should show first page with 5 items
    expect(result.current.pagination.pageSize).toBe(5);
    expect(result.current.paginatedPasses.length).toBe(5);
    expect(result.current.pagination.totalPages).toBe(5);
  });

  it('should create a single pass successfully', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Set up mock for createPass API
    const newPassId = 'P98768';
    mockApiServices({
      passesApi: {
        createPass: jest.fn().mockResolvedValue(createSuccessResponse({
          success: true,
          passId: newPassId
        }))
      }
    });

    // Create pass form data
    const passFormData: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC100004',
      customerName: 'Michael Williams',
      spotType: PassSpotType.REGULAR,
      lotId: 'LOT-A'
    };

    // Act - create a pass
    let creationResult;
    await act(async () => {
      creationResult = await result.current.createPass(passFormData);
    });

    // Assert - API should have been called with correct data
    expect(passesApi.createPass).toHaveBeenCalledWith({
      eventId: passFormData.eventId,
      accountId: passFormData.accountId,
      barcode: passFormData.barcode,
      customerName: passFormData.customerName,
      spotType: passFormData.spotType.toString(),
      lotId: passFormData.lotId
    });

    // Assert - creation should be successful
    expect(creationResult.success).toBe(true);
    expect(creationResult.pass.id).toBe(newPassId);
    expect(creationResult.pass.barcode).toBe(passFormData.barcode);
    expect(creationResult.pass.customerName).toBe(passFormData.customerName);
  });

  it('should handle errors when creating a pass', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Set up mock for createPass API to return an error
    const apiError = createApiError('duplicate_barcode', 'Barcode already exists');
    mockApiServices({
      passesApi: {
        createPass: jest.fn().mockResolvedValue(createErrorResponse(apiError))
      }
    });

    // Create pass form data
    const passFormData: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC100004',
      customerName: 'Michael Williams',
      spotType: PassSpotType.REGULAR,
      lotId: 'LOT-A'
    };

    // Act - create a pass
    let creationResult;
    await act(async () => {
      creationResult = await result.current.createPass(passFormData);
    });

    // Assert - API should have been called with the correct data
    expect(passesApi.createPass).toHaveBeenCalled();

    // Assert - creation should have failed
    expect(creationResult.success).toBe(false);
    expect(creationResult.pass).toBe(null);
    expect(creationResult.error).not.toBeNull();
  });

  it('should create multiple passes successfully', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Set up mock for createMultiplePasses API
    const batchResult = {
      successful: [
        { passId: 'P98768', barcode: 'BC100004', customerName: 'Michael Williams' },
        { passId: 'P98769', barcode: 'BC100005', customerName: 'Sarah Johnson' }
      ],
      failed: [],
      totalSuccess: 2,
      totalFailed: 0
    };

    mockApiServices({
      passesApi: {
        createMultiplePasses: jest.fn().mockResolvedValue(batchResult)
      }
    });

    // Create multiple pass form data
    const passesFormData: PassFormData[] = [
      {
        eventId: 'EV12345',
        accountId: 'ABC123',
        barcode: 'BC100004',
        customerName: 'Michael Williams',
        spotType: PassSpotType.REGULAR,
        lotId: 'LOT-A'
      },
      {
        eventId: 'EV12345',
        accountId: 'ABC123',
        barcode: 'BC100005',
        customerName: 'Sarah Johnson',
        spotType: PassSpotType.VIP,
        lotId: 'LOT-B'
      }
    ];

    // Act - create multiple passes
    let creationResult;
    await act(async () => {
      creationResult = await result.current.createMultiplePasses(passesFormData);
    });

    // Assert - API should have been called with correct data
    expect(passesApi.createMultiplePasses).toHaveBeenCalledWith(
      passesFormData.map(p => ({
        eventId: p.eventId,
        accountId: p.accountId,
        barcode: p.barcode,
        customerName: p.customerName,
        spotType: p.spotType.toString(),
        lotId: p.lotId
      }))
    );

    // Assert - creation summary should match expected result
    expect(creationResult.totalSuccess).toBe(2);
    expect(creationResult.totalFailed).toBe(0);
    expect(creationResult.successful.length).toBe(2);
    expect(creationResult.failed.length).toBe(0);
  });

  it('should handle partial success when creating multiple passes', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Set up mock for createMultiplePasses API with partial success
    const batchResult = {
      successful: [
        { passId: 'P98768', barcode: 'BC100004', customerName: 'Michael Williams' }
      ],
      failed: [
        { 
          barcode: 'BC100005', 
          customerName: 'Sarah Johnson',
          error: {
            code: 'duplicate_barcode',
            message: 'Barcode already exists'
          }
        }
      ],
      totalSuccess: 1,
      totalFailed: 1
    };

    mockApiServices({
      passesApi: {
        createMultiplePasses: jest.fn().mockResolvedValue(batchResult)
      }
    });

    // Create multiple pass form data
    const passesFormData: PassFormData[] = [
      {
        eventId: 'EV12345',
        accountId: 'ABC123',
        barcode: 'BC100004',
        customerName: 'Michael Williams',
        spotType: PassSpotType.REGULAR,
        lotId: 'LOT-A'
      },
      {
        eventId: 'EV12345',
        accountId: 'ABC123',
        barcode: 'BC100005',
        customerName: 'Sarah Johnson',
        spotType: PassSpotType.VIP,
        lotId: 'LOT-B'
      }
    ];

    // Act - create multiple passes
    let creationResult;
    await act(async () => {
      creationResult = await result.current.createMultiplePasses(passesFormData);
    });

    // Assert - should have partial success
    expect(creationResult.totalSuccess).toBe(1);
    expect(creationResult.totalFailed).toBe(1);
    expect(creationResult.successful.length).toBe(1);
    expect(creationResult.failed.length).toBe(1);
    
    // Assert - successful pass details
    expect(creationResult.successful[0].barcode).toBe('BC100004');
    expect(creationResult.successful[0].customerName).toBe('Michael Williams');
    
    // Assert - failed pass details
    expect(creationResult.failed[0].barcode).toBe('BC100005');
    expect(creationResult.failed[0].customerName).toBe('Sarah Johnson');
    expect(creationResult.failed[0].error).toBeDefined();
  });

  it('should refetch passes when refetch is called', async () => {
    const { result } = renderHookWithProviders(() => usePasses());

    // Act - select an event to load passes initially
    act(() => {
      result.current.selectEvent('EV12345');
    });

    // Wait for the initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Reset the mock to track new calls
    jest.clearAllMocks();

    // Act - call refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Assert - API was called again with the same event ID
    expect(passesApi.getPassesForEvent).toHaveBeenCalledWith({
      eventId: 'EV12345',
      landMarkId: undefined
    });
  });
});