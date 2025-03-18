import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { jest } from '@testing-library/jest';
import EventsTable from '../../../src/components/events/EventsTable';
import { renderWithProviders } from '../../../src/utils/testing';
import { mockEvents } from '../../__mocks__/eventsMock';
import { EventSortField, EventSortOptions, SortDirection } from '../../../src/types/event.types';

describe('EventsTable', () => {
  let mockUseMediaQuery: jest.Mock;

  beforeEach(() => {
    // Mock useMediaQuery for responsive design testing
    mockUseMediaQuery = jest.fn().mockReturnValue(false); // Default to desktop view
    jest.spyOn(require('@mui/material'), 'useMediaQuery').mockImplementation(mockUseMediaQuery);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Helper function to render the EventsTable with default props
  const renderTable = (props = {}) => {
    const defaultProps = {
      events: mockEvents,
      loading: false,
      sortOptions: {
        field: EventSortField.DATE,
        direction: SortDirection.DESC,
      } as EventSortOptions,
      onSortChange: jest.fn(),
      paginationConfig: {
        page: 0,
        pageSize: 10,
        totalItems: mockEvents.length,
        totalPages: Math.ceil(mockEvents.length / 10),
      },
      onPageChange: jest.fn(),
      onRowsPerPageChange: jest.fn(),
      selectedEventId: null,
      onEventSelect: jest.fn(),
      onViewPasses: jest.fn(),
      onCreatePasses: jest.fn(),
    };

    return renderWithProviders(
      <EventsTable {...{ ...defaultProps, ...props }} />
    );
  };

  it('renders the table with event data', () => {
    renderTable();
    
    // Check that the desktop table view is rendered
    const table = screen.getByTestId('desktop-events-table');
    expect(table).toBeInTheDocument();
    
    // Check that event data is displayed
    mockEvents.forEach(event => {
      expect(screen.getByText(event.id)).toBeInTheDocument();
      expect(screen.getByText(event.name)).toBeInTheDocument();
      expect(screen.getByText(event.formattedDate)).toBeInTheDocument();
      expect(screen.getByText(event.venue)).toBeInTheDocument();
      
      // Status is displayed as a chip with capitalized text
      const statusText = event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase();
      expect(screen.getByText(statusText)).toBeInTheDocument();
    });
  });

  it('handles sorting when column header is clicked', async () => {
    const onSortChange = jest.fn();
    const { user } = renderTable({ onSortChange });
    
    // Find a sortable column header (Name) and click it
    const nameHeader = screen.getByText('Event Name').closest('th');
    await user.click(nameHeader);
    
    // Verify onSortChange was called with correct sort options
    expect(onSortChange).toHaveBeenCalledWith({
      field: EventSortField.NAME,
      direction: SortDirection.ASC,
    });
    
    // Click again to test sort direction toggle
    await user.click(nameHeader);
    expect(onSortChange).toHaveBeenCalledWith({
      field: EventSortField.NAME,
      direction: SortDirection.DESC,
    });
  });

  it('handles pagination correctly', async () => {
    const onPageChange = jest.fn();
    const onRowsPerPageChange = jest.fn();
    const { user } = renderTable({ 
      onPageChange, 
      onRowsPerPageChange,
      paginationConfig: {
        page: 0,
        pageSize: 2,
        totalItems: mockEvents.length,
        totalPages: Math.ceil(mockEvents.length / 2),
      } 
    });
    
    // Find and click next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    await user.click(nextPageButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
    
    // Change rows per page
    const rowsPerPageSelect = screen.getByLabelText(/rows per page/i);
    await user.click(rowsPerPageSelect);
    
    // Wait for dropdown to appear and select 25
    await waitFor(() => {
      const option = screen.getByRole('option', { name: '25' });
      return expect(option).toBeInTheDocument();
    });
    
    const option = screen.getByRole('option', { name: '25' });
    await user.click(option);
    expect(onRowsPerPageChange).toHaveBeenCalledWith(25);
  });

  it('selects an event when row is clicked', async () => {
    const onEventSelect = jest.fn();
    const { user } = renderTable({ onEventSelect });
    
    // Find the first event row and click it
    const firstEventRow = screen.getAllByRole('row')[1]; // Skip header row
    await user.click(firstEventRow);
    
    // Verify onEventSelect was called with the correct event ID
    expect(onEventSelect).toHaveBeenCalledWith(mockEvents[0].id);
  });

  it('renders in mobile view on small screens', () => {
    // Mock useMediaQuery to simulate small screen
    mockUseMediaQuery.mockReturnValue(true);
    
    renderTable();
    
    // Check that mobile view is rendered instead of table
    const mobileView = screen.getByTestId('mobile-events-container');
    expect(mobileView).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-events-table')).not.toBeInTheDocument();
    
    // Check that event data is still displayed in mobile view
    mockEvents.forEach(event => {
      expect(screen.getByText(event.name)).toBeInTheDocument();
    });
  });

  it('displays loading state correctly', () => {
    renderTable({ loading: true });
    
    // Check that loading indicator is displayed
    const loadingIndicator = screen.getByText(/loading events/i);
    expect(loadingIndicator).toBeInTheDocument();
    
    // Table content should not be displayed while loading
    expect(screen.queryByText(mockEvents[0].name)).not.toBeInTheDocument();
  });

  it('handles empty events array', () => {
    renderTable({ events: [] });
    
    // Check that empty state message is displayed
    const emptyMessage = screen.getByText(/no events found/i);
    expect(emptyMessage).toBeInTheDocument();
  });
});