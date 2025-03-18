import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import ErrorDisplay from '../../../src/components/feedback/ErrorDisplay';
import { renderWithProviders } from '../../../src/utils/testing';
import { ErrorType, ErrorCode, AppError } from '../../../src/types/error.types';

// Helper function to create a network error object for testing
const createNetworkError = (): AppError => {
  return {
    type: ErrorType.NETWORK,
    code: ErrorCode.CONNECTION_ERROR,
    message: 'Unable to connect to the server',
    timestamp: Date.now(),
    retryable: true,
    retryCount: 0,
    originalError: null
  };
};

// Helper function to create an authentication error object for testing
const createAuthenticationError = (): AppError => {
  return {
    type: ErrorType.AUTHENTICATION,
    code: ErrorCode.INVALID_API_KEY,
    message: 'Invalid API key',
    timestamp: Date.now(),
    statusCode: 401
  };
};

// Helper function to create a validation error object for testing
const createValidationError = (): AppError => {
  return {
    type: ErrorType.VALIDATION,
    code: ErrorCode.INVALID_INPUT,
    message: 'Invalid input',
    timestamp: Date.now(),
    field: 'barcode',
    fieldErrors: { barcode: 'Invalid barcode format' }
  };
};

// Helper function to create a server error object for testing
const createServerError = (): AppError => {
  return {
    type: ErrorType.SERVER,
    code: ErrorCode.SERVER_ERROR,
    message: 'Internal server error',
    timestamp: Date.now(),
    statusCode: 500,
    retryable: true
  };
};

// Helper function to create an unknown error object for testing
const createUnknownError = (): AppError => {
  return {
    type: ErrorType.UNKNOWN,
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    timestamp: Date.now(),
    originalError: new Error('Unknown error')
  };
};

describe('ErrorDisplay', () => {
  test('renders nothing when error is null', () => {
    const { container } = renderWithProviders(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders network error correctly', () => {
    const error = createNetworkError();
    renderWithProviders(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('renders authentication error correctly', () => {
    const error = createAuthenticationError();
    renderWithProviders(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid API key')).toBeInTheDocument();
  });

  test('renders validation error correctly', () => {
    const error = createValidationError();
    renderWithProviders(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  test('renders server error correctly', () => {
    const error = createServerError();
    renderWithProviders(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText('Internal server error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('renders unknown error correctly', () => {
    const error = createUnknownError();
    renderWithProviders(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Unexpected Error')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });

  test('calls onRetry when retry button is clicked', () => {
    const error = createNetworkError();
    const onRetry = jest.fn();
    renderWithProviders(<ErrorDisplay error={error} onRetry={onRetry} />);
    
    screen.getByText('Retry').click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('calls onHelp when help button is clicked', () => {
    const error = createServerError();
    const onHelp = jest.fn();
    renderWithProviders(<ErrorDisplay error={error} onHelp={onHelp} />);
    
    screen.getByText('Help').click();
    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when close button is clicked', () => {
    const error = createValidationError();
    const onClose = jest.fn();
    renderWithProviders(<ErrorDisplay error={error} onClose={onClose} />);
    
    // Find the close button using its aria-label
    const closeButton = screen.getByLabelText('close');
    closeButton.click();
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not show action buttons when showActions is false', () => {
    const error = createNetworkError();
    renderWithProviders(
      <ErrorDisplay error={error} showActions={false} onRetry={() => {}} onHelp={() => {}} />
    );
    
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
  });

  test('applies custom className when provided', () => {
    const error = createNetworkError();
    const { container } = renderWithProviders(
      <ErrorDisplay error={error} className="custom-error-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-error-class');
  });
});