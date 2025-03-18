/**
 * Barrel file for the storage module that exports all storage-related services.
 * Provides a single entry point for accessing API key storage and cache storage
 * functionality throughout the application.
 * 
 * @module services/storage
 * @version 1.0.0
 */

// Import API key storage functionality
import { apiKeyStorage } from './apiKeyStorage';

// Import cache storage functionality
import { 
  cacheStorage,
  CacheStorage,
  // Individual cache methods  
  getEventCache,
  setEventCache,
  getPassesCache,
  setPassesCache,
  clearEventCache,
  clearPassesCache,
  clearAllPassesCache,
  clearAllCache,
  clearExpired,
  getCacheItem,
  setCacheItem,
  removeCacheItem,
  DEFAULT_CACHE_EXPIRY
} from './cacheStorage';

// Re-export API key storage
export { apiKeyStorage };

// Re-export cache storage
export { 
  cacheStorage,
  CacheStorage,
  getEventCache,
  setEventCache,
  getPassesCache,
  setPassesCache,
  clearEventCache,
  clearPassesCache,
  clearAllCache,
  clearExpired,
  getCacheItem,
  setCacheItem,
  removeCacheItem,
  DEFAULT_CACHE_EXPIRY
};

// Default export combining all storage services for convenient import
export default {
  apiKeyStorage,
  cacheStorage
};