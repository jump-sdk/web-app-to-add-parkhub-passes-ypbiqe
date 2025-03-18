import { useState, useEffect, useCallback, useRef } from 'react'; // ^18.2.0
import { ApiResponse, ApiStatus, QueryOptions, QueryResult } from '../types/common.types';
import { apiClient } from '../services/api/apiClient';
import { useErrorHandler } from './useErrorHandler';
import { useApiKey } from './useApiKey';
import { cacheStorage } from '../services/storage/cacheStorage';
import { retry } from '../utils/retry-logic';

/**
 * Default options for queries with sensible values
 */
const DEFAULT_QUERY_OPTIONS: QueryOptions = {
  enabled: true,
  retry: true,
  retryCount: 3,
  cacheTime: 3600000 // 1 hour cache time in milliseconds
};

/**
 * Custom hook for fetching data from the API with caching and error handling
 * 
 * @template T - The type of data to be returned by the query
 * @param url - The URL to fetch data from
 * @param options - Optional query configuration options
 * @returns QueryResult containing data, loading state, error state, and a refetch function
 */
export function useQuery<T>(url: string, options?: Partial<QueryOptions>): QueryResult<T> {
  // Merge the provided options with default options
  const mergedOptions: QueryOptions = {
    ...DEFAULT_QUERY_OPTIONS,
    ...options
  };

  // Get API key status
  const { hasApiKey } = useApiKey();
  
  // Get error handling functions
  const { handleError, error, clearError } = useErrorHandler({
    retry: mergedOptions.retry,
    maxRetries: mergedOptions.retryCount
  });

  // State for data, loading status, and error
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);

  // Create a cache key based on the URL
  const cacheKey = `query_${url}`;
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  /**
   * Function to fetch data from API or cache
   */
  const fetchData = useCallback(async () => {
    // Clear any previous errors
    clearError();
    
    // Check if data exists in cache before making API request
    const cachedData = cacheStorage.getCacheItem<T>(cacheKey);
    if (cachedData) {
      if (isMounted.current) {
        setData(cachedData);
        setStatus(ApiStatus.SUCCESS);
      }
      return;
    }

    // Set loading state before making the request
    if (isMounted.current) {
      setStatus(ApiStatus.LOADING);
    }

    try {
      // Make the API request
      const response = await apiClient.get<T>(url);

      // Only update state if component is still mounted
      if (isMounted.current) {
        if (response.success && response.data) {
          // Update state with successful response
          setData(response.data);
          setStatus(ApiStatus.SUCCESS);

          // Cache the successful response
          cacheStorage.setCacheItem<T>(cacheKey, response.data, mergedOptions.cacheTime);
        } else if (response.error) {
          // Handle API error response
          setStatus(ApiStatus.ERROR);
          handleError(response.error);
        } else {
          // Handle API success but with no data
          setStatus(ApiStatus.ERROR);
          handleError(new Error('No data returned from API'));
        }
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setStatus(ApiStatus.ERROR);
        handleError(err);
      }
    }
  }, [url, mergedOptions.cacheTime, clearError, handleError]);

  /**
   * Function to manually refetch data
   */
  const refetch = useCallback(async () => {
    // Clear the cache for this query
    cacheStorage.removeCacheItem(cacheKey);
    
    // Fetch fresh data
    await fetchData();
  }, [fetchData, cacheKey]);

  // Effect to fetch data on mount or when dependencies change
  useEffect(() => {
    // Set mounted ref to true
    isMounted.current = true;

    // Only fetch if enabled and API key is available
    if (mergedOptions.enabled) {
      fetchData();
    }

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, mergedOptions.enabled]);

  // Return result object with all relevant data
  return {
    data,
    status,
    error,
    refetch,
    isLoading: status === ApiStatus.LOADING,
    isSuccess: status === ApiStatus.SUCCESS,
    isError: status === ApiStatus.ERROR
  };
}

export default useQuery;