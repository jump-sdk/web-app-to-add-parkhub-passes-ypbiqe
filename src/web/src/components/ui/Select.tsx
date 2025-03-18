import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select as MuiSelect, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent 
} from '@mui/material'; // version: ^5.12.0
import { styled } from '@mui/material/styles'; // version: ^5.12.0
import { FormFieldOption } from '../../types/form.types';

/**
 * Props for the Select component
 */
export interface SelectProps {
  /** Field name */
  name: string;
  /** Label text */
  label: string;
  /** Array of options for the select field */
  options: FormFieldOption[];
  /** Current field value */
  value: string;
  /** Handler for value changes */
  onChange: (name: string, value: string) => void;
  /** Handler for blur events */
  onBlur: (name: string) => void;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether the component should take up the full width of its container */
  fullWidth?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
}

/**
 * Styled FormControl component with consistent margin and width handling
 */
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  minWidth: 120,
}));

/**
 * Styled Select component with consistent styling
 */
export const StyledSelect = styled(MuiSelect)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: theme.spacing(1.5),
  },
}));

/**
 * A customizable select component that wraps Material UI Select with consistent styling and error handling
 * 
 * @param props - Component props
 * @returns A select input field with label and error handling
 */
const Select = ({
  name,
  label,
  options,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = null,
  fullWidth = true,
  className = '',
  placeholder = '',
}: SelectProps): React.ReactElement => {
  
  /**
   * Handle select value changes
   * @param event - Select change event
   */
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(name, event.target.value);
  };
  
  /**
   * Handle select blur events
   */
  const handleBlur = () => {
    onBlur(name);
  };

  const hasError = Boolean(error);
  const labelId = `${name}-label`;

  return (
    <StyledFormControl 
      variant="outlined" 
      fullWidth={fullWidth} 
      error={hasError}
      className={className}
      data-testid={`select-${name}`}
    >
      <InputLabel 
        id={labelId} 
        required={required}
        error={hasError}
      >
        {label}
      </InputLabel>
      <StyledSelect
        labelId={labelId}
        id={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        label={label}
        disabled={disabled}
        displayEmpty={Boolean(placeholder)}
        aria-describedby={hasError ? `${name}-error-text` : undefined}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
      {hasError && (
        <FormHelperText id={`${name}-error-text`} error>{error}</FormHelperText>
      )}
    </StyledFormControl>
  );
};

export default Select;