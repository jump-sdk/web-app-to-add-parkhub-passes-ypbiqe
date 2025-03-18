import { renderHook, act } from '@testing-library/react-hooks'; // v8.0.1
import { waitFor } from '@testing-library/react'; // v14.0.0
import { useForm, useBatchForm } from '../../src/hooks/useForm';
import { 
  FormConfig, 
  FormField, 
  FieldType 
} from '../../src/types/form.types';
import { SpotType } from '../../src/types/api.types';
import { VALIDATION_PATTERNS } from '../../src/constants/validation';

describe('useForm hook', () => {
  // Create a test form configuration
  const createMockFormConfig = (overrides = {}): FormConfig => ({
    fields: [
      {
        name: 'eventId',
        label: 'Event ID',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.EVENT_ID,
        validationMessage: 'Event ID must be in the format EV##### (where # is a digit)'
      },
      {
        name: 'barcode',
        label: 'Barcode',
        type: FieldType.TEXT,
        required: true,
        validation: VALIDATION_PATTERNS.BARCODE,
        validationMessage: 'Barcode must follow the format BC###### (where # is a digit)'
      }
    ],
    initialValues: {
      eventId: '',
      barcode: ''
    },
    onSubmit: jest.fn(),
    validateOnBlur: true,
    validateOnChange: false,
    ...overrides
  });

  test('should initialize form with initial values', () => {
    const mockConfig = createMockFormConfig({
      initialValues: {
        eventId: 'EV12345',
        barcode: 'BC123456'
      }
    });

    const { result } = renderHook(() => useForm(mockConfig));

    expect(result.current.formState.fields.eventId.value).toBe('EV12345');
    expect(result.current.formState.fields.barcode.value).toBe('BC123456');
    expect(result.current.formState.isValid).toBe(true);
    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.isSubmitting).toBe(false);
    expect(result.current.formState.submitCount).toBe(0);
  });

  test('should update field value when handleChange is called', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    act(() => {
      result.current.handleChange('eventId', 'EV12345');
    });

    expect(result.current.formState.fields.eventId.value).toBe('EV12345');
    expect(result.current.formState.isDirty).toBe(true);
    expect(result.current.formState.fields.eventId.touched).toBe(false); // Not touched, only changed
  });

  test('should mark field as touched and validate when handleBlur is called', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    // Set invalid value
    act(() => {
      result.current.handleChange('eventId', 'invalid');
    });

    // Trigger blur
    act(() => {
      result.current.handleBlur('eventId');
    });

    expect(result.current.formState.fields.eventId.touched).toBe(true);
    expect(result.current.formState.fields.eventId.error).not.toBeNull();
    expect(result.current.formState.isValid).toBe(false);
  });

  test('should set field value directly using setFieldValue', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    act(() => {
      result.current.setFieldValue('eventId', 'EV12345');
    });

    expect(result.current.formState.fields.eventId.value).toBe('EV12345');
    expect(result.current.formState.isDirty).toBe(true);
  });

  test('should set field error directly using setFieldError', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    act(() => {
      result.current.setFieldError('eventId', 'Custom error message');
    });

    expect(result.current.formState.fields.eventId.error).toBe('Custom error message');
  });

  test('should validate field using validateField', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    // Set invalid value
    act(() => {
      result.current.setFieldValue('eventId', 'invalid');
    });

    // Validate the field
    let isValid;
    act(() => {
      isValid = result.current.validateField('eventId');
    });

    expect(isValid).toBe(false);
    expect(result.current.formState.fields.eventId.error).not.toBeNull();
  });

  test('should validate all fields using validateAllFields', () => {
    const mockConfig = createMockFormConfig();
    const { result } = renderHook(() => useForm(mockConfig));

    // Set one valid field and one invalid field
    act(() => {
      result.current.setFieldValue('eventId', 'EV12345');
      result.current.setFieldValue('barcode', 'invalid');
    });

    // Validate all fields
    let isValid;
    act(() => {
      isValid = result.current.validateAllFields();
    });

    expect(isValid).toBe(false);
    expect(result.current.formState.fields.eventId.error).toBeNull();
    expect(result.current.formState.fields.barcode.error).not.toBeNull();
    expect(result.current.formState.isValid).toBe(false);
  });

  test('should reset form to initial values when resetForm is called', () => {
    const mockConfig = createMockFormConfig({
      initialValues: {
        eventId: 'EV12345',
        barcode: 'BC123456'
      }
    });
    const { result } = renderHook(() => useForm(mockConfig));

    // Change values
    act(() => {
      result.current.handleChange('eventId', 'EV67890');
      result.current.handleChange('barcode', 'BC654321');
    });

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formState.fields.eventId.value).toBe('EV12345');
    expect(result.current.formState.fields.barcode.value).toBe('BC123456');
    expect(result.current.formState.isDirty).toBe(false);
  });

  test('should submit form when all fields are valid', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    const mockConfig = createMockFormConfig({
      onSubmit: mockSubmit
    });
    const { result } = renderHook(() => useForm(mockConfig));

    // Set valid values
    act(() => {
      result.current.setFieldValue('eventId', 'EV12345');
      result.current.setFieldValue('barcode', 'BC123456');
    });

    // Submit form
    let submitPromise;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // Check that isSubmitting is true during submission
    expect(result.current.formState.isSubmitting).toBe(true);

    // Wait for submission to complete
    await act(async () => {
      await submitPromise;
    });

    // Verify onSubmit was called with correct values
    expect(mockSubmit).toHaveBeenCalledWith({
      eventId: 'EV12345',
      barcode: 'BC123456'
    });
    
    // Check that submitCount is incremented and isSubmitting is reset
    expect(result.current.formState.submitCount).toBe(1);
    expect(result.current.formState.isSubmitting).toBe(false);
  });

  test('should not submit form when fields are invalid', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    const mockConfig = createMockFormConfig({
      onSubmit: mockSubmit
    });
    const { result } = renderHook(() => useForm(mockConfig));

    // Set invalid values
    act(() => {
      result.current.setFieldValue('eventId', 'invalid');
      result.current.setFieldValue('barcode', 'also-invalid');
    });

    // Submit form should throw
    await expect(async () => {
      await act(async () => {
        await result.current.handleSubmit();
      });
    }).rejects.toThrow('Form validation failed');

    // Verify onSubmit was not called
    expect(mockSubmit).not.toHaveBeenCalled();
    
    // Check that form is marked as invalid and errors are set
    expect(result.current.formState.isValid).toBe(false);
    expect(result.current.formState.fields.eventId.error).not.toBeNull();
    expect(result.current.formState.fields.barcode.error).not.toBeNull();
  });

  test('should validate on change when validateOnChange is true', () => {
    const mockConfig = createMockFormConfig({
      validateOnChange: true
    });
    const { result } = renderHook(() => useForm(mockConfig));

    // Set invalid value
    act(() => {
      result.current.handleChange('eventId', 'invalid');
    });

    // Check that validation occurred immediately
    expect(result.current.formState.fields.eventId.error).not.toBeNull();
    expect(result.current.formState.isValid).toBe(false);
  });

  test('should validate on blur when validateOnBlur is true', () => {
    const mockConfig = createMockFormConfig({
      validateOnBlur: true,
      validateOnChange: false
    });
    const { result } = renderHook(() => useForm(mockConfig));

    // Set invalid value without validation
    act(() => {
      result.current.handleChange('eventId', 'invalid');
    });

    // Should not validate yet
    expect(result.current.formState.fields.eventId.error).toBeNull();

    // Trigger blur
    act(() => {
      result.current.handleBlur('eventId');
    });

    // Now validation should have occurred
    expect(result.current.formState.fields.eventId.error).not.toBeNull();
  });
});

describe('useBatchForm hook', () => {
  const createMockBatchFormConfig = (overrides = {}) => ({
    eventId: 'EV12345',
    onSubmit: jest.fn(),
    ...overrides
  });

  test('should initialize batch form with event ID', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    expect(result.current.batchFormState.eventId).toBe('EV12345');
    expect(result.current.batchFormState.passes).toEqual([]);
    expect(result.current.batchFormState.isValid).toBe(true);
    expect(result.current.batchFormState.isSubmitting).toBe(false);
  });

  test('should add new pass form when handleAddForm is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    act(() => {
      result.current.handleAddForm();
    });

    expect(result.current.batchFormState.passes.length).toBe(1);
    expect(result.current.batchFormState.passes[0].data.eventId).toBe('EV12345');
    expect(result.current.batchFormState.passes[0].data.accountId).toBe('');
    expect(result.current.batchFormState.passes[0].data.barcode).toBe('');
    expect(result.current.batchFormState.passes[0].data.customerName).toBe('');
    expect(result.current.batchFormState.passes[0].data.spotType).toBe(SpotType.REGULAR);
    expect(result.current.batchFormState.passes[0].data.lotId).toBe('');
  });

  test('should remove pass form when handleRemoveForm is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add two pass forms
    act(() => {
      result.current.handleAddForm();
      result.current.handleAddForm();
    });

    const passId = result.current.batchFormState.passes[0].id;

    // Remove the first one
    act(() => {
      result.current.handleRemoveForm(passId);
    });

    expect(result.current.batchFormState.passes.length).toBe(1);
    expect(result.current.batchFormState.passes[0].id).not.toBe(passId);
  });

  test('should update field in specific pass when handleFieldChange is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add two pass forms
    act(() => {
      result.current.handleAddForm();
      result.current.handleAddForm();
    });

    // Update a field in the first pass
    act(() => {
      result.current.handleFieldChange(0, 'barcode', 'BC123456');
    });

    expect(result.current.batchFormState.passes[0].data.barcode).toBe('BC123456');
    expect(result.current.batchFormState.passes[0].state.fields.barcode.value).toBe('BC123456');
    expect(result.current.batchFormState.passes[0].state.fields.barcode.touched).toBe(true);
    
    // Second pass should be unchanged
    expect(result.current.batchFormState.passes[1].data.barcode).toBe('');
  });

  test('should validate field in specific pass when handleFieldBlur is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add a pass form
    act(() => {
      result.current.handleAddForm();
    });

    // Set invalid value
    act(() => {
      result.current.handleFieldChange(0, 'barcode', 'invalid');
    });

    // Trigger blur
    act(() => {
      result.current.handleFieldBlur(0, 'barcode');
    });

    expect(result.current.batchFormState.passes[0].state.fields.barcode.touched).toBe(true);
    expect(result.current.batchFormState.passes[0].state.fields.barcode.error).not.toBeNull();
  });

  test('should update eventId for all passes when setEventId is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add two pass forms
    act(() => {
      result.current.handleAddForm();
      result.current.handleAddForm();
    });

    // Update event ID
    act(() => {
      result.current.setEventId('EV67890');
    });

    expect(result.current.batchFormState.eventId).toBe('EV67890');
    expect(result.current.batchFormState.passes[0].data.eventId).toBe('EV67890');
    expect(result.current.batchFormState.passes[1].data.eventId).toBe('EV67890');
  });

  test('should reset batch form when resetBatchForm is called', () => {
    const mockConfig = createMockBatchFormConfig();
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add pass forms and modify them
    act(() => {
      result.current.handleAddForm();
      result.current.handleFieldChange(0, 'barcode', 'BC123456');
    });

    // Reset batch form
    act(() => {
      result.current.resetBatchForm();
    });

    expect(result.current.batchFormState.passes).toEqual([]);
    expect(result.current.batchFormState.eventId).toBe('EV12345');
  });

  test('should submit all valid passes when handleSubmit is called', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    const mockConfig = createMockBatchFormConfig({
      onSubmit: mockSubmit
    });
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add two pass forms
    act(() => {
      result.current.handleAddForm();
      result.current.handleAddForm();
    });

    // Set valid values for both passes
    act(() => {
      result.current.handleFieldChange(0, 'accountId', 'ACC123');
      result.current.handleFieldChange(0, 'barcode', 'BC123456');
      result.current.handleFieldChange(0, 'customerName', 'John Doe');
      result.current.handleFieldChange(0, 'lotId', 'LOT-A');

      result.current.handleFieldChange(1, 'accountId', 'ACC456');
      result.current.handleFieldChange(1, 'barcode', 'BC654321');
      result.current.handleFieldChange(1, 'customerName', 'Jane Smith');
      result.current.handleFieldChange(1, 'lotId', 'LOT-B');
    });

    // Submit batch form
    let submitPromise;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // Check that isSubmitting is true during submission
    expect(result.current.batchFormState.isSubmitting).toBe(true);

    // Wait for submission to complete
    await act(async () => {
      await submitPromise;
    });

    // Verify onSubmit was called with correct values
    expect(mockSubmit).toHaveBeenCalledWith([
      {
        eventId: 'EV12345',
        accountId: 'ACC123',
        barcode: 'BC123456',
        customerName: 'John Doe',
        spotType: SpotType.REGULAR,
        lotId: 'LOT-A'
      },
      {
        eventId: 'EV12345',
        accountId: 'ACC456',
        barcode: 'BC654321',
        customerName: 'Jane Smith',
        spotType: SpotType.REGULAR,
        lotId: 'LOT-B'
      }
    ]);
    
    // Check that isSubmitting is reset
    expect(result.current.batchFormState.isSubmitting).toBe(false);
  });

  test('should not submit when passes have validation errors', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    const mockConfig = createMockBatchFormConfig({
      onSubmit: mockSubmit
    });
    const { result } = renderHook(() => useBatchForm(mockConfig));

    // Add a pass form
    act(() => {
      result.current.handleAddForm();
    });

    // Set invalid values
    act(() => {
      result.current.handleFieldChange(0, 'barcode', 'invalid');
    });

    // Submit batch form should throw
    await expect(async () => {
      await act(async () => {
        await result.current.handleSubmit();
      });
    }).rejects.toThrow('Form validation failed');

    // Verify onSubmit was not called
    expect(mockSubmit).not.toHaveBeenCalled();
    
    // Check that form is marked as invalid
    expect(result.current.batchFormState.isValid).toBe(false);
  });
});