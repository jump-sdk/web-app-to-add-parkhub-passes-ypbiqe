import React, { useState } from 'react'; // ^18.2.0
import { Box, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useApiKey } from '../../hooks/useApiKey';
import { useNotificationContext } from '../../context/NotificationContext';

/**
 * Props interface for the ApiKeyPrompt component
 */
export interface ApiKeyPromptProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function called when the API key is successfully saved */
  onSuccess: () => void;
  /** Optional error message to display (e.g., from API authentication failure) */
  errorMessage: string;
}

/**
 * Styled component for the form container with proper spacing
 */
export const StyledFormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
}));

/**
 * Modal component that prompts users to enter their ParkHub API key.
 * Displayed when authentication is required or when the current API key is invalid.
 */
const ApiKeyPrompt = ({
  isOpen,
  onClose,
  onSuccess,
  errorMessage,
}: ApiKeyPromptProps): JSX.Element => {
  // State for API key input and validation
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Get API key management functions from useApiKey hook
  const { setApiKey, validateApiKey } = useApiKey();
  
  // Get notification functions from context
  const { showSuccess, showError } = useNotificationContext();

  /**
   * Handles changes to the API key input field
   * @param name Field name
   * @param value New input value
   */
  const handleChange = (name: string, value: string) => {
    setApiKeyInput(value);
    setInputError(null); // Clear any existing errors when user types
  };

  /**
   * Validates the API key format when the input field loses focus
   * @param name Field name
   */
  const handleBlur = (name: string) => {
    if (!apiKeyInput) {
      setInputError('API key is required');
    } else if (!validateApiKey(apiKeyInput)) {
      setInputError('Invalid API key format');
    } else {
      setInputError(null);
    }
  };

  /**
   * Handles form submission, validates and saves the API key
   */
  const handleSubmit = () => {
    // Validate the API key format
    if (!apiKeyInput) {
      setInputError('API key is required');
      return;
    }

    if (!validateApiKey(apiKeyInput)) {
      setInputError('Invalid API key format');
      return;
    }

    // Try to save the API key
    try {
      const success = setApiKey(apiKeyInput);
      if (success) {
        showSuccess('API key saved successfully');
        onSuccess(); // Call the success callback
        handleClose(); // Close the modal
      } else {
        showError('Failed to save API key');
      }
    } catch (error) {
      showError('An error occurred while saving the API key');
    }
  };

  /**
   * Handles modal close and resets form state
   */
  const handleClose = () => {
    setApiKeyInput('');
    setInputError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Enter ParkHub API Key"
      onClose={handleClose}
      actions={
        <>
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            color="secondary"
            type="button"
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            type="submit"
            aria-label="Save API Key"
          >
            Save API Key
          </Button>
        </>
      }
    >
      <StyledFormContainer>
        <Typography variant="body2" color="textSecondary">
          Please enter your ParkHub API key to authenticate with the service.
        </Typography>
        
        {errorMessage && (
          <Typography variant="body2" color="error" role="alert">
            {errorMessage}
          </Typography>
        )}
        
        <Input
          name="apiKey"
          label="API Key"
          type="password"
          value={apiKeyInput}
          onChange={handleChange}
          onBlur={handleBlur}
          error={inputError}
          required
          fullWidth
          autoFocus
          placeholder="Enter your ParkHub API key"
        />
        
        <Typography variant="caption" color="textSecondary">
          Your API key will be securely encrypted and stored in your browser.
        </Typography>
      </StyledFormContainer>
    </Modal>
  );
};

export default ApiKeyPrompt;