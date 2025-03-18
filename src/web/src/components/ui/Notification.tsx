import React, { useCallback, useEffect } from 'react';
import { styled } from '@mui/material/styles'; // ^5.14.0
import { Snackbar } from '@mui/material'; // ^5.14.0
import Alert from './Alert';
import { useNotificationContext } from '../context/NotificationContext';
import { NotificationType, Notification } from '../types/common.types';

/**
 * Props interface for the Notification component
 */
export interface NotificationProps {
  /**
   * Position where notifications should appear
   * @default 'bottom'
   */
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Optional CSS class name for custom styling
   */
  className?: string;
}

/**
 * Styled version of Material UI's Snackbar component with custom positioning
 */
const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  zIndex: theme.zIndex.snackbar,
  '& .MuiAlert-root': {
    width: '100%',
    maxWidth: '400px',
    boxShadow: theme.shadows[3]
  }
}));

/**
 * Notification component that displays notifications from the NotificationContext
 * with appropriate styling based on notification type. Supports auto-dismissal
 * and manual closing of notifications.
 * 
 * @param props - Component props
 * @returns React component
 */
const Notification: React.FC<NotificationProps> = ({ position = 'bottom', className }) => {
  const { notifications, removeNotification } = useNotificationContext();
  
  /**
   * Handles closing a notification by removing it from the context
   * @param id - ID of the notification to close
   */
  const handleClose = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);
  
  /**
   * Maps notification type to Alert severity
   * @param type - Notification type
   * @returns Corresponding Alert severity
   */
  const mapTypeToSeverity = useCallback((type: NotificationType): 'success' | 'info' | 'warning' | 'error' => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.WARNING:
        return 'warning';
      case NotificationType.INFO:
        return 'info';
      default:
        return 'info';
    }
  }, []);
  
  /**
   * Determines Snackbar position based on the position prop
   * @returns Object with vertical and horizontal position values
   */
  const getSnackbarPosition = useCallback(() => {
    switch (position) {
      case 'top':
        return { vertical: 'top', horizontal: 'center' };
      case 'top-left':
        return { vertical: 'top', horizontal: 'left' };
      case 'top-right':
        return { vertical: 'top', horizontal: 'right' };
      case 'bottom-left':
        return { vertical: 'bottom', horizontal: 'left' };
      case 'bottom-right':
        return { vertical: 'bottom', horizontal: 'right' };
      case 'bottom':
      default:
        return { vertical: 'bottom', horizontal: 'center' };
    }
  }, [position]);
  
  /**
   * Sets up auto-dismissal for a notification
   * @param notification - The notification to set up auto-dismissal for
   * @returns Cleanup function to clear the timeout
   */
  const setupAutoDismiss = useCallback((notification: Notification) => {
    if (notification.autoClose && notification.duration > 0) {
      const timeoutId = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timeoutId);
    }
    return () => {};
  }, [removeNotification]);
  
  // Setup auto-dismissal for all notifications
  useEffect(() => {
    const cleanupFunctions = notifications.map(notification => 
      setupAutoDismiss(notification)
    );
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [notifications, setupAutoDismiss]);
  
  // Get position for Snackbar
  const snackbarPosition = getSnackbarPosition();
  
  return (
    <>
      {notifications.map((notification) => (
        <StyledSnackbar
          key={notification.id}
          open={true}
          className={className}
          anchorOrigin={{
            vertical: snackbarPosition.vertical as 'top' | 'bottom',
            horizontal: snackbarPosition.horizontal as 'left' | 'center' | 'right',
          }}
        >
          <Alert
            severity={mapTypeToSeverity(notification.type)}
            onClose={() => handleClose(notification.id)}
          >
            {notification.message}
          </Alert>
        </StyledSnackbar>
      ))}
    </>
  );
};

export default Notification;