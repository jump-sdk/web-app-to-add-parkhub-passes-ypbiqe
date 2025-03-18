import React, { useMemo, useCallback } from 'react';
import { Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import { Event, EventSortField, EventSortOptions, EventTableColumn } from '../../types/event.types';
import { SortDirection, PaginationConfig } from '../../types/common.types';
import Table from '../ui/Table';
import EventItem from './EventItem';
import { formatDate } from '../../utils/date-helpers';

/**
 * Props interface for the EventsTable component
 */
export interface EventsTableProps {
  /** Array of events to display */
  events: Event[];
  /** Whether the table is in loading state */
  loading: boolean;
  /** Current sort configuration */
  sortOptions: EventSortOptions;
  /** Callback when sort configuration changes */
  onSortChange: (sortOptions: EventSortOptions) => void;
  /** Pagination configuration */
  paginationConfig: PaginationConfig;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when rows per page changes */
  onRowsPerPageChange: (pageSize: number) => void;
  /** Currently selected event ID */
  selectedEventId: string | null;
  /** Callback when an event is selected */
  onEventSelect: (eventId: string) => void;
  /** Callback to view passes for an event */
  onViewPasses: (eventId: string) => void;
  /** Callback to create passes for an event */
  onCreatePasses: (eventId: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Styled container for the events table
 */
const StyledTable = styled(Box)(({ theme }) => ({
  width: '100%',
  overflow: 'auto',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

/**
 * Styled container for mobile view of events
 */
const MobileEventsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
}));

/**
 * Styled chip for displaying event status
 */
const StatusChip = styled(Chip)({
  fontSize: '0.75rem',
  height: 24,
  borderRadius: 12,
});

/**
 * Determines the color to use for the status chip based on event status
 * @param status - Event status
 * @returns Color name to use for the status chip
 */
const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'inactive':
      return 'warning';
    case 'completed':
    default:
      return 'default';
  }
};

/**
 * Generates the column configuration for the events table
 * @returns Array of column configurations for the events table
 */
const getEventColumns = (): EventTableColumn[] => {
  return [
    {
      id: 'id',
      label: 'Event ID',
      field: 'id',
      sortable: true,
      width: '120px',
      align: 'left',
    },
    {
      id: 'date',
      label: 'Date',
      field: 'formattedDate',
      sortable: true,
      width: '120px',
      align: 'left',
    },
    {
      id: 'time',
      label: 'Time',
      field: 'formattedTime',
      sortable: false,
      width: '100px',
      align: 'left',
    },
    {
      id: 'name',
      label: 'Event Name',
      field: 'name',
      sortable: true,
      width: 'auto',
      align: 'left',
    },
    {
      id: 'venue',
      label: 'Venue',
      field: 'venue',
      sortable: true,
      width: '150px',
      align: 'left',
    },
    {
      id: 'status',
      label: 'Status',
      field: 'status',
      sortable: true,
      width: '120px',
      align: 'left',
      format: (value, event) => (
        <StatusChip 
          label={value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
          color={getStatusColor(value)}
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      field: 'id',
      sortable: false,
      width: '250px',
      align: 'right',
    },
  ];
};

/**
 * A component that renders a table of events from the ParkHub system.
 * It provides sorting, pagination, and row selection capabilities,
 * and is used in the Events view of the application.
 * 
 * The component displays event details such as ID, name, date, time, venue, and status,
 * and supports responsive design by adapting to different screen sizes.
 */
const EventsTable: React.FC<EventsTableProps> = ({
  events,
  loading,
  sortOptions,
  onSortChange,
  paginationConfig,
  onPageChange,
  onRowsPerPageChange,
  selectedEventId,
  onEventSelect,
  onViewPasses,
  onCreatePasses,
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Generate table columns using memoization to prevent unnecessary re-renders
  const columns = useMemo(() => getEventColumns(), []);
  
  // Create a memoized sort config object for the Table component
  const sortConfig = useMemo(() => ({
    column: sortOptions.field,
    direction: sortOptions.direction,
  }), [sortOptions]);
  
  // Handle sorting changes from the Table component
  const handleSortChange = useCallback((newSortConfig) => {
    onSortChange({
      field: newSortConfig.column as EventSortField,
      direction: newSortConfig.direction,
    });
  }, [onSortChange]);
  
  // Handle row click to select an event
  const handleRowClick = useCallback((row) => {
    onEventSelect(row.id);
  }, [onEventSelect]);
  
  // Use the mobile view when on smaller screens
  if (isMobile) {
    return (
      <MobileEventsContainer className={className} data-testid="mobile-events-container">
        {loading ? (
          <Box p={2} display="flex" justifyContent="center">
            <Typography>Loading events...</Typography>
          </Box>
        ) : events.length === 0 ? (
          <Box p={2} display="flex" justifyContent="center">
            <Typography>No events found</Typography>
          </Box>
        ) : (
          <>
            {/* Render events as cards in mobile view */}
            {events.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                viewMode="card"
                selected={selectedEventId === event.id}
                onSelect={onEventSelect}
                onViewPasses={onViewPasses}
                onCreatePasses={onCreatePasses}
              />
            ))}
          </>
        )}
      </MobileEventsContainer>
    );
  }
  
  // Render desktop view (table layout)
  return (
    <StyledTable className={className} data-testid="desktop-events-table">
      <Table
        data={events}
        columns={columns}
        loading={loading}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        paginationConfig={paginationConfig}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onRowClick={handleRowClick}
        rowKey="id"
        selectedRowKey={selectedEventId}
        customRowRenderer={(rowData, index) => (
          <EventItem
            key={rowData.id}
            event={rowData}
            viewMode="table"
            selected={selectedEventId === rowData.id}
            onSelect={onEventSelect}
            onViewPasses={onViewPasses}
            onCreatePasses={onCreatePasses}
          />
        )}
        stickyHeader
      />
    </StyledTable>
  );
};

export default EventsTable;