import React from 'react';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import { useMediaQuery } from '@mui/material';
import Table from '../../../src/components/ui/Table';
import { TableColumn, SortDirection } from '../../../src/types/common.types';
import { renderWithProviders } from '../../../src/utils/testing';

// Mock useMediaQuery to test responsive behavior
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn()
}));

// Setup test data
const mockData = [
  { id: '1', name: 'Item 1', category: 'Category A', price: 10 },
  { id: '2', name: 'Item 2', category: 'Category B', price: 20 },
  { id: '3', name: 'Item 3', category: 'Category A', price: 30 }
];

const mockColumns: TableColumn[] = [
  { id: 'name', label: 'Name', field: 'name', sortable: true },
  { id: 'category', label: 'Category', field: 'category', sortable: true },
  { id: 'price', label: 'Price', field: 'price', sortable: false }
];

// Helper function to set up the component with props
const setup = (props = {}) => {
  const defaultProps = {
    data: mockData,
    columns: mockColumns,
    emptyMessage: 'No data to display',
    rowKey: 'id'
  };

  const mergedProps = { ...defaultProps, ...props };
  
  return renderWithProviders(
    <Table {...mergedProps} />
  );
};

describe('Table component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default to desktop view
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  test('renders_correctly_with_data', () => {
    const { getByTestId, getAllByTestId } = setup();
    
    // Check for desktop table
    const table = getByTestId('desktop-table');
    expect(table).toBeInTheDocument();
    
    // Check that headers are rendered
    expect(getByTestId('header-name')).toHaveTextContent('Name');
    expect(getByTestId('header-category')).toHaveTextContent('Category');
    expect(getByTestId('header-price')).toHaveTextContent('Price');
    
    // Check that data rows are rendered
    const rows = getAllByTestId(/^table-row-/);
    expect(rows).toHaveLength(3);
    
    // Check content of first row
    const firstRow = rows[0];
    expect(within(firstRow).getByTestId('cell-name')).toHaveTextContent('Item 1');
    expect(within(firstRow).getByTestId('cell-category')).toHaveTextContent('Category A');
    expect(within(firstRow).getByTestId('cell-price')).toHaveTextContent('10');
  });

  test('displays_empty_message_when_no_data', () => {
    const { getByTestId } = setup({ data: [] });
    
    // Check for empty table message
    const emptyTable = getByTestId('empty-table');
    expect(emptyTable).toBeInTheDocument();
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('handles_sorting_when_clicking_sortable_column_header', () => {
    const onSortChange = jest.fn();
    const { getByTestId } = setup({ onSortChange });
    
    // Click on sortable column header
    const nameHeader = getByTestId('header-name');
    fireEvent.click(within(nameHeader).getByRole('button'));
    
    // Check that onSortChange was called with correct arguments
    expect(onSortChange).toHaveBeenCalledWith({
      column: 'name',
      direction: SortDirection.DESC // First click toggles to DESC from default ASC
    });
    
    // Check that sort indicator is shown
    expect(within(nameHeader).getByRole('button')).toHaveClass('MuiTableSortLabel-active');
  });

  test('does_not_sort_when_clicking_non_sortable_column_header', () => {
    const onSortChange = jest.fn();
    const { getByTestId } = setup({ onSortChange });
    
    // Click on non-sortable column header
    const priceHeader = getByTestId('header-price');
    fireEvent.click(priceHeader);
    
    // Check that onSortChange was not called
    expect(onSortChange).not.toHaveBeenCalled();
    
    // Check that there's no sort button on this header
    expect(within(priceHeader).queryByRole('button')).not.toBeInTheDocument();
  });

  test('handles_pagination_correctly', () => {
    const onPageChange = jest.fn();
    const onRowsPerPageChange = jest.fn();
    const paginationConfig = {
      page: 0,
      pageSize: 10,
      totalItems: 30
    };
    
    const { getByTestId } = setup({
      paginationConfig,
      onPageChange,
      onRowsPerPageChange
    });
    
    // Get pagination component
    const pagination = getByTestId('pagination');
    
    // Click on next page button
    const nextPageButton = within(pagination).getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);
    
    // Check that onPageChange was called with correct page number
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    // Change rows per page
    const select = within(pagination).getByLabelText('Rows per page:');
    fireEvent.mouseDown(select);
    const options = screen.getAllByRole('option');
    fireEvent.click(options[1]); // Select second option (25)
    
    // Check that onRowsPerPageChange was called with correct size
    expect(onRowsPerPageChange).toHaveBeenCalled();
  });

  test('handles_row_click_events', () => {
    const onRowClick = jest.fn();
    const { getAllByTestId } = setup({ onRowClick });
    
    // Click on the first row
    const rows = getAllByTestId(/^table-row-/);
    fireEvent.click(rows[0]);
    
    // Check that onRowClick was called with the correct row data
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    
    // Test keyboard navigation - press Enter on a row
    fireEvent.keyDown(rows[1], { key: 'Enter' });
    expect(onRowClick).toHaveBeenCalledWith(mockData[1]);
    
    // Test keyboard navigation - press Space on a row
    fireEvent.keyDown(rows[2], { key: ' ' });
    expect(onRowClick).toHaveBeenCalledWith(mockData[2]);
  });

  test('highlights_selected_row', () => {
    const { getAllByTestId } = setup({ selectedRowKey: '2' });
    
    // Get all rows
    const rows = getAllByTestId(/^table-row-/);
    
    // Check that the second row has the selected class
    expect(rows[1]).toHaveClass('selected');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    
    // Check that other rows are not selected
    expect(rows[0]).not.toHaveClass('selected');
    expect(rows[2]).not.toHaveClass('selected');
  });

  test('renders_custom_cell_content_with_format_function', () => {
    // Create columns with format functions
    const columnsWithFormat = [
      ...mockColumns.slice(0, 2),
      {
        id: 'price',
        label: 'Price',
        field: 'price',
        sortable: false,
        format: (value) => `$${value}.00`
      }
    ];
    
    const { getAllByTestId } = setup({ columns: columnsWithFormat });
    
    // Get all price cells
    const rows = getAllByTestId(/^table-row-/);
    const priceCells = rows.map(row => within(row).getByTestId('cell-price'));
    
    // Check that the price cells have the formatted content
    expect(priceCells[0]).toHaveTextContent('$10.00');
    expect(priceCells[1]).toHaveTextContent('$20.00');
    expect(priceCells[2]).toHaveTextContent('$30.00');
  });

  test('adapts_to_small_screens', () => {
    // Mock useMediaQuery to return true (small screen)
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    
    const { queryByTestId, getByTestId } = setup();
    
    // Check that mobile view is rendered instead of desktop
    expect(queryByTestId('desktop-table')).not.toBeInTheDocument();
    expect(getByTestId('mobile-table')).toBeInTheDocument();
    
    // Check that cards are rendered instead of rows
    const cards = screen.getAllByTestId(/^table-row-/);
    expect(cards).toHaveLength(3);
    
    // Verify card content format
    const firstCard = cards[0];
    expect(within(firstCard).getByText('Name:')).toBeInTheDocument();
    expect(within(firstCard).getByText('Item 1')).toBeInTheDocument();
  });

  test('handles_loading_state', () => {
    const { queryByTestId } = setup({ loading: true });
    
    // Check that loading indicator is displayed
    expect(queryByTestId('loading-indicator')).toBeInTheDocument();
    
    // Check that table content is not displayed while loading
    const rows = screen.queryAllByTestId(/^table-row-/);
    expect(rows).toHaveLength(0);
  });
});