/**
 * Service responsible for securely storing and retrieving the ParkHub API key in browser storage.
 * Implements encryption for sensitive API key data and provides methods for managing the API key
 * throughout the application lifecycle.
 * 
 * @version 1.0.0
 */

import { StorageType, StorageOptions } from '../../types/storage.types';
import { API_KEY } from '../../constants/storageKeys';
import { getItem, setItem, removeItem } from '../../utils/storage-helpers';

/**
 * Default storage options for API key storage
 * Uses localStorage with encryption enabled for secure storage
 */
const DEFAULT_STORAGE_OPTIONS: Partial<StorageOptions> = {
  type: StorageType.LOCAL,
  encrypt: true
};

/**
 * Retrieves the ParkHub API key from secure storage
 * 
 * @returns The stored API key or null if not found
 */
export const getApiKey = (): string | null => {
  try {
    return getItem<string>(API_KEY, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return null;
  }
};

/**
 * Securely stores the ParkHub API key in browser storage with encryption
 * 
 * @param apiKey - The API key to store
 * @returns True if storage was successful, false otherwise
 */
export const setApiKey = (apiKey: string): boolean => {
  try {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error('Invalid API key provided');
      return false;
    }
    
    return setItem<string>(API_KEY, apiKey, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error storing API key:', error);
    return false;
  }
};

/**
 * Removes the ParkHub API key from browser storage
 * 
 * @returns True if removal was successful, false otherwise
 */
export const removeApiKey = (): boolean => {
  try {
    return removeItem(API_KEY, DEFAULT_STORAGE_OPTIONS);
  } catch (error) {
    console.error('Error removing API key:', error);
    return false;
  }
};

/**
 * Validates the format of a ParkHub API key
 * 
 * @param apiKey - The API key to validate
 * @returns True if the API key format is valid, false otherwise
 */
export const validateApiKey = (apiKey: string): boolean => {
  // Check if apiKey is a non-empty string
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return false;
  }
  
  // API key format validation
  // This is a placeholder - actual format would depend on ParkHub's requirements
  // Typically, API keys are alphanumeric strings with possible special characters like dashes
  const apiKeyRegex = /^[A-Za-z0-9\-_.]{32,128}$/;
  return apiKeyRegex.test(apiKey);
};

/**
 * Checks if a ParkHub API key exists in storage
 * 
 * @returns True if an API key exists, false otherwise
 */
export const hasApiKey = (): boolean => {
  return getApiKey() !== null;
};

/**
 * Object containing all API key storage functions for convenient import
 */
export const apiKeyStorage = {
  getApiKey,
  setApiKey,
  removeApiKey,
  validateApiKey,
  hasApiKey
};

export default apiKeyStorage;