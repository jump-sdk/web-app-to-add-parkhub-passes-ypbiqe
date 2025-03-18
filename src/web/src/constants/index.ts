/**
 * Constants Index
 * 
 * This barrel file re-exports all constants from the various constants files in the ParkHub 
 * Passes Creation Web Application. By importing from this file, you can access any constant
 * throughout the application without needing to know its specific source file.
 * 
 * Using a centralized constants approach makes it easier to maintain the application and
 * update values when needed, especially for ParkHub API integration points.
 * 
 * @version 1.0.0
 */

// API Endpoints
export { API_BASE_URL, LANDMARK_ID, ENDPOINTS, buildEventsUrl, buildPassesUrl, buildCreatePassUrl } from './apiEndpoints';

// Error Messages
export { DEFAULT_ERROR_MESSAGES, FIELD_ERROR_MESSAGES, getErrorMessage } from './errorMessages';

// Form Fields
export { EVENT_ID_REGEX, EVENT_SELECTION_FIELDS, PASS_CREATION_FIELDS, SPOT_TYPE_OPTIONS, getPassFormConfig } from './formFields';

// Routes
export { ROUTES } from './routes';

// Spot Types
export { SPOT_TYPE_LABELS, SPOT_TYPE_DESCRIPTIONS, SPOT_TYPES_ARRAY } from './spotTypes';

// Storage Keys
export { API_KEY, EVENTS_CACHE, PASSES_CACHE, USER_PREFERENCES, FORM_STATE, STORAGE_KEYS } from './storageKeys';

// Validation
export { 
  VALIDATION_PATTERNS,
  VALID_SPOT_TYPES,
  MIN_LENGTH_REQUIREMENTS,
  MAX_LENGTH_REQUIREMENTS,
  VALIDATION_RULES,
  isValidEventId,
  isValidBarcode,
  isValidSpotType
} from './validation';