/**
 * Utility functions for formatting various data types for display in the ParkHub Passes Creation Web Application.
 * These functions handle formatting for event statuses, pass statuses, spot types, currency, numbers,
 * percentages, text, phone numbers, and IDs.
 */

/**
 * Formats an event status value for display
 * @param status - The raw event status string
 * @returns Formatted status string with proper capitalization
 */
export const formatEventStatus = (status: string): string => {
  if (status == null) return '';
  const formattedStatus = status.toLowerCase().replace(/_/g, ' ');
  return capitalizeFirstLetter(formattedStatus);
};

/**
 * Formats a pass status value for display
 * @param status - The raw pass status string
 * @returns Formatted status string with proper capitalization
 */
export const formatPassStatus = (status: string): string => {
  if (status == null) return '';
  const formattedStatus = status.toLowerCase().replace(/_/g, ' ');
  return capitalizeFirstLetter(formattedStatus);
};

/**
 * Formats a parking spot type for display
 * @param spotType - The raw spot type string
 * @returns Formatted spot type with proper capitalization
 */
export const formatSpotType = (spotType: string): string => {
  if (spotType == null) return '';
  const formattedSpotType = spotType.toLowerCase().replace(/_/g, ' ');
  return capitalizeFirstLetter(formattedSpotType);
};

/**
 * Formats a number as currency with dollar sign
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string (e.g., $10.00)
 */
export const formatCurrency = (value: number, locale = 'en-US'): string => {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Formats a number with thousands separators and decimal places
 * @param value - The number to format
 * @param decimalPlaces - The number of decimal places to include (default: 0)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted number string with proper separators
 */
export const formatNumber = (
  value: number,
  decimalPlaces = 0,
  locale = 'en-US'
): string => {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value - The number to format as percentage (0.1 = 10%)
 * @param decimalPlaces - The number of decimal places to include (default: 0)
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted percentage string with % symbol
 */
export const formatPercentage = (
  value: number,
  decimalPlaces = 0,
  locale = 'en-US'
): string => {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - The maximum length of the returned string
 * @returns Truncated text with ellipsis if truncated
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text == null) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Formats a phone number string into a standardized format
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number (e.g., (123) 456-7890)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (phoneNumber == null) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if we have a 10-digit number
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  // Return the cleaned number if not 10 digits
  return cleaned;
};

/**
 * Formats an ID by ensuring consistent display with optional prefix
 * @param id - The ID to format
 * @param prefix - Optional prefix to add to the ID
 * @returns Formatted ID with optional prefix
 */
export const formatId = (id: string, prefix?: string): string => {
  if (id == null) return '';
  return prefix ? `${prefix}${id}` : id;
};

/**
 * Returns a color code based on a status value
 * @param status - The status to determine color for
 * @returns Color code for the status (success, warning, error, or default)
 */
export const getStatusColor = (status: string): string => {
  if (status == null) return 'default';
  
  const statusLower = status.toLowerCase();
  
  if (['active', 'approved', 'complete', 'success'].includes(statusLower)) {
    return 'success';
  }
  
  if (['pending', 'in_progress', 'warning', 'expired'].includes(statusLower)) {
    return 'warning';
  }
  
  if (['cancelled', 'canceled', 'rejected', 'error', 'failed'].includes(statusLower)) {
    return 'error';
  }
  
  return 'default';
};

/**
 * Capitalizes the first letter of a string
 * @param text - The string to capitalize
 * @returns String with first letter capitalized
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Formats validation errors for display in forms
 * @param errors - Object with field names as keys and error messages as values
 * @returns Object with formatted error messages
 */
export const formatValidationErrors = (
  errors: Record<string, string>
): Record<string, string> => {
  if (!errors) return {};
  
  const formattedErrors: Record<string, string> = {};
  
  for (const [field, message] of Object.entries(errors)) {
    let formattedMessage = message;
    
    // Capitalize first letter
    formattedMessage = capitalizeFirstLetter(formattedMessage);
    
    // Add period at the end if missing
    if (formattedMessage && !formattedMessage.endsWith('.') && 
        !formattedMessage.endsWith('!') && !formattedMessage.endsWith('?')) {
      formattedMessage += '.';
    }
    
    formattedErrors[field] = formattedMessage;
  }
  
  return formattedErrors;
};