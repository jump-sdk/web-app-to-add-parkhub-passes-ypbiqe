import { ErrorType, ErrorCode } from '../types/error.types';

/**
 * Default error messages for different error types and codes.
 * Provides standardized messages for a consistent user experience.
 */
export const DEFAULT_ERROR_MESSAGES: Record<ErrorType, Record<ErrorCode, string>> = {
  [ErrorType.NETWORK]: {
    [ErrorCode.CONNECTION_ERROR]: "Unable to connect to the ParkHub service. Please check your internet connection and try again.",
    [ErrorCode.TIMEOUT]: "The request to ParkHub timed out. Please try again. If the problem persists, the service may be experiencing high load.",
    [ErrorCode.INVALID_API_KEY]: "Network error occurred with authentication. Please refresh and try again.",
    [ErrorCode.MISSING_API_KEY]: "Network error occurred with authentication. Please refresh and try again.",
    [ErrorCode.INVALID_INPUT]: "Network error occurred while processing your request. Please try again.",
    [ErrorCode.DUPLICATE_BARCODE]: "Network error occurred while checking barcode uniqueness. Please try again.",
    [ErrorCode.EVENT_NOT_FOUND]: "Network error occurred while searching for the event. Please try again.",
    [ErrorCode.SERVER_ERROR]: "Network connection to the server failed. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Network error occurred due to too many requests. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "A network error occurred while communicating with ParkHub. Please try again later."
  },
  [ErrorType.AUTHENTICATION]: {
    [ErrorCode.CONNECTION_ERROR]: "Authentication failed due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Authentication request timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "The API key provided is invalid or has expired. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "No API key found. Please enter your ParkHub API key to continue.",
    [ErrorCode.INVALID_INPUT]: "Authentication failed due to invalid input. Please check your credentials.",
    [ErrorCode.DUPLICATE_BARCODE]: "Authentication error occurred. Please refresh and try again.",
    [ErrorCode.EVENT_NOT_FOUND]: "Authentication error occurred. Please refresh and try again.",
    [ErrorCode.SERVER_ERROR]: "Authentication failed due to a server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many authentication attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An authentication error occurred. Please check your credentials and try again."
  },
  [ErrorType.VALIDATION]: {
    [ErrorCode.CONNECTION_ERROR]: "Validation could not be completed due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Validation request timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Validation failed due to authentication issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Validation failed due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "The provided information contains errors. Please review and correct the highlighted fields.",
    [ErrorCode.DUPLICATE_BARCODE]: "A pass with this barcode already exists in the system.",
    [ErrorCode.EVENT_NOT_FOUND]: "The specified event could not be found. Please verify the event ID and try again.",
    [ErrorCode.SERVER_ERROR]: "Validation failed due to a server error. Please try again.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "A validation error occurred. Please review your input and try again."
  },
  [ErrorType.SERVER]: {
    [ErrorCode.CONNECTION_ERROR]: "Could not connect to the server. Please check your internet connection and try again.",
    [ErrorCode.TIMEOUT]: "The server request timed out. Please try again later.",
    [ErrorCode.INVALID_API_KEY]: "Server rejected the API key. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Server requires an API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Server rejected the request due to invalid input. Please try again.",
    [ErrorCode.DUPLICATE_BARCODE]: "Server reported a duplicate barcode. Please use a unique barcode.",
    [ErrorCode.EVENT_NOT_FOUND]: "Server could not find the specified event. Please verify the event ID.",
    [ErrorCode.SERVER_ERROR]: "The ParkHub service encountered an error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "You have made too many requests. Please wait a moment before trying again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected server error occurred. Please try again later or contact support if the problem persists."
  },
  [ErrorType.CLIENT]: {
    [ErrorCode.CONNECTION_ERROR]: "Client could not establish connection. Please check your internet and try again.",
    [ErrorCode.TIMEOUT]: "Client request timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Client has an invalid API key. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Client is missing an API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "The request contains invalid data. Please correct the errors and try again.",
    [ErrorCode.DUPLICATE_BARCODE]: "Client detected a duplicate barcode. Please use a unique barcode.",
    [ErrorCode.EVENT_NOT_FOUND]: "The requested event could not be found. It may have been removed or the ID is incorrect.",
    [ErrorCode.SERVER_ERROR]: "Client received a server error response. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Client has exceeded the rate limit. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected client error occurred. Please refresh the page and try again."
  },
  [ErrorType.UNKNOWN]: {
    [ErrorCode.CONNECTION_ERROR]: "An unknown connection error occurred. Please try again.",
    [ErrorCode.TIMEOUT]: "An unknown timeout error occurred. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "An unknown API key error occurred. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "An unknown error related to missing API key occurred. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "An unknown input validation error occurred. Please review your input.",
    [ErrorCode.DUPLICATE_BARCODE]: "An unknown error related to duplicate barcode occurred. Please use a unique barcode.",
    [ErrorCode.EVENT_NOT_FOUND]: "An unknown error occurred while finding the event. Please verify the event ID.",
    [ErrorCode.SERVER_ERROR]: "An unknown server error occurred. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "An unknown rate limit error occurred. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again or contact support if the problem persists."
  }
};

/**
 * Field-specific error messages for form validation errors.
 * Provides detailed guidance for correcting specific input fields.
 */
export const FIELD_ERROR_MESSAGES: Record<string, Record<ErrorCode, string>> = {
  eventId: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate Event ID due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Event ID validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate Event ID due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate Event ID due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Event ID must be in the format EV##### (where # is a digit).",
    [ErrorCode.DUPLICATE_BARCODE]: "Event ID validation error. Please try a different Event ID.",
    [ErrorCode.EVENT_NOT_FOUND]: "No event found with this ID. Please check and try again.",
    [ErrorCode.SERVER_ERROR]: "Could not validate Event ID due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many Event ID validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating Event ID. Please try again."
  },
  accountId: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate Account ID due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Account ID validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate Account ID due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate Account ID due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Account ID is required and must be in the correct format.",
    [ErrorCode.DUPLICATE_BARCODE]: "Account ID validation error. Please try a different Account ID.",
    [ErrorCode.EVENT_NOT_FOUND]: "Account ID validation error related to event. Please check event details.",
    [ErrorCode.SERVER_ERROR]: "Could not validate Account ID due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many Account ID validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating Account ID. Please try again."
  },
  barcode: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate barcode due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Barcode validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate barcode due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate barcode due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Barcode must follow the format BC###### (where # is a digit).",
    [ErrorCode.DUPLICATE_BARCODE]: "This barcode already exists. Please use a unique barcode.",
    [ErrorCode.EVENT_NOT_FOUND]: "Barcode validation error related to event. Please check event details.",
    [ErrorCode.SERVER_ERROR]: "Could not validate barcode due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many barcode validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating barcode. Please try again."
  },
  customerName: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate customer name due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Customer name validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate customer name due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate customer name due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Customer name is required and must contain only letters, spaces, and hyphens.",
    [ErrorCode.DUPLICATE_BARCODE]: "Customer name validation error. Please check your input.",
    [ErrorCode.EVENT_NOT_FOUND]: "Customer name validation error related to event. Please check event details.",
    [ErrorCode.SERVER_ERROR]: "Could not validate customer name due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many customer name validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating customer name. Please try again."
  },
  spotType: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate spot type due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Spot type validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate spot type due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate spot type due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Spot type must be one of: Regular, VIP, Premium.",
    [ErrorCode.DUPLICATE_BARCODE]: "Spot type validation error. Please check your input.",
    [ErrorCode.EVENT_NOT_FOUND]: "Spot type validation error related to event. Please check event details.",
    [ErrorCode.SERVER_ERROR]: "Could not validate spot type due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many spot type validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating spot type. Please try again."
  },
  lotId: {
    [ErrorCode.CONNECTION_ERROR]: "Could not validate Lot ID due to connection issues. Please try again.",
    [ErrorCode.TIMEOUT]: "Lot ID validation timed out. Please try again.",
    [ErrorCode.INVALID_API_KEY]: "Could not validate Lot ID due to API key issues. Please update your API key.",
    [ErrorCode.MISSING_API_KEY]: "Could not validate Lot ID due to missing API key. Please provide your API key.",
    [ErrorCode.INVALID_INPUT]: "Lot ID is required and must be in the correct format.",
    [ErrorCode.DUPLICATE_BARCODE]: "Lot ID validation error. Please check your input.",
    [ErrorCode.EVENT_NOT_FOUND]: "Lot ID validation error related to event. Please check event details.",
    [ErrorCode.SERVER_ERROR]: "Could not validate Lot ID due to server error. Please try again later.",
    [ErrorCode.RATE_LIMIT_EXCEEDED]: "Too many Lot ID validation attempts. Please wait and try again.",
    [ErrorCode.UNKNOWN_ERROR]: "An unknown error occurred while validating Lot ID. Please try again."
  }
};

/**
 * Retrieves the appropriate error message based on error type, code, and optional field.
 * 
 * @param type - The type of error (network, authentication, etc.)
 * @param code - The specific error code
 * @param field - Optional field name for field-specific error messages
 * @returns The appropriate error message for the given parameters
 */
export const getErrorMessage = (
  type: ErrorType,
  code: ErrorCode,
  field?: string
): string => {
  // Check for field-specific error message first
  if (field && FIELD_ERROR_MESSAGES[field] && FIELD_ERROR_MESSAGES[field][code]) {
    return FIELD_ERROR_MESSAGES[field][code];
  }
  
  // Check for general error message by type and code
  if (DEFAULT_ERROR_MESSAGES[type] && DEFAULT_ERROR_MESSAGES[type][code]) {
    return DEFAULT_ERROR_MESSAGES[type][code];
  }
  
  // Fallback to unknown error message
  return DEFAULT_ERROR_MESSAGES[ErrorType.UNKNOWN][ErrorCode.UNKNOWN_ERROR];
};