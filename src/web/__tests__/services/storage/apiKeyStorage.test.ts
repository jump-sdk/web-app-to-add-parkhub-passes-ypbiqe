import { getApiKey, setApiKey, removeApiKey, validateApiKey, hasApiKey, apiKeyStorage } from '../../../src/services/storage/apiKeyStorage';
import { API_KEY } from '../../../src/constants/storageKeys';
import { mockLocalStorage, resetMockStorage } from '../../__mocks__/mockStorage';
import * as jest from 'jest'; // Version ^29.5.0

describe('apiKeyStorage', () => {
  // Setup mocks
  let originalLocalStorage: Storage;
  
  beforeAll(() => {
    originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', { 
      value: mockLocalStorage,
      writable: true
    });
  });
  
  afterAll(() => {
    Object.defineProperty(window, 'localStorage', { 
      value: originalLocalStorage,
      writable: true
    });
  });
  
  beforeEach(() => {
    resetMockStorage();
    jest.clearAllMocks();
  });
  
  describe('getApiKey', () => {
    test('getApiKey returns null when no API key is stored', () => {
      const result = getApiKey();
      expect(result).toBeNull();
    });

    test('getApiKey returns the stored API key', () => {
      // Use a spy to mock the internal getItem function
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'getItem')
          .mockReturnValueOnce('test-api-key');
      
      const result = getApiKey();
      expect(result).toBe('test-api-key');
    });

    test('getApiKey handles errors gracefully and returns null', () => {
      // Mock an implementation that throws an error
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'getItem')
          .mockImplementationOnce(() => {
            throw new Error('Storage error');
          });
      
      const result = getApiKey();
      expect(result).toBeNull();
    });
  });
  
  describe('setApiKey', () => {
    test('setApiKey returns false for empty API key', () => {
      const result = setApiKey('');
      expect(result).toBe(false);
    });

    test('setApiKey stores the API key and returns true', () => {
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'setItem')
          .mockReturnValueOnce(true);
      
      const result = setApiKey('test-api-key');
      expect(result).toBe(true);
      expect(require('../../../src/utils/storage-helpers').setItem)
        .toHaveBeenCalledWith(API_KEY, 'test-api-key', expect.any(Object));
    });

    test('setApiKey handles errors gracefully and returns false', () => {
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'setItem')
          .mockImplementationOnce(() => {
            throw new Error('Storage error');
          });
      
      const result = setApiKey('test-api-key');
      expect(result).toBe(false);
    });
  });

  describe('removeApiKey', () => {
    test('removeApiKey removes the API key and returns true', () => {
      // Set up mock to return true on successful removal
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'removeItem')
          .mockReturnValueOnce(true);
      
      const result = removeApiKey();
      expect(result).toBe(true);
      expect(require('../../../src/utils/storage-helpers').removeItem)
        .toHaveBeenCalledWith(API_KEY, expect.any(Object));
    });

    test('removeApiKey handles errors gracefully and returns false', () => {
      jest.spyOn(require('../../../src/utils/storage-helpers'), 'removeItem')
          .mockImplementationOnce(() => {
            throw new Error('Storage error');
          });
      
      const result = removeApiKey();
      expect(result).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    test('validateApiKey returns false for invalid API keys', () => {
      // Empty string
      expect(validateApiKey('')).toBe(false);
      
      // Null
      expect(validateApiKey(null as unknown as string)).toBe(false);
      
      // Invalid format (too short)
      expect(validateApiKey('short')).toBe(false);
    });

    test('validateApiKey returns true for valid API keys', () => {
      // Valid API key format (alphanumeric with special chars, proper length)
      expect(validateApiKey('abcdef1234567890-_.abcdef1234567890')).toBe(true);
    });
  });

  describe('hasApiKey', () => {
    test('hasApiKey returns true when API key exists', () => {
      // Since hasApiKey() calls getApiKey() internally, we need to mock getApiKey
      jest.spyOn(apiKeyStorage, 'getApiKey').mockReturnValueOnce('test-api-key');
      
      const result = hasApiKey();
      expect(result).toBe(true);
    });

    test('hasApiKey returns false when no API key exists', () => {
      jest.spyOn(apiKeyStorage, 'getApiKey').mockReturnValueOnce(null);
      
      const result = hasApiKey();
      expect(result).toBe(false);
    });
  });
});