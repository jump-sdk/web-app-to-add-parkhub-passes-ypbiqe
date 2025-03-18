/**
 * Utility functions for browser storage operations in the ParkHub Passes Creation Web Application.
 * Provides a consistent interface for storing, retrieving, and managing data in
 * localStorage and sessionStorage with support for encryption, serialization, and cache expiration.
 * 
 * @version 1.0.0
 */

import crypto from 'crypto-js'; // Version ^4.1.1
import { 
  StorageType, 
  StorageOptions, 
  CachedItem,
  EncryptedData
} from '../types/storage.types';

/**
 * Default storage options
 */
const DEFAULT_STORAGE_OPTIONS: StorageOptions = {
  type: StorageType.LOCAL,
  expiry: null,
  encrypt: false
};

/**
 * Encryption key used for securing sensitive data
 * Note: In a production environment, this should be stored more securely
 * or derived from user input.
 */
const ENCRYPTION_KEY = 'PARKHUB_SECURE_STORAGE_KEY';

/**
 * Returns the appropriate Storage object (localStorage or sessionStorage) based on the storage type
 * @param storageType - Type of storage to use
 * @returns The browser Storage object corresponding to the specified type
 */
export const getStorageInstance = (storageType: StorageType): Storage => {
  return storageType === StorageType.SESSION
    ? window.sessionStorage
    : window.localStorage;
};

/**
 * Checks if the specified storage type is available in the current browser environment
 * @param storageType - Type of storage to check
 * @returns True if storage is available, false otherwise
 */
export const isStorageAvailable = (storageType: StorageType): boolean => {
  try {
    const storage = getStorageInstance(storageType);
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Returns default storage options merged with any provided options
 * @param options - Partial storage options to override defaults
 * @returns Complete storage options with defaults applied
 */
export const getDefaultStorageOptions = (options?: Partial<StorageOptions>): StorageOptions => {
  return {
    ...DEFAULT_STORAGE_OPTIONS,
    ...options
  };
};

/**
 * Encrypts data using AES encryption
 * @param data - Data to encrypt
 * @returns Object containing encrypted data and initialization vector
 */
export const encryptData = (data: any): EncryptedData => {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Generate random IV
    const iv = crypto.lib.WordArray.random(16);
    
    // Create encryption key
    const key = crypto.enc.Utf8.parse(ENCRYPTION_KEY);
    
    // Encrypt data
    const encrypted = crypto.AES.encrypt(jsonData, key, {
      iv: iv,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7
    });
    
    // Return encrypted data and IV as strings
    return {
      data: encrypted.toString(),
      iv: iv.toString(crypto.enc.Hex)
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedData - Object containing encrypted data and initialization vector
 * @returns The decrypted data
 */
export const decryptData = (encryptedData: EncryptedData): any => {
  try {
    const { data, iv } = encryptedData;
    
    // Create encryption key
    const key = crypto.enc.Utf8.parse(ENCRYPTION_KEY);
    
    // Create IV from string
    const ivParams = crypto.enc.Hex.parse(iv);
    
    // Decrypt data
    const decrypted = crypto.AES.decrypt(data, key, {
      iv: ivParams,
      mode: crypto.mode.CBC,
      padding: crypto.pad.Pkcs7
    });
    
    // Convert to string and parse JSON
    const decryptedString = decrypted.toString(crypto.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Retrieves an item from storage with optional decryption
 * @param key - The key of the item to retrieve
 * @param options - Storage options overrides
 * @returns The stored item or null if not found
 */
export const getItem = <T>(key: string, options?: Partial<StorageOptions>): T | null => {
  try {
    const opts = getDefaultStorageOptions(options);
    const storage = getStorageInstance(opts.type);
    
    // Check if storage is available
    if (!isStorageAvailable(opts.type)) {
      console.warn(`Storage type ${opts.type} is not available`);
      return null;
    }
    
    // Get item from storage
    const item = storage.getItem(key);
    if (!item) {
      return null;
    }
    
    // Parse item based on encryption setting
    if (opts.encrypt) {
      // Parse as EncryptedData and decrypt
      const encryptedData = JSON.parse(item) as EncryptedData;
      return decryptData(encryptedData);
    } else {
      // Parse as regular JSON
      return JSON.parse(item);
    }
  } catch (error) {
    console.error(`Error retrieving item "${key}" from ${options?.type || DEFAULT_STORAGE_OPTIONS.type}:`, error);
    return null;
  }
};

/**
 * Stores an item in storage with optional encryption
 * @param key - The key to store the item under
 * @param value - The value to store
 * @param options - Storage options overrides
 * @returns True if storage was successful, false otherwise
 */
export const setItem = <T>(key: string, value: T, options?: Partial<StorageOptions>): boolean => {
  try {
    const opts = getDefaultStorageOptions(options);
    const storage = getStorageInstance(opts.type);
    
    // Check if storage is available
    if (!isStorageAvailable(opts.type)) {
      console.warn(`Storage type ${opts.type} is not available`);
      return false;
    }
    
    // Prepare data based on encryption setting
    let dataToStore: string;
    if (opts.encrypt) {
      // Encrypt data and convert to JSON string
      const encryptedData = encryptData(value);
      dataToStore = JSON.stringify(encryptedData);
    } else {
      // Convert to JSON string directly
      dataToStore = JSON.stringify(value);
    }
    
    // Store in storage
    storage.setItem(key, dataToStore);
    return true;
  } catch (error) {
    console.error(`Error storing item "${key}" in ${options?.type || DEFAULT_STORAGE_OPTIONS.type}:`, error);
    return false;
  }
};

/**
 * Removes an item from storage
 * @param key - The key of the item to remove
 * @param options - Storage options overrides
 * @returns True if removal was successful, false otherwise
 */
export const removeItem = (key: string, options?: Partial<StorageOptions>): boolean => {
  try {
    const opts = getDefaultStorageOptions(options);
    const storage = getStorageInstance(opts.type);
    
    // Check if storage is available
    if (!isStorageAvailable(opts.type)) {
      console.warn(`Storage type ${opts.type} is not available`);
      return false;
    }
    
    // Remove item from storage
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item "${key}" from ${options?.type || DEFAULT_STORAGE_OPTIONS.type}:`, error);
    return false;
  }
};

/**
 * Clears all items from the specified storage
 * @param storageType - Type of storage to clear
 * @returns True if clearing was successful, false otherwise
 */
export const clearStorage = (storageType: StorageType): boolean => {
  try {
    const storage = getStorageInstance(storageType);
    
    // Check if storage is available
    if (!isStorageAvailable(storageType)) {
      console.warn(`Storage type ${storageType} is not available`);
      return false;
    }
    
    // Clear storage
    storage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${storageType}:`, error);
    return false;
  }
};

/**
 * Retrieves cached data from storage and validates its expiration
 * @param key - The key of the cached item to retrieve
 * @param options - Storage options overrides
 * @returns The cached data if valid, null if expired or not found
 */
export const getCachedData = <T>(key: string, options?: Partial<StorageOptions>): T | null => {
  try {
    // Get the cached item
    const cachedItem = getItem<CachedItem>(key, options);
    if (!cachedItem) {
      return null;
    }
    
    // Validate cached item structure
    if (!cachedItem.data || typeof cachedItem.timestamp !== 'number' || typeof cachedItem.expiry !== 'number') {
      console.warn(`Invalid cache structure for key "${key}"`);
      return null;
    }
    
    // Check expiration
    const now = Date.now();
    if (cachedItem.expiry !== 0 && cachedItem.expiry < now) {
      // Item has expired, remove it from storage
      removeItem(key, options);
      return null;
    }
    
    // Return the cached data
    return cachedItem.data as T;
  } catch (error) {
    console.error(`Error retrieving cached data for key "${key}":`, error);
    return null;
  }
};

/**
 * Stores data in cache with an expiration time
 * @param key - The key to store the data under
 * @param data - The data to cache
 * @param expiryInMs - Expiration time in milliseconds from now (0 for no expiration)
 * @param options - Storage options overrides
 * @returns True if caching was successful, false otherwise
 */
export const setCachedData = <T>(
  key: string, 
  data: T, 
  expiryInMs: number, 
  options?: Partial<StorageOptions>
): boolean => {
  try {
    const now = Date.now();
    const expiry = expiryInMs === 0 ? 0 : now + expiryInMs;
    
    // Create cached item
    const cachedItem: CachedItem = {
      data,
      timestamp: now,
      expiry
    };
    
    // Store cached item
    return setItem(key, cachedItem, options);
  } catch (error) {
    console.error(`Error caching data for key "${key}":`, error);
    return false;
  }
};

/**
 * Removes all expired cached items from storage
 * @param storageType - Type of storage to clean
 * @returns Number of expired items removed
 */
export const clearExpiredCache = (storageType: StorageType): number => {
  try {
    const storage = getStorageInstance(storageType);
    
    // Check if storage is available
    if (!isStorageAvailable(storageType)) {
      console.warn(`Storage type ${storageType} is not available`);
      return 0;
    }
    
    const now = Date.now();
    let removedCount = 0;
    
    // Loop through all keys in storage
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (!key) continue;
      
      try {
        // Try to parse as cached item
        const item = JSON.parse(storage.getItem(key) || '');
        
        // Check if it's a cached item with expiration
        if (item && 
            typeof item.timestamp === 'number' && 
            typeof item.expiry === 'number' && 
            item.expiry !== 0 && 
            item.expiry < now) {
          // Item has expired, remove it
          storage.removeItem(key);
          removedCount++;
        }
      } catch (parseError) {
        // Not a JSON item or not a cached item, skip it
        continue;
      }
    }
    
    return removedCount;
  } catch (error) {
    console.error(`Error clearing expired cache from ${storageType}:`, error);
    return 0;
  }
};