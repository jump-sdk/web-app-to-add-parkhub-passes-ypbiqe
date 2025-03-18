import { FieldType, FormField, FormFieldOption } from '../types/form.types';
import { SpotType } from '../types/api.types';
import { VALIDATION_PATTERNS } from './validation';
import { FIELD_ERROR_MESSAGES } from './errorMessages';
import { ErrorCode } from '../types/error.types';
import { SPOT_TYPE_LABELS } from './spotTypes';

/**
 * Regular expression for event ID validation
 * Pattern: "EV" followed by 5 digits
 */
export const EVENT_ID_REGEX = VALIDATION_PATTERNS.EVENT_ID;

/**
 * Form field definitions for the event selection form
 */
export const EVENT_SELECTION_FIELDS: FormField[] = [
  {
    name: 'eventId',
    label: 'Event ID',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Enter Event ID (e.g., EV12345)',
    validation: VALIDATION_PATTERNS.EVENT_ID,
    validationMessage: FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT]
  }
];

/**
 * Options for the spot type select field
 */
export const SPOT_TYPE_OPTIONS: FormFieldOption[] = [
  { value: SpotType.REGULAR, label: SPOT_TYPE_LABELS[SpotType.REGULAR] },
  { value: SpotType.VIP, label: SPOT_TYPE_LABELS[SpotType.VIP] },
  { value: SpotType.PREMIUM, label: SPOT_TYPE_LABELS[SpotType.PREMIUM] }
];

/**
 * Form field definitions for the pass creation form
 */
export const PASS_CREATION_FIELDS: FormField[] = [
  {
    name: 'eventId',
    label: 'Event ID',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Event ID will be auto-filled',
    validation: VALIDATION_PATTERNS.EVENT_ID,
    validationMessage: FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT],
    disabled: true
  },
  {
    name: 'accountId',
    label: 'Account ID',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Enter Account ID',
    validation: VALIDATION_PATTERNS.ACCOUNT_ID,
    validationMessage: FIELD_ERROR_MESSAGES.accountId[ErrorCode.INVALID_INPUT]
  },
  {
    name: 'barcode',
    label: 'Barcode',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Enter Barcode (e.g., BC100001)',
    validation: VALIDATION_PATTERNS.BARCODE,
    validationMessage: FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT]
  },
  {
    name: 'customerName',
    label: 'Customer Name',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Enter Customer Name',
    validation: VALIDATION_PATTERNS.CUSTOMER_NAME,
    validationMessage: FIELD_ERROR_MESSAGES.customerName[ErrorCode.INVALID_INPUT]
  },
  {
    name: 'spotType',
    label: 'Spot Type',
    type: FieldType.SELECT,
    required: true,
    options: SPOT_TYPE_OPTIONS,
    validationMessage: FIELD_ERROR_MESSAGES.spotType[ErrorCode.INVALID_INPUT]
  },
  {
    name: 'lotId',
    label: 'Lot ID',
    type: FieldType.TEXT,
    required: true,
    placeholder: 'Enter Lot ID (e.g., LOT-A)',
    validation: VALIDATION_PATTERNS.LOT_ID,
    validationMessage: FIELD_ERROR_MESSAGES.lotId[ErrorCode.INVALID_INPUT]
  }
];

/**
 * Generates a form configuration for pass creation with initial values
 * 
 * @param eventId - The event ID to use for the form
 * @returns Form configuration with fields and initial values
 */
export const getPassFormConfig = (eventId: string) => {
  return {
    fields: PASS_CREATION_FIELDS,
    initialValues: {
      eventId,
      accountId: '',
      barcode: '',
      customerName: '',
      spotType: SpotType.REGULAR,
      lotId: ''
    },
    validateOnBlur: true
  };
};