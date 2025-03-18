import React from 'react'; // ^18.2.0
import { Alert as MuiAlert, AlertProps as MuiAlertProps } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import { IconButton, Box } from '@mui/material'; // ^5.14.0
import CloseIcon from '@mui/icons-material/Close'; // ^5.14.0

/**
 * Props interface for the Alert component extending Material UI's AlertProps
 */
export interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  severity: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'standard' | 'filled' | 'outlined';
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * Styled version of Material UI's Alert component with custom styling based on severity
 */
const StyledAlert = styled(MuiAlert, {
  shouldForwardProp: (prop) => prop !== 'severity',
})<AlertProps>(({ theme, severity }) => ({
  borderRadius: theme.shape.borderRadius,
  fontWeight: 500,
  width: '100%',
  boxShadow: theme.shadows[2],
  '& .MuiAlert-icon': {
    fontSize: 22,
    alignSelf: 'center',
  },
  ...(severity === 'success' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
    borderLeft: `4px solid ${theme.palette.success.main}`,
  }),
  ...(severity === 'error' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
    borderLeft: `4px solid ${theme.palette.error.main}`,
  }),
  ...(severity === 'warning' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  }),
  ...(severity === 'info' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark,
    borderLeft: `4px solid ${theme.palette.info.main}`,
  }),
  '& .MuiAlert-message': {
    padding: theme.spacing(1),
    flexGrow: 1,
  },
  marginBottom: theme.spacing(2),
}));

/**
 * A customized alert component that wraps Material UI's Alert with additional styling and functionality.
 * Used throughout the application to display success, error, warning, and info messages.
 */
export const Alert: React.FC<AlertProps> = ({
  severity,
  variant = 'standard',
  onClose,
  children,
  className,
  icon,
  action,
  ...rest
}) => {
  /**
   * Handles the close button click event
   */
  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onClose) {
      onClose();
    }
  };

  /**
   * Renders the close button if onClose prop is provided
   */
  const renderCloseButton = (): React.ReactNode => {
    if (!onClose) return null;
    
    return (
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    );
  };

  return (
    <StyledAlert
      severity={severity}
      variant={variant}
      className={className}
      icon={icon}
      action={action || renderCloseButton()}
      {...rest}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {children}
      </Box>
    </StyledAlert>
  );
};

export default Alert;