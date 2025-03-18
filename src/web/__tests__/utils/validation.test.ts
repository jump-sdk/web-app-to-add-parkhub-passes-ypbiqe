import {
  validateField,
  validateForm,
  validatePassForm,
  validateEventId,
  validateBarcode,
  isFormValid,
  isFieldValid,
  createValidationError
} from '../../src/utils/validation';
import { VALIDATION_PATTERNS } from '../../src/constants/validation';
import { FIELD_ERROR_MESSAGES } from '../../src/constants/errorMessages';
import { FormField, PassFormData } from '../../src/types/form.types';
import { SpotType } from '../../src/types/api.types';
import { ErrorType, ErrorCode } from '../../src/types/error.types';

describe('validateField', () => {
  it('should return invalid result for unknown field', () => {
    const result = validateField('unknownField', 'value');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('unknownField');
    expect(result.errors['unknownField']).toContain('Unknown field');
  });

  it('should validate required fields and return error if empty', () => {
    const fieldConfig: FormField = {
      name: 'testField',
      label: 'Test Field',
      type: FieldType.TEXT,
      required: true,
      validationMessage: 'This field is required'
    };
    
    // Empty string
    let result = validateField('testField', '', fieldConfig);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('testField');
    expect(result.errors['testField']).toBe('This field is required');
    
    // Only whitespace
    result = validateField('testField', '   ', fieldConfig);
    expect(result.isValid).toBe(false);
    
    // Null value
    result = validateField('testField', null as unknown as string, fieldConfig);
    expect(result.isValid).toBe(false);
  });

  it('should validate optional fields and pass if empty', () => {
    const fieldConfig: FormField = {
      name: 'testField',
      label: 'Test Field',
      type: FieldType.TEXT,
      required: false,
      validation: /^[A-Z]+$/
    };
    
    const result = validateField('testField', '', fieldConfig);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should validate field with minimum length requirement', () => {
    // Using default validation rules for customerName which has min length of 2
    const result = validateField('customerName', 'A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('customerName');
    expect(result.errors['customerName']).toContain('at least');
    
    // Valid length
    const validResult = validateField('customerName', 'John');
    expect(validResult.isValid).toBe(true);
  });

  it('should validate field with maximum length requirement', () => {
    // Using default validation rules for customerName which has max length of 50
    const longName = 'A'.repeat(51);
    const result = validateField('customerName', longName);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('customerName');
    expect(result.errors['customerName']).toContain('cannot exceed');
    
    // Valid length
    const validResult = validateField('customerName', 'John Doe');
    expect(validResult.isValid).toBe(true);
  });

  it('should validate field with pattern validation', () => {
    // Using eventId which must match EVENT_ID pattern
    const result = validateField('eventId', 'INVALID');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('eventId');
    
    // Valid pattern
    const validResult = validateField('eventId', 'EV12345');
    expect(validResult.isValid).toBe(true);
  });

  it('should validate spotType field with valid values', () => {
    // Valid spot types: Regular, VIP, Premium
    const regularResult = validateField('spotType', SpotType.REGULAR);
    expect(regularResult.isValid).toBe(true);
    
    const vipResult = validateField('spotType', SpotType.VIP);
    expect(vipResult.isValid).toBe(true);
    
    const premiumResult = validateField('spotType', SpotType.PREMIUM);
    expect(premiumResult.isValid).toBe(true);
  });

  it('should validate spotType field with invalid values', () => {
    // Invalid spot type
    const result = validateField('spotType', 'Invalid');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('spotType');
    expect(result.errors['spotType']).toBe(FIELD_ERROR_MESSAGES.spotType[ErrorCode.INVALID_INPUT]);
  });

  it('should validate with custom field configuration', () => {
    const customConfig: FormField = {
      name: 'customField',
      label: 'Custom Field',
      type: FieldType.TEXT,
      required: true,
      validation: /^[0-9]{3}$/,
      validationMessage: 'Must be exactly 3 digits'
    };
    
    // Invalid
    const invalidResult = validateField('customField', '12', customConfig);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors['customField']).toBe('Must be exactly 3 digits');
    
    // Valid
    const validResult = validateField('customField', '123', customConfig);
    expect(validResult.isValid).toBe(true);
  });
});

describe('validateForm', () => {
  it('should validate a form with all valid fields', () => {
    const values = {
      field1: 'value1',
      field2: 'value2'
    };
    
    const fields: FormField[] = [
      {
        name: 'field1',
        label: 'Field 1',
        type: FieldType.TEXT,
        required: true
      },
      {
        name: 'field2',
        label: 'Field 2',
        type: FieldType.TEXT,
        required: true
      }
    ];
    
    const result = validateForm(values, fields);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should validate a form with some invalid fields', () => {
    const values = {
      field1: '', // Required but empty
      field2: 'value2'
    };
    
    const fields: FormField[] = [
      {
        name: 'field1',
        label: 'Field 1',
        type: FieldType.TEXT,
        required: true,
        validationMessage: 'Field 1 is required'
      },
      {
        name: 'field2',
        label: 'Field 2',
        type: FieldType.TEXT,
        required: true
      }
    ];
    
    const result = validateForm(values, fields);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('field1');
    expect(result.errors['field1']).toBe('Field 1 is required');
    expect(result.errors).not.toHaveProperty('field2');
  });

  it('should validate a form with all invalid fields', () => {
    const values = {
      field1: '', // Required but empty
      field2: ''  // Required but empty
    };
    
    const fields: FormField[] = [
      {
        name: 'field1',
        label: 'Field 1',
        type: FieldType.TEXT,
        required: true
      },
      {
        name: 'field2',
        label: 'Field 2',
        type: FieldType.TEXT,
        required: true
      }
    ];
    
    const result = validateForm(values, fields);
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(2);
    expect(result.errors).toHaveProperty('field1');
    expect(result.errors).toHaveProperty('field2');
  });

  it('should validate a form with custom field configurations', () => {
    const values = {
      eventId: 'EV12345',
      barcode: 'BC123456',
      spotType: SpotType.REGULAR
    };
    
    const fields: FormField[] = [
      {
        name: 'eventId',
        label: 'Event ID',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.EVENT_ID
      },
      {
        name: 'barcode',
        label: 'Barcode',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.BARCODE
      },
      {
        name: 'spotType',
        label: 'Spot Type',
        type: FieldType.SELECT,
        required: true,
        options: [
          { value: SpotType.REGULAR, label: 'Regular' },
          { value: SpotType.VIP, label: 'VIP' },
          { value: SpotType.PREMIUM, label: 'Premium' }
        ]
      }
    ];
    
    const result = validateForm(values, fields);
    expect(result.isValid).toBe(true);
    
    // Test with invalid barcode
    const invalidValues = { ...values, barcode: 'INVALID' };
    const invalidResult = validateForm(invalidValues, fields);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toHaveProperty('barcode');
  });
});

describe('validatePassForm', () => {
  it('should validate a valid pass form', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC123456',
      customerName: 'John Doe',
      spotType: SpotType.REGULAR,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should validate a pass form with invalid eventId', () => {
    const passForm: PassFormData = {
      eventId: 'INVALID',
      accountId: 'ABC123',
      barcode: 'BC123456',
      customerName: 'John Doe',
      spotType: SpotType.REGULAR,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('eventId');
    expect(result.errors['eventId']).toBe(FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT]);
  });

  it('should validate a pass form with invalid accountId', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: '', // Required but empty
      barcode: 'BC123456',
      customerName: 'John Doe',
      spotType: SpotType.REGULAR,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('accountId');
  });

  it('should validate a pass form with invalid barcode', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'INVALID',
      customerName: 'John Doe',
      spotType: SpotType.REGULAR,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('barcode');
    expect(result.errors['barcode']).toBe(FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT]);
  });

  it('should validate a pass form with invalid customerName', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC123456',
      customerName: '', // Required but empty
      spotType: SpotType.REGULAR,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('customerName');
  });

  it('should validate a pass form with invalid spotType', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC123456',
      customerName: 'John Doe',
      spotType: 'Invalid' as SpotType,
      lotId: 'LOT-A'
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('spotType');
    expect(result.errors['spotType']).toBe(FIELD_ERROR_MESSAGES.spotType[ErrorCode.INVALID_INPUT]);
  });

  it('should validate a pass form with invalid lotId', () => {
    const passForm: PassFormData = {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC123456',
      customerName: 'John Doe',
      spotType: SpotType.REGULAR,
      lotId: '' // Required but empty
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('lotId');
  });

  it('should validate a pass form with multiple invalid fields', () => {
    const passForm: PassFormData = {
      eventId: 'INVALID',
      accountId: '',
      barcode: 'INVALID',
      customerName: '',
      spotType: 'Invalid' as SpotType,
      lotId: ''
    };
    
    const result = validatePassForm(passForm);
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(6); // All 6 fields should have errors
  });
});

describe('validateEventId', () => {
  it('should validate a valid event ID', () => {
    const result = validateEventId('EV12345');
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should invalidate an empty event ID', () => {
    const emptyResult = validateEventId('');
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.errors).toHaveProperty('eventId');
    expect(emptyResult.errors['eventId']).toBe(FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT]);
    
    const whitespaceResult = validateEventId('   ');
    expect(whitespaceResult.isValid).toBe(false);
  });

  it('should invalidate an event ID with invalid format', () => {
    const result = validateEventId('EV123ABC');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('eventId');
    expect(result.errors['eventId']).toBe(FIELD_ERROR_MESSAGES.eventId[ErrorCode.INVALID_INPUT]);
  });

  it('should invalidate an event ID with incorrect prefix', () => {
    const result = validateEventId('AB12345');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('eventId');
  });

  it('should invalidate an event ID with incorrect length', () => {
    // Too short
    const shortResult = validateEventId('EV123');
    expect(shortResult.isValid).toBe(false);
    
    // Too long
    const longResult = validateEventId('EV123456');
    expect(longResult.isValid).toBe(false);
  });
});

describe('validateBarcode', () => {
  it('should validate a valid barcode', () => {
    const result = validateBarcode('BC123456');
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should invalidate an empty barcode', () => {
    const emptyResult = validateBarcode('');
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.errors).toHaveProperty('barcode');
    expect(emptyResult.errors['barcode']).toBe(FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT]);
    
    const whitespaceResult = validateBarcode('   ');
    expect(whitespaceResult.isValid).toBe(false);
  });

  it('should invalidate a barcode with invalid format', () => {
    const result = validateBarcode('BC12345A');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('barcode');
    expect(result.errors['barcode']).toBe(FIELD_ERROR_MESSAGES.barcode[ErrorCode.INVALID_INPUT]);
  });

  it('should invalidate a barcode with incorrect prefix', () => {
    const result = validateBarcode('XX123456');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('barcode');
  });

  it('should invalidate a barcode with incorrect length', () => {
    // Too short
    const shortResult = validateBarcode('BC12345');
    expect(shortResult.isValid).toBe(false);
    
    // Too long
    const longResult = validateBarcode('BC1234567');
    expect(longResult.isValid).toBe(false);
  });

  it('should invalidate a duplicate barcode', () => {
    const existingBarcodes = ['BC123456', 'BC234567'];
    const result = validateBarcode('BC123456', existingBarcodes);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('barcode');
    expect(result.errors['barcode']).toBe(FIELD_ERROR_MESSAGES.barcode[ErrorCode.DUPLICATE_BARCODE]);
  });

  it('should validate a unique barcode when existing barcodes are provided', () => {
    const existingBarcodes = ['BC123456', 'BC234567'];
    const result = validateBarcode('BC345678', existingBarcodes);
    
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});

describe('isFormValid', () => {
  it('should return true for a valid form', () => {
    const values = {
      field1: 'value1',
      field2: 'value2'
    };
    
    const fields: FormField[] = [
      {
        name: 'field1',
        label: 'Field 1',
        type: FieldType.TEXT,
        required: true
      },
      {
        name: 'field2',
        label: 'Field 2',
        type: FieldType.TEXT,
        required: true
      }
    ];
    
    const result = isFormValid(values, fields);
    expect(result).toBe(true);
  });

  it('should return false for an invalid form', () => {
    const values = {
      field1: '', // Required but empty
      field2: 'value2'
    };
    
    const fields: FormField[] = [
      {
        name: 'field1',
        label: 'Field 1',
        type: FieldType.TEXT,
        required: true
      },
      {
        name: 'field2',
        label: 'Field 2',
        type: FieldType.TEXT,
        required: true
      }
    ];
    
    const result = isFormValid(values, fields);
    expect(result).toBe(false);
  });

  it('should work with custom field configurations', () => {
    const values = {
      eventId: 'INVALID',
      barcode: 'BC123456'
    };
    
    const fields: FormField[] = [
      {
        name: 'eventId',
        label: 'Event ID',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.EVENT_ID
      },
      {
        name: 'barcode',
        label: 'Barcode',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.BARCODE
      }
    ];
    
    const result = isFormValid(values, fields);
    expect(result).toBe(false);
    
    // Fix the values and test again
    const validValues = {
      eventId: 'EV12345',
      barcode: 'BC123456'
    };
    
    const validResult = isFormValid(validValues, fields);
    expect(validResult).toBe(true);
  });
});

describe('isFieldValid', () => {
  it('should return true for a valid field', () => {
    const result = isFieldValid('eventId', 'EV12345');
    expect(result).toBe(true);
  });

  it('should return false for an invalid field', () => {
    const result = isFieldValid('eventId', 'INVALID');
    expect(result).toBe(false);
  });

  it('should work with custom field configuration', () => {
    const customConfig: FormField = {
      name: 'customField',
      label: 'Custom Field',
      type: FieldType.TEXT,
      required: true,
      validation: /^[0-9]{3}$/,
      validationMessage: 'Must be exactly 3 digits'
    };
    
    const invalidResult = isFieldValid('customField', '12', customConfig);
    expect(invalidResult).toBe(false);
    
    const validResult = isFieldValid('customField', '123', customConfig);
    expect(validResult).toBe(true);
  });
});

describe('createValidationError', () => {
  it('should create a validation error with the correct type and code', () => {
    const validationResult = {
      isValid: false,
      errors: {
        field1: 'Field 1 is invalid'
      }
    };
    
    const error = createValidationError(validationResult);
    expect(error).toHaveProperty('type', ErrorType.VALIDATION);
    expect(error).toHaveProperty('code', ErrorCode.INVALID_INPUT);
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('fieldErrors');
    expect(error).toHaveProperty('timestamp');
  });

  it('should include the provided field name', () => {
    const validationResult = {
      isValid: false,
      errors: {
        field1: 'Field 1 is invalid'
      }
    };
    
    const error = createValidationError(validationResult, 'field1');
    expect(error).toHaveProperty('field', 'field1');
  });

  it('should include the validation errors from the validation result', () => {
    const validationResult = {
      isValid: false,
      errors: {
        field1: 'Field 1 is invalid',
        field2: 'Field 2 is invalid'
      }
    };
    
    const error = createValidationError(validationResult);
    expect(error).toHaveProperty('fieldErrors');
    expect(error.fieldErrors).toEqual(validationResult.errors);
    expect(Object.keys(error.fieldErrors).length).toBe(2);
    expect(error.fieldErrors['field1']).toBe('Field 1 is invalid');
    expect(error.fieldErrors['field2']).toBe('Field 2 is invalid');
  });
});

// Import needed for FieldType enum in tests
enum FieldType {
  TEXT = 'text',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date'
}