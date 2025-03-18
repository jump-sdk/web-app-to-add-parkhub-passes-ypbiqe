import { useState, useCallback, useMemo } from 'react';
import { 
  VALIDATION_PATTERNS, 
  VALIDATION_RULES, 
  VALID_SPOT_TYPES 
} from '../constants/validation';
import { FIELD_ERROR_MESSAGES } from '../constants/errorMessages';
import { 
  ErrorType, 
  ErrorCode 
} from '../types/error.types';
import { 
  FormField, 
  PassFormData 
} from '../types/form.types';
import { ValidationResult } from '../types/common.types';
import {
  validateField,
  validateForm,
  validatePassForm,
  validateEventId,
  validateBarcode,
  createValidationError
} from '../utils/validation';

/**
 * Configuration options for the useValidation hook
 */
interface UseValidationOptions {
  /**
   * Initial validation errors to populate the state with
   */
  initialErrors?: Record<string, string>;
  
  /**
   * Initial list of existing barcodes to check against for uniqueness
   */
  initialExistingBarcodes?: string[];
  
  /**
   * Callback triggered when a validation error occurs
   */
  onError?: (error: any) => void;
}

/**
 * Return type for the useValidation hook
 */
interface UseValidationResult {
  validateFieldValue: (fieldName: string, value: string, updateErrorState?: boolean) => ValidationResult;
  validateFormValues: (values: Record<string, string>, fields: FormField[], updateErrorState?: boolean) => ValidationResult;
  validatePassFormData: (passData: PassFormData, updateErrorState?: boolean) => ValidationResult;
  validateEventIdValue: (eventId: string, updateErrorState?: boolean) => ValidationResult;
  validateBarcodeValue: (barcode: string, updateErrorState?: boolean) => ValidationResult;
  addExistingBarcode: (barcode: string) => void;
  clearExistingBarcodes: () => void;
  validationErrors: Record<string, string>;
  hasErrors: boolean;
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

/**
 * Custom React hook that provides form validation functionality for the ParkHub Passes
 * Creation Web Application. Specializes in validating parking pass creation forms and
 * ensuring unique barcodes.
 *
 * @param options - Optional configuration options for the validation hook
 * @returns Object containing validation methods and state for form validation
 */
export const useValidation = (options?: UseValidationOptions): UseValidationResult => {
  // State for tracking validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>(
    options?.initialErrors || {}
  );
  
  // State for tracking existing barcodes to prevent duplicates
  const [existingBarcodes, setExistingBarcodes] = useState<string[]>(
    options?.initialExistingBarcodes || []
  );
  
  /**
   * Validates a single field value and optionally updates the validation error state
   * 
   * @param fieldName - Name of the field to validate
   * @param value - Value to validate
   * @param updateErrorState - Whether to update the validation error state (default: true)
   * @returns Validation result with isValid flag and error messages
   */
  const validateFieldValue = useCallback((fieldName: string, value: string, updateErrorState: boolean = true): ValidationResult => {
    const result = validateField(fieldName, value);
    
    // Update validation errors state if requested
    if (updateErrorState) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        
        // If field is valid, remove any existing error
        if (result.isValid) {
          delete newErrors[fieldName];
        } 
        // If field is invalid, add the error message
        else if (result.errors[fieldName]) {
          newErrors[fieldName] = result.errors[fieldName];
        }
        
        return newErrors;
      });
    }
    
    return result;
  }, []);
  
  /**
   * Validates an entire form with multiple fields and optionally updates the validation error state
   * 
   * @param values - Object containing field values by field name
   * @param fields - Array of field configurations
   * @param updateErrorState - Whether to update the validation error state (default: true)
   * @returns Validation result with isValid flag and error messages
   */
  const validateFormValues = useCallback((values: Record<string, string>, fields: FormField[], updateErrorState: boolean = true): ValidationResult => {
    const result = validateForm(values, fields);
    
    // Update validation errors state if requested
    if (updateErrorState) {
      if (!result.isValid) {
        setValidationErrors(result.errors);
        
        // Call onError callback if provided
        if (options?.onError) {
          options.onError(createValidationError(result));
        }
      } else {
        setValidationErrors({});
      }
    }
    
    return result;
  }, [options]);
  
  /**
   * Validates a parking pass form with specialized validation for pass fields
   * and checks for duplicate barcodes
   * 
   * @param passData - Pass form data to validate
   * @param updateErrorState - Whether to update the validation error state (default: true)
   * @returns Validation result with isValid flag and error messages
   */
  const validatePassFormData = useCallback((passData: PassFormData, updateErrorState: boolean = true): ValidationResult => {
    // Validate the pass form data using the utility function
    let result = validatePassForm(passData);
    
    // If the pass is valid so far but the barcode already exists, mark it as invalid
    if (result.isValid && existingBarcodes.includes(passData.barcode)) {
      result = {
        isValid: false,
        errors: {
          ...result.errors,
          barcode: FIELD_ERROR_MESSAGES.barcode[ErrorCode.DUPLICATE_BARCODE]
        }
      };
    }
    
    // Update validation errors state if requested
    if (updateErrorState) {
      if (!result.isValid) {
        setValidationErrors(result.errors);
        
        // Call onError callback if provided
        if (options?.onError) {
          options.onError(createValidationError(result));
        }
      } else {
        setValidationErrors({});
      }
    }
    
    return result;
  }, [existingBarcodes, options]);
  
  /**
   * Specialized validation for event ID format with optional error state update
   * 
   * @param eventId - Event ID to validate
   * @param updateErrorState - Whether to update the validation error state (default: true)
   * @returns Validation result with isValid flag and error message if invalid
   */
  const validateEventIdValue = useCallback((eventId: string, updateErrorState: boolean = true): ValidationResult => {
    const result = validateEventId(eventId);
    
    // Update validation errors state if requested
    if (updateErrorState) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        
        // If eventId is valid, remove any existing error
        if (result.isValid) {
          delete newErrors.eventId;
        } 
        // If eventId is invalid, add the error message
        else if (result.errors.eventId) {
          newErrors.eventId = result.errors.eventId;
        }
        
        return newErrors;
      });
    }
    
    return result;
  }, []);
  
  /**
   * Specialized validation for barcode format and uniqueness with optional error state update
   * 
   * @param barcode - Barcode to validate
   * @param updateErrorState - Whether to update the validation error state (default: true)
   * @returns Validation result with isValid flag and error message if invalid
   */
  const validateBarcodeValue = useCallback((barcode: string, updateErrorState: boolean = true): ValidationResult => {
    const result = validateBarcode(barcode, existingBarcodes);
    
    // Update validation errors state if requested
    if (updateErrorState) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        
        // If barcode is valid, remove any existing error
        if (result.isValid) {
          delete newErrors.barcode;
        } 
        // If barcode is invalid, add the error message
        else if (result.errors.barcode) {
          newErrors.barcode = result.errors.barcode;
        }
        
        return newErrors;
      });
    }
    
    return result;
  }, [existingBarcodes]);
  
  /**
   * Adds a barcode to the list of existing barcodes to prevent duplicates
   * 
   * @param barcode - Barcode to add to the existing barcodes list
   */
  const addExistingBarcode = useCallback((barcode: string) => {
    if (barcode && !existingBarcodes.includes(barcode)) {
      setExistingBarcodes(prev => [...prev, barcode]);
    }
  }, [existingBarcodes]);
  
  /**
   * Clears the list of existing barcodes
   */
  const clearExistingBarcodes = useCallback(() => {
    setExistingBarcodes([]);
  }, []);
  
  /**
   * Boolean indicating whether there are any validation errors
   */
  const hasErrors = useMemo(() => Object.keys(validationErrors).length > 0, [validationErrors]);
  
  return {
    validateFieldValue,
    validateFormValues,
    validatePassFormData,
    validateEventIdValue,
    validateBarcodeValue,
    addExistingBarcode,
    clearExistingBarcodes,
    validationErrors,
    hasErrors,
    setValidationErrors
  };
};