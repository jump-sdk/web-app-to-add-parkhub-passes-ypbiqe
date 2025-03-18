import { StorageType, StorageOptions, CachedItem } from '../../types/storage.types';
import { EVENTS_CACHE, PASSES_CACHE } from '../../constants/storageKeys';
import { 
  getItem, 
  setItem, 
  removeItem, 
  getCachedData, 
  setCachedData,
  clearExpiredCache,
  getStorageInstance
} from '../../utils/storage-helpers';
import { ParkHubEvent, ParkHubPass } from '../../types/api.types';

/**
 * Default expiration time for cached items (1 hour in milliseconds)
 */
export const DEFAULT_CACHE_EXPIRY = 3600000; // 1 hour

/**
 * Default storage options for cache operations
 */
const DEFAULT_STORAGE_OPTIONS: StorageOptions = { 
  type: StorageType.LOCAL, 
  expiry: DEFAULT_CACHE_EXPIRY,
  encrypt: false
};

/**
 * Retrieves cached event data from storage if not expired
 * @returns Array of cached events or null if not found or expired
 */
export const getEventCache = (): ParkHubEvent[] | null => {
  try {
    return getCachedData<ParkHubEvent[]>(EVENTS_CACHE, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error retrieving event cache:', error);
    return null;
  }
};

/**
 * Stores event data in cache with an expiration time
 * @param events - The events data to cache
 * @param expiryInMs - Optional custom expiration time in milliseconds
 * @returns True if caching was successful, false otherwise
 */
export const setEventCache = (
  events: ParkHubEvent[],
  expiryInMs?: number
): boolean => {
  try {
    if (!Array.isArray(events)) {
      console.warn('Invalid events data for caching');
      return false;
    }

    const expiry = expiryInMs || DEFAULT_CACHE_EXPIRY;
    return setCachedData(EVENTS_CACHE, events, expiry, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error setting event cache:', error);
    return false;
  }
};

/**
 * Retrieves cached passes data for a specific event from storage if not expired
 * @param eventId - The event ID to get passes for
 * @returns Array of cached passes or null if not found or expired
 */
export const getPassesCache = (eventId: string): ParkHubPass[] | null => {
  try {
    if (!eventId || typeof eventId !== 'string') {
      console.warn('Invalid eventId for retrieving passes cache');
      return null;
    }

    const cacheKey = `${PASSES_CACHE}${eventId}`;
    return getCachedData<ParkHubPass[]>(cacheKey, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error retrieving passes cache for event ${eventId}:`, error);
    return null;
  }
};

/**
 * Stores passes data for a specific event in cache with an expiration time
 * @param eventId - The event ID the passes belong to
 * @param passes - The passes data to cache
 * @param expiryInMs - Optional custom expiration time in milliseconds
 * @returns True if caching was successful, false otherwise
 */
export const setPassesCache = (
  eventId: string,
  passes: ParkHubPass[],
  expiryInMs?: number
): boolean => {
  try {
    if (!eventId || typeof eventId !== 'string') {
      console.warn('Invalid eventId for caching passes');
      return false;
    }

    if (!Array.isArray(passes)) {
      console.warn('Invalid passes data for caching');
      return false;
    }

    const cacheKey = `${PASSES_CACHE}${eventId}`;
    const expiry = expiryInMs || DEFAULT_CACHE_EXPIRY;
    return setCachedData(cacheKey, passes, expiry, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error setting passes cache for event ${eventId}:`, error);
    return false;
  }
};

/**
 * Removes cached event data from storage
 * @returns True if removal was successful, false otherwise
 */
export const clearEventCache = (): boolean => {
  try {
    return removeItem(EVENTS_CACHE, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error clearing event cache:', error);
    return false;
  }
};

/**
 * Removes cached passes data for a specific event from storage
 * @param eventId - The event ID to clear passes for
 * @returns True if removal was successful, false otherwise
 */
export const clearPassesCache = (eventId: string): boolean => {
  try {
    if (!eventId || typeof eventId !== 'string') {
      console.warn('Invalid eventId for clearing passes cache');
      return false;
    }

    const cacheKey = `${PASSES_CACHE}${eventId}`;
    return removeItem(cacheKey, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error clearing passes cache for event ${eventId}:`, error);
    return false;
  }
};

/**
 * Removes all cached passes data from storage by finding keys with the PASSES_CACHE prefix
 * @returns True if removal was successful, false otherwise
 */
export const clearAllPassesCache = (): boolean => {
  try {
    const storage = getStorageInstance(StorageType.LOCAL);
    let success = true;
    
    // Iterate through all keys in storage and remove those that start with PASSES_CACHE
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(PASSES_CACHE)) {
        const removed = removeItem(key, DEFAULT_STORAGE_OPTIONS);
        if (!removed) {
          success = false;
        }
      }
    }
    return success;
  } catch (error) {
    console.error('Error clearing all passes cache:', error);
    return false;
  }
};

/**
 * Removes all cached data managed by this service from storage
 * @returns True if removal was successful, false otherwise
 */
export const clearAllCache = (): boolean => {
  try {
    const eventCacheCleared = clearEventCache();
    const passesCacheCleared = clearAllPassesCache();
    return eventCacheCleared && passesCacheCleared;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

/**
 * Removes all expired cached items from storage
 * @returns Number of expired items removed
 */
export const clearExpired = (): number => {
  try {
    return clearExpiredCache(StorageType.LOCAL);
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return 0;
  }
};

/**
 * Generic method to retrieve any cached item by key
 * @param key - The cache key
 * @returns The cached item or null if not found or expired
 */
export const getCacheItem = <T>(key: string): T | null => {
  try {
    return getCachedData<T>(key, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error retrieving cache item for key ${key}:`, error);
    return null;
  }
};

/**
 * Generic method to store any item in cache with an expiration time
 * @param key - The cache key
 * @param data - The data to cache
 * @param expiryInMs - Optional custom expiration time in milliseconds
 * @returns True if caching was successful, false otherwise
 */
export const setCacheItem = <T>(
  key: string,
  data: T,
  expiryInMs?: number
): boolean => {
  try {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid key for caching item');
      return false;
    }

    const expiry = expiryInMs || DEFAULT_CACHE_EXPIRY;
    return setCachedData(key, data, expiry, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error setting cache item for key ${key}:`, error);
    return false;
  }
};

/**
 * Generic method to remove any cached item by key
 * @param key - The cache key
 * @returns True if removal was successful, false otherwise
 */
export const removeCacheItem = (key: string): boolean => {
  try {
    if (!key || typeof key !== 'string') {
      console.warn('Invalid key for removing cache item');
      return false;
    }

    return removeItem(key, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error(`Error removing cache item for key ${key}:`, error);
    return false;
  }
};

/**
 * Service class for caching API responses and other data in browser storage with expiration times
 */
export class CacheStorage {
  /**
   * Default expiration time for cached items in milliseconds
   */
  private defaultExpiry: number;
  
  /**
   * Initializes a new instance of the CacheStorage class
   */
  constructor() {
    this.defaultExpiry = DEFAULT_CACHE_EXPIRY;
    // Clean up expired cache items on initialization
    this.clearExpired();
  }

  /**
   * Retrieves cached event data from storage if not expired
   * @returns Array of cached events or null if not found or expired
   */
  getEventCache(): ParkHubEvent[] | null {
    return getEventCache();
  }

  /**
   * Stores event data in cache with an expiration time
   * @param events - The events data to cache
   * @param expiryInMs - Optional custom expiration time in milliseconds
   * @returns True if caching was successful, false otherwise
   */
  setEventCache(events: ParkHubEvent[], expiryInMs?: number): boolean {
    return setEventCache(events, expiryInMs);
  }

  /**
   * Retrieves cached passes data for a specific event from storage if not expired
   * @param eventId - The event ID to get passes for
   * @returns Array of cached passes or null if not found or expired
   */
  getPassesCache(eventId: string): ParkHubPass[] | null {
    return getPassesCache(eventId);
  }

  /**
   * Stores passes data for a specific event in cache with an expiration time
   * @param eventId - The event ID the passes belong to
   * @param passes - The passes data to cache
   * @param expiryInMs - Optional custom expiration time in milliseconds
   * @returns True if caching was successful, false otherwise
   */
  setPassesCache(
    eventId: string,
    passes: ParkHubPass[],
    expiryInMs?: number
  ): boolean {
    return setPassesCache(eventId, passes, expiryInMs);
  }

  /**
   * Removes cached event data from storage
   * @returns True if removal was successful, false otherwise
   */
  clearEventCache(): boolean {
    return clearEventCache();
  }

  /**
   * Removes cached passes data for a specific event from storage
   * @param eventId - The event ID to clear passes for
   * @returns True if removal was successful, false otherwise
   */
  clearPassesCache(eventId: string): boolean {
    return clearPassesCache(eventId);
  }

  /**
   * Removes all cached passes data from storage
   * @returns True if removal was successful, false otherwise
   */
  clearAllPassesCache(): boolean {
    return clearAllPassesCache();
  }

  /**
   * Removes all cached data managed by this service from storage
   * @returns True if removal was successful, false otherwise
   */
  clearAllCache(): boolean {
    return clearAllCache();
  }

  /**
   * Removes all expired cached items from storage
   * @returns Number of expired items removed
   */
  clearExpired(): number {
    return clearExpired();
  }

  /**
   * Generic method to retrieve any cached item by key
   * @param key - The cache key
   * @returns The cached item or null if not found or expired
   */
  getCacheItem<T>(key: string): T | null {
    return getCacheItem<T>(key);
  }

  /**
   * Generic method to store any item in cache with an expiration time
   * @param key - The cache key
   * @param data - The data to cache
   * @param expiryInMs - Optional custom expiration time in milliseconds
   * @returns True if caching was successful, false otherwise
   */
  setCacheItem<T>(key: string, data: T, expiryInMs?: number): boolean {
    return setCacheItem<T>(key, data, expiryInMs);
  }

  /**
   * Generic method to remove any cached item by key
   * @param key - The cache key
   * @returns True if removal was successful, false otherwise
   */
  removeCacheItem(key: string): boolean {
    return removeCacheItem(key);
  }
}

/**
 * Singleton instance of the CacheStorage service for application-wide use
 */
export const cacheStorage = new CacheStorage();