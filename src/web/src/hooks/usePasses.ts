import { useState, useEffect, useCallback, useMemo } from 'react'; // ^18.2.0
import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { useErrorHandler } from './useErrorHandler';
import { useApiKey } from './useApiKey';
import { useEvents } from './useEvents';
import { passesApi } from '../services/api/passesApi';
import {
  Pass,
  PassStatus,
  PassSpotType,
  PassSortField,
  PassFilterOptions,
  PassSortOptions,
  PassesHookResult,
  PassFormData,
  PassCreationResult,
  PassCreationSummary
} from '../types/pass.types';
import { ParkHubPass } from '../types/api.types';
import { SortDirection, PaginationOptions } from '../types/common.types';
import { formatDate, parseDate } from '../utils/date-helpers';

/**
 * Maps a ParkHub API pass to the application's Pass model
 * @param parkHubPass - Pass data from the ParkHub API
 * @param events - Optional array of events to associate with the pass
 * @returns Mapped pass with formatted date and associated event
 */
const mapParkHubPassToPass = (
  parkHubPass: ParkHubPass,
  events?: Event[]
): Pass => {
  // Parse the createdAt date string from the ParkHub pass
  const dateObj = parseDate(parkHubPass.createdAt) || new Date();
  
  // Format the date for display
  const formattedCreatedAt = formatDate(dateObj);
  
  // Map the status string to the PassStatus enum
  let status: PassStatus;
  switch (parkHubPass.status.toLowerCase()) {
    case 'inactive':
      status = PassStatus.INACTIVE;
      break;
    case 'used':
      status = PassStatus.USED;
      break;
    case 'cancelled':
      status = PassStatus.CANCELLED;
      break;
    case 'active':
    default:
      status = PassStatus.ACTIVE; // Default to active if status is unknown
      break;
  }
  
  // Map the spotType string to the PassSpotType enum
  let spotType: PassSpotType;
  switch (parkHubPass.spotType.toLowerCase()) {
    case 'vip':
      spotType = PassSpotType.VIP;
      break;
    case 'premium':
      spotType = PassSpotType.PREMIUM;
      break;
    case 'regular':
    default:
      spotType = PassSpotType.REGULAR;
      break;
  }
  
  // Find the associated event from the events array if available
  const event = events?.find(e => e.id === parkHubPass.eventId) || null;
  
  // Return a new Pass object with all properties mapped
  return {
    id: parkHubPass.id,
    eventId: parkHubPass.eventId,
    accountId: parkHubPass.accountId,
    barcode: parkHubPass.barcode,
    customerName: parkHubPass.customerName,
    spotType,
    lotId: parkHubPass.lotId,
    createdAt: dateObj,
    formattedCreatedAt,
    status,
    event
  };
};

/**
 * Filters passes based on provided filter options
 * @param passes - Array of passes to filter
 * @param filterOptions - Filter criteria
 * @returns Filtered passes array
 */
const filterPasses = (
  passes: Pass[],
  filterOptions?: PassFilterOptions
): Pass[] => {
  // Return all passes if no filter options are provided
  if (!filterOptions) {
    return passes;
  }
  
  return passes.filter(pass => {
    // Filter by status if specified
    if (filterOptions.status && pass.status !== filterOptions.status) {
      return false;
    }
    
    // Filter by spotType if specified
    if (filterOptions.spotType && pass.spotType !== filterOptions.spotType) {
      return false;
    }
    
    // Filter by lotId if specified
    if (filterOptions.lotId && 
        !pass.lotId.toLowerCase().includes(filterOptions.lotId.toLowerCase())) {
      return false;
    }
    
    // Filter by search term across barcode, customerName, and lotId
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      const barcodeMatch = pass.barcode.toLowerCase().includes(searchTerm);
      const customerNameMatch = pass.customerName.toLowerCase().includes(searchTerm);
      const lotIdMatch = pass.lotId.toLowerCase().includes(searchTerm);
      
      if (!barcodeMatch && !customerNameMatch && !lotIdMatch) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sorts passes based on provided sort options
 * @param passes - Array of passes to sort
 * @param sortOptions - Sort criteria
 * @returns Sorted passes array
 */
const sortPasses = (
  passes: Pass[],
  sortOptions?: PassSortOptions
): Pass[] => {
  // Return passes as-is if no sort options are provided
  if (!sortOptions) {
    return passes;
  }
  
  // Create a new array to avoid mutating the original
  const sortedPasses = [...passes];
  
  // Sort by the specified field and direction
  sortedPasses.sort((a, b) => {
    let comparison = 0;
    
    switch (sortOptions.field) {
      case PassSortField.ID:
        comparison = a.id.localeCompare(b.id);
        break;
      case PassSortField.BARCODE:
        comparison = a.barcode.localeCompare(b.barcode);
        break;
      case PassSortField.CUSTOMER_NAME:
        comparison = a.customerName.localeCompare(b.customerName);
        break;
      case PassSortField.SPOT_TYPE:
        comparison = a.spotType.localeCompare(b.spotType);
        break;
      case PassSortField.LOT_ID:
        comparison = a.lotId.localeCompare(b.lotId);
        break;
      case PassSortField.CREATED_AT:
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case PassSortField.STATUS:
        comparison = a.status.localeCompare(b.status);
        break;
      default:
        comparison = 0;
    }
    
    // Apply the sort direction
    return sortOptions.direction === SortDirection.ASC ? comparison : -comparison;
  });
  
  return sortedPasses;
};

/**
 * Paginates passes based on pagination configuration
 * @param passes - Array of passes to paginate
 * @param pagination - Pagination configuration
 * @returns Paginated passes array
 */
const paginatePasses = (
  passes: Pass[],
  pagination?: PaginationOptions
): Pass[] => {
  // Return all passes if no pagination config is provided
  if (!pagination) {
    return passes;
  }
  
  // Calculate the start and end indices based on page and pageSize
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  
  // Slice the passes array to get the current page of passes
  return passes.slice(startIndex, endIndex);
};

/**
 * Custom hook for managing passes data, filtering, sorting, pagination, and creation
 * 
 * @param initialFilterOptions - Initial filter options
 * @param initialSortOptions - Initial sort options
 * @param initialPagination - Initial pagination configuration
 * @returns Object containing passes data and management functions
 */
export const usePasses = (
  initialFilterOptions?: PassFilterOptions,
  initialSortOptions?: PassSortOptions,
  initialPagination?: PaginationOptions
): PassesHookResult => {
  // Set up default values
  const defaultFilterOptions: PassFilterOptions = {
    status: null,
    spotType: null,
    lotId: null,
    searchTerm: null
  };
  
  const defaultSortOptions: PassSortOptions = {
    field: PassSortField.CREATED_AT,
    direction: SortDirection.DESC // Newest passes first
  };
  
  const defaultPagination: PaginationOptions = {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  };
  
  // Initialize state with defaults merged with any provided initial values
  const [filterOptions, setFilterOptions] = useState<PassFilterOptions>({
    ...defaultFilterOptions,
    ...initialFilterOptions
  });
  
  const [sortOptions, setSortOptions] = useState<PassSortOptions>({
    ...defaultSortOptions,
    ...initialSortOptions
  });
  
  const [pagination, setPaginationState] = useState<PaginationOptions>({
    ...defaultPagination,
    ...initialPagination
  });
  
  const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Get API key status
  const { apiKey } = useApiKey();
  
  // Get events data
  const { events } = useEvents();
  
  // Set up error handler
  const { handleError } = useErrorHandler();
  
  // Create a memoized fetch function for passes
  const fetchPasses = useCallback(() => {
    if (!selectedEventId) {
      return null;
    }
    
    return passesApi.getPassesForEvent({
      eventId: selectedEventId,
      landMarkId: undefined // Will use default from API
    });
  }, [selectedEventId]);
  
  // Use the useQuery hook to fetch passes when an event is selected
  const {
    data,
    status,
    error,
    refetch
  } = useQuery(
    selectedEventId ? `passes?eventId=${selectedEventId}` : null,
    {
      enabled: Boolean(selectedEventId && apiKey)
    }
  );
  
  // Map API response to application model
  const passes = useMemo(() => {
    if (!data) {
      return [];
    }
    
    // If data is an array, map each ParkHubPass to a Pass
    return (Array.isArray(data) ? data : []).map((parkHubPass: ParkHubPass) => 
      mapParkHubPassToPass(parkHubPass, events)
    );
  }, [data, events]);
  
  // Apply filtering
  const filteredPasses = useMemo(() => {
    return filterPasses(passes, filterOptions);
  }, [passes, filterOptions]);
  
  // Apply sorting
  const sortedPasses = useMemo(() => {
    return sortPasses(filteredPasses, sortOptions);
  }, [filteredPasses, sortOptions]);
  
  // Update pagination whenever filtered results change
  useEffect(() => {
    setPaginationState(prev => ({
      ...prev,
      totalItems: filteredPasses.length,
      totalPages: Math.max(1, Math.ceil(filteredPasses.length / prev.pageSize))
    }));
  }, [filteredPasses]);
  
  // Apply pagination
  const paginatedPasses = useMemo(() => {
    return paginatePasses(sortedPasses, pagination);
  }, [sortedPasses, pagination]);
  
  // Set up mutation for creating a single pass
  const createPassMutation = useMutation((passData: PassFormData) => 
    passesApi.createPass({
      eventId: passData.eventId,
      accountId: passData.accountId,
      barcode: passData.barcode,
      customerName: passData.customerName,
      spotType: passData.spotType.toString(),
      lotId: passData.lotId
    })
  );
  
  // Set up mutation for creating multiple passes
  const createMultiplePassesMutation = useMutation((passesData: PassFormData[]) => 
    passesApi.createMultiplePasses(
      passesData.map(pass => ({
        eventId: pass.eventId,
        accountId: pass.accountId,
        barcode: pass.barcode,
        customerName: pass.customerName,
        spotType: pass.spotType.toString(),
        lotId: pass.lotId
      }))
    )
  );
  
  // Pagination updater that preserves other pagination properties
  const setPagination = useCallback((newPaginationConfig: Partial<PaginationOptions>) => {
    setPaginationState(prev => ({
      ...prev,
      ...newPaginationConfig
    }));
  }, []);
  
  // Pass selection handler
  const selectPass = useCallback((passId: string | null) => {
    setSelectedPassId(passId);
  }, []);
  
  // Event selection handler
  const selectEvent = useCallback((eventId: string | null) => {
    setSelectedEventId(eventId);
    
    // Reset pagination when changing events
    setPaginationState(prev => ({
      ...prev,
      page: 1
    }));
    
    // Clear selected pass when changing events
    setSelectedPassId(null);
  }, []);
  
  // Create a single pass
  const createPass = useCallback(async (passData: PassFormData): Promise<PassCreationResult> => {
    try {
      // Validate pass data
      if (!passData.eventId || 
          !passData.accountId || 
          !passData.barcode || 
          !passData.customerName || 
          !passData.spotType || 
          !passData.lotId) {
        throw new Error('All pass fields are required');
      }
      
      // Create the pass using the mutation
      const response = await createPassMutation.mutate({
        eventId: passData.eventId,
        accountId: passData.accountId,
        barcode: passData.barcode,
        customerName: passData.customerName,
        spotType: passData.spotType.toString(),
        lotId: passData.lotId
      });
      
      if (response.success && response.data) {
        // Create a Pass object from the successful creation
        const newPass: Pass = {
          id: response.data.passId || '',
          eventId: passData.eventId,
          accountId: passData.accountId,
          barcode: passData.barcode,
          customerName: passData.customerName,
          spotType: passData.spotType,
          lotId: passData.lotId,
          createdAt: new Date(),
          formattedCreatedAt: formatDate(new Date()),
          status: PassStatus.ACTIVE,
          event: events?.find(e => e.id === passData.eventId) || null
        };
        
        // Refetch passes to update the list
        refetch();
        
        return {
          success: true,
          pass: newPass,
          error: null
        };
      } else {
        return {
          success: false,
          pass: null,
          error: response.error || new Error('Failed to create pass')
        };
      }
    } catch (err) {
      // Handle errors
      handleError(err);
      
      return {
        success: false,
        pass: null,
        error: err instanceof Error ? err : new Error('Unknown error creating pass')
      };
    }
  }, [createPassMutation, events, handleError, refetch]);
  
  // Create multiple passes
  const createMultiplePasses = useCallback(async (passesData: PassFormData[]): Promise<PassCreationSummary> => {
    try {
      // Validate that we have passes to create
      if (!passesData.length) {
        throw new Error('At least one pass is required');
      }
      
      // Get the event ID from the first pass (all passes should be for the same event)
      const eventId = passesData[0].eventId;
      
      // Create passes using the mutation
      const result = await createMultiplePassesMutation.mutate(
        passesData.map(pass => ({
          eventId: pass.eventId,
          accountId: pass.accountId,
          barcode: pass.barcode,
          customerName: pass.customerName,
          spotType: pass.spotType.toString(),
          lotId: pass.lotId
        }))
      );
      
      // Process results
      const successful: Pass[] = result.successful.map(success => ({
        id: success.passId,
        eventId,
        accountId: passesData.find(p => p.barcode === success.barcode)?.accountId || '',
        barcode: success.barcode,
        customerName: success.customerName,
        spotType: passesData.find(p => p.barcode === success.barcode)?.spotType || PassSpotType.REGULAR,
        lotId: passesData.find(p => p.barcode === success.barcode)?.lotId || '',
        createdAt: new Date(),
        formattedCreatedAt: formatDate(new Date()),
        status: PassStatus.ACTIVE,
        event: events?.find(e => e.id === eventId) || null
      }));
      
      const failed = result.failed.map(failure => ({
        barcode: failure.barcode,
        customerName: failure.customerName,
        error: new Error(failure.error.message || 'Unknown error')
      }));
      
      // Refetch passes to update the list
      refetch();
      
      return {
        eventId,
        event: events?.find(e => e.id === eventId) || null,
        successful,
        failed,
        totalSuccess: result.totalSuccess,
        totalFailed: result.totalFailed
      };
    } catch (err) {
      // Handle errors
      handleError(err);
      
      // Get the event ID from the first pass (all passes should be for the same event)
      const eventId = passesData.length > 0 ? passesData[0].eventId : '';
      
      return {
        eventId,
        event: events?.find(e => e.id === eventId) || null,
        successful: [],
        failed: passesData.map(passData => ({
          barcode: passData.barcode,
          customerName: passData.customerName,
          error: err instanceof Error ? err : new Error('Unknown error creating passes')
        })),
        totalSuccess: 0,
        totalFailed: passesData.length
      };
    }
  }, [createMultiplePassesMutation, events, handleError, refetch]);
  
  // Handle API errors
  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);
  
  // Calculate loading state
  const loading = status === 'loading';
  
  // Return the complete hook result with all data and functions
  return {
    passes,
    filteredPasses,
    paginatedPasses,
    loading,
    error,
    filterOptions,
    sortOptions,
    pagination,
    selectedPassId,
    selectedEventId,
    setFilterOptions,
    setSortOptions,
    setPagination,
    selectPass,
    selectEvent,
    createPass,
    createMultiplePasses,
    refetch
  };
};

export default usePasses;