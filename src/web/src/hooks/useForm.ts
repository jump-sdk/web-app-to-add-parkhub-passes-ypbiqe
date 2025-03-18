import { useReducer, useCallback, useEffect, useState } from 'react'; // v18.2.0
import {
  FormConfig,
  FormState,
  FormFieldState,
  FormActionTypes,
  FormAction,
  UseFormResult,
  FormChangeHandler,
  FormBlurHandler,
  FormSubmitHandler,
  PassFormData,
  BatchPassFormState,
  PassFormItem,
  UseBatchFormResult,
  BatchFormChangeHandler,
  BatchFormBlurHandler,
  BatchFormAddHandler,
  BatchFormRemoveHandler
} from '../types/form.types';
import { isFieldValid, isFormValid, validateField } from '../utils/validation';
import { SpotType } from '../types/api.types';

/**
 * Initializes the form state based on configuration
 * @param config - Form configuration object
 * @returns Initial form state with fields initialized from config
 */
const initializeFormState = (config: FormConfig): FormState => {
  const fields: Record<string, FormFieldState> = {};
  
  // Initialize fields from config
  config.fields.forEach(field => {
    fields[field.name] = {
      value: config.initialValues[field.name] || '',
      touched: false,
      error: null
    };
  });
  
  return {
    fields,
    isValid: true, // Assume valid initially, will be validated later
    isDirty: false,
    isSubmitting: false,
    submitCount: 0
  };
};

/**
 * Reducer function for form state management
 * @param state - Current form state
 * @param action - Action to perform on the state
 * @returns Updated form state based on the action
 */
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case FormActionTypes.SET_FIELD_VALUE:
      return {
        ...state,
        isDirty: true,
        fields: {
          ...state.fields,
          [action.payload.fieldName]: {
            ...state.fields[action.payload.fieldName],
            value: action.payload.value
          }
        }
      };
      
    case FormActionTypes.SET_FIELD_ERROR:
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.fieldName]: {
            ...state.fields[action.payload.fieldName],
            error: action.payload.error
          }
        }
      };
      
    case FormActionTypes.SET_FIELD_TOUCHED:
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.fieldName]: {
            ...state.fields[action.payload.fieldName],
            touched: true
          }
        }
      };
      
    case FormActionTypes.VALIDATE_FORM:
      return {
        ...state,
        isValid: action.payload.isValid
      };
      
    case FormActionTypes.RESET_FORM:
      return initializeFormState(action.payload.config);
      
    case FormActionTypes.SUBMIT_FORM:
      return {
        ...state,
        isSubmitting: true,
        submitCount: state.submitCount + 1
      };
      
    case FormActionTypes.SUBMIT_SUCCESS:
      return {
        ...state,
        isSubmitting: false
      };
      
    case FormActionTypes.SUBMIT_FAILURE:
      return {
        ...state,
        isSubmitting: false
      };
      
    default:
      return state;
  }
};

/**
 * Custom React hook for form state management with validation and submission handling
 * @param config - Form configuration object
 * @returns Object containing form state and handler functions
 */
export const useForm = (config: FormConfig): UseFormResult => {
  // Initialize form state using the reducer
  const [formState, dispatch] = useReducer(
    formReducer,
    config,
    initializeFormState
  );
  
  // Handle field value changes
  const handleChange: FormChangeHandler = useCallback((fieldName, value) => {
    dispatch({
      type: FormActionTypes.SET_FIELD_VALUE,
      payload: { fieldName, value }
    });
    
    if (config.validateOnChange) {
      const fieldConfig = config.fields.find(field => field.name === fieldName);
      const validationResult = validateField(fieldName, value, fieldConfig);
      
      dispatch({
        type: FormActionTypes.SET_FIELD_ERROR,
        payload: {
          fieldName,
          error: validationResult.isValid ? null : Object.values(validationResult.errors)[0]
        }
      });
    }
  }, [config]);
  
  // Handle field blur events
  const handleBlur: FormBlurHandler = useCallback((fieldName) => {
    dispatch({
      type: FormActionTypes.SET_FIELD_TOUCHED,
      payload: { fieldName }
    });
    
    if (config.validateOnBlur) {
      const fieldConfig = config.fields.find(field => field.name === fieldName);
      const fieldValue = formState.fields[fieldName]?.value || '';
      const validationResult = validateField(fieldName, fieldValue, fieldConfig);
      
      dispatch({
        type: FormActionTypes.SET_FIELD_ERROR,
        payload: {
          fieldName,
          error: validationResult.isValid ? null : Object.values(validationResult.errors)[0]
        }
      });
    }
  }, [config, formState.fields]);
  
  // Validate a specific field
  const validateSingleField = useCallback((fieldName: string): boolean => {
    const fieldConfig = config.fields.find(field => field.name === fieldName);
    const fieldValue = formState.fields[fieldName]?.value || '';
    
    const validationResult = validateField(fieldName, fieldValue, fieldConfig);
    
    dispatch({
      type: FormActionTypes.SET_FIELD_ERROR,
      payload: {
        fieldName,
        error: validationResult.isValid ? null : Object.values(validationResult.errors)[0]
      }
    });
    
    return validationResult.isValid;
  }, [config.fields, formState.fields]);
  
  // Validate all fields in the form
  const validateAllFields = useCallback((): boolean => {
    let formIsValid = true;
    const values: Record<string, string> = {};
    
    Object.keys(formState.fields).forEach(fieldName => {
      values[fieldName] = formState.fields[fieldName].value;
    });
    
    // Validate all fields
    config.fields.forEach(field => {
      const fieldName = field.name;
      const fieldValue = values[fieldName] || '';
      const validationResult = validateField(fieldName, fieldValue, field);
      
      if (!validationResult.isValid) {
        formIsValid = false;
        dispatch({
          type: FormActionTypes.SET_FIELD_ERROR,
          payload: {
            fieldName,
            error: Object.values(validationResult.errors)[0]
          }
        });
      } else {
        dispatch({
          type: FormActionTypes.SET_FIELD_ERROR,
          payload: {
            fieldName,
            error: null
          }
        });
      }
    });
    
    dispatch({
      type: FormActionTypes.VALIDATE_FORM,
      payload: { isValid: formIsValid }
    });
    
    return formIsValid;
  }, [config.fields, formState.fields]);
  
  // Handle form submission
  const handleSubmit: FormSubmitHandler = useCallback(async () => {
    dispatch({ type: FormActionTypes.SUBMIT_FORM, payload: {} });
    
    // Collect current values
    const values: Record<string, string> = {};
    Object.keys(formState.fields).forEach(fieldName => {
      values[fieldName] = formState.fields[fieldName].value;
    });
    
    // Validate all fields
    const isValid = validateAllFields();
    
    if (isValid) {
      try {
        await config.onSubmit(values);
        dispatch({ type: FormActionTypes.SUBMIT_SUCCESS, payload: {} });
      } catch (error) {
        dispatch({ type: FormActionTypes.SUBMIT_FAILURE, payload: { error } });
        throw error; // Re-throw to allow consumer to handle
      }
    } else {
      dispatch({ type: FormActionTypes.SUBMIT_FAILURE, payload: {} });
      throw new Error('Form validation failed');
    }
  }, [formState.fields, config, validateAllFields]);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    dispatch({
      type: FormActionTypes.RESET_FORM,
      payload: { config }
    });
  }, [config]);
  
  // Set a field value programmatically
  const setFieldValue = useCallback((fieldName: string, value: string) => {
    dispatch({
      type: FormActionTypes.SET_FIELD_VALUE,
      payload: { fieldName, value }
    });
  }, []);
  
  // Set a field error programmatically
  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    dispatch({
      type: FormActionTypes.SET_FIELD_ERROR,
      payload: { fieldName, error }
    });
  }, []);
  
  // Effect to validate form when fields change if validateOnChange is true
  useEffect(() => {
    if (config.validateOnChange && formState.isDirty) {
      const formIsValid = isFormValid(
        Object.keys(formState.fields).reduce((values, fieldName) => {
          values[fieldName] = formState.fields[fieldName].value;
          return values;
        }, {} as Record<string, string>),
        config.fields
      );
      
      dispatch({
        type: FormActionTypes.VALIDATE_FORM,
        payload: { isValid: formIsValid }
      });
    }
  }, [formState.fields, formState.isDirty, config]);
  
  // Return the form state and handler functions
  return {
    formState,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateField: validateSingleField,
    validateAllFields
  };
};

/**
 * Custom React hook for managing batch form operations, specifically for creating multiple passes
 * @param config - Configuration object for batch form
 * @returns Object containing batch form state and handler functions
 */
export const useBatchForm = (config: {
  eventId?: string;
  onSubmit: (passes: PassFormData[]) => Promise<void>;
}): UseBatchFormResult => {
  // State for tracking passes and their validity
  const [batchFormState, setBatchFormState] = useState<BatchPassFormState>({
    eventId: config.eventId || '',
    passes: [],
    isValid: true,
    isSubmitting: false
  });
  
  // Add a new form to the batch
  const handleAddForm: BatchFormAddHandler = useCallback(() => {
    const newPassId = `pass-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    setBatchFormState(prev => ({
      ...prev,
      passes: [
        ...prev.passes,
        {
          id: newPassId,
          data: {
            eventId: prev.eventId,
            accountId: '',
            barcode: '',
            customerName: '',
            spotType: SpotType.REGULAR,
            lotId: ''
          },
          state: {
            fields: {
              accountId: { value: '', touched: false, error: null },
              barcode: { value: '', touched: false, error: null },
              customerName: { value: '', touched: false, error: null },
              spotType: { value: SpotType.REGULAR, touched: false, error: null },
              lotId: { value: '', touched: false, error: null }
            },
            isValid: false,
            isDirty: false,
            isSubmitting: false,
            submitCount: 0
          }
        }
      ]
    }));
  }, []);
  
  // Remove a form from the batch
  const handleRemoveForm: BatchFormRemoveHandler = useCallback((id: string) => {
    setBatchFormState(prev => ({
      ...prev,
      passes: prev.passes.filter(pass => pass.id !== id)
    }));
  }, []);
  
  // Handle field change in a specific form
  const handleFieldChange: BatchFormChangeHandler = useCallback((index: number, fieldName: string, value: string) => {
    setBatchFormState(prev => {
      const newPasses = [...prev.passes];
      if (index < 0 || index >= newPasses.length) return prev;
      
      const pass = { ...newPasses[index] };
      
      // Update the data object with the new value
      pass.data = {
        ...pass.data,
        [fieldName]: value
      };
      
      // Update the form state to reflect the change
      pass.state = {
        ...pass.state,
        isDirty: true,
        fields: {
          ...pass.state.fields,
          [fieldName]: {
            ...pass.state.fields[fieldName],
            value,
            touched: true
          }
        }
      };
      
      newPasses[index] = pass;
      
      return {
        ...prev,
        passes: newPasses
      };
    });
  }, []);
  
  // Handle field blur in a specific form
  const handleFieldBlur: BatchFormBlurHandler = useCallback((index: number, fieldName: string) => {
    setBatchFormState(prev => {
      const newPasses = [...prev.passes];
      if (index < 0 || index >= newPasses.length) return prev;
      
      const pass = { ...newPasses[index] };
      const value = pass.state.fields[fieldName]?.value || '';
      
      // Validate the field
      const validationResult = validateField(fieldName, value);
      
      pass.state = {
        ...pass.state,
        fields: {
          ...pass.state.fields,
          [fieldName]: {
            ...pass.state.fields[fieldName],
            touched: true,
            error: validationResult.isValid ? null : Object.values(validationResult.errors)[0]
          }
        }
      };
      
      newPasses[index] = pass;
      
      return {
        ...prev,
        passes: newPasses
      };
    });
  }, []);
  
  // Set event ID for all passes
  const setEventId = useCallback((eventId: string) => {
    setBatchFormState(prev => {
      const newPasses = prev.passes.map(pass => ({
        ...pass,
        data: {
          ...pass.data,
          eventId
        }
      }));
      
      return {
        ...prev,
        eventId,
        passes: newPasses
      };
    });
  }, []);
  
  // Validate all passes
  const validateAllPasses = useCallback(() => {
    let allValid = true;
    
    setBatchFormState(prev => {
      const newPasses = prev.passes.map(pass => {
        // Create a validation result for each field
        const errors: Record<string, string> = {};
        let passValid = true;
        
        // Validate each field
        Object.entries(pass.data).forEach(([fieldName, value]) => {
          // Skip eventId as it's managed separately
          if (fieldName === 'eventId') return;
          
          const validationResult = validateField(fieldName, value as string);
          
          if (!validationResult.isValid) {
            passValid = false;
            allValid = false;
            Object.assign(errors, validationResult.errors);
          }
        });
        
        // Update field errors
        const newFields = { ...pass.state.fields };
        
        Object.keys(newFields).forEach(fieldName => {
          newFields[fieldName] = {
            ...newFields[fieldName],
            error: errors[fieldName] || null
          };
        });
        
        return {
          ...pass,
          state: {
            ...pass.state,
            fields: newFields,
            isValid: passValid
          }
        };
      });
      
      return {
        ...prev,
        passes: newPasses,
        isValid: allValid
      };
    });
    
    return allValid;
  }, []);
  
  // Handle submission of all passes
  const handleSubmit: FormSubmitHandler = useCallback(async () => {
    setBatchFormState(prev => ({
      ...prev,
      isSubmitting: true
    }));
    
    const isValid = validateAllPasses();
    
    if (!isValid) {
      setBatchFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
      throw new Error('Form validation failed');
    }
    
    try {
      const passData = batchFormState.passes.map(pass => pass.data);
      await config.onSubmit(passData);
      
      setBatchFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    } catch (error) {
      setBatchFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
      throw error;
    }
  }, [batchFormState.passes, config.onSubmit, validateAllPasses]);
  
  // Reset the batch form
  const resetBatchForm = useCallback(() => {
    setBatchFormState({
      eventId: config.eventId || '',
      passes: [],
      isValid: true,
      isSubmitting: false
    });
  }, [config.eventId]);
  
  // Effect to validate all passes when they change
  useEffect(() => {
    if (batchFormState.passes.length > 0) {
      validateAllPasses();
    }
  }, [batchFormState.passes, validateAllPasses]);
  
  return {
    batchFormState,
    handleFieldChange,
    handleFieldBlur,
    handleAddForm,
    handleRemoveForm,
    handleSubmit,
    resetBatchForm,
    setEventId
  };
};