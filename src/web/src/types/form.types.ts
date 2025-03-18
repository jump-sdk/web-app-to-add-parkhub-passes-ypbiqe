/**
 * TypeScript type definitions for form handling in the ParkHub Passes Creation Web Application.
 * This file defines interfaces and types for form configuration, state management, 
 * validation, and field definitions used by form components and hooks throughout the application.
 * 
 * @version 1.0.0
 */

import { SpotType } from './api.types';

/**
 * Enum for possible form field types.
 */
export enum FieldType {
  /** Standard text input field */
  TEXT = 'text',
  /** Dropdown/select input field */
  SELECT = 'select',
  /** Multi-line text input field */
  TEXTAREA = 'textarea',
  /** Numeric input field */
  NUMBER = 'number',
  /** Date input field */
  DATE = 'date'
}

/**
 * Interface for options in select fields.
 */
export interface FormFieldOption {
  /** Value to be submitted with the form */
  value: string;
  /** Display text shown in the UI */
  label: string;
}

/**
 * Interface for form field configuration.
 */
export interface FormField {
  /** Unique field name/identifier */
  name: string;
  /** Display label for the field */
  label: string;
  /** Type of form field */
  type: FieldType;
  /** Whether the field is required */
  required: boolean;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Options for select fields */
  options?: FormFieldOption[];
  /** Regular expression for field validation */
  validation?: RegExp;
  /** Error message to display when validation fails */
  validationMessage?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Default value for the field */
  defaultValue?: string;
}

/**
 * Interface for tracking form field state.
 */
export interface FormFieldState {
  /** Current field value */
  value: string;
  /** Whether the field has been touched/interacted with */
  touched: boolean;
  /** Current validation error message or null if valid */
  error: string | null;
}

/**
 * Interface for overall form state.
 */
export interface FormState {
  /** Map of field names to their states */
  fields: Record<string, FormFieldState>;
  /** Whether the entire form is valid */
  isValid: boolean;
  /** Whether any field has been changed from initial values */
  isDirty: boolean;
  /** Whether the form is currently being submitted */
  isSubmitting: boolean;
  /** Number of submission attempts */
  submitCount: number;
}

/**
 * Interface for form configuration options.
 */
export interface FormConfig {
  /** Array of field configurations */
  fields: FormField[];
  /** Initial values for form fields */
  initialValues: Record<string, string>;
  /** Handler called when form is submitted */
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  /** Whether to validate fields on blur events */
  validateOnBlur: boolean;
  /** Whether to validate fields on change events */
  validateOnChange: boolean;
}

/**
 * Enum for form reducer action types.
 */
export enum FormActionTypes {
  /** Action to set a field's value */
  SET_FIELD_VALUE = 'SET_FIELD_VALUE',
  /** Action to set a field's error state */
  SET_FIELD_ERROR = 'SET_FIELD_ERROR',
  /** Action to mark a field as touched */
  SET_FIELD_TOUCHED = 'SET_FIELD_TOUCHED',
  /** Action to validate the entire form */
  VALIDATE_FORM = 'VALIDATE_FORM',
  /** Action to reset the form to initial state */
  RESET_FORM = 'RESET_FORM',
  /** Action to begin form submission */
  SUBMIT_FORM = 'SUBMIT_FORM',
  /** Action for successful form submission */
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  /** Action for failed form submission */
  SUBMIT_FAILURE = 'SUBMIT_FAILURE'
}

/**
 * Type for form reducer actions.
 */
export type FormAction = {
  /** Action type */
  type: FormActionTypes;
  /** Action payload data */
  payload: any;
};

/**
 * Interface for parking pass form data.
 */
export interface PassFormData {
  /** Event ID associated with this pass */
  eventId: string;
  /** Account ID associated with this pass */
  accountId: string;
  /** Unique barcode for the pass */
  barcode: string;
  /** Name of the customer associated with this pass */
  customerName: string;
  /** Type of parking spot */
  spotType: SpotType;
  /** Identifier for the parking lot */
  lotId: string;
}

/**
 * Interface for a single pass form item in batch creation.
 */
export interface PassFormItem {
  /** Unique identifier for this form item */
  id: string;
  /** Form data for this pass */
  data: PassFormData;
  /** Current state of this form */
  state: FormState;
}

/**
 * Interface for batch pass creation form state.
 */
export interface BatchPassFormState {
  /** Selected event ID for all passes */
  eventId: string;
  /** Array of individual pass form items */
  passes: PassFormItem[];
  /** Whether all passes are valid */
  isValid: boolean;
  /** Whether the batch is currently being submitted */
  isSubmitting: boolean;
}

/**
 * Interface for event selection form data.
 */
export interface EventSelectionFormData {
  /** Selected event ID */
  eventId: string;
}

/**
 * Type for form field change handler function.
 */
export type FormChangeHandler = (fieldName: string, value: string) => void;

/**
 * Type for form field blur handler function.
 */
export type FormBlurHandler = (fieldName: string) => void;

/**
 * Type for form submission handler function.
 */
export type FormSubmitHandler = () => Promise<void>;

/**
 * Type for batch form field change handler function.
 */
export type BatchFormChangeHandler = (index: number, fieldName: string, value: string) => void;

/**
 * Type for batch form field blur handler function.
 */
export type BatchFormBlurHandler = (index: number, fieldName: string) => void;

/**
 * Type for adding a new form to batch handler function.
 */
export type BatchFormAddHandler = () => void;

/**
 * Type for removing a form from batch handler function.
 */
export type BatchFormRemoveHandler = (id: string) => void;

/**
 * Interface for the return value of the useForm hook.
 */
export interface UseFormResult {
  /** Current form state */
  formState: FormState;
  /** Handler for field value changes */
  handleChange: FormChangeHandler;
  /** Handler for field blur events */
  handleBlur: FormBlurHandler;
  /** Handler for form submission */
  handleSubmit: FormSubmitHandler;
  /** Function to reset the form to initial state */
  resetForm: () => void;
  /** Function to programmatically set a field value */
  setFieldValue: (fieldName: string, value: string) => void;
  /** Function to programmatically set a field error */
  setFieldError: (fieldName: string, error: string | null) => void;
  /** Function to validate a specific field */
  validateField: (fieldName: string) => boolean;
  /** Function to validate all fields in the form */
  validateAllFields: () => boolean;
}

/**
 * Interface for the return value of the useBatchForm hook.
 */
export interface UseBatchFormResult {
  /** Current batch form state */
  batchFormState: BatchPassFormState;
  /** Handler for field value changes in any form */
  handleFieldChange: BatchFormChangeHandler;
  /** Handler for field blur events in any form */
  handleFieldBlur: BatchFormBlurHandler;
  /** Handler to add a new form to the batch */
  handleAddForm: BatchFormAddHandler;
  /** Handler to remove a form from the batch */
  handleRemoveForm: BatchFormRemoveHandler;
  /** Handler for batch form submission */
  handleSubmit: FormSubmitHandler;
  /** Function to reset the batch form to initial state */
  resetBatchForm: () => void;
  /** Function to set the event ID for all passes */
  setEventId: (eventId: string) => void;
}