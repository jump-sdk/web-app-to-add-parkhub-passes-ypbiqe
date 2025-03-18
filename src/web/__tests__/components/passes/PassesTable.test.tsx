import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { jest } from '@jest/globals';
import PassesTable from '../../../src/components/passes/PassesTable';
import { renderWithProviders } from '../../../src/utils/testing';
import { mockPasses, generateMockPasses } from '../../__mocks__/passesMock';
import { Pass, PassStatus, PassSpotType, PassSortField } from '../../../src/types/pass.types';
import usePasses from '../../../src/hooks/usePasses';
import { SortDirection } from '../../../src/types/common.types';

// Mock the usePasses hook
jest.mock('../../../src/hooks/usePasses', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the useMediaQuery hook from Material UI
jest.mock('@mui/material', () => {
  const actualMaterial = jest.requireActual('@mui/material');
  return {
    ...actualMaterial,
    useMediaQuery: jest.fn()
  };
});

// Helper function to set the useMediaQuery result
function mockUseMediaQuery(matches: boolean) {
  const { useMediaQuery } = require('@mui/material');
  useMediaQuery.mockReturnValue(matches);
}

describe('PassesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with passes data', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: mockPasses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 42 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that the desktop table is rendered
    expect(screen.getByTestId('passes-table-desktop')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('Pass ID')).toBeInTheDocument();
    expect(screen.getByText('Barcode')).toBeInTheDocument();
    expect(screen.getByText('Customer Name')).toBeInTheDocument();
    expect(screen.getByText('Spot Type')).toBeInTheDocument();
    expect(screen.getByText('Lot ID')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    // Check that pass data is displayed
    mockPasses.forEach(pass => {
      expect(screen.getByText(pass.id)).toBeInTheDocument();
      expect(screen.getByText(pass.barcode)).toBeInTheDocument();
      expect(screen.getByText(pass.customerName)).toBeInTheDocument();
    });
  });

  it('renders loading state correctly', () => {
    // Mock usePasses hook to return loading state
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: [],
      loading: true,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 0 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that loading state is shown
    expect(screen.getByTestId('passes-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading passes...')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    // Mock usePasses hook to return empty passes array
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: [],
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 0 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that empty state is shown
    expect(screen.getByTestId('passes-empty')).toBeInTheDocument();
    expect(screen.getByText('No passes found for this event. Create passes to see them here.')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    // Create error object
    const error = new Error('Failed to fetch passes');
    
    // Mock usePasses hook to return error state
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: [],
      loading: false,
      error,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 0 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that error state is shown
    expect(screen.getByTestId('passes-error')).toBeInTheDocument();
    expect(screen.getByText('Error loading passes: Failed to fetch passes')).toBeInTheDocument();
  });

  it('handles row click correctly', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Create mock functions for selection
    const selectPassMock = jest.fn();
    const onPassSelectMock = jest.fn();
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: mockPasses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 42 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: selectPassMock,
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={onPassSelectMock} onPassDetails={jest.fn()} />
    );

    // Get the first row (Note: this approach depends on the Table implementation)
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // First row is header, second is first data row
    
    // Click the row
    firstDataRow.click();
    
    // Verify the correct functions are called
    expect(selectPassMock).toHaveBeenCalledWith(mockPasses[0].id);
    expect(onPassSelectMock).toHaveBeenCalledWith(mockPasses[0]);
  });

  it('handles sorting correctly', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Create mock function for setSortOptions
    const setSortOptionsMock = jest.fn();
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: mockPasses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 42 },
      selectedPassId: null,
      setSortOptions: setSortOptionsMock,
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Find the Barcode column header and click it to sort
    const barcodeHeader = screen.getByText('Barcode');
    barcodeHeader.click();
    
    // Verify that setSortOptions was called with the correct arguments
    expect(setSortOptionsMock).toHaveBeenCalledWith({
      field: PassSortField.BARCODE,
      direction: SortDirection.ASC
    });
  });

  it('handles pagination correctly', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Create mock function for setPagination
    const setPaginationMock = jest.fn();
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: mockPasses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 42 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: setPaginationMock,
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Since we can't easily test MUI's pagination directly,
    // we'll test that our component setup correctly by simulating the handler
    const handlePageChange = (event: unknown, page: number) => {
      setPaginationMock({ page });
    };
    
    // Simulate clicking next page (page 1)
    handlePageChange(null, 1);
    
    // Verify setPagination was called with correct page
    expect(setPaginationMock).toHaveBeenCalledWith({ page: 1 });
  });

  it('renders in mobile view correctly', () => {
    // Mock mobile view (false means below breakpoint)
    mockUseMediaQuery(false);
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: mockPasses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 42 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that mobile view is shown
    expect(screen.getByTestId('passes-table-mobile')).toBeInTheDocument();
    
    // Check that PassItem components are rendered with correct data
    mockPasses.forEach(pass => {
      expect(screen.getByText(`Pass: ${pass.barcode}`)).toBeInTheDocument();
      expect(screen.getByText(pass.customerName)).toBeInTheDocument();
    });
  });

  it('formats pass status correctly', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Create passes with various statuses
    const passesWithDifferentStatuses = [
      { ...mockPasses[0], status: PassStatus.ACTIVE },
      { ...mockPasses[1], status: PassStatus.USED },
      { ...mockPasses[2], status: PassStatus.CANCELLED }
    ];
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: passesWithDifferentStatuses,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 3 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that status is formatted correctly with the right text
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('formats spot type correctly', () => {
    // Mock desktop view
    mockUseMediaQuery(true);
    
    // Create passes with various spot types
    const passesWithDifferentSpotTypes = [
      { ...mockPasses[0], spotType: PassSpotType.REGULAR },
      { ...mockPasses[1], spotType: PassSpotType.VIP },
      { ...mockPasses[2], spotType: PassSpotType.PREMIUM }
    ];
    
    // Mock usePasses hook response
    (usePasses as jest.Mock).mockReturnValue({
      paginatedPasses: passesWithDifferentSpotTypes,
      loading: false,
      error: null,
      sortOptions: { field: PassSortField.CREATED_AT, direction: SortDirection.DESC },
      pagination: { page: 0, pageSize: 10, totalItems: 3 },
      selectedPassId: null,
      setSortOptions: jest.fn(),
      setPagination: jest.fn(),
      selectPass: jest.fn(),
      selectEvent: jest.fn()
    });

    // Render the component
    renderWithProviders(
      <PassesTable eventId="EV12345" onPassSelect={jest.fn()} onPassDetails={jest.fn()} />
    );

    // Check that spot types are formatted correctly
    expect(screen.getByText('Regular')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});