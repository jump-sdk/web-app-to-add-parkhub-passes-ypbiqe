import React, { useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  useMediaQuery 
} from '@mui/material'; // ^5.14.0
import { useTheme, styled } from '@mui/material/styles'; // ^5.14.0
import { useNavigate } from 'react-router-dom'; // ^6.14.0

import { 
  Event, 
  EventFilterOptions, 
  EventSortOptions, 
  PaginationConfig 
} from '../../types/event.types';
import { SortDirection } from '../../types/common.types';
import useEvents from '../../hooks/useEvents';
import EventsTable from './EventsTable';
import EventsFilter from './EventsFilter';
import EventItem from './EventItem';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../feedback/ErrorDisplay';
import { ROUTES } from '../../constants/routes';

export interface EventsListProps {
  className?: string;
}

// Styled component for the events container
const EventsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  width: '100%',
}));

// Styled component for the events header
const EventsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}));

// Styled component for the pagination container
const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const EventsList: React.FC<EventsListProps> = ({ className }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Initialize events hook which provides events data and management functions
  const {
    events,
    filteredEvents,
    paginatedEvents,
    loading,
    error,
    filterOptions,
    sortOptions,
    pagination,
    selectedEventId,
    setFilterOptions,
    setSortOptions,
    setPagination,
    selectEvent,
    refetch
  } = useEvents();

  // Handle event selection
  const handleEventSelect = useCallback((eventId: string) => {
    selectEvent(eventId);
  }, [selectEvent]);

  // Handle navigation to passes view
  const handleViewPasses = useCallback((eventId: string) => {
    navigate(`${ROUTES.PASSES}?eventId=${eventId}`);
  }, [navigate]);

  // Handle navigation to pass creation
  const handleCreatePasses = useCallback((eventId: string) => {
    navigate(`${ROUTES.CREATE_PASSES}?eventId=${eventId}`);
  }, [navigate]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterOptions: EventFilterOptions) => {
    setFilterOptions(filterOptions);
    // Reset to first page when filters change
    setPagination({ page: 1 });
  }, [setFilterOptions, setPagination]);

  // Handle sort changes
  const handleSortChange = useCallback((sortOptions: EventSortOptions) => {
    setSortOptions(sortOptions);
  }, [setSortOptions]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setPagination({ page });
  }, [setPagination]);

  // Handle rows per page changes
  const handleRowsPerPageChange = useCallback((rowsPerPage: number) => {
    setPagination({
      page: 1, // Reset to first page when changing rows per page
      pageSize: rowsPerPage
    });
  }, [setPagination]);

  // Handle retry action for API errors
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Determine unique venues for filtering
  const availableVenues = useMemo(() => {
    return Array.from(new Set(events.map(event => event.venue))).filter(Boolean);
  }, [events]);

  return (
    <EventsContainer className={className} data-testid="events-list">
      <EventsHeader>
        <Typography variant="h5" component="h1">
          Events
        </Typography>
      </EventsHeader>

      {/* Display loading spinner if data is loading */}
      {loading && <LoadingSpinner />}

      {/* Display error if there is one */}
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
        />
      )}

      {/* Only display content if not loading and no errors */}
      {!loading && !error && (
        <>
          {/* Filters */}
          <EventsFilter
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            availableVenues={availableVenues}
          />

          {/* Events display - table for desktop, cards for mobile */}
          {isMobile ? (
            <Box>
              {paginatedEvents.length === 0 ? (
                <Typography align="center" py={4}>
                  No events found matching your criteria.
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {paginatedEvents.map((event) => (
                    <Grid item xs={12} key={event.id}>
                      <EventItem
                        event={event}
                        viewMode="card"
                        selected={selectedEventId === event.id}
                        onSelect={handleEventSelect}
                        onViewPasses={handleViewPasses}
                        onCreatePasses={handleCreatePasses}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          ) : (
            <EventsTable
              events={paginatedEvents}
              loading={loading}
              sortOptions={sortOptions}
              onSortChange={handleSortChange}
              paginationConfig={pagination}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              selectedEventId={selectedEventId}
              onEventSelect={handleEventSelect}
              onViewPasses={handleViewPasses}
              onCreatePasses={handleCreatePasses}
            />
          )}

          {/* Display summary and pagination */}
          {!loading && filteredEvents.length > 0 && (
            <PaginationContainer>
              <Typography variant="body2" color="textSecondary">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1}-
                {Math.min(pagination.page * pagination.pageSize, filteredEvents.length)} of {filteredEvents.length} events
              </Typography>
            </PaginationContainer>
          )}
        </>
      )}
    </EventsContainer>
  );
};

export default EventsList;