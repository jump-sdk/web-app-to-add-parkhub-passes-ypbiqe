import { 
  VALIDATION_PATTERNS, 
  VALIDATION_RULES, 
  VALID_SPOT_TYPES,
  MIN_LENGTH_REQUIREMENTS,
  MAX_LENGTH_REQUIREMENTS
} from '../constants/validation';
import { FIELD_ERROR_MESSAGES } from '../constants/errorMessages';
import { FormField, PassFormData } from '../types/form.types';
import { ValidationResult } from '../types/common.types';
import { SpotType } from '../types/api.types';
import { ErrorType, ErrorCode } from '../types/error.types';

/**
 * Validates a single form field value against validation rules
 * 
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @param fieldConfig - Optional specific field configuration, uses VALIDATION_RULES if not provided
 * @returns Validation result with isValid flag and error message if invalid
 */
export const validateField = (
  fieldName: string, 
  value: string, 
  fieldConfig?: FormField
): ValidationResult => {
  // Use provided field config or get default from VALIDATION_RULES
  const config = fieldConfig || VALIDATION_RULES[fieldName];
  
  if (!config) {
    return { isValid: false, errors: { [fieldName]: `Unknown field: ${fieldName}` } };
  }

  const errors: Record<string, string> = {};

  // Check if field is required but empty
  if (config.required && (!value || value.trim() === '')) {
    errors[fieldName] = config.validationMessage || 
      VALIDATION_RULES[fieldName]?.errorMessages?.required || 
      `${fieldName} is required`;
    return { isValid: false, errors };
  }

  // Skip further validations if field is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true, errors: {} };
  }

  // Check minimum length requirement
  const minLength = VALIDATION_RULES[fieldName]?.minLength || MIN_LENGTH_REQUIREMENTS[fieldName];
  if (minLength && value.length < minLength) {
    errors[fieldName] = VALIDATION_RULES[fieldName]?.errorMessages?.minLength || 
      `${fieldName} must be at least ${minLength} characters`;
    return { isValid: false, errors };
  }

  // Check maximum length requirement
  const maxLength = VALIDATION_RULES[fieldName]?.maxLength || MAX_LENGTH_REQUIREMENTS[fieldName];
  if (maxLength && value.length > maxLength) {
    errors[fieldName] = VALIDATION_RULES[fieldName]?.errorMessages?.maxLength || 
      `${fieldName} cannot exceed ${maxLength} characters`;
    return { isValid: false, errors };
  }

  // For spot type, check if it's a valid option
  if (fieldName === 'spotType') {
    if (!VALID_SPOT_TYPES.includes(value as SpotType)) {
      errors[fieldName] = VALIDATION_RULES.spotType.errorMessages.invalid;
      return { isValid: false, errors };
    }
    return { isValid: true, errors: {} };
  }

  // Check pattern validation
  const pattern = config.validation || VALIDATION_PATTERNS[fieldName.toUpperCase()];
  if (pattern && !pattern.test(value)) {
    errors[fieldName] = config.validationMessage || 
      VALIDATION_RULES[fieldName]?.errorMessages?.pattern || 
      `${fieldName} is invalid`;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

/**
 * Validates an entire form with multiple fields
 * 
 * @param values - Object containing field values by field name
 * @param fields - Array of field configurations
 * @returns Validation result with isValid flag and error messages for invalid fields
 */
export const validateForm = (
  values: Record<string, string>,
  fields: FormField[]
): ValidationResult => {
  let isValid = true;
  const errors: Record<string, string> = {};

  // Validate each field
  for (const field of fields) {
    const fieldName = field.name;
    const fieldValue = values[fieldName] || '';
    
    const fieldResult = validateField(fieldName, fieldValue, field);
    
    if (!fieldResult.isValid) {
      isValid = false;
      Object.assign(errors, fieldResult.errors);
    }
  }

  return { isValid, errors };
};

/**
 * Validates a parking pass form with specialized validation for pass fields
 * 
 * @param passData - Pass form data to validate
 * @returns Validation result with isValid flag and error messages for invalid fields
 */
export const validatePassForm = (passData: PassFormData): ValidationResult => {
  let isValid = true;
  const errors: Record<string, string> = {};

  // Validate eventId field
  const eventIdResult = validateEventId(passData.eventId);
  if (!eventIdResult.isValid) {
    isValid = false;
    Object.assign(errors, eventIdResult.errors);
  }

  // Validate accountId field
  const accountIdResult = validateField('accountId', passData.accountId);
  if (!accountIdResult.isValid) {
    isValid = false;
    Object.assign(errors, accountIdResult.errors);
  }

  // Validate barcode field
  const barcodeResult = validateBarcode(passData.barcode);
  if (!barcodeResult.isValid) {
    isValid = false;
    Object.assign(errors, barcodeResult.errors);
  }

  // Validate customerName field
  const customerNameResult = validateField('customerName', passData.customerName);
  if (!customerNameResult.isValid) {
    isValid = false;
    Object.assign(errors, customerNameResult.errors);
  }

  // Validate spotType field
  const spotTypeResult = validateField('spotType', passData.spotType);
  if (!spotTypeResult.isValid) {
    isValid = false;
    Object.assign(errors, spotTypeResult.errors);
  }

  // Validate lotId field
  const lotIdResult = validateField('lotId', passData.lotId);
  if (!lotIdResult.isValid) {
    isValid = false;
    Object.assign(errors, lotIdResult.errors);
  }

  return { isValid, errors };
};

/**
 * Specialized validation for event ID format
 * 
 * @param eventId - Event ID to validate
 * @returns Validation result with isValid flag and error message if invalid
 */
export const validateEventId = (eventId: string): ValidationResult => {
  const errors: Record<string, string> = {};

  // Check if eventId is empty
  if (!eventId || eventId.trim() === '') {
    errors.eventId = VALIDATION_RULES.eventId.errorMessages.required;
    return { isValid: false, errors };
  }

  // Check if eventId matches the required pattern (EV##### format)
  if (!VALIDATION_PATTERNS.EVENT_ID.test(eventId)) {
    errors.eventId = VALIDATION_RULES.eventId.errorMessages.pattern;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

/**
 * Specialized validation for barcode format and uniqueness
 * 
 * @param barcode - Barcode to validate
 * @param existingBarcodes - Optional array of existing barcodes to check for duplicates
 * @returns Validation result with isValid flag and error message if invalid
 */
export const validateBarcode = (
  barcode: string,
  existingBarcodes?: string[]
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Check if barcode is empty
  if (!barcode || barcode.trim() === '') {
    errors.barcode = VALIDATION_RULES.barcode.errorMessages.required;
    return { isValid: false, errors };
  }

  // Check if barcode matches the required pattern (BC###### format)
  if (!VALIDATION_PATTERNS.BARCODE.test(barcode)) {
    errors.barcode = VALIDATION_RULES.barcode.errorMessages.pattern;
    return { isValid: false, errors };
  }

  // Check if barcode already exists (if existingBarcodes provided)
  if (existingBarcodes && existingBarcodes.includes(barcode)) {
    errors.barcode = VALIDATION_RULES.barcode.errorMessages.duplicate;
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
};

/**
 * Checks if a form is valid by validating all fields
 * 
 * @param values - Object containing field values by field name
 * @param fields - Array of field configurations
 * @returns True if all fields are valid, false otherwise
 */
export const isFormValid = (
  values: Record<string, string>,
  fields: FormField[]
): boolean => {
  const result = validateForm(values, fields);
  return result.isValid;
};

/**
 * Checks if a single field is valid
 * 
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @param fieldConfig - Optional specific field configuration
 * @returns True if the field is valid, false otherwise
 */
export const isFieldValid = (
  fieldName: string,
  value: string,
  fieldConfig?: FormField
): boolean => {
  const result = validateField(fieldName, value, fieldConfig);
  return result.isValid;
};

/**
 * Creates a ValidationError object from validation results
 * 
 * @param validationResult - Validation result containing errors
 * @param field - Optional field name associated with the validation
 * @returns A validation error object with type, code, message, field, and fieldErrors
 */
export const createValidationError = (
  validationResult: ValidationResult,
  field?: string
): object => {
  return {
    type: ErrorType.VALIDATION,
    code: ErrorCode.INVALID_INPUT,
    message: "Form validation failed. Please correct the highlighted fields.",
    field,
    fieldErrors: validationResult.errors,
    timestamp: Date.now()
  };
};