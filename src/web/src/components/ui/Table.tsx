import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Box,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import { visuallyHidden } from '@mui/utils'; // v5.14.0
import {
  TableColumn as ImportedTableColumn,
  SortDirection,
  SortConfig as ImportedSortConfig,
  PaginationConfig as ImportedPaginationConfig
} from '../../types/common.types';
import { truncateText } from '../../utils/formatting';

// Interface for TableProps with detailed documentation
export interface TableProps {
  /** Array of data items to display in the table */
  data: any[];
  /** Column configuration for the table */
  columns: TableColumn[];
  /** Current sort configuration (column and direction) */
  sortConfig?: SortConfig;
  /** Callback function when sort changes */
  onSortChange?: (sortConfig: SortConfig) => void;
  /** Current pagination configuration */
  paginationConfig?: PaginationConfig;
  /** Callback function when page changes */
  onPageChange?: (page: number) => void;
  /** Callback function when rows per page changes */
  onRowsPerPageChange?: (pageSize: number) => void;
  /** Callback function when a row is clicked */
  onRowClick?: (rowData: any) => void;
  /** Property name to use as unique key for each row */
  rowKey?: string;
  /** Key value of currently selected row */
  selectedRowKey?: string | null;
  /** Whether the table is in loading state */
  loading?: boolean;
  /** Message to display when there is no data */
  emptyMessage?: string;
  /** Custom renderer function for table rows */
  customRowRenderer?: (rowData: any, index: number) => React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Whether the table header should be sticky */
  stickyHeader?: boolean;
  /** Whether to use dense padding */
  dense?: boolean;
}

// Extended TableColumn interface with additional properties
export interface TableColumn extends ImportedTableColumn {
  /** Text alignment for the column */
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit';
  /** Function to format cell values for display */
  format?: (value: any, row: any) => React.ReactNode;
  /** Whether the column should be hidden (can be responsive) */
  hidden?: boolean | ((breakpoint: string) => boolean);
}

// SortConfig interface for sort state
export interface SortConfig extends ImportedSortConfig {
  // Re-export with the same structure
}

// PaginationConfig interface for pagination state
export interface PaginationConfig extends ImportedPaginationConfig {
  // Re-export with the same structure
}

/**
 * Creates a comparator function for sorting table data based on column and direction
 * @param direction Sort direction (ascending or descending)
 * @param column Column field to sort by
 * @returns Comparator function that compares two objects
 */
function getComparator(direction: SortDirection, column: string): (a: any, b: any) => number {
  const isAsc = direction === SortDirection.ASC;
  
  return function comparator(a: any, b: any): number {
    // Get the values to compare
    const valueA = a[column];
    const valueB = b[column];
    
    // Handle undefined or null values
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return isAsc ? -1 : 1;
    if (valueB == null) return isAsc ? 1 : -1;
    
    let comparison = 0;
    
    // Handle different data types
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      // Case-insensitive string comparison
      comparison = valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
    } else if (
      // Check if the values are dates
      (valueA instanceof Date || !isNaN(Date.parse(valueA))) &&
      (valueB instanceof Date || !isNaN(Date.parse(valueB)))
    ) {
      const dateA = valueA instanceof Date ? valueA : new Date(valueA);
      const dateB = valueB instanceof Date ? valueB : new Date(valueB);
      comparison = dateA.getTime() - dateB.getTime();
    } else {
      // Default numeric comparison
      comparison = valueA - valueB;
    }
    
    return isAsc ? comparison : -comparison;
  };
}

/**
 * Sorts an array while maintaining the original order of equal elements
 * @param array Array to sort
 * @param comparator Comparator function
 * @returns Sorted array
 */
function stableSort<T>(array: T[], comparator: (a: T, b: T) => number): T[] {
  // Create an array of indices to track original positions
  const indexedArray = array.map((item, index) => [item, index] as [T, number]);
  
  // Sort the array with the comparator, using indices as tiebreaker
  indexedArray.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    // If values are equal, use the original index for stable sort
    return a[1] - b[1];
  });
  
  // Return just the sorted items (without indices)
  return indexedArray.map((item) => item[0]);
}

// Styled table row component for handling hover and selected states
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
  '&.selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
  },
}));

// Styled card view for mobile display
const CardView = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
  },
  '&.selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '-2px',
  },
}));

// Styled loading overlay
const LoadingOverlay = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  width: '100%',
}));

/**
 * Reusable table component for displaying tabular data with sorting, pagination, and row selection.
 * Adapts to mobile screens by switching to a card layout.
 */
const Table: React.FC<TableProps> = ({
  data = [],
  columns = [],
  sortConfig,
  onSortChange,
  paginationConfig,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  rowKey = 'id',
  selectedRowKey = null,
  loading = false,
  emptyMessage = 'No data to display',
  customRowRenderer,
  className,
  stickyHeader = false,
  dense = false,
}) => {
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Internal state for sorting if not controlled externally
  const [internalSortConfig, setInternalSortConfig] = useState<SortConfig>({
    column: columns.find(col => col.sortable)?.field || '',
    direction: SortDirection.ASC
  });
  
  // Determine which sort config to use (controlled or internal)
  const currentSortConfig = sortConfig || internalSortConfig;
  
  // Internal state for pagination if not controlled externally
  const [internalPaginationConfig, setInternalPaginationConfig] = useState<PaginationConfig>({
    page: 0,
    pageSize: 10,
    totalItems: data.length
  });
  
  // Determine which pagination config to use (controlled or internal)
  const currentPaginationConfig = paginationConfig || internalPaginationConfig;
  
  // Update internal pagination when data changes
  useEffect(() => {
    if (!paginationConfig) {
      setInternalPaginationConfig(prev => ({
        ...prev,
        totalItems: data.length
      }));
    }
  }, [data, paginationConfig]);
  
  // Handle sort requests
  const handleSort = useCallback((column: string) => {
    const isAsc = currentSortConfig.column === column && currentSortConfig.direction === SortDirection.ASC;
    const newSortConfig: SortConfig = {
      column,
      direction: isAsc ? SortDirection.DESC : SortDirection.ASC
    };
    
    // If externally controlled, call the callback
    if (onSortChange) {
      onSortChange(newSortConfig);
    } else {
      // Otherwise update internal state
      setInternalSortConfig(newSortConfig);
    }
  }, [currentSortConfig, onSortChange]);
  
  // Handle page change
  const handlePageChange = useCallback((event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPaginationConfig(prev => ({
        ...prev,
        page: newPage
      }));
    }
  }, [onPageChange]);
  
  // Handle rows per page change
  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newPageSize);
    } else {
      setInternalPaginationConfig(prev => ({
        ...prev,
        pageSize: newPageSize,
        page: 0 // Reset to first page when changing page size
      }));
    }
  }, [onRowsPerPageChange]);
  
  // Handle row click
  const handleRowClick = useCallback((row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);
  
  // Handle keyboard navigation for rows
  const handleRowKeyDown = useCallback((event: React.KeyboardEvent, row: any) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRowClick(row);
    }
  }, [handleRowClick]);
  
  // Process and sort data
  const sortedData = useMemo(() => {
    if (!data.length || !currentSortConfig.column) return data;
    
    return stableSort(
      data, 
      getComparator(currentSortConfig.direction, currentSortConfig.column)
    );
  }, [data, currentSortConfig]);
  
  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!sortedData.length) return [];
    
    const { page, pageSize } = currentPaginationConfig;
    const start = page * pageSize;
    const end = start + pageSize;
    
    return sortedData.slice(start, end);
  }, [sortedData, currentPaginationConfig]);
  
  // Handle empty state
  if (!loading && (!data || data.length === 0)) {
    return (
      <Paper className={className} data-testid="empty-table">
        <Box p={3} display="flex" justifyContent="center" alignItems="center">
          <Typography variant="body1" color="textSecondary">
            {emptyMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Render mobile card view
  if (isMobile) {
    return (
      <Box className={className} data-testid="mobile-table">
        {loading ? (
          <LoadingOverlay>
            <Typography>Loading...</Typography>
          </LoadingOverlay>
        ) : (
          <>
            {paginatedData.map((row, index) => {
              const isSelected = selectedRowKey != null && row[rowKey] === selectedRowKey;
              
              if (customRowRenderer) {
                return React.cloneElement(
                  customRowRenderer(row, index) as React.ReactElement,
                  {
                    key: row[rowKey] || index,
                    onClick: () => handleRowClick(row),
                    onKeyDown: (e: React.KeyboardEvent) => handleRowKeyDown(e, row),
                    className: isSelected ? 'selected' : '',
                    tabIndex: 0,
                    role: 'button',
                    'aria-pressed': isSelected,
                  }
                );
              }
              
              return (
                <CardView
                  key={row[rowKey] || index}
                  onClick={() => handleRowClick(row)}
                  onKeyDown={(e) => handleRowKeyDown(e, row)}
                  className={isSelected ? 'selected' : ''}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  data-testid={`table-row-${index}`}
                >
                  {columns
                    .filter(column => {
                      if (typeof column.hidden === 'function') {
                        return !column.hidden('sm');
                      }
                      return !column.hidden;
                    })
                    .map(column => {
                      const value = row[column.field];
                      const displayValue = column.format 
                        ? column.format(value, row)
                        : value != null 
                          ? String(value) 
                          : '';
                      
                      return (
                        <Box key={column.id} mb={1} data-testid={`cell-${column.field}`}>
                          <Typography variant="caption" color="textSecondary">
                            {column.label}:
                          </Typography>
                          <Typography variant="body2">
                            {displayValue}
                          </Typography>
                        </Box>
                      );
                    })}
                </CardView>
              );
            })}
            
            {/* Pagination for mobile */}
            {paginatedData.length > 0 && (
              <TablePagination
                component="div"
                count={currentPaginationConfig.totalItems}
                page={currentPaginationConfig.page}
                onPageChange={handlePageChange}
                rowsPerPage={currentPaginationConfig.pageSize}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Rows:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              />
            )}
          </>
        )}
      </Box>
    );
  }
  
  // Desktop table view
  return (
    <Paper className={className} data-testid="desktop-table">
      <TableContainer>
        <MuiTable 
          aria-label="data table" 
          stickyHeader={stickyHeader} 
          size={dense ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              {columns
                .filter(column => {
                  if (typeof column.hidden === 'function') {
                    return !column.hidden(theme.breakpoints.values.md.toString());
                  }
                  return !column.hidden;
                })
                .map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ width: column.width }}
                    sortDirection={currentSortConfig.column === column.field ? currentSortConfig.direction : false}
                    data-testid={`header-${column.field}`}
                  >
                    {column.sortable ? (
                      <TableSortLabel
                        active={currentSortConfig.column === column.field}
                        direction={
                          currentSortConfig.column === column.field
                            ? currentSortConfig.direction
                            : SortDirection.ASC
                        }
                        onClick={() => handleSort(column.field)}
                      >
                        {column.label}
                        {currentSortConfig.column === column.field ? (
                          <Box component="span" sx={visuallyHidden}>
                            {currentSortConfig.direction === SortDirection.DESC
                              ? 'sorted descending'
                              : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.filter(col => !col.hidden).length} 
                  align="center"
                  data-testid="loading-indicator"
                >
                  <Box p={3}>
                    <Typography>Loading...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const isSelected = selectedRowKey != null && row[rowKey] === selectedRowKey;
                
                if (customRowRenderer) {
                  return customRowRenderer(row, index);
                }
                
                return (
                  <StyledTableRow
                    hover
                    tabIndex={0}
                    key={row[rowKey] || index}
                    onClick={() => handleRowClick(row)}
                    onKeyDown={(e) => handleRowKeyDown(e, row)}
                    className={isSelected ? 'selected' : ''}
                    role="row"
                    aria-selected={isSelected}
                    selected={isSelected}
                    data-testid={`table-row-${index}`}
                  >
                    {columns
                      .filter(column => {
                        if (typeof column.hidden === 'function') {
                          return !column.hidden(theme.breakpoints.values.md.toString());
                        }
                        return !column.hidden;
                      })
                      .map(column => {
                        const value = row[column.field];
                        let displayValue: React.ReactNode;
                        
                        if (column.format) {
                          displayValue = column.format(value, row);
                        } else if (value != null) {
                          if (typeof value === 'string') {
                            displayValue = truncateText(value, 100);
                          } else {
                            displayValue = String(value);
                          }
                        } else {
                          displayValue = '';
                        }
                        
                        return (
                          <TableCell 
                            key={column.id} 
                            align={column.align || 'left'}
                            data-testid={`cell-${column.field}`}
                          >
                            {displayValue}
                          </TableCell>
                        );
                      })}
                  </StyledTableRow>
                );
              })
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      
      {/* Pagination for desktop */}
      {paginatedData.length > 0 && (
        <TablePagination
          component="div"
          count={currentPaginationConfig.totalItems}
          page={currentPaginationConfig.page}
          onPageChange={handlePageChange}
          rowsPerPage={currentPaginationConfig.pageSize}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          data-testid="pagination"
        />
      )}
    </Paper>
  );
};

export default Table;