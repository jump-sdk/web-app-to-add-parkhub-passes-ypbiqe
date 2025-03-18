import { SpotType } from '../types/api.types';
import { FIELD_ERROR_MESSAGES } from './errorMessages';
import { ErrorCode } from '../types/error.types';

/**
 * Regular expression patterns for form field validation
 */
export const VALIDATION_PATTERNS = {
  /**
   * Event ID must follow the format "EV#####" where # is a digit
   */
  EVENT_ID: /^EV\d{5}$/,
  
  /**
   * Account ID pattern - assumes alphanumeric format
   */
  ACCOUNT_ID: /^[A-Za-z0-9]{3,12}$/,
  
  /**
   * Barcode must follow the format "BC######" where # is a digit
   */
  BARCODE: /^BC\d{6}$/,
  
  /**
   * Customer name must contain only letters, spaces, and hyphens
   */
  CUSTOMER_NAME: /^[A-Za-z\s\-']+$/,
  
  /**
   * Lot ID pattern - assumes alphanumeric format with optional hyphens
   */
  LOT_ID: /^[A-Za-z0-9\-]{3,10}$/,
};

/**
 * Array of valid spot type values for validation
 */
export const VALID_SPOT_TYPES = [
  SpotType.REGULAR,
  SpotType.VIP,
  SpotType.PREMIUM
];

/**
 * Minimum length requirements for string fields
 */
export const MIN_LENGTH_REQUIREMENTS: Record<string, number> = {
  eventId: 7, // "EV" + 5 digits
  accountId: 3,
  barcode: 8, // "BC" + 6 digits
  customerName: 2,
  lotId: 3,
};

/**
 * Maximum length requirements for string fields
 */
export const MAX_LENGTH_REQUIREMENTS: Record<string, number> = {
  eventId: 7, // "EV" + 5 digits
  accountId: 12,
  barcode: 8, // "BC" + 6 digits
  customerName: 50,
  lotId: 10,
};

/**
 * Validation rules for each form field
 */
export const VALIDATION_RULES = {
  eventId: {
    required: true,
    minLength: MIN_LENGTH_REQUIREMENTS.eventId,
    maxLength: MAX_LENGTH_REQUIREMENTS.eventId,
    pattern: VALIDATION_PATTERNS.EVENT_ID,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT],
      minLength: `Event ID must be at least ${MIN_LENGTH_REQUIREMENTS.eventId} characters`,
      maxLength: `Event ID cannot exceed ${MAX_LENGTH_REQUIREMENTS.eventId} characters`,
      pattern: FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT],
      invalid: FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT]
    }
  },
  accountId: {
    required: true,
    minLength: MIN_LENGTH_REQUIREMENTS.accountId,
    maxLength: MAX_LENGTH_REQUIREMENTS.accountId,
    pattern: VALIDATION_PATTERNS.ACCOUNT_ID,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.accountId[ErrorCode.INVALID_INPUT],
      minLength: `Account ID must be at least ${MIN_LENGTH_REQUIREMENTS.accountId} characters`,
      maxLength: `Account ID cannot exceed ${MAX_LENGTH_REQUIREMENTS.accountId} characters`,
      pattern: FIELD_ERROR_MESSAGES.accountId[ErrorCode.INVALID_INPUT],
      invalid: FIELD_ERROR_MESSAGES.accountId[ErrorCode.INVALID_INPUT]
    }
  },
  barcode: {
    required: true,
    minLength: MIN_LENGTH_REQUIREMENTS.barcode,
    maxLength: MAX_LENGTH_REQUIREMENTS.barcode,
    pattern: VALIDATION_PATTERNS.BARCODE,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT],
      minLength: `Barcode must be at least ${MIN_LENGTH_REQUIREMENTS.barcode} characters`,
      maxLength: `Barcode cannot exceed ${MAX_LENGTH_REQUIREMENTS.barcode} characters`,
      pattern: FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT],
      duplicate: FIELD_ERROR_MESSAGES.barcode[ErrorCode.DUPLICATE_BARCODE],
      invalid: FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT]
    }
  },
  customerName: {
    required: true,
    minLength: MIN_LENGTH_REQUIREMENTS.customerName,
    maxLength: MAX_LENGTH_REQUIREMENTS.customerName,
    pattern: VALIDATION_PATTERNS.CUSTOMER_NAME,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.customerName[ErrorCode.INVALID_INPUT],
      minLength: `Customer name must be at least ${MIN_LENGTH_REQUIREMENTS.customerName} characters`,
      maxLength: `Customer name cannot exceed ${MAX_LENGTH_REQUIREMENTS.customerName} characters`,
      pattern: FIELD_ERROR_MESSAGES.customerName[ErrorCode.INVALID_INPUT],
      invalid: FIELD_ERROR_MESSAGES.customerName[ErrorCode.INVALID_INPUT]
    }
  },
  spotType: {
    required: true,
    validValues: VALID_SPOT_TYPES,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.spotType[ErrorCode.INVALID_INPUT],
      invalid: FIELD_ERROR_MESSAGES.spotType[ErrorCode.INVALID_INPUT]
    }
  },
  lotId: {
    required: true,
    minLength: MIN_LENGTH_REQUIREMENTS.lotId,
    maxLength: MAX_LENGTH_REQUIREMENTS.lotId,
    pattern: VALIDATION_PATTERNS.LOT_ID,
    errorMessages: {
      required: FIELD_ERROR_MESSAGES.lotId[ErrorCode.INVALID_INPUT],
      minLength: `Lot ID must be at least ${MIN_LENGTH_REQUIREMENTS.lotId} characters`,
      maxLength: `Lot ID cannot exceed ${MAX_LENGTH_REQUIREMENTS.lotId} characters`,
      pattern: FIELD_ERROR_MESSAGES.lotId[ErrorCode.INVALID_INPUT],
      invalid: FIELD_ERROR_MESSAGES.lotId[ErrorCode.INVALID_INPUT]
    }
  },
};

/**
 * Validates if a value is a valid event ID
 * @param value - The event ID to validate
 * @returns True if the value is a valid event ID, false otherwise
 */
export const isValidEventId = (value: string): boolean => {
  if (!value) return false;
  return VALIDATION_PATTERNS.EVENT_ID.test(value);
};

/**
 * Validates if a value is a valid barcode
 * @param value - The barcode to validate
 * @returns True if the value is a valid barcode, false otherwise
 */
export const isValidBarcode = (value: string): boolean => {
  if (!value) return false;
  return VALIDATION_PATTERNS.BARCODE.test(value);
};

/**
 * Validates if a value is a valid spot type
 * @param value - The spot type to validate
 * @returns True if the value is a valid spot type, false otherwise
 */
export const isValidSpotType = (value: string): boolean => {
  if (!value) return false;
  return VALID_SPOT_TYPES.includes(value as SpotType);
};