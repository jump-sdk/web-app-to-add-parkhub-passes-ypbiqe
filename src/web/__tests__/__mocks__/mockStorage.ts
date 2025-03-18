/**
 * Mock implementation of browser storage (localStorage and sessionStorage) for testing.
 * 
 * This module provides in-memory storage functionality that mimics browser storage APIs
 * without requiring a browser environment, enabling isolated unit testing of
 * storage-dependent components.
 * 
 * @version 1.0.0
 */

import { StorageType } from '../../src/types/storage.types';

// In-memory storage for test environment
let mockStorageData: { [key in StorageType]: Record<string, string> } = {
  [StorageType.LOCAL]: {},
  [StorageType.SESSION]: {}
};

/**
 * Extended Storage interface with additional testing utilities
 */
interface MockStorage extends Storage {
  /**
   * Returns all items in the storage as an object for testing inspection
   */
  getAllItems(): Record<string, string>;
}

/**
 * Creates a mock implementation of the Storage interface for testing
 * @param storageType - The type of storage to create (LOCAL or SESSION)
 * @returns A mock Storage object that mimics browser storage behavior
 */
function createMockStorage(storageType: StorageType): MockStorage {
  return {
    /**
     * Gets an item from storage by key
     * @param key - The key to retrieve
     * @returns The value or null if not found
     */
    getItem(key: string): string | null {
      return mockStorageData[storageType][key] || null;
    },
    
    /**
     * Sets an item in storage
     * @param key - The key to store under
     * @param value - The value to store
     */
    setItem(key: string, value: string): void {
      mockStorageData[storageType][key] = value;
    },
    
    /**
     * Removes an item from storage
     * @param key - The key to remove
     */
    removeItem(key: string): void {
      delete mockStorageData[storageType][key];
    },
    
    /**
     * Clears all items from storage
     */
    clear(): void {
      mockStorageData[storageType] = {};
    },
    
    /**
     * Returns the number of items in storage
     */
    get length(): number {
      return Object.keys(mockStorageData[storageType]).length;
    },
    
    /**
     * Gets the key at the specified index
     * @param index - The index of the key to retrieve
     * @returns The key or null if not found
     */
    key(index: number): string | null {
      return Object.keys(mockStorageData[storageType])[index] || null;
    },
    
    /**
     * Returns all items in storage for testing inspection
     * @returns Object containing all key-value pairs in storage
     */
    getAllItems(): Record<string, string> {
      return { ...mockStorageData[storageType] };
    }
  };
}

/**
 * Resets all mock storage data to empty state.
 * Useful for clearing storage between tests.
 */
export function resetMockStorage(): void {
  mockStorageData = {
    [StorageType.LOCAL]: {},
    [StorageType.SESSION]: {}
  };
}

/**
 * Returns all items currently stored in the specified mock storage
 * @param storageType - The type of storage to retrieve items from
 * @returns Object containing all key-value pairs in storage
 */
export function getAllItems(storageType: StorageType): Record<string, string> {
  return { ...mockStorageData[storageType] };
}

/**
 * Mock implementation of localStorage for testing
 */
export const mockLocalStorage = createMockStorage(StorageType.LOCAL);

/**
 * Mock implementation of sessionStorage for testing
 */
export const mockSessionStorage = createMockStorage(StorageType.SESSION);