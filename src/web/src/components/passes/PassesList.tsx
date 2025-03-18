import React, { useState, useEffect, useMemo, useCallback } from 'react'; // ^18.2.0
import { Box, Typography, useMediaQuery, Pagination } from '@mui/material'; // ^5.14.0
import { useTheme, styled } from '@mui/material/styles'; // ^5.14.0

import { 
  Pass, 
  PassFilterOptions, 
  PassSortOptions, 
  PassTableColumn, 
  PassSortField
} from '../../types/pass.types';
import { PaginationOptions } from '../../types/common.types';
import { usePasses } from '../../hooks/usePasses';
import PassesTable from './PassesTable';
import PassItem from './PassItem';
import PassesFilter from './PassesFilter';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorDisplay from '../feedback/ErrorDisplay';

// Props interface
export interface PassesListProps {
  eventId: string;
  onPassSelect: (pass: Pass) => void;
  onPassDetails: (pass: Pass) => void;
  className?: string;
}

// Styled components
const ListContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
}));

const MobileList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

// Utility function to extract available lot IDs from passes
const getAvailableLotIds = (passes: Pass[]): string[] => {
  const lotIdsSet = new Set<string>();
  passes.forEach(pass => {
    if (pass.lotId) {
      lotIdsSet.add(pass.lotId);
    }
  });
  return Array.from(lotIdsSet).sort();
};

const PassesList: React.FC<PassesListProps> = ({
  eventId,
  onPassSelect,
  onPassDetails,
  className,
}) => {
  // Get theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use the usePasses hook to manage passes data and state
  const {
    passes,
    filteredPasses,
    paginatedPasses,
    loading,
    error,
    filterOptions,
    sortOptions,
    pagination,
    selectedPassId,
    setFilterOptions,
    setSortOptions,
    setPagination,
    selectPass,
    selectEvent,
    refetch,
  } = usePasses();
  
  // Create memoized available lot IDs
  const availableLotIds = useMemo(() => getAvailableLotIds(passes), [passes]);
  
  // Handler for filter changes
  const handleFilterChange = useCallback((newFilterOptions: PassFilterOptions) => {
    setFilterOptions(newFilterOptions);
  }, [setFilterOptions]);
  
  // Handler for sort changes
  const handleSortChange = useCallback((newSortOptions: PassSortOptions) => {
    setSortOptions(newSortOptions);
  }, [setSortOptions]);
  
  // Handler for page changes
  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    setPagination({ page });
  }, [setPagination]);
  
  // Handler for rows per page changes
  const handleRowsPerPageChange = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, [setPagination]);
  
  // Handler for pass selection
  const handlePassSelect = useCallback((pass: Pass) => {
    selectPass(pass.id);
    onPassSelect(pass);
  }, [selectPass, onPassSelect]);
  
  // Handler for retrying on error
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  
  // Select the event when eventId changes
  useEffect(() => {
    if (eventId) {
      selectEvent(eventId);
    }
  }, [eventId, selectEvent]);
  
  // Render error state
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={handleRetry}
        data-testid="passes-error"
      />
    );
  }
  
  // Render loading state
  if (loading) {
    return <LoadingSpinner data-testid="passes-loading" />;
  }
  
  // Render empty state
  if (!paginatedPasses || paginatedPasses.length === 0) {
    return (
      <EmptyState data-testid="passes-empty">
        <Typography variant="h6">No Passes Found</Typography>
        <Typography variant="body1">
          There are no passes for this event yet. Create some passes to see them here.
        </Typography>
      </EmptyState>
    );
  }
  
  return (
    <ListContainer className={className} data-testid="passes-list">
      {/* Filter component */}
      <PassesFilter
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        availableLotIds={availableLotIds}
      />
      
      {/* Mobile or desktop view based on screen size */}
      {isMobile ? (
        <MobileList data-testid="passes-mobile-list">
          {paginatedPasses.map(pass => (
            <PassItem
              key={pass.id}
              pass={pass}
              onSelect={handlePassSelect}
              onDetails={onPassDetails}
              selected={pass.id === selectedPassId}
            />
          ))}
        </MobileList>
      ) : (
        <PassesTable
          eventId={eventId}
          onPassSelect={onPassSelect}
          onPassDetails={onPassDetails}
          className={className}
        />
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationContainer data-testid="passes-pagination">
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </PaginationContainer>
      )}
    </ListContainer>
  );
};

export default PassesList;