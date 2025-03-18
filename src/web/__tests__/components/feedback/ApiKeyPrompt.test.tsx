import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import jest from 'jest'; // v29.5.0
import ApiKeyPrompt from '../../../src/components/feedback/ApiKeyPrompt';
import { renderWithProviders, mockApiKey } from '../../../src/utils/testing';
import { apiKeyStorage } from '../../../src/services/storage/apiKeyStorage';
import { useNotificationContext } from '../../../src/context/NotificationContext';

// Mock the notification context hook
jest.mock('../../../src/context/NotificationContext');

describe('ApiKeyPrompt', () => {
  // Common props for testing
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    errorMessage: ''
  };

  // Mock notification functions
  const mockShowSuccess = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup notification context mock
    (useNotificationContext as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError
    });
  });

  afterEach(() => {
    // Restore all mocked functions
    jest.restoreAllMocks();
  });

  it('renders correctly when open', async () => {
    renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Check that the modal title is displayed
    expect(screen.getByText('Enter ParkHub API Key')).toBeInTheDocument();
    
    // Check that the input field is displayed
    expect(screen.getByTestId('input-apiKey')).toBeInTheDocument();
    
    // Check that the action buttons are displayed
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save API Key' })).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    renderWithProviders(<ApiKeyPrompt {...defaultProps} isOpen={false} />);
    
    // The modal should not be in the document when closed
    expect(screen.queryByText('Enter ParkHub API Key')).not.toBeInTheDocument();
    expect(screen.queryByTestId('input-apiKey')).not.toBeInTheDocument();
  });

  it('validates API key format on blur', async () => {
    // Mock the validateApiKey function to return false
    jest.spyOn(apiKeyStorage, 'validateApiKey').mockReturnValue(false);
    
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the input field
    const input = screen.getByTestId('input-apiKey');
    
    // Type an invalid API key
    await user.type(input, 'invalid-key');
    
    // Trigger blur event
    await user.tab();
    
    // Check for validation error message
    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
  });

  it('shows error when API key format is invalid on submit', async () => {
    // Mock the validateApiKey function to return false
    jest.spyOn(apiKeyStorage, 'validateApiKey').mockReturnValue(false);
    
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the input field and submit button
    const input = screen.getByTestId('input-apiKey');
    const submitButton = screen.getByRole('button', { name: 'Save API Key' });
    
    // Type an invalid API key
    await user.type(input, 'invalid-key');
    
    // Click the submit button
    await user.click(submitButton);
    
    // Check for validation error message
    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
    
    // Ensure onSuccess was not called
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });

  it('shows error when API key storage fails', async () => {
    // Mock the validateApiKey function to return true
    jest.spyOn(apiKeyStorage, 'validateApiKey').mockReturnValue(true);
    
    // Mock the setApiKey function to return false (storage failure)
    jest.spyOn(apiKeyStorage, 'setApiKey').mockReturnValue(false);
    
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the input field and submit button
    const input = screen.getByTestId('input-apiKey');
    const submitButton = screen.getByRole('button', { name: 'Save API Key' });
    
    // Type a valid API key
    await user.type(input, 'valid-api-key');
    
    // Click the submit button
    await user.click(submitButton);
    
    // Ensure showError was called
    expect(mockShowError).toHaveBeenCalledWith('Failed to save API key');
    
    // Ensure onSuccess was not called
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess and shows notification when API key is stored successfully', async () => {
    // Mock the validateApiKey function to return true
    jest.spyOn(apiKeyStorage, 'validateApiKey').mockReturnValue(true);
    
    // Mock the setApiKey function to return true (storage success)
    jest.spyOn(apiKeyStorage, 'setApiKey').mockReturnValue(true);
    
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the input field and submit button
    const input = screen.getByTestId('input-apiKey');
    const submitButton = screen.getByRole('button', { name: 'Save API Key' });
    
    // Type a valid API key
    await user.type(input, 'valid-api-key');
    
    // Click the submit button
    await user.click(submitButton);
    
    // Ensure showSuccess was called
    expect(mockShowSuccess).toHaveBeenCalledWith('API key saved successfully');
    
    // Ensure onSuccess was called
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    
    // Ensure onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    
    // Click the cancel button
    await user.click(cancelButton);
    
    // Ensure onClose was called
    expect(defaultProps.onClose).toHaveBeenCalled();
    
    // Ensure onSuccess was not called
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
  });

  it('displays custom error message when provided', async () => {
    const customError = 'Authentication failed. Please update your API key.';
    
    renderWithProviders(<ApiKeyPrompt {...defaultProps} errorMessage={customError} />);
    
    // Check for the custom error message
    expect(screen.getByText(customError)).toBeInTheDocument();
  });

  it('clears error message when user types in the input', async () => {
    // Mock the validateApiKey function to return false
    jest.spyOn(apiKeyStorage, 'validateApiKey').mockReturnValue(false);
    
    const { user } = renderWithProviders(<ApiKeyPrompt {...defaultProps} />);
    
    // Get the input field
    const input = screen.getByTestId('input-apiKey');
    
    // Type an invalid API key
    await user.type(input, 'invalid-key');
    
    // Trigger blur event to show error
    await user.tab();
    
    // Check for validation error message
    expect(screen.getByText('Invalid API key format')).toBeInTheDocument();
    
    // Type more characters in the input
    await user.type(input, 'more-characters');
    
    // Error message should be cleared
    expect(screen.queryByText('Invalid API key format')).not.toBeInTheDocument();
  });
});