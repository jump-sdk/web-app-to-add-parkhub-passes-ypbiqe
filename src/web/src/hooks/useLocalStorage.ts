import { useState, useEffect, useCallback } from 'react'; // ^18.2.0
import { StorageOptions, StorageType } from '../types/storage.types';
import { getItem, setItem, removeItem } from '../utils/storage-helpers';

/**
 * Custom React hook that provides a synchronization layer between React state and browser localStorage.
 * This hook abstracts the complexity of working with localStorage, handling serialization, 
 * deserialization, and error handling automatically.
 * 
 * @template T The type of value being stored
 * @param key The key under which to store the value in localStorage
 * @param initialValue The initial value to use if no value is found in localStorage
 * @param options Optional storage configuration options (type, expiry, encryption)
 * @returns A tuple containing: 
 *          [storedValue, setValue function, removeValue function]
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: Partial<StorageOptions>
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Initialize state with initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load value from localStorage on mount
  useEffect(() => {
    try {
      // Get the value from localStorage using the storage-helpers utility
      const item = getItem<T>(key, {
        type: StorageType.LOCAL, // Ensure we're using localStorage
        ...options
      });
      
      // Update state with retrieved value if it exists, otherwise use initialValue
      setStoredValue(item !== null ? item : initialValue);
    } catch (error) {
      // If error occurs during retrieval, fall back to initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, options]);

  // Define setValue function to update state and localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for state updates based on previous state
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update state with new value
      setStoredValue(valueToStore);
      
      // Update localStorage using the storage-helpers utility
      const success = setItem(key, valueToStore, {
        type: StorageType.LOCAL,
        ...options
      });
      
      if (!success) {
        console.warn(`Failed to save value to localStorage key "${key}"`);
      }
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
    }
  }, [key, storedValue, options]);

  // Define removeValue function to remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      // Remove from localStorage using the storage-helpers utility
      const success = removeItem(key, {
        type: StorageType.LOCAL,
        ...options
      });
      
      // Reset state to initialValue
      setStoredValue(initialValue);
      
      if (!success) {
        console.warn(`Failed to remove value from localStorage key "${key}"`);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, options]);

  // Return current value, setValue function, and removeValue function
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;