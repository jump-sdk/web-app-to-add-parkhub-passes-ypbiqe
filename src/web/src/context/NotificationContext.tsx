import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'; // v18.2.0
import { v4 as uuidv4 } from 'uuid'; // v9.0.0
import { NotificationType, Notification } from '../types/common.types';
import { AppError } from '../types/error.types';
import { mapErrorToAppError } from '../utils/error-handling';

/**
 * Interface defining the shape of the notification context
 */
interface NotificationContextType {
  /** Array of active notifications */
  notifications: Notification[];
  /** Adds a new notification to the system and returns its ID */
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  /** Removes a specific notification by ID */
  removeNotification: (id: string) => void;
  /** Clears all notifications */
  clearNotifications: () => void;
  /** Convenience method to show a success notification */
  showSuccess: (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => string;
  /** Convenience method to show an error notification */
  showError: (message: string | AppError, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => string;
  /** Convenience method to show a warning notification */
  showWarning: (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => string;
  /** Convenience method to show an info notification */
  showInfo: (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => string;
}

/**
 * Props for the NotificationProvider component
 */
interface NotificationProviderProps {
  /** React children */
  children: ReactNode;
}

/**
 * Create the notification context with default values
 */
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider component that manages notification state and provides notification functions
 * @param props Component props
 * @returns A React component
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // State to track all active notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Adds a new notification to the notifications state
   * @param notification The notification to add (without ID)
   * @returns The ID of the newly created notification
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    // Generate a unique ID for the notification
    const id = uuidv4();
    
    // Create complete notification object with ID
    const newNotification: Notification = {
      ...notification,
      id,
    };
    
    // Add the notification to state
    setNotifications(prev => [...prev, newNotification]);
    
    // Set up auto-removal if autoClose is true
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
    
    return id;
  }, []);

  /**
   * Removes a notification from the notifications state by ID
   * @param id ID of the notification to remove
   */
  const removeNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  /**
   * Removes all notifications from the notifications state
   */
  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  /**
   * Shows a success notification
   * @param message Message to display
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const showSuccess = useCallback((
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>
  ): string => {
    return addNotification({
      type: NotificationType.SUCCESS,
      message,
      duration: 3000, // Default 3 seconds for success messages
      autoClose: true, // Auto-close by default
      ...options,
    });
  }, [addNotification]);

  /**
   * Shows an error notification
   * @param message Error message or AppError object
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const showError = useCallback((
    message: string | AppError,
    options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>
  ): string => {
    // Process error message based on input type
    let errorMessage: string;
    
    if (typeof message === 'string') {
      errorMessage = message;
    } else {
      // If it's already an AppError object, use its message
      if ('message' in message && typeof message.message === 'string') {
        errorMessage = message.message;
      } else {
        // Convert to AppError to handle unknown error types
        const appError = mapErrorToAppError(message);
        errorMessage = appError.message;
      }
    }
    
    return addNotification({
      type: NotificationType.ERROR,
      message: errorMessage,
      duration: 0, // Errors persist until dismissed
      autoClose: false, // Don't auto-close errors
      ...options,
    });
  }, [addNotification]);

  /**
   * Shows a warning notification
   * @param message Warning message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const showWarning = useCallback((
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>
  ): string => {
    return addNotification({
      type: NotificationType.WARNING,
      message,
      duration: 0, // Warnings persist until dismissed
      autoClose: false, // Don't auto-close warnings
      ...options,
    });
  }, [addNotification]);

  /**
   * Shows an info notification
   * @param message Info message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const showInfo = useCallback((
    message: string,
    options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>
  ): string => {
    return addNotification({
      type: NotificationType.INFO,
      message,
      duration: 5000, // Default 5 seconds for info
      autoClose: true, // Auto-close by default
      ...options,
    });
  }, [addNotification]);

  // Create the context value object with all notification functions
  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook that provides access to the notification context
 * @returns The notification context value containing notification state and management functions
 * @throws Error if used outside of a NotificationProvider
 */
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  
  return context;
};