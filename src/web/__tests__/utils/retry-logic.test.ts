import { 
  isRetryableError,
  calculateBackoffDelay,
  delay,
  incrementRetryCount,
  retry,
  retryWithBackoff
} from '../../src/utils/retry-logic';
import { 
  ErrorType, 
  ErrorCode,
  NetworkError,
  ServerError
} from '../../src/types/error.types';

// Helper functions to create mock errors for testing
const createNetworkError = (retryable: boolean = true, retryCount: number = 0): NetworkError => ({
  type: ErrorType.NETWORK,
  code: ErrorCode.CONNECTION_ERROR,
  message: 'Network connection error',
  timestamp: Date.now(),
  retryable,
  retryCount,
  originalError: null
});

const createServerError = (retryable: boolean = true, code: ErrorCode = ErrorCode.SERVER_ERROR): ServerError => ({
  type: ErrorType.SERVER,
  code,
  message: 'Server error',
  timestamp: Date.now(),
  statusCode: 500,
  retryable
});

// Mock functions for testing retry logic
const mockSuccessfulFunction = <T>(value: T) => jest.fn().mockResolvedValue(value);
const mockFailingFunction = (error: any) => jest.fn().mockRejectedValue(error);
const mockEventuallySuccessfulFunction = (error: any, succeedAfterAttempts: number) => {
  const fn = jest.fn();
  for (let i = 0; i < succeedAfterAttempts; i++) {
    fn.mockRejectedValueOnce(error);
  }
  fn.mockResolvedValue('success');
  return fn;
};

describe('isRetryableError', () => {
  it('should return true for NetworkError with retryable=true', () => {
    const error = createNetworkError(true);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for NetworkError with retryable=false', () => {
    const error = createNetworkError(false);
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for ServerError with retryable=true', () => {
    const error = createServerError(true);
    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for ServerError with retryable=false', () => {
    const error = createServerError(false);
    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for ServerError with RATE_LIMIT_EXCEEDED error code', () => {
    const error = createServerError(false, ErrorCode.RATE_LIMIT_EXCEEDED);
    expect(isRetryableError(error)).toBe(true);
  });
  
  it('should return false for other error types', () => {
    const error = {
      type: ErrorType.VALIDATION,
      code: 'validation_error',
      message: 'Validation error',
      timestamp: Date.now()
    };
    expect(isRetryableError(error as any)).toBe(false);
  });
});

describe('calculateBackoffDelay', () => {
  it('should return baseDelay for retryCount=0', () => {
    const baseDelay = 300;
    const result = calculateBackoffDelay(0, baseDelay);
    
    // With jitter, the result will be between baseDelay and baseDelay * 1.2
    expect(result).toBeGreaterThanOrEqual(baseDelay);
    expect(result).toBeLessThanOrEqual(baseDelay * 1.2);
  });

  it('should return exponential delay for retryCount>0', () => {
    const baseDelay = 300;
    const retryCount = 2;
    const expectedBaseDelay = baseDelay * Math.pow(2, retryCount); // 300 * 2^2 = 1200
    
    const result = calculateBackoffDelay(retryCount, baseDelay);
    
    // With jitter, the result will be between expectedBaseDelay and expectedBaseDelay * 1.2
    expect(result).toBeGreaterThanOrEqual(expectedBaseDelay);
    expect(result).toBeLessThanOrEqual(expectedBaseDelay * 1.2);
  });

  it('should respect maxDelay parameter', () => {
    const baseDelay = 300;
    const retryCount = 5; // This would normally give 300 * 2^5 = 9600
    const maxDelay = 3000;
    
    const result = calculateBackoffDelay(retryCount, baseDelay, maxDelay);
    
    // Result should not exceed maxDelay
    expect(result).toBeLessThanOrEqual(maxDelay);
  });
  
  it('should add jitter to the delay', () => {
    // By mocking Math.random we can test the jitter calculation
    const mockRandom = jest.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0.5); // 50% jitter
    
    const baseDelay = 300;
    const retryCount = 1;
    const expectedBaseDelay = baseDelay * Math.pow(2, retryCount); // 300 * 2^1 = 600
    const expectedJitter = 0.5 * 0.2 * expectedBaseDelay; // 0.5 * 0.2 * 600 = 60
    
    const result = calculateBackoffDelay(retryCount, baseDelay);
    
    expect(result).toBeCloseTo(expectedBaseDelay + expectedJitter);
    
    mockRandom.mockRestore();
  });
});

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should return a Promise', () => {
    const result = delay(1000);
    expect(result).toBeInstanceOf(Promise);
  });
  
  it('should resolve after the specified delay time', async () => {
    const delayTime = 1000;
    const promise = delay(delayTime);
    
    // The promise should not resolve immediately
    let resolved = false;
    promise.then(() => { resolved = true; });
    
    expect(resolved).toBe(false);
    
    // Fast-forward time
    jest.advanceTimersByTime(delayTime - 1);
    await Promise.resolve(); // Let the promise handlers run
    
    // Promise should still not be resolved
    expect(resolved).toBe(false);
    
    // Advance to the full delay time
    jest.advanceTimersByTime(1);
    await Promise.resolve(); // Let the promise handlers run
    
    // Promise should now be resolved
    expect(resolved).toBe(true);
  });
  
  it('should work with setTimeout', () => {
    const delayTime = 1000;
    delay(delayTime);
    
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), delayTime);
  });
});

describe('incrementRetryCount', () => {
  it('should increment retryCount for NetworkError', () => {
    const error = createNetworkError(true, 1);
    const result = incrementRetryCount(error);
    
    expect(result.type).toBe(ErrorType.NETWORK);
    expect((result as NetworkError).retryCount).toBe(2);
  });
  
  it('should initialize retryCount to 1 if not present', () => {
    const error = createNetworkError(true);
    delete (error as any).retryCount;
    
    const result = incrementRetryCount(error);
    
    expect(result.type).toBe(ErrorType.NETWORK);
    expect((result as NetworkError).retryCount).toBe(1);
  });
  
  it('should return the original error for non-NetworkError types', () => {
    const error = createServerError(true);
    const result = incrementRetryCount(error);
    
    expect(result).toBe(error);
  });
});

describe('retry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should return the result of the function if successful', async () => {
    const expectedResult = 'success';
    const fn = mockSuccessfulFunction(expectedResult);
    
    const promise = retry(fn);
    await jest.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe(expectedResult);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  
  it('should retry the function on retryable errors', async () => {
    const error = createNetworkError(true);
    const fn = mockEventuallySuccessfulFunction(error, 1);
    
    const promise = retry(fn);
    
    // First attempt fails
    await jest.runOnlyPendingTimersAsync();
    
    // Wait for backoff
    await jest.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
  
  it('should respect maxRetries option', async () => {
    const error = createNetworkError(true);
    const fn = mockFailingFunction(error);
    
    const maxRetries = 2;
    const promise = retry(fn, { maxRetries });
    
    // We need to catch the error since we expect it to fail
    let caughtError = null;
    try {
      await jest.runAllTimersAsync();
      await promise;
    } catch (err) {
      caughtError = err;
    }
    
    expect(caughtError).toBe(error);
    expect(fn).toHaveBeenCalledTimes(maxRetries + 1); // Initial attempt + retries
  });
  
  it('should use exponential backoff between retries', async () => {
    const error = createNetworkError(true);
    const fn = mockFailingFunction(error);
    
    const baseDelay = 100;
    const maxRetries = 2;
    
    const promise = retry(fn, { baseDelay, maxRetries });
    
    // First call
    await jest.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);
    
    // Backoff for first retry (100ms base * 2^0 = 100ms plus jitter)
    await jest.advanceTimersByTimeAsync(baseDelay * 1.2); // Including max jitter
    expect(fn).toHaveBeenCalledTimes(2);
    
    // Backoff for second retry (100ms base * 2^1 = 200ms plus jitter)
    await jest.advanceTimersByTimeAsync(baseDelay * 2 * 1.2); // Including max jitter
    expect(fn).toHaveBeenCalledTimes(3);
    
    // Catch the error to prevent test failure
    try {
      await promise;
    } catch (err) {
      // Expected
    }
  });
  
  it('should call onRetry callback between retries', async () => {
    const error = createNetworkError(true);
    const fn = mockFailingFunction(error);
    
    const onRetry = jest.fn();
    const maxRetries = 2;
    
    const promise = retry(fn, { maxRetries, onRetry });
    
    try {
      await jest.runAllTimersAsync();
      await promise;
    } catch (err) {
      // Expected
    }
    
    expect(onRetry).toHaveBeenCalledTimes(maxRetries);
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ type: ErrorType.NETWORK }),
      1,  // first retry
      expect.any(Number)
    );
    expect(onRetry).toHaveBeenCalledWith(
      expect.objectContaining({ type: ErrorType.NETWORK }),
      2,  // second retry
      expect.any(Number)
    );
  });
  
  it('should throw the error after max retries', async () => {
    const error = createNetworkError(true);
    const fn = mockFailingFunction(error);
    
    const promise = retry(fn, { maxRetries: 2 });
    
    let caughtError = null;
    try {
      await jest.runAllTimersAsync();
      await promise;
    } catch (err) {
      caughtError = err;
    }
    
    expect(caughtError).toBe(error);
  });
  
  it('should throw immediately for non-retryable errors', async () => {
    const error = createNetworkError(false);
    const fn = mockFailingFunction(error);
    
    const promise = retry(fn);
    
    let caughtError = null;
    try {
      await promise;
    } catch (err) {
      caughtError = err;
    }
    
    expect(caughtError).toBe(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should return a function', () => {
    const fn = jest.fn();
    const result = retryWithBackoff(fn);
    
    expect(typeof result).toBe('function');
  });
  
  it('should call the original function with the same arguments', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const wrappedFn = retryWithBackoff(fn);
    
    await wrappedFn('arg1', 'arg2', { option: 'value' });
    
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', { option: 'value' });
  });
  
  it('should apply retry logic to the original function', async () => {
    const error = createNetworkError(true);
    const fn = mockEventuallySuccessfulFunction(error, 1);
    const wrappedFn = retryWithBackoff(fn);
    
    const promise = wrappedFn();
    
    // First attempt fails
    await jest.runOnlyPendingTimersAsync();
    
    // Wait for backoff
    await jest.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
  
  it('should pass options to the retry function', async () => {
    const error = createNetworkError(true);
    const fn = mockFailingFunction(error);
    
    const onRetry = jest.fn();
    const maxRetries = 1;
    
    const wrappedFn = retryWithBackoff(fn, { maxRetries, onRetry });
    
    try {
      const promise = wrappedFn();
      await jest.runAllTimersAsync();
      await promise;
    } catch (err) {
      // Expected
    }
    
    expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  
  it('should return the result of the original function when successful', async () => {
    const expectedResult = { data: 'test' };
    const fn = jest.fn().mockResolvedValue(expectedResult);
    const wrappedFn = retryWithBackoff(fn);
    
    const result = await wrappedFn();
    
    expect(result).toBe(expectedResult);
  });
});