import React from 'react'; // ^18.2.0
import { Box } from '@mui/material'; // ^5.12.0
import { styled } from '@mui/material/styles'; // ^5.12.0

import Input from '../ui/Input';
import Select from '../ui/Select';
import FormValidationMessage from './FormValidationMessage';
import { 
  FormField as FormFieldType, 
  FormFieldState, 
  FieldType 
} from '../../types/form.types';

/**
 * Props interface for the FormField component
 */
export interface FormFieldProps {
  /** Configuration for the form field */
  field: FormFieldType;
  /** Current state of the form field */
  fieldState: FormFieldState;
  /** Handler for value changes */
  onChange: (name: string, value: string) => void;
  /** Handler for blur events */
  onBlur: (name: string) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Styled container for form fields with consistent spacing
 */
export const FieldContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
}));

/**
 * A reusable form field component that renders the appropriate input type based on field configuration.
 * It handles different field types (text, select, etc.), manages field state, and displays validation messages.
 *
 * @param props - Component props
 * @returns The rendered form field component
 */
const FormField: React.FC<FormFieldProps> = ({
  field,
  fieldState,
  onChange,
  onBlur,
  disabled = false,
  className = '',
}) => {
  const { name, label, type, required, placeholder, options } = field;
  const { value, touched, error } = fieldState;

  // Only show error if field has been touched and has an error
  const showError = touched && Boolean(error);
  const errorMessage = showError ? error : null;

  // Render the appropriate field type based on the field configuration
  const renderField = () => {
    switch (type) {
      case FieldType.SELECT:
        if (!options || options.length === 0) {
          console.error(`Select field "${name}" requires options but none were provided.`);
          return null;
        }
        return (
          <Select
            name={name}
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            error={errorMessage}
            placeholder={placeholder}
            fullWidth
          />
        );
      case FieldType.TEXTAREA:
        // For textarea type, we use the regular Input with specialized handling
        // Note: In a real implementation, this might use a dedicated textarea component
        return (
          <Input
            name={name}
            label={label}
            type="text"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            error={errorMessage}
            fullWidth
          />
        );
      case FieldType.NUMBER:
        return (
          <Input
            name={name}
            label={label}
            type="number"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            error={errorMessage}
            fullWidth
          />
        );
      case FieldType.DATE:
        return (
          <Input
            name={name}
            label={label}
            type="date"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            error={errorMessage}
            fullWidth
          />
        );
      case FieldType.TEXT:
      default:
        return (
          <Input
            name={name}
            label={label}
            type="text"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            error={errorMessage}
            fullWidth
          />
        );
    }
  };

  return (
    <FieldContainer 
      className={className} 
      data-testid={`field-container-${name}`}
      role="group"
      aria-labelledby={`${name}-label`}
    >
      {renderField()}
      {/* We don't need to render FormValidationMessage separately as 
          Input and Select components handle error display internally */}
    </FieldContainer>
  );
};

export default FormField;