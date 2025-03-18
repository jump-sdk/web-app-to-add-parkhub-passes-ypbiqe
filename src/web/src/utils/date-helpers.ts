/**
 * Provides utility functions for date formatting, parsing, and manipulation
 * used throughout the ParkHub Passes Creation Web Application.
 * 
 * @module date-helpers
 */

/**
 * Formats a date object or date string into a human-readable date format
 * 
 * @param date - The date to format
 * @param format - The format to use (default: MM/DD/YYYY)
 * @returns Formatted date string or empty string if input is invalid
 */
export const formatDate = (
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY'
): string => {
  if (date === null || date === undefined) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return '';
  }

  // Default format: MM/DD/YYYY
  let formatted = format;
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // getMonth() is zero-based
  const day = dateObj.getDate();
  
  // Replace year
  formatted = formatted.replace('YYYY', year.toString());
  formatted = formatted.replace('YY', year.toString().slice(-2));
  
  // Replace month
  formatted = formatted.replace('MM', month.toString().padStart(2, '0'));
  formatted = formatted.replace('M', month.toString());
  
  // Replace day
  formatted = formatted.replace('DD', day.toString().padStart(2, '0'));
  formatted = formatted.replace('D', day.toString());
  
  return formatted;
};

/**
 * Formats a date object or date string into a human-readable time format
 * 
 * @param date - The date to format
 * @param format - The format to use (default: h:mm A)
 * @returns Formatted time string or empty string if input is invalid
 */
export const formatTime = (
  date: Date | string | null | undefined,
  format: string = 'h:mm A'
): string => {
  if (date === null || date === undefined) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return '';
  }

  // Default format: h:mm A
  let formatted = format;
  
  const hours24 = dateObj.getHours();
  const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for 12 AM
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  const ampm = hours24 < 12 ? 'AM' : 'PM';
  
  // Replace hours
  formatted = formatted.replace('hh', hours12.toString().padStart(2, '0'));
  formatted = formatted.replace('h', hours12.toString());
  formatted = formatted.replace('HH', hours24.toString().padStart(2, '0'));
  formatted = formatted.replace('H', hours24.toString());
  
  // Replace minutes
  formatted = formatted.replace('mm', minutes.toString().padStart(2, '0'));
  formatted = formatted.replace('m', minutes.toString());
  
  // Replace seconds
  formatted = formatted.replace('ss', seconds.toString().padStart(2, '0'));
  formatted = formatted.replace('s', seconds.toString());
  
  // Replace AM/PM
  formatted = formatted.replace('A', ampm);
  formatted = formatted.replace('a', ampm.toLowerCase());
  
  return formatted;
};

/**
 * Formats a date object or date string into a combined date and time format
 * 
 * @param date - The date to format
 * @param dateFormat - The date format to use (default: MM/DD/YYYY)
 * @param timeFormat - The time format to use (default: h:mm A)
 * @returns Formatted date and time string or empty string if input is invalid
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  dateFormat: string = 'MM/DD/YYYY',
  timeFormat: string = 'h:mm A'
): string => {
  if (date === null || date === undefined) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return '';
  }

  const formattedDate = formatDate(dateObj, dateFormat);
  const formattedTime = formatTime(dateObj, timeFormat);
  
  return `${formattedDate} ${formattedTime}`;
};

/**
 * Parses a date string into a Date object
 * 
 * @param dateString - The date string to parse
 * @returns Date object or null if input is invalid
 */
export const parseDate = (
  dateString: string | null | undefined
): Date | null => {
  if (!dateString) {
    return null;
  }
  
  const parsedDate = new Date(dateString);
  
  if (!isValidDate(parsedDate)) {
    return null;
  }
  
  return parsedDate;
};

/**
 * Checks if a value is a valid Date object
 * 
 * @param date - The value to check
 * @returns True if the value is a valid Date object, false otherwise
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Gets the current date formatted for API requests (ISO format)
 * 
 * @returns Current date in ISO format (YYYY-MM-DDT00:00:00.000Z)
 */
export const getCurrentDateForApi = (): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
};

/**
 * Formats a date for API requests (ISO format)
 * 
 * @param date - The date to format
 * @returns Date in ISO format (YYYY-MM-DDT00:00:00.000Z) or current date if input is invalid
 */
export const formatDateForApi = (
  date: Date | string | null | undefined
): string => {
  if (date === null || date === undefined) {
    return getCurrentDateForApi();
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(dateObj)) {
    return getCurrentDateForApi();
  }

  const formatted = new Date(dateObj);
  formatted.setHours(0, 0, 0, 0);
  return formatted.toISOString();
};

/**
 * Adds a specified number of days to a date
 * 
 * @param date - The date to add days to
 * @param days - The number of days to add
 * @returns New date with days added
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtracts a specified number of days from a date
 * 
 * @param date - The date to subtract days from
 * @param days - The number of days to subtract
 * @returns New date with days subtracted
 */
export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

/**
 * Checks if two dates represent the same day
 * 
 * @param date1 - The first date
 * @param date2 - The second date
 * @returns True if the dates represent the same day, false otherwise
 */
export const isSameDay = (
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined
): boolean => {
  if (!date1 || !date2) {
    return false;
  }

  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  if (!isValidDate(dateObj1) || !isValidDate(dateObj2)) {
    return false;
  }

  return (
    dateObj1.getFullYear() === dateObj2.getFullYear() &&
    dateObj1.getMonth() === dateObj2.getMonth() &&
    dateObj1.getDate() === dateObj2.getDate()
  );
};

/**
 * Calculates the difference in days between two dates
 * 
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Number of days between the dates
 */
export const getDateDifferenceInDays = (
  startDate: Date | string,
  endDate: Date | string
): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (!isValidDate(start) || !isValidDate(end)) {
    return 0;
  }

  // Set hours to 0 to calculate full days
  const startCopy = new Date(start);
  const endCopy = new Date(end);
  startCopy.setHours(0, 0, 0, 0);
  endCopy.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds and convert to days
  const differenceMs = Math.abs(endCopy.getTime() - startCopy.getTime());
  return Math.round(differenceMs / (1000 * 60 * 60 * 24));
};