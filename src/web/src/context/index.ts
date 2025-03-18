/**
 * Context Barrel File
 * 
 * This file re-exports all context providers and hooks from the context directory,
 * providing a single entry point for accessing all context-related functionality.
 * 
 * This simplifies imports throughout the application and ensures consistent
 * access to authentication and notification capabilities.
 * 
 * @version 1.0.0
 */

// Re-export the API key context for authentication
export { 
  ApiKeyContext, 
  ApiKeyProvider, 
  useApiKeyContext 
} from './ApiKeyContext';

// Re-export the notification context for user feedback
export { 
  NotificationContext, 
  NotificationProvider, 
  useNotificationContext 
} from './NotificationContext';