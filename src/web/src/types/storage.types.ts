/**
 * TypeScript type definitions for browser storage operations in the ParkHub Passes Creation Web Application.
 * This file defines enums, interfaces, and types for working with localStorage and sessionStorage, 
 * including support for data caching, encryption, and expiration.
 * 
 * @version 1.0.0
 */

import { ApiResponse } from './api.types';

/**
 * Enum defining the available browser storage types.
 */
export enum StorageType {
  /** Browser's localStorage for persistent storage */
  LOCAL = 'localStorage',
  /** Browser's sessionStorage for session-based storage */
  SESSION = 'sessionStorage'
}

/**
 * Interface defining options for storage operations.
 */
export interface StorageOptions {
  /** Storage type to use (localStorage or sessionStorage) */
  type: StorageType;
  /** 
   * Expiration time in milliseconds from now, or null for no expiration.
   * Items with expired timestamps will be treated as if they don't exist.
   */
  expiry: number | null;
  /** Whether to encrypt the data before storing */
  encrypt: boolean;
}

/**
 * Interface for items stored in cache with expiration time.
 */
export interface CachedItem {
  /** The stored data */
  data: any;
  /** Unix timestamp (milliseconds since epoch) when the item was stored */
  timestamp: number;
  /** Unix timestamp (milliseconds since epoch) when the item expires, or 0 for no expiration */
  expiry: number;
}

/**
 * Interface for API responses stored in cache with expiration time.
 */
export interface CachedApiResponse<T = any> {
  /** The API response data */
  data: ApiResponse<T>;
  /** Unix timestamp (milliseconds since epoch) when the response was cached */
  timestamp: number;
  /** Unix timestamp (milliseconds since epoch) when the cached response expires, or 0 for no expiration */
  expiry: number;
}

/**
 * Interface for encrypted data structure containing the encrypted data and initialization vector.
 */
export interface EncryptedData {
  /** The encrypted data as a string */
  data: string;
  /** Initialization vector used for encryption */
  iv: string;
}

/**
 * Interface defining the contract for storage service implementations.
 */
export interface StorageService {
  /**
   * Retrieves an item from storage.
   * @param key - The key of the item to retrieve
   * @param options - Storage options overrides
   * @returns The stored item, or null if not found or expired
   */
  getItem<T>(key: string, options?: Partial<StorageOptions>): T | null;
  
  /**
   * Stores an item in storage.
   * @param key - The key to store the item under
   * @param value - The value to store
   * @param options - Storage options overrides
   * @returns True if the operation was successful, false otherwise
   */
  setItem<T>(key: string, value: T, options?: Partial<StorageOptions>): boolean;
  
  /**
   * Removes an item from storage.
   * @param key - The key of the item to remove
   * @param options - Storage options overrides
   * @returns True if the operation was successful, false otherwise
   */
  removeItem(key: string, options?: Partial<StorageOptions>): boolean;
  
  /**
   * Clears all items from the specified storage type.
   * @param options - Storage options overrides
   * @returns True if the operation was successful, false otherwise
   */
  clear(options?: Partial<StorageOptions>): boolean;
}

/**
 * Type alias for storage key strings to improve type safety when working with storage keys.
 */
export type StorageKey = string;

/**
 * Interface for storage operation errors with code, message, and original error.
 */
export interface StorageError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original error object if available */
  originalError: Error | null;
}

/**
 * Interface for user preferences stored in browser storage.
 */
export interface UserPreferences {
  /** User's theme preference */
  theme: string;
  /** Number of items to display per page */
  pageSize: number;
  /** Default event ID to pre-select, or null if none */
  defaultEventId: string | null;
}