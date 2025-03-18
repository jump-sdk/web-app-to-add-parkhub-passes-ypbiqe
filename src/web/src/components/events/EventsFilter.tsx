import React, { useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material'; // version: ^5.14.0
import { DatePicker } from '@mui/x-date-pickers'; // version: ^6.0.0
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'; // version: ^5.14.0
import { styled } from '@mui/material/styles'; // version: ^5.14.0
import useMediaQuery from '@mui/material/useMediaQuery'; // version: ^5.14.0
import { useTheme } from '@mui/material/styles'; // version: ^5.14.0

import { EventFilterOptions, EventStatus } from '../../types/event.types';
import Select from '../ui/Select';
import { FormFieldOption } from '../../types/form.types';

/**
 * Interface for EventsFilter component props
 */
export interface EventsFilterProps {
  /** Current filter options */
  filterOptions: EventFilterOptions;
  /** Callback function for when filters change */
  onFilterChange: (filters: EventFilterOptions) => void;
  /** Array of available venue names for the venue filter */
  availableVenues: string[];
  /** Optional CSS class name */
  className?: string;
}

/**
 * Styled container for the filter controls
 */
const FilterContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

/**
 * Styled grid item for individual filter controls
 */
const FilterItem = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1),
  flexGrow: 1,
  minWidth: 200,
}));

/**
 * Styled text field for search input
 */
const SearchField = styled(TextField)(({ theme }) => ({
  width: '100%',
}));

/**
 * Generates options for the status filter select component
 * @returns Array of status options with values and labels
 */
const getStatusOptions = (): FormFieldOption[] => {
  const options: FormFieldOption[] = [
    { value: '', label: 'All Statuses' }
  ];
  
  // Add options for each EventStatus enum value
  Object.values(EventStatus).forEach(status => {
    options.push({
      value: status,
      // Convert 'active' to 'Active', etc.
      label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    });
  });
  
  return options;
};

/**
 * Generates options for the venue filter select component based on available venues
 * @param venues Array of available venues
 * @returns Array of venue options with values and labels
 */
const getVenueOptions = (venues: string[]): FormFieldOption[] => {
  const options: FormFieldOption[] = [
    { value: '', label: 'All Venues' }
  ];
  
  // Add options for each unique venue
  venues.forEach(venue => {
    if (venue) {
      options.push({
        value: venue,
        label: venue
      });
    }
  });
  
  return options;
};

/**
 * A component that provides filtering controls for the events list
 * Allows users to filter events by status, venue, date range, and search term
 * 
 * @param props Component props
 * @returns React component
 */
const EventsFilter: React.FC<EventsFilterProps> = ({
  filterOptions,
  onFilterChange,
  availableVenues,
  className = '',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Memoize the options arrays to prevent unnecessary recalculations
  const statusOptions = useMemo(() => getStatusOptions(), []);
  const venueOptions = useMemo(() => getVenueOptions(availableVenues), [availableVenues]);
  
  /**
   * Handles changes to the status filter
   */
  const handleStatusChange = useCallback((name: string, value: string) => {
    const status = value ? value as EventStatus : null;
    onFilterChange({
      ...filterOptions,
      status
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Handles changes to the venue filter
   */
  const handleVenueChange = useCallback((name: string, value: string) => {
    const venue = value || null;
    onFilterChange({
      ...filterOptions,
      venue
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Handles changes to the start date filter
   */
  const handleDateFromChange = useCallback((date: Date | null) => {
    onFilterChange({
      ...filterOptions,
      dateFrom: date
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Handles changes to the end date filter
   */
  const handleDateToChange = useCallback((date: Date | null) => {
    onFilterChange({
      ...filterOptions,
      dateTo: date
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Handles changes to the search term
   */
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value || null;
    onFilterChange({
      ...filterOptions,
      searchTerm
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Clears the search term filter
   */
  const handleClearSearch = useCallback(() => {
    onFilterChange({
      ...filterOptions,
      searchTerm: null
    });
  }, [filterOptions, onFilterChange]);
  
  /**
   * Clears all filters
   */
  const handleClearFilters = useCallback(() => {
    onFilterChange({
      status: null,
      venue: null,
      dateFrom: null,
      dateTo: null,
      searchTerm: null
    });
  }, [onFilterChange]);
  
  return (
    <FilterContainer className={className} data-testid="events-filter">
      <Grid container spacing={2} alignItems="center">
        <FilterItem item xs={12} sm={6} md={3}>
          <Select
            name="status"
            label="Status"
            options={statusOptions}
            value={filterOptions.status || ''}
            onChange={handleStatusChange}
            onBlur={() => {}}
            fullWidth
          />
        </FilterItem>
        
        <FilterItem item xs={12} sm={6} md={3}>
          <Select
            name="venue"
            label="Venue"
            options={venueOptions}
            value={filterOptions.venue || ''}
            onChange={handleVenueChange}
            onBlur={() => {}}
            fullWidth
          />
        </FilterItem>
        
        <FilterItem item xs={12} sm={6} md={3}>
          <DatePicker
            label="From Date"
            value={filterOptions.dateFrom}
            onChange={handleDateFromChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                variant: "outlined"
              }
            }}
          />
        </FilterItem>
        
        <FilterItem item xs={12} sm={6} md={3}>
          <DatePicker
            label="To Date"
            value={filterOptions.dateTo}
            onChange={handleDateToChange}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                variant: "outlined"
              }
            }}
          />
        </FilterItem>
        
        <FilterItem item xs={12}>
          <SearchField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search events by name or venue..."
            value={filterOptions.searchTerm || ''}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: filterOptions.searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    edge="end"
                    aria-label="clear search"
                    size="small"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FilterItem>
        
        {(filterOptions.status || filterOptions.venue || 
         filterOptions.dateFrom || filterOptions.dateTo || 
         filterOptions.searchTerm) && (
          <Box display="flex" justifyContent="flex-end" width="100%" mt={1} px={1}>
            <IconButton 
              onClick={handleClearFilters} 
              size="small"
              color="primary"
              aria-label="clear all filters"
            >
              <ClearIcon fontSize="small" />
              {!isMobile && <Box component="span" ml={0.5}>Clear All Filters</Box>}
            </IconButton>
          </Box>
        )}
      </Grid>
    </FilterContainer>
  );
};

export default EventsFilter;