import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AxiosError } from 'axios'; // v1.3.4
import {
  mapErrorToAppError,
  handleError,
  extractErrorFromResponse,
  createNetworkError,
  createAuthenticationError,
  createValidationError,
  createServerError,
  createClientError,
  createUnknownError
} from '../../src/utils/error-handling';
import {
  ErrorType,
  ErrorCode,
  AppError
} from '../../src/types/error.types';
import {
  isRetryableError,
  incrementRetryCount
} from '../../src/utils/retry-logic';

// Mock dependencies
jest.mock('../../src/utils/retry-logic', () => ({
  isRetryableError: jest.fn(),
  incrementRetryCount: jest.fn((error) => error)
}));

describe('Error Handling Utilities', () => {
  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapErrorToAppError', () => {
    it('should map Axios network error to NetworkError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        response: undefined
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.code).toBe(ErrorCode.TIMEOUT);
      expect(result.message).toBe('Network Error');
      expect(result.retryable).toBe(true);
      expect(result.retryCount).toBe(0);
    });
    
    it('should map Axios 401 error to AuthenticationError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Unauthorized',
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.code).toBe(ErrorCode.INVALID_API_KEY);
      expect(result.message).toBe('Invalid API key');
      expect(result.statusCode).toBe(401);
    });
    
    it('should map Axios 403 error to AuthenticationError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Forbidden',
        response: {
          status: 403,
          data: {
            error: {
              message: 'Missing API key'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.code).toBe(ErrorCode.MISSING_API_KEY);
      expect(result.message).toBe('Missing API key');
      expect(result.statusCode).toBe(403);
    });
    
    it('should map Axios 400 error to ValidationError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Bad Request',
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid input',
              field: 'barcode'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.code).toBe(ErrorCode.INVALID_INPUT);
      expect(result.message).toBe('Invalid input');
      expect(result.field).toBe('barcode');
      expect(result.fieldErrors).toHaveProperty('barcode');
    });
    
    it('should map Axios 422 error to ValidationError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Unprocessable Entity',
        response: {
          status: 422,
          data: {
            error: {
              message: 'Invalid format',
              field: 'eventId'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.code).toBe(ErrorCode.INVALID_INPUT);
      expect(result.message).toBe('Invalid format');
      expect(result.field).toBe('eventId');
    });
    
    it('should map Axios 429 error to ServerError type with rate limit code', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Too Many Requests',
        response: {
          status: 429,
          data: {
            error: {
              message: 'Rate limit exceeded'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.SERVER);
      expect(result.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(result.message).toBe('Rate limit exceeded');
      expect(result.retryable).toBe(true);
    });
    
    it('should map Axios 500+ errors to ServerError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Internal Server Error',
        response: {
          status: 500,
          data: {
            error: {
              message: 'Server error occurred'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.SERVER);
      expect(result.code).toBe(ErrorCode.SERVER_ERROR);
      expect(result.message).toBe('Server error occurred');
      expect(result.statusCode).toBe(500);
      expect(result.retryable).toBe(true);
    });
    
    it('should map Axios 404 error to ClientError type', () => {
      const mockError = {
        isAxiosError: true,
        message: 'Not Found',
        response: {
          status: 404,
          data: {
            error: {
              message: 'Resource not found'
            }
          }
        }
      } as unknown as AxiosError;
      
      const result = mapErrorToAppError(mockError);
      
      expect(result.type).toBe(ErrorType.CLIENT);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Resource not found');
      expect(result.statusCode).toBe(404);
    });
    
    it('should map non-Axios errors to UnknownError type', () => {
      const error = new Error('Generic error');
      const result = mapErrorToAppError(error);
      
      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Generic error');
      expect(result.originalError).toBe(error);
    });
    
    it('should return existing AppError objects unchanged', () => {
      const appError: AppError = {
        type: ErrorType.NETWORK,
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Connection failed',
        timestamp: Date.now(),
        retryable: true,
        retryCount: 1,
        originalError: null
      };
      
      const result = mapErrorToAppError(appError);
      
      expect(result).toBe(appError);
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.code).toBe(ErrorCode.CONNECTION_ERROR);
      expect(result.message).toBe('Connection failed');
    });
  });

  describe('Error Creation Functions', () => {
    it('should create NetworkError with correct structure', () => {
      const originalError = new Error('Network failed');
      const result = createNetworkError(
        originalError, 
        ErrorCode.CONNECTION_ERROR,
        'Custom network error message'
      );
      
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.code).toBe(ErrorCode.CONNECTION_ERROR);
      expect(result.message).toBe('Custom network error message');
      expect(result.retryable).toBe(true);
      expect(result.retryCount).toBe(0);
      expect(result.originalError).toBe(originalError);
      expect(result.timestamp).toBeGreaterThan(0);
    });
    
    it('should create AuthenticationError with correct structure', () => {
      const result = createAuthenticationError(
        401,
        ErrorCode.INVALID_API_KEY,
        'Custom auth error message'
      );
      
      expect(result.type).toBe(ErrorType.AUTHENTICATION);
      expect(result.code).toBe(ErrorCode.INVALID_API_KEY);
      expect(result.message).toBe('Custom auth error message');
      expect(result.statusCode).toBe(401);
      expect(result.timestamp).toBeGreaterThan(0);
    });
    
    it('should create ValidationError with correct structure', () => {
      const apiError = {
        field: 'barcode',
        message: 'Invalid barcode format'
      };
      
      const result = createValidationError(
        apiError,
        'Field validation error'
      );
      
      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.code).toBe(ErrorCode.INVALID_INPUT);
      expect(result.message).toBe('Field validation error');
      expect(result.field).toBe('barcode');
      expect(result.fieldErrors).toHaveProperty('barcode');
      expect(result.timestamp).toBeGreaterThan(0);
    });
    
    it('should create ServerError with correct structure', () => {
      const result = createServerError(
        500,
        ErrorCode.SERVER_ERROR,
        'Internal server error'
      );
      
      expect(result.type).toBe(ErrorType.SERVER);
      expect(result.code).toBe(ErrorCode.SERVER_ERROR);
      expect(result.message).toBe('Internal server error');
      expect(result.statusCode).toBe(500);
      expect(result.retryable).toBe(true);
      expect(result.timestamp).toBeGreaterThan(0);
    });
    
    it('should create ClientError with correct structure', () => {
      const result = createClientError(
        404,
        ErrorCode.EVENT_NOT_FOUND,
        'Event not found'
      );
      
      expect(result.type).toBe(ErrorType.CLIENT);
      expect(result.code).toBe(ErrorCode.EVENT_NOT_FOUND);
      expect(result.message).toBe('Event not found');
      expect(result.statusCode).toBe(404);
      expect(result.timestamp).toBeGreaterThan(0);
    });
    
    it('should create UnknownError with correct structure', () => {
      const originalError = new Error('Something went wrong');
      const result = createUnknownError(
        originalError,
        'Unknown application error'
      );
      
      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Unknown application error');
      expect(result.originalError).toBe(originalError);
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });

  describe('handleError', () => {
    it('should map errors to AppError type', async () => {
      const error = new Error('Test error');
      
      try {
        await handleError(error, { retry: false });
        // The test should fail if handleError doesn't reject
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(caughtError.type).toBe(ErrorType.UNKNOWN);
        expect(caughtError.message).toBe('Test error');
      }
    });
    
    it('should call onError callback when provided', async () => {
      const error = new Error('Test error');
      const onError = jest.fn();
      
      try {
        await handleError(error, { retry: false, onError });
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({
          type: ErrorType.UNKNOWN,
          message: 'Test error'
        }));
      }
    });
    
    it('should not retry non-retryable errors', async () => {
      const error = new Error('Non-retryable error');
      const onRetry = jest.fn();
      
      (isRetryableError as jest.Mock).mockReturnValue(false);
      
      try {
        await handleError(error, { 
          retry: true, 
          maxRetries: 3,
          onRetry
        });
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(isRetryableError).toHaveBeenCalledTimes(1);
        expect(onRetry).not.toHaveBeenCalled();
      }
    });
    
    it('should retry retryable network errors when retry option is true', async () => {
      const networkError: AppError = {
        type: ErrorType.NETWORK,
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Connection failed',
        timestamp: Date.now(),
        retryable: true,
        retryCount: 0,
        originalError: null
      };
      
      const onRetry = jest.fn();
      
      (isRetryableError as jest.Mock).mockReturnValue(true);
      
      try {
        await handleError(networkError, {
          retry: true,
          maxRetries: 3,
          onRetry
        });
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(isRetryableError).toHaveBeenCalledTimes(1);
        expect(incrementRetryCount).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledWith(
          expect.objectContaining({ type: ErrorType.NETWORK }),
          0
        );
      }
    });
    
    it('should respect maxRetries option for network errors', async () => {
      const networkError: AppError = {
        type: ErrorType.NETWORK,
        code: ErrorCode.CONNECTION_ERROR,
        message: 'Connection failed',
        timestamp: Date.now(),
        retryable: true,
        retryCount: 3, // Already at max retries
        originalError: null
      };
      
      const onRetry = jest.fn();
      
      (isRetryableError as jest.Mock).mockReturnValue(true);
      
      try {
        await handleError(networkError, {
          retry: true,
          maxRetries: 3,
          onRetry
        });
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(isRetryableError).toHaveBeenCalledTimes(1);
        expect(incrementRetryCount).not.toHaveBeenCalled();
        expect(onRetry).not.toHaveBeenCalled();
      }
    });
    
    it('should call onRetry callback for retryable server errors', async () => {
      const serverError: AppError = {
        type: ErrorType.SERVER,
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded',
        timestamp: Date.now(),
        statusCode: 429,
        retryable: true
      };
      
      const onRetry = jest.fn();
      
      (isRetryableError as jest.Mock).mockReturnValue(true);
      
      try {
        await handleError(serverError, {
          retry: true,
          maxRetries: 3,
          onRetry
        });
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(isRetryableError).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(onRetry).toHaveBeenCalledWith(
          expect.objectContaining({ type: ErrorType.SERVER }),
          0
        );
      }
    });
    
    it('should return rejected promise with the processed error', async () => {
      const error = new Error('Test error');
      
      try {
        await handleError(error);
        expect(true).toBe(false);
      } catch (caughtError) {
        expect(caughtError).toMatchObject({
          type: ErrorType.UNKNOWN,
          code: ErrorCode.UNKNOWN_ERROR,
          message: 'Test error'
        });
      }
    });
  });

  describe('extractErrorFromResponse', () => {
    it('should extract error from response with data.error property', () => {
      const response = {
        data: {
          error: {
            code: 'invalid_input',
            message: 'Invalid input',
            field: 'barcode'
          }
        }
      };
      
      const result = extractErrorFromResponse(response);
      
      expect(result.code).toBe('invalid_input');
      expect(result.message).toBe('Invalid input');
      expect(result.field).toBe('barcode');
    });
    
    it('should handle response without data.error property', () => {
      const response = {
        data: {}
      };
      
      const result = extractErrorFromResponse(response);
      
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBeTruthy();
      expect(result.field).toBeUndefined();
    });
    
    it('should handle null or undefined response', () => {
      const result1 = extractErrorFromResponse(null);
      const result2 = extractErrorFromResponse(undefined);
      
      expect(result1.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result1.message).toBeTruthy();
      
      expect(result2.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result2.message).toBeTruthy();
    });
    
    it('should extract error with field property for validation errors', () => {
      const response = {
        data: {
          error: {
            code: 'invalid_input',
            message: 'Barcode is invalid',
            field: 'barcode'
          }
        }
      };
      
      const result = extractErrorFromResponse(response);
      
      expect(result.code).toBe('invalid_input');
      expect(result.message).toBe('Barcode is invalid');
      expect(result.field).toBe('barcode');
    });
  });
});