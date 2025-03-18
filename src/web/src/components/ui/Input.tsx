import React from 'react';
import { TextField, InputAdornment } from '@mui/material'; // @mui/material ^5.12.0
import { styled } from '@mui/material/styles'; // @mui/material/styles ^5.12.0
// FormFieldState is imported for typing consistency with form state management
import { FormFieldState } from '../../types/form.types';

/**
 * Props for the Input component.
 */
export interface InputProps {
  /** Unique identifier for the input field */
  name: string;
  /** Label text displayed above the input */
  label: string;
  /** Type of input field */
  type: 'text' | 'number' | 'password' | 'email' | 'tel' | 'date';
  /** Current value of the input */
  value: string;
  /** Callback when value changes */
  onChange: (name: string, value: string) => void;
  /** Callback when field loses focus */
  onBlur: (name: string) => void;
  /** Placeholder text displayed when input is empty */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether the input should take up full width of container */
  fullWidth?: boolean;
  /** Content to display at the start of the input */
  startAdornment?: React.ReactNode;
  /** Content to display at the end of the input */
  endAdornment?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Whether the input should be focused initially */
  autoFocus?: boolean;
}

/**
 * Styled TextField component with consistent styling across the application.
 */
export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiInputBase-root': {
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-error fieldset': {
      borderColor: theme.palette.error.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
  // Make sure input is readable in both light and dark themes
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
  },
  // Ensure adequate spacing for validation messages
  '& .MuiFormHelperText-root': {
    minHeight: '1.25rem',
  }
}));

/**
 * A customizable input component that wraps Material UI TextField 
 * with consistent styling and error handling.
 * 
 * This component is used throughout the application for text and number input fields,
 * particularly in the pass creation forms.
 */
const Input: React.FC<InputProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  fullWidth = true,
  startAdornment,
  endAdornment,
  className,
  autoFocus = false,
}) => {
  /**
   * Handles input value changes and calls the onChange callback with field name and value.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  /**
   * Handles input blur events and calls the onBlur callback with field name.
   */
  const handleBlur = () => {
    onBlur(name);
  };

  return (
    <StyledTextField
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error}
      fullWidth={fullWidth}
      className={className}
      autoFocus={autoFocus}
      variant="outlined"
      margin="normal"
      InputProps={{
        startAdornment: startAdornment && (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ),
        endAdornment: endAdornment && (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ),
      }}
      // Add ARIA attributes for accessibility
      inputProps={{
        'aria-label': label,
        'aria-required': required,
        'aria-invalid': !!error,
        'data-testid': `input-${name}`,
      }}
    />
  );
};

export default Input;