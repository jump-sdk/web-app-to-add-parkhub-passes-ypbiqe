import React from 'react'; // ^18.2.0
import { Box, Typography, Chip, Divider } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0
import { Pass, PassStatus, PassSpotType } from '../../types/pass.types';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * Interface for PassItem component props
 */
export interface PassItemProps {
  /** The pass object to display */
  pass: Pass;
  /** Function to call when the pass is selected */
  onSelect: (pass: Pass) => void;
  /** Function to call when viewing pass details */
  onDetails: (pass: Pass) => void;
  /** Whether the pass is currently selected */
  selected?: boolean;
  /** Optional CSS class name for styling */
  className?: string;
}

/**
 * Styled Card component for the pass item with selection state visualization
 */
const PassCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
}));

/**
 * Styled Box component for each detail item with consistent layout
 */
const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(0.5, 0),
}));

/**
 * Styled Typography component for detail labels
 */
const DetailLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginRight: theme.spacing(2),
}));

/**
 * Styled Typography component for detail values
 */
const DetailValue = styled(Typography)(({ theme }) => ({
  fontWeight: 400,
  textAlign: 'right',
  wordBreak: 'break-word',
}));

/**
 * Styled Box component for action buttons with proper spacing
 */
const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

/**
 * Formats the pass status as a colored chip component
 * 
 * @param status - The pass status to format
 * @returns A Chip component with appropriate color and label
 */
const formatPassStatus = (status: PassStatus): JSX.Element => {
  let color: 'success' | 'error' | 'warning' | 'secondary' | 'default' = 'default';
  
  // Determine color based on status
  switch (status) {
    case PassStatus.ACTIVE:
      color = 'success';
      break;
    case PassStatus.USED:
      color = 'secondary';
      break;
    case PassStatus.CANCELLED:
      color = 'error';
      break;
    case PassStatus.INACTIVE:
      color = 'warning';
      break;
    default:
      color = 'default';
  }
  
  // Format status text for display (capitalize, replace underscores with spaces)
  const statusText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  return (
    <Chip
      color={color}
      size="small"
      label={statusText}
      sx={{ fontWeight: 500, minWidth: '70px' }}
    />
  );
};

/**
 * A component that displays a single parking pass in a card format, primarily
 * used in the mobile view of the passes management interface. It provides a
 * user-friendly way to view pass details and interact with individual passes.
 * 
 * @param props - The component props
 * @returns The rendered pass item component
 */
const PassItem: React.FC<PassItemProps> = ({
  pass,
  onSelect,
  onDetails,
  selected = false,
  className,
}) => {
  /**
   * Handles pass selection when the card is clicked
   */
  const handleSelect = () => {
    onSelect(pass);
  };

  /**
   * Handles viewing pass details
   */
  const handleDetails = () => {
    onDetails(pass);
  };

  /**
   * Renders the pass details in a structured format
   */
  const renderPassDetails = () => (
    <Box sx={{ mt: 2 }}>
      <DetailItem>
        <DetailLabel variant="body2">Pass ID:</DetailLabel>
        <DetailValue variant="body2">{pass.id}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Barcode:</DetailLabel>
        <DetailValue variant="body2">{pass.barcode}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Customer:</DetailLabel>
        <DetailValue variant="body2">{pass.customerName}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Spot Type:</DetailLabel>
        <DetailValue variant="body2">{pass.spotType}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Lot ID:</DetailLabel>
        <DetailValue variant="body2">{pass.lotId}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Created:</DetailLabel>
        <DetailValue variant="body2">{pass.formattedCreatedAt}</DetailValue>
      </DetailItem>
      
      <DetailItem>
        <DetailLabel variant="body2">Status:</DetailLabel>
        <Box>{formatPassStatus(pass.status)}</Box>
      </DetailItem>
    </Box>
  );

  return (
    <PassCard
      selected={selected}
      className={className}
      elevation={selected ? 3 : 1}
      aria-selected={selected}
      data-testid="pass-card"
    >
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '70%' }}>
            Pass: {pass.barcode}
          </Typography>
          {formatPassStatus(pass.status)}
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {pass.customerName}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        {renderPassDetails()}
        
        <ActionContainer>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSelect}
            aria-pressed={selected}
            size="small"
          >
            {selected ? 'Selected' : 'Select'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDetails}
            size="small"
          >
            Details
          </Button>
        </ActionContainer>
      </Box>
    </PassCard>
  );
};

export default PassItem;