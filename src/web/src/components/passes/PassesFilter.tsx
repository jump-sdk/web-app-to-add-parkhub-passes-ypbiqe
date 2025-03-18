import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Grid, Typography, IconButton, Collapse, Paper } from '@mui/material'; // version: ^5.14.0
import { styled } from '@mui/material/styles'; // version: ^5.14.0
import { FilterList, Clear, ExpandMore, ExpandLess, Search } from '@mui/icons-material'; // version: ^5.14.0
import { debounce } from 'lodash'; // version: ^4.17.21

// Internal imports
import { PassFilterOptions, PassSpotType, PassStatus } from '../../types/pass.types';
import { FormFieldOption } from '../../types/form.types';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { SPOT_TYPE_LABELS } from '../../constants/spotTypes';

/**
 * Interface for PassesFilter component props
 */
export interface PassesFilterProps {
  /** Current filter options */
  filterOptions: PassFilterOptions;
  /** Callback when filter options change */
  onFilterChange: (filterOptions: PassFilterOptions) => void;
  /** Available lot IDs for filtering */
  availableLotIds: string[];
  /** Optional CSS class name */
  className?: string;
}

/**
 * Styled Paper component for the filter container
 */
const FilterContainer = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(0, 0, 2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

/**
 * Styled Box component for the filter header
 */
const FilterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

/**
 * Styled Typography component for the filter title
 */
const FilterTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 500,
  gap: theme.spacing(1),
}));

/**
 * Styled Box component for the filter controls container
 */
const FilterControls = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  gap: theme.spacing(2),
}));

/**
 * Creates select options for lot ID filter based on available lot IDs
 * 
 * @param lotIds - Array of available lot IDs
 * @returns Array of lot ID options for select component
 */
const createLotIdOptions = (lotIds: string[]): FormFieldOption[] => {
  const allOption: FormFieldOption = { value: '', label: 'All Lots' };
  
  const lotOptions = lotIds.map((lotId) => ({
    value: lotId,
    label: lotId,
  }));
  
  return [allOption, ...lotOptions];
};

/**
 * A component that provides filtering controls for the passes list
 * 
 * @param props - Component props
 * @returns The rendered filter component
 */
const PassesFilter: React.FC<PassesFilterProps> = ({
  filterOptions,
  onFilterChange,
  availableLotIds,
  className,
}) => {
  // State for expanded/collapsed filter panel
  const [expanded, setExpanded] = useState(false);
  
  // Local state for filter values
  const [localFilterOptions, setLocalFilterOptions] = useState<PassFilterOptions>(filterOptions);
  
  // Create status options for dropdown
  const statusOptions = useMemo((): FormFieldOption[] => {
    const options: FormFieldOption[] = [
      { value: '', label: 'All Statuses' },
      { value: PassStatus.ACTIVE, label: 'Active' },
      { value: PassStatus.INACTIVE, label: 'Inactive' },
      { value: PassStatus.USED, label: 'Used' },
      { value: PassStatus.CANCELLED, label: 'Cancelled' },
    ];
    return options;
  }, []);
  
  // Create spot type options for dropdown
  const spotTypeOptions = useMemo((): FormFieldOption[] => {
    const options: FormFieldOption[] = [
      { value: '', label: 'All Spot Types' },
      { value: PassSpotType.REGULAR, label: SPOT_TYPE_LABELS[PassSpotType.REGULAR] },
      { value: PassSpotType.VIP, label: SPOT_TYPE_LABELS[PassSpotType.VIP] },
      { value: PassSpotType.PREMIUM, label: SPOT_TYPE_LABELS[PassSpotType.PREMIUM] },
    ];
    return options;
  }, []);
  
  // Create lot ID options for dropdown
  const lotIdOptions = useMemo(() => {
    return createLotIdOptions(availableLotIds);
  }, [availableLotIds]);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFilterOptions(filterOptions);
  }, [filterOptions]);
  
  // Handle filter changes
  const handleFilterChange = (key: keyof PassFilterOptions, value: string | null) => {
    const newFilterOptions = {
      ...localFilterOptions,
      [key]: value === '' ? null : value,
    };
    setLocalFilterOptions(newFilterOptions);
    onFilterChange(newFilterOptions);
  };
  
  // Debounced search handler to prevent too many updates while typing
  const debouncedSearchHandler = useCallback(
    debounce((value: string) => handleFilterChange('searchTerm', value), 300),
    []
  );
  
  // Handle search input changes
  const handleSearchChange = (name: string, value: string) => {
    // Update local state immediately for responsive UI
    setLocalFilterOptions(prev => ({
      ...prev,
      searchTerm: value === '' ? null : value
    }));
    
    // Debounce the actual filter change
    debouncedSearchHandler(value);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: PassFilterOptions = {
      status: null,
      spotType: null,
      lotId: null,
      searchTerm: null,
    };
    setLocalFilterOptions(clearedFilters);
    onFilterChange(clearedFilters);
  };
  
  // Toggle expanded/collapsed state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  return (
    <FilterContainer className={className} elevation={1}>
      <FilterHeader>
        <FilterTitle variant="h6">
          <FilterList color="primary" />
          Filter Passes
        </FilterTitle>
        <Box>
          <IconButton 
            onClick={handleClearFilters}
            size="small"
            aria-label="Clear filters"
            title="Clear all filters"
            data-testid="clear-filters-button"
          >
            <Clear />
          </IconButton>
          <IconButton 
            onClick={toggleExpanded}
            size="small"
            aria-label={expanded ? "Collapse filters" : "Expand filters"}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </FilterHeader>
      
      <Collapse in={expanded}>
        <FilterControls>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                name="status"
                label="Status"
                options={statusOptions}
                value={localFilterOptions.status || ''}
                onChange={(name, value) => handleFilterChange('status', value)}
                onBlur={() => {}}
                fullWidth
                data-testid="filter-status"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                name="spotType"
                label="Spot Type"
                options={spotTypeOptions}
                value={localFilterOptions.spotType || ''}
                onChange={(name, value) => handleFilterChange('spotType', value)}
                onBlur={() => {}}
                fullWidth
                data-testid="filter-spot-type"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                name="lotId"
                label="Lot ID"
                options={lotIdOptions}
                value={localFilterOptions.lotId || ''}
                onChange={(name, value) => handleFilterChange('lotId', value)}
                onBlur={() => {}}
                fullWidth
                data-testid="filter-lot-id"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Input
                name="searchTerm"
                label="Search"
                type="text"
                value={localFilterOptions.searchTerm || ''}
                onChange={handleSearchChange}
                onBlur={() => {}}
                placeholder="Search by barcode or name"
                fullWidth
                startAdornment={<Search />}
                data-testid="filter-search"
              />
            </Grid>
          </Grid>
        </FilterControls>
      </Collapse>
    </FilterContainer>
  );
};

export default PassesFilter;