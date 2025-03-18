import React from 'react'; // ^18.2.0
import { Box, Typography, Button } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import { CheckCircleOutline } from '@mui/icons-material'; // ^5.14.0
import { Alert } from '../ui/Alert';

/**
 * Props interface for the SuccessMessage component
 */
export interface SuccessMessageProps {
  /** The success message to display */
  message: string;
  /** Optional array of action buttons */
  actions?: Array<{ label: string; onClick: () => void }>;
  /** Optional callback when the message is closed */
  onClose?: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Styled container for action buttons with appropriate spacing
 */
const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

/**
 * Component that displays a success message with optional action buttons.
 * Uses the Alert component with success severity and includes a check circle icon.
 */
const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  actions,
  onClose,
  className,
}) => {
  return (
    <Alert
      severity="success"
      onClose={onClose}
      className={className}
      icon={<CheckCircleOutline />}
    >
      <Box sx={{ width: '100%' }}>
        <Typography variant="body1">{message}</Typography>
        
        {actions && actions.length > 0 && (
          <ActionContainer>
            {actions.map((action, index) => (
              <Button 
                key={index}
                onClick={action.onClick}
                variant="text"
                size="small"
                color="success"
              >
                {action.label}
              </Button>
            ))}
          </ActionContainer>
        )}
      </Box>
    </Alert>
  );
};

export default SuccessMessage;