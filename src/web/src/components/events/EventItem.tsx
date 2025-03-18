import React from 'react';
import { Box, Typography, Chip, Grid, TableRow, TableCell } from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import VisibilityIcon from '@mui/icons-material/Visibility'; // v5.14.0
import EditIcon from '@mui/icons-material/Edit'; // v5.14.0
import { Event, EventStatus } from '../../types/event.types';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * Props interface for the EventItem component
 */
export interface EventItemProps {
  /** Event data to display */
  event: Event;
  /** View mode: table row or card */
  viewMode: 'table' | 'card';
  /** Whether this event is selected */
  selected: boolean;
  /** Callback when event is selected */
  onSelect: (eventId: string) => void;
  /** Callback to view passes for this event */
  onViewPasses: (eventId: string) => void;
  /** Callback to create passes for this event */
  onCreatePasses: (eventId: string) => void;
  /** Optional class name for styling */
  className?: string;
}

/**
 * Determines the color to use for the status chip based on event status
 * @param status - Event status
 * @returns Color name for the status chip
 */
const getStatusColor = (status: EventStatus): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case EventStatus.ACTIVE:
      return 'success';
    case EventStatus.INACTIVE:
      return 'warning';
    case EventStatus.CANCELLED:
      return 'error';
    case EventStatus.COMPLETED:
    default:
      return 'default';
  }
};

// Styled table row for selected state
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&.selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  cursor: 'pointer',
  // Focus styles for accessibility
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
}));

// Styled TableCell for actions to ensure proper spacing
const ActionCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  },
}));

/**
 * A component that renders an individual event item from the ParkHub system.
 * It can be displayed as either a table row or a card depending on the view mode.
 * 
 * @param props - Component props
 * @returns Rendered event item component
 */
const EventItem: React.FC<EventItemProps> = ({
  event,
  viewMode,
  selected,
  onSelect,
  onViewPasses,
  onCreatePasses,
  className,
}) => {
  const { id, name, formattedDate, formattedTime, venue, status } = event;
  const statusColor = getStatusColor(status);
  
  // Handlers for various interactions
  const handleRowClick = () => {
    onSelect(id);
  };
  
  const handleViewPasses = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row/card click
    onViewPasses(id);
  };
  
  const handleCreatePasses = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row/card click
    onCreatePasses(id);
  };
  
  // Format status for display
  const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  if (viewMode === 'table') {
    return (
      <StyledTableRow 
        onClick={handleRowClick}
        className={`${className || ''} ${selected ? 'selected' : ''}`}
        aria-selected={selected}
        data-testid="event-item-row"
        tabIndex={0} // Make row focusable for keyboard navigation
        onKeyPress={(e) => {
          // Handle keyboard selection
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(id);
          }
        }}
      >
        <TableCell>{id}</TableCell>
        <TableCell>{formattedDate}</TableCell>
        <TableCell>{formattedTime}</TableCell>
        <TableCell>{name}</TableCell>
        <TableCell>{venue}</TableCell>
        <TableCell>
          <Chip 
            label={statusDisplay} 
            color={statusColor} 
            size="small" 
            variant="outlined"
            aria-label={`Status: ${statusDisplay}`}
          />
        </TableCell>
        <ActionCell>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button 
              size="small" 
              startIcon={<VisibilityIcon />} 
              onClick={handleViewPasses}
              aria-label={`View passes for ${name}`}
            >
              View Passes
            </Button>
            <Button 
              size="small" 
              startIcon={<EditIcon />} 
              variant="outlined" 
              onClick={handleCreatePasses}
              aria-label={`Create passes for ${name}`}
            >
              Create Passes
            </Button>
          </Box>
        </ActionCell>
      </StyledTableRow>
    );
  } else {
    return (
      <Card
        selected={selected}
        onClick={() => onSelect(id)}
        className={className}
        data-testid="event-item-card"
        aria-label={`Event: ${name} on ${formattedDate} at ${formattedTime}`}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="h3">{name}</Typography>
              <Chip 
                label={statusDisplay} 
                color={statusColor} 
                size="small" 
                variant="outlined"
                aria-label={`Status: ${statusDisplay}`}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight="bold">ID:</Box> {id}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight="bold">Date:</Box> {formattedDate}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight="bold">Time:</Box> {formattedTime}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" fontWeight="bold">Venue:</Box> {venue}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" gap={1} mt={1}>
              <Button 
                size="small" 
                fullWidth 
                startIcon={<VisibilityIcon />} 
                onClick={handleViewPasses}
                aria-label={`View passes for ${name}`}
              >
                View Passes
              </Button>
              <Button 
                size="small" 
                fullWidth 
                startIcon={<EditIcon />} 
                variant="outlined" 
                onClick={handleCreatePasses}
                aria-label={`Create passes for ${name}`}
              >
                Create Passes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
    );
  }
};

export default EventItem;