import React from 'react'; // ^18.2.0
import { Box, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import RefreshIcon from '@mui/icons-material/Refresh'; // ^5.14.0
import Button from '../ui/Button'; // Custom button component

/**
 * Interface for the Footer component props
 */
export interface FooterProps {
  /**
   * Current application status - affects the text color (error, warning, or normal)
   */
  status?: 'error' | 'warning' | 'normal';
  
  /**
   * The timestamp when the data was last updated
   */
  lastUpdated?: Date;
  
  /**
   * Function to call when the refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Whether to show the refresh button
   * @default false
   */
  showRefreshButton?: boolean;
}

/**
 * Formats a date object into a readable string
 * @param date The date to format
 * @returns Formatted date string in the format MM/DD/YYYY HH:MM AM/PM
 */
const formatDate = (date?: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Styled container for the footer
 */
const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  minHeight: '48px',
  width: '100%',
}));

/**
 * Styled component for the status text
 */
const StatusText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'statusType'
})<{ statusType?: string }>(({ theme, statusType }) => {
  let color = theme.palette.text.secondary;
  
  if (statusType === 'error') {
    color = theme.palette.error.main;
  } else if (statusType === 'warning') {
    color = theme.palette.warning.main;
  }
  
  return {
    fontSize: theme.typography.caption.fontSize,
    color,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  };
});

/**
 * Styled component for the last updated text
 */
const LastUpdatedText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.disabled,
  fontStyle: 'italic',
  marginLeft: theme.spacing(1),
}));

/**
 * Footer component that displays status information, last updated timestamp,
 * and optional refresh button at the bottom of the application layout.
 * It provides users with context about the current application state and
 * allows for manual data refresh when needed.
 */
const Footer: React.FC<FooterProps> = ({
  status = 'normal',
  lastUpdated,
  onRefresh,
  showRefreshButton = false,
}) => {
  const formattedDate = formatDate(lastUpdated);
  
  return (
    <FooterContainer data-testid="app-footer">
      <Box display="flex" alignItems="center">
        <StatusText statusType={status}>
          {status === 'error' && 'Error: Unable to connect to ParkHub API'}
          {status === 'warning' && 'Warning: Some data may be outdated'}
          {status === 'normal' && 'Connected to ParkHub API'}
          
          {formattedDate && (
            <LastUpdatedText component="span">
              Last updated: {formattedDate}
            </LastUpdatedText>
          )}
        </StatusText>
      </Box>
      
      {showRefreshButton && onRefresh && (
        <Button 
          onClick={onRefresh}
          variant="text"
          size="small"
          startIcon={<RefreshIcon />}
          aria-label="Refresh data"
        >
          Refresh
        </Button>
      )}
    </FooterContainer>
  );
};

export default Footer;