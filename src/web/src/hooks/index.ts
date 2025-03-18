/**
 * Barrel file for exporting all custom React hooks used in the ParkHub Passes Creation Web Application.
 * This centralizes hook imports to make them more accessible and easier to maintain throughout the app.
 * 
 * @version 1.0.0
 */

// API key management hook
export { useApiKey } from './useApiKey';

// Error handling hook
export { useErrorHandler } from './useErrorHandler';

// Events management hook
export { useEvents } from './useEvents';

// Form management hooks
export { useForm, useBatchForm } from './useForm';

// Local storage hook
export { default as useLocalStorage } from './useLocalStorage';

// Mutation hook for data modification
export { useMutation } from './useMutation';

// Passes management hook
export { usePasses } from './usePasses';

// Query hook for data fetching
export { useQuery } from './useQuery';

// Validation hook
export { useValidation } from './useValidation';