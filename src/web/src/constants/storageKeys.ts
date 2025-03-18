/**
 * Constants for browser storage keys used throughout the application.
 * 
 * These keys are prefixed with a consistent application identifier to
 * avoid collisions with other applications that might use the same browser.
 * 
 * @module constants/storageKeys
 */

/**
 * Application prefix for all storage keys to prevent collision with other apps
 */
const APP_PREFIX = 'parkhub_passes_';

/**
 * Storage key for the ParkHub API key
 * Used for securely storing the API key in browser storage (localStorage or sessionStorage)
 */
export const API_KEY = `${APP_PREFIX}api_key`;

/**
 * Storage key for cached event data
 * Used for storing the list of events to reduce API calls
 */
export const EVENTS_CACHE = `${APP_PREFIX}events_cache`;

/**
 * Storage key prefix for cached passes data
 * Will be combined with event ID when storing passes for a specific event
 */
export const PASSES_CACHE = `${APP_PREFIX}passes_cache_`;

/**
 * Storage key for user preferences
 * Used for storing UI preferences, display options, etc.
 */
export const USER_PREFERENCES = `${APP_PREFIX}user_preferences`;

/**
 * Storage key for temporary form state
 * Used for preserving form input during navigation or page refresh
 */
export const FORM_STATE = `${APP_PREFIX}form_state`;

/**
 * Object containing all storage keys for convenient import
 */
export const STORAGE_KEYS = {
  API_KEY,
  EVENTS_CACHE,
  PASSES_CACHE,
  USER_PREFERENCES,
  FORM_STATE,
};