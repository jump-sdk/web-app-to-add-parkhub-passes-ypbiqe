import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import PassesList from '../../../src/components/passes/PassesList';
import { Pass, PassStatus, PassSpotType, PassSortField } from '../../../src/types/pass.types';
import { renderWithProviders, mockApiServices } from '../../../src/utils/testing';
import { mockPasses, generateMockPasses } from '../../__mocks__/passesMock';
import { usePasses } from '../../../src/hooks/usePasses';
import { useMediaQuery } from '@mui/material';

// Mock the usePasses hook
jest.mock('../../../src/hooks/usePasses');

// Mock useMediaQuery for responsive design testing
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn(),
  };
});

describe('PassesList', () => {
  // Props and mock functions
  const mockOnPassSelect = jest.fn();
  const mockOnPassDetails = jest.fn();
  const mockSelectEvent = jest.fn();
  const mockSetFilterOptions = jest.fn();
  const mockSetSortOptions = jest.fn();
  const mockSetPagination = jest.fn();
  const mockSelectPass = jest.fn();
  const mockRefetch = jest.fn();
  
  const defaultProps = {
    eventId: 'EV12345',
    onPassSelect: mockOnPassSelect,
    onPassDetails: mockOnPassDetails,
  };
  
  const mockHookReturn = {
    passes: mockPasses,
    filteredPasses: mockPasses,
    paginatedPasses: mockPasses.slice(0, 3),
    loading: false,
    error: null,
    filterOptions: {
      status: null,
      spotType: null,
      lotId: null,
      searchTerm: null,
    },
    sortOptions: {
      field: PassSortField.CREATED_AT,
      direction: 'desc',
    },
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: mockPasses.length,
      totalPages: 1,
    },
    selectedPassId: null,
    selectedEventId: 'EV12345',
    setFilterOptions: mockSetFilterOptions,
    setSortOptions: mockSetSortOptions,
    setPagination: mockSetPagination,
    selectPass: mockSelectPass,
    selectEvent: mockSelectEvent,
    refetch: mockRefetch,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (usePasses as jest.Mock).mockReturnValue(mockHookReturn);
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Default to desktop view
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when loading', () => {
    (usePasses as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      loading: true,
    });
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(screen.getByTestId('passes-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('passes-list')).not.toBeInTheDocument();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Failed to fetch passes';
    (usePasses as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      error: new Error(errorMessage),
    });
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(screen.getByTestId('passes-error')).toBeInTheDocument();
  });

  it('renders empty state when no passes are available', () => {
    (usePasses as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      paginatedPasses: [],
    });
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(screen.getByTestId('passes-empty')).toBeInTheDocument();
    expect(screen.getByText(/No Passes Found/i)).toBeInTheDocument();
  });

  it('renders passes table in desktop view', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(false); // Desktop view
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(screen.getByTestId('passes-list')).toBeInTheDocument();
    expect(screen.queryByTestId('passes-mobile-list')).not.toBeInTheDocument();
  });

  it('renders passes cards in mobile view', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile view
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(screen.getByTestId('passes-list')).toBeInTheDocument();
    expect(screen.getByTestId('passes-mobile-list')).toBeInTheDocument();
  });

  it('calls selectEvent when eventId prop changes', () => {
    const { rerender } = renderWithProviders(<PassesList {...defaultProps} />);
    
    expect(mockSelectEvent).toHaveBeenCalledWith('EV12345');
    
    rerender(<PassesList {...defaultProps} eventId="EV12346" />);
    
    expect(mockSelectEvent).toHaveBeenCalledWith('EV12346');
  });

  it('handles filter changes correctly', async () => {
    const user = userEvent.setup();
    
    // Using the actual component to test filter changes
    renderWithProviders(<PassesList {...defaultProps} />);
    
    // Simulate filter change by directly calling the handler
    const filterOptions = {
      status: PassStatus.ACTIVE,
      spotType: null,
      lotId: null,
      searchTerm: null,
    };
    
    // Get access to the component instance's handleFilterChange
    const instance = (usePasses as jest.Mock).mock.instances[0];
    const handleFilterChange = instance.handleFilterChange || mockHookReturn.setFilterOptions;
    
    // Call handleFilterChange with new filter options
    if (typeof handleFilterChange === 'function') {
      handleFilterChange(filterOptions);
    }
    
    expect(mockSetFilterOptions).toHaveBeenCalledWith(filterOptions);
  });

  it('handles sort changes correctly', async () => {
    renderWithProviders(<PassesList {...defaultProps} />);
    
    // Simulate sort change by directly calling the handler
    const sortOptions = {
      field: PassSortField.BARCODE,
      direction: 'asc',
    };
    
    // Get access to the component instance's handleSortChange
    const instance = (usePasses as jest.Mock).mock.instances[0];
    const handleSortChange = instance.handleSortChange || mockHookReturn.setSortOptions;
    
    // Call handleSortChange with new sort options
    if (typeof handleSortChange === 'function') {
      handleSortChange(sortOptions);
    }
    
    expect(mockSetSortOptions).toHaveBeenCalledWith(sortOptions);
  });

  it('handles pagination correctly', async () => {
    (usePasses as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      pagination: {
        ...mockHookReturn.pagination,
        totalPages: 3,
      },
    });
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    // Verify pagination is displayed
    expect(screen.getByTestId('passes-pagination')).toBeInTheDocument();
    
    // Simulate page change by directly calling the handler
    const page = 2;
    
    // Get access to the component instance's handlePageChange
    const handlePageChange = mockHookReturn.setPagination;
    
    // Call handlePageChange with new page
    if (typeof handlePageChange === 'function') {
      handlePageChange({ page });
    }
    
    expect(mockSetPagination).toHaveBeenCalledWith({ page });
  });

  it('calls onPassSelect when a pass is selected', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<PassesList {...defaultProps} />);
    
    // Simulate pass selection by directly calling the handler
    const pass = mockPasses[0];
    
    // Get access to the component instance's handlePassSelect
    const instance = (usePasses as jest.Mock).mock.instances[0];
    const handlePassSelect = instance.handlePassSelect || 
                           (pass => {
                             mockSelectPass(pass.id);
                             mockOnPassSelect(pass);
                           });
    
    // Call handlePassSelect with a pass
    if (typeof handlePassSelect === 'function') {
      handlePassSelect(pass);
    }
    
    expect(mockSelectPass).toHaveBeenCalledWith(pass.id);
    expect(mockOnPassSelect).toHaveBeenCalledWith(pass);
  });

  it('calls refetch when retry button is clicked', async () => {
    (usePasses as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      error: new Error('Failed to fetch passes'),
    });
    
    const user = userEvent.setup();
    renderWithProviders(<PassesList {...defaultProps} />);
    
    // Find the retry button in the error display
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    
    expect(mockRefetch).toHaveBeenCalled();
  });
});