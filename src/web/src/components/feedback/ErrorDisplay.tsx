import React, { useState } from 'react'; // ^18.2.0
import { Box, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Alert from '../ui/Alert';
import Button from '../ui/Button';
import ApiKeyPrompt from './ApiKeyPrompt';
import { AppError, ErrorType } from '../../types/error.types';
import { getErrorMessage } from '../../constants/errorMessages';
import { isRetryableError } from '../../utils/retry-logic';

/**
 * Props interface for the ErrorDisplay component
 */
export interface ErrorDisplayProps {
  /** The error to display, or null for no error */
  error: AppError | null;
  /** Optional callback for when the user clicks retry */
  onRetry?: () => void;
  /** Optional callback for when the user clicks help */
  onHelp?: () => void;
  /** Optional callback for when the error display is closed */
  onClose?: () => void;
  /** Whether to show action buttons (retry/help) */
  showActions?: boolean;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Styled container for the error display with proper spacing and layout
 */
export const StyledErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  boxSizing: 'border-box',
}));

/**
 * Helper function to generate an appropriate title based on error type
 * @param errorType - The type of error
 * @returns An error title string
 */
const getErrorTitle = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.UNKNOWN:
      return 'Unexpected Error';
    default:
      return 'Error';
  }
};

/**
 * Helper function to determine the appropriate alert severity based on error type
 * @param errorType - The type of error
 * @returns The alert severity ('error' or 'warning')
 */
const getAlertSeverity = (errorType: ErrorType): 'error' | 'warning' => {
  // Server and unknown errors are considered more severe
  if (errorType === ErrorType.SERVER || errorType === ErrorType.UNKNOWN) {
    return 'error';
  }
  return 'warning';
};

/**
 * A reusable component that displays error messages with appropriate styling,
 * context-specific information, and action buttons based on the error type.
 * It handles different error categories including network, authentication,
 * validation, server, and unknown errors, providing appropriate visual feedback
 * and recovery options.
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onHelp,
  onClose,
  showActions = true,
  className,
}) => {
  // State for API key prompt visibility
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState<boolean>(false);
  
  // If there's no error, render nothing
  if (!error) return null;
  
  // Determine alert severity based on error type
  const severity = getAlertSeverity(error.type);
  
  // Generate error title based on error type
  const errorTitle = getErrorTitle(error.type);
  
  // Get formatted error message from error messages utility
  const errorMessage = getErrorMessage(error.type, error.code);
  
  // Check if this type of error can be retried
  const canRetry = isRetryableError(error);
  
  // Handle API key authentication
  const handleAuthError = () => {
    if (error.type === ErrorType.AUTHENTICATION) {
      setShowApiKeyPrompt(true);
    }
  };
  
  // Handle API key update success
  const handleApiKeySuccess = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  // Initialize the API key prompt when authentication error occurs
  if (error.type === ErrorType.AUTHENTICATION && !showApiKeyPrompt) {
    handleAuthError();
  }
  
  return (
    <StyledErrorContainer className={className}>
      <Alert 
        severity={severity}
        onClose={onClose}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="h3" fontWeight="bold">
            {errorTitle}
          </Typography>
          <Typography variant="body2">
            {errorMessage}
          </Typography>
        </Box>
      </Alert>
      
      {/* API Key Prompt for authentication errors */}
      {error.type === ErrorType.AUTHENTICATION && (
        <ApiKeyPrompt
          isOpen={showApiKeyPrompt}
          onClose={() => setShowApiKeyPrompt(false)}
          onSuccess={handleApiKeySuccess}
          errorMessage={errorMessage}
        />
      )}
      
      {/* Action buttons */}
      {showActions && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="contained"
              color="primary"
              aria-label="Retry operation"
            >
              Retry
            </Button>
          )}
          
          {onHelp && (
            <Button
              onClick={onHelp}
              variant="outlined"
              color="info"
              aria-label="Get help"
            >
              Help
            </Button>
          )}
        </Box>
      )}
    </StyledErrorContainer>
  );
};

export default ErrorDisplay;