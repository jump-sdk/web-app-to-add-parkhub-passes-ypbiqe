import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import ResultsPage from '../../src/pages/ResultsPage';
import { renderWithProviders, mockApiServices } from '../../src/utils/testing';
import { mockEvents, createMockEvent } from '../__mocks__/eventsMock';
import { mockPasses, createMockPass } from '../__mocks__/passesMock';
import { ROUTES } from '../../src/constants/routes';
import { PassCreationSummary } from '../../src/types/pass.types';
import { AppError } from '../../src/types/error.types';

// Mock navigate and location hooks from react-router-dom
const mockNavigate = jest.fn();
const mockLocation = jest.fn(() => ({ state: null }));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

describe('ResultsPage', () => {
  // Mock the createMultiplePasses function from usePasses hook
  const mockCreateMultiplePasses = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockApiServices({
      usePasses: {
        createMultiplePasses: mockCreateMultiplePasses
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders creation results when summary is provided', async () => {
    // Create a mock event for the test
    const mockEvent = createMockEvent({
      id: 'EV12345',
      name: 'Test Event'
    });

    // Create mock successful and failed passes
    const mockSuccessfulPasses = [
      createMockPass({ 
        id: 'P00001', 
        eventId: mockEvent.id, 
        barcode: 'BC100001', 
        customerName: 'John Doe' 
      }),
      createMockPass({ 
        id: 'P00002', 
        eventId: mockEvent.id, 
        barcode: 'BC100002', 
        customerName: 'Jane Smith' 
      })
    ];

    const mockFailedPasses = [
      { 
        barcode: 'BC100003', 
        customerName: 'Failed User', 
        error: new Error('Duplicate barcode') as AppError 
      }
    ];

    // Create a mock creation summary
    const mockSummary: PassCreationSummary = {
      eventId: mockEvent.id,
      event: mockEvent,
      successful: mockSuccessfulPasses,
      failed: mockFailedPasses,
      totalSuccess: mockSuccessfulPasses.length,
      totalFailed: mockFailedPasses.length
    };

    // Set up mock location state with the summary
    mockLocation.mockReturnValue({
      state: {
        creationSummary: mockSummary
      }
    });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Verify the event name is displayed
    expect(screen.getByText(`Event: ${mockEvent.name}`)).toBeInTheDocument();

    // Verify successful passes are displayed
    expect(screen.getByText('Successful Creations')).toBeInTheDocument();
    expect(screen.getByText(mockSuccessfulPasses[0].customerName)).toBeInTheDocument();
    expect(screen.getByText(mockSuccessfulPasses[1].customerName)).toBeInTheDocument();

    // Verify failed passes are displayed
    expect(screen.getByText('Failed Creations')).toBeInTheDocument();
    expect(screen.getByText(mockFailedPasses[0].customerName)).toBeInTheDocument();
    expect(screen.getByText('Duplicate barcode')).toBeInTheDocument();

    // Verify action buttons
    expect(screen.getByText('Create More Passes')).toBeInTheDocument();
    expect(screen.getByText('View All Passes for Event')).toBeInTheDocument();
    expect(screen.getByText('Retry Failed Passes')).toBeInTheDocument();
  });

  it('displays error message when no summary is provided', async () => {
    // Set up mock location without a summary
    mockLocation.mockReturnValue({ state: null });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Verify error message is displayed
    expect(screen.getByText(/no creation results found/i)).toBeInTheDocument();
    
    // Verify retry button is displayed
    expect(screen.getByText('Go to Create Passes')).toBeInTheDocument();
  });

  it('navigates to create passes page when create more button is clicked', async () => {
    // Create a mock event for the test
    const mockEvent = createMockEvent({
      id: 'EV12345',
      name: 'Test Event'
    });

    // Create a mock creation summary
    const mockSummary: PassCreationSummary = {
      eventId: mockEvent.id,
      event: mockEvent,
      successful: [],
      failed: [],
      totalSuccess: 0,
      totalFailed: 0
    };

    // Set up mock location state with the summary
    mockLocation.mockReturnValue({
      state: {
        creationSummary: mockSummary
      }
    });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Click the "Create More Passes" button
    const createMoreButton = screen.getByText('Create More Passes');
    createMoreButton.click();

    // Verify navigation was called with the correct route and parameters
    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.CREATE_PASSES}?eventId=${mockEvent.id}`);
  });

  it('navigates to passes page when view all passes button is clicked', async () => {
    // Create a mock event for the test
    const mockEvent = createMockEvent({
      id: 'EV12345',
      name: 'Test Event'
    });

    // Create a mock creation summary
    const mockSummary: PassCreationSummary = {
      eventId: mockEvent.id,
      event: mockEvent,
      successful: [],
      failed: [],
      totalSuccess: 0,
      totalFailed: 0
    };

    // Set up mock location state with the summary
    mockLocation.mockReturnValue({
      state: {
        creationSummary: mockSummary
      }
    });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Click the "View All Passes" button
    const viewAllPassesButton = screen.getByText('View All Passes for Event');
    viewAllPassesButton.click();

    // Verify navigation was called with the correct route and parameters
    expect(mockNavigate).toHaveBeenCalledWith(`${ROUTES.PASSES}?eventId=${mockEvent.id}`);
  });

  it('retries failed passes when retry button is clicked', async () => {
    // Create a mock event for the test
    const mockEvent = createMockEvent({
      id: 'EV12345',
      name: 'Test Event'
    });

    // Create mock successful and failed passes
    const mockSuccessfulPasses = [
      createMockPass({ 
        id: 'P00001', 
        eventId: mockEvent.id, 
        barcode: 'BC100001', 
        customerName: 'John Doe',
        accountId: 'ACC123',
        spotType: 'Regular',
        lotId: 'LOT-A'
      })
    ];

    const mockFailedPasses = [
      { 
        barcode: 'BC100003', 
        customerName: 'Failed User', 
        error: new Error('Duplicate barcode') as AppError 
      }
    ];

    // Create a mock creation summary
    const mockSummary: PassCreationSummary = {
      eventId: mockEvent.id,
      event: mockEvent,
      successful: mockSuccessfulPasses,
      failed: mockFailedPasses,
      totalSuccess: mockSuccessfulPasses.length,
      totalFailed: mockFailedPasses.length
    };

    // Set up mock location state with the summary
    mockLocation.mockReturnValue({
      state: {
        creationSummary: mockSummary
      }
    });

    // Mock the createMultiplePasses function to return successful results
    const newlyCreatedPass = createMockPass({
      id: 'P00003', 
      eventId: mockEvent.id, 
      barcode: 'BC100003', 
      customerName: 'Failed User'
    });
    
    mockCreateMultiplePasses.mockResolvedValue({
      eventId: mockEvent.id,
      event: mockEvent,
      successful: [newlyCreatedPass],
      failed: [],
      totalSuccess: 1,
      totalFailed: 0
    });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Click the "Retry Failed Passes" button
    const retryButton = screen.getByText('Retry Failed Passes');
    retryButton.click();

    // Verify createMultiplePasses was called with the correct parameters
    await waitFor(() => {
      expect(mockCreateMultiplePasses).toHaveBeenCalledWith([
        {
          eventId: mockEvent.id,
          accountId: 'ACC123',
          barcode: 'BC100003',
          customerName: 'Failed User',
          spotType: 'Regular',
          lotId: 'LOT-A'
        }
      ]);
    });

    // Verify navigation was called to update the results page with the new creation summary
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.RESULTS, {
      state: {
        creationSummary: expect.any(Object)
      },
      replace: true
    });
  });

  it('handles errors during retry', async () => {
    // Create a mock event for the test
    const mockEvent = createMockEvent({
      id: 'EV12345',
      name: 'Test Event'
    });

    // Create mock failed passes
    const mockFailedPasses = [
      { 
        barcode: 'BC100003', 
        customerName: 'Failed User', 
        error: new Error('Duplicate barcode') as AppError 
      }
    ];

    // Create a mock creation summary
    const mockSummary: PassCreationSummary = {
      eventId: mockEvent.id,
      event: mockEvent,
      successful: [],
      failed: mockFailedPasses,
      totalSuccess: 0,
      totalFailed: mockFailedPasses.length
    };

    // Set up mock location state with the summary
    mockLocation.mockReturnValue({
      state: {
        creationSummary: mockSummary
      }
    });

    // Mock the createMultiplePasses function to throw an error
    const mockError = new Error('API error') as AppError;
    mockCreateMultiplePasses.mockRejectedValue(mockError);

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Click the "Retry Failed Passes" button
    const retryButton = screen.getByText('Retry Failed Passes');
    retryButton.click();

    // Verify createMultiplePasses was called
    await waitFor(() => {
      expect(mockCreateMultiplePasses).toHaveBeenCalled();
    });

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('navigates to create passes page when error retry button is clicked', async () => {
    // Set up mock location without a summary
    mockLocation.mockReturnValue({ state: null });

    // Render the component
    renderWithProviders(<ResultsPage />);

    // Click the "Go to Create Passes" button
    const retryButton = screen.getByText('Go to Create Passes');
    retryButton.click();

    // Verify navigation was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_PASSES);
  });
});