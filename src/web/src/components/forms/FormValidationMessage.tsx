import React from 'react'; // ^18.2.0
import { styled } from '@mui/material/styles'; // ^5.12.0
import { Typography, Box } from '@mui/material'; // ^5.12.0
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // ^5.12.0
import Alert from '../ui/Alert'; // Internal import

/**
 * Props interface for the FormValidationMessage component
 */
export interface FormValidationMessageProps {
  /** The error message to display */
  error: string | null;
  /** Whether to display the error in compact mode (just text) */
  compact?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Styled Typography component for compact error messages
 */
export const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  fontWeight: 400,
  lineHeight: 1.66,
  letterSpacing: '0.03333em',
  marginTop: theme.spacing(0.5),
  display: 'flex',
  alignItems: 'center',
}));

/**
 * Styled container for error messages with consistent spacing
 */
export const ErrorContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

/**
 * A component that displays validation error messages for form fields.
 * Provides consistent styling and presentation of error messages across all forms in the application.
 * 
 * @param {FormValidationMessageProps} props - The component props
 * @returns {React.ReactElement | null} The rendered validation message or null if no error
 */
const FormValidationMessage: React.FC<FormValidationMessageProps> = ({
  error,
  compact = false,
  className,
}) => {
  // If no error message is provided, return null
  if (!error) {
    return null;
  }

  // For compact mode, render a styled Typography component with error message
  if (compact) {
    return (
      <ErrorText 
        className={className} 
        role="alert" 
        aria-live="polite"
      >
        <ErrorOutlineIcon 
          fontSize="small" 
          style={{ marginRight: '4px', fontSize: '1rem' }} 
        />
        {error}
      </ErrorText>
    );
  }

  // For standard mode, render an Alert component with error message
  return (
    <ErrorContainer className={className}>
      <Alert 
        severity="error" 
        variant="outlined"
        role="alert" 
        aria-live="polite"
      >
        {error}
      </Alert>
    </ErrorContainer>
  );
};

export default FormValidationMessage;