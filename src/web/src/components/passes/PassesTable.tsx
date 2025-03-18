import React, { useMemo, useCallback, useEffect } from 'react'; // ^18.2.0
import { Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Table from '../ui/Table';
import { 
  Pass, 
  PassStatus, 
  PassSpotType, 
  PassSortField,
  PassTableColumn 
} from '../../types/pass.types';
import PassItem from './PassItem';
import usePasses from '../../hooks/usePasses';
import { SPOT_TYPE_LABELS } from '../../constants/spotTypes';
import { SortDirection, SortConfig, PaginationConfig } from '../../types/common.types';

/**
 * Props for the PassesTable component
 */
export interface PassesTableProps {
  /** The event ID to fetch passes for */
  eventId: string;
  /** Callback function when a pass is selected */
  onPassSelect: (pass: Pass) => void;
  /** Callback function when pass details are requested */
  onPassDetails: (pass: Pass) => void;
  /** Optional CSS class name */
  className?: string;
}

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
  const statusText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
  
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
 * Formats the spot type using human-readable labels
 * 
 * @param spotType - The spot type to format
 * @returns Human-readable spot type label
 */
const formatSpotType = (spotType: PassSpotType): string => {
  return SPOT_TYPE_LABELS[spotType] || spotType;
};

/**
 * A component that displays parking passes in a tabular format with support for sorting,
 * filtering, and pagination. It provides a user-friendly interface for viewing and
 * interacting with passes for a specific event in the ParkHub system.
 * 
 * @param props - The component props
 * @returns The rendered PassesTable component
 */
const PassesTable: React.FC<PassesTableProps> = ({
  eventId,
  onPassSelect,
  onPassDetails,
  className
}) => {
  const {
    paginatedPasses,
    loading,
    error,
    sortOptions,
    pagination,
    selectedPassId,
    setSortOptions,
    setPagination,
    selectPass,
    selectEvent
  } = usePasses();

  // Use these hooks to check screen size for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Effect to select the event when eventId changes
  useEffect(() => {
    if (eventId) {
      selectEvent(eventId);
    }
  }, [eventId, selectEvent]);

  // Define table columns with appropriate headers, field mappings, and formatters
  const columns = useMemo((): PassTableColumn[] => [
    {
      id: 'id',
      label: 'Pass ID',
      field: 'id',
      sortable: true,
      width: '100px',
      align: 'left'
    },
    {
      id: 'barcode',
      label: 'Barcode',
      field: 'barcode',
      sortable: true,
      width: '120px',
      align: 'left'
    },
    {
      id: 'customerName',
      label: 'Customer Name',
      field: 'customerName',
      sortable: true,
      width: '200px',
      align: 'left'
    },
    {
      id: 'spotType',
      label: 'Spot Type',
      field: 'spotType',
      sortable: true,
      width: '120px',
      align: 'left',
      format: (value) => formatSpotType(value as PassSpotType)
    },
    {
      id: 'lotId',
      label: 'Lot ID',
      field: 'lotId',
      sortable: true,
      width: '100px',
      align: 'left'
    },
    {
      id: 'createdAt',
      label: 'Created At',
      field: 'formattedCreatedAt',
      sortable: true,
      width: '150px',
      align: 'left'
    },
    {
      id: 'status',
      label: 'Status',
      field: 'status',
      sortable: true,
      width: '120px',
      align: 'left',
      format: (value) => formatPassStatus(value as PassStatus)
    }
  ], []);

  // Configure sorting options for the table
  const sortConfig = useMemo((): SortConfig => ({
    column: sortOptions.field,
    direction: sortOptions.direction
  }), [sortOptions]);

  // Configure pagination options for the table
  const paginationConfig = useMemo((): PaginationConfig => pagination, [pagination]);

  // Handle pass selection
  const handlePassSelect = useCallback((pass: Pass) => {
    selectPass(pass.id);
    onPassSelect(pass);
  }, [selectPass, onPassSelect]);

  // Handle row click in the table
  const handleRowClick = useCallback((pass: Pass) => {
    handlePassSelect(pass);
  }, [handlePassSelect]);

  // Handle sort change
  const handleSortChange = useCallback((newSortConfig: SortConfig) => {
    setSortOptions({
      field: newSortConfig.column as PassSortField,
      direction: newSortConfig.direction
    });
  }, [setSortOptions]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPagination({ page });
  }, [setPagination]);

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize });
  }, [setPagination]);

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} data-testid="passes-loading">
        <Typography>Loading passes...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} data-testid="passes-error">
        <Typography color="error">
          Error loading passes: {error.message}
        </Typography>
      </Box>
    );
  }

  // If no passes found
  if (!paginatedPasses || paginatedPasses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} data-testid="passes-empty">
        <Typography>
          No passes found for this event. Create passes to see them here.
        </Typography>
      </Box>
    );
  }

  // Render for mobile view using PassItem components
  if (isMobile) {
    return (
      <Box className={className} data-testid="passes-table-mobile">
        {paginatedPasses.map((pass) => (
          <PassItem
            key={pass.id}
            pass={pass}
            onSelect={handlePassSelect}
            onDetails={onPassDetails}
            selected={pass.id === selectedPassId}
          />
        ))}
      </Box>
    );
  }

  // Render for desktop view using Table component
  return (
    <Table
      data={paginatedPasses}
      columns={columns}
      sortConfig={sortConfig}
      onSortChange={handleSortChange}
      paginationConfig={paginationConfig}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onRowClick={handleRowClick}
      rowKey="id"
      selectedRowKey={selectedPassId}
      className={className}
      data-testid="passes-table-desktop"
    />
  );
};

export default PassesTable;