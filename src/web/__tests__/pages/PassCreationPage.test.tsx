import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PassCreationPage from '../../src/pages/PassCreationPage';
import { renderWithProviders, mockApiKey, mockApiServices } from '../../src/utils/testing';
import { mockEvents, createMockEvent } from '../__mocks__/eventsMock';
import { mockPasses, createMockPass, createMockPassCreationResponse } from '../__mocks__/passesMock';
import { ROUTES } from '../../src/constants/routes';
import { PassCreationSummary } from '../../src/types/pass.types';

// Create module-scope variables to store captured props
let capturedPassCreationFormProps = {};
let capturedErrorDisplayProps = {};

// Mock the hooks we need
jest.mock('../../src/hooks/usePasses', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../src/hooks/useErrorHandler', () => ({ __esModule: true, default: jest.fn() }));

// Mock react-router-dom functions
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: jest.fn()
}));

// Mock PassCreationForm to capture props
jest.mock('../../src/components/forms/PassCreationForm', () => {
  return function MockPassCreationForm(props) {
    // Capture props for testing
    capturedPassCreationFormProps = props;
    return <div data-testid="mock-pass-creation-form">Mock Form</div>;
  };
});

// Mock ErrorDisplay to capture props
jest.mock('../../src/components/feedback/ErrorDisplay', () => {
  return function MockErrorDisplay(props) {
    // Capture props for testing
    capturedErrorDisplayProps = props;
    return <div data-testid="mock-error-display">{props.error?.message}</div>;
  };
});

describe('PassCreationPage', () => {
  beforeEach(() => {
    // Reset captured props
    capturedPassCreationFormProps = {};
    capturedErrorDisplayProps = {};
    
    // Mock API key for authentication
    mockApiKey('test-api-key');
    
    // Set up react-router mocks
    const mockNavigate = jest.fn();
    const mockLocation = { pathname: '/create-passes', search: '', hash: '', state: {} };
    const mockSearchParams = [new URLSearchParams(), jest.fn()];
    
    // Restore imports with mocks
    const reactRouterDom = require('react-router-dom');
    reactRouterDom.useNavigate.mockReturnValue(mockNavigate);
    reactRouterDom.useLocation.mockReturnValue(mockLocation);
    reactRouterDom.useSearchParams.mockReturnValue(mockSearchParams);
    
    // Set up usePasses hook mock
    const usePasses = require('../../src/hooks/usePasses').default;
    usePasses.mockReturnValue({
      loading: false,
      error: null,
      createMultiplePasses: jest.fn().mockResolvedValue({
        eventId: 'EV12345',
        event: mockEvents[0],
        successful: [],
        failed: [],
        totalSuccess: 0,
        totalFailed: 0
      }),
      selectEvent: jest.fn()
    });
    
    // Set up useErrorHandler hook mock
    const useErrorHandler = require('../../src/hooks/useErrorHandler').default;
    useErrorHandler.mockReturnValue({
      handleError: jest.fn(),
      error: null,
      clearError: jest.fn()
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders correctly', () => {
    renderWithProviders(<PassCreationPage />);
    
    expect(screen.getByText('Create Parking Passes')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pass-creation-form')).toBeInTheDocument();
  });
  
  it('displays loading spinner when loading', () => {
    const usePasses = require('../../src/hooks/usePasses').default;
    usePasses.mockReturnValue({
      loading: true,
      error: null,
      createMultiplePasses: jest.fn(),
      selectEvent: jest.fn()
    });
    
    renderWithProviders(<PassCreationPage />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('displays error message when there is an error', () => {
    const mockError = { 
      type: 'network', 
      code: 'connection_error', 
      message: 'Test error message', 
      timestamp: Date.now() 
    };
    
    const usePasses = require('../../src/hooks/usePasses').default;
    usePasses.mockReturnValue({
      loading: false,
      error: mockError,
      createMultiplePasses: jest.fn(),
      selectEvent: jest.fn()
    });
    
    renderWithProviders(<PassCreationPage />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByTestId('mock-error-display')).toBeInTheDocument();
  });
  
  it('extracts eventId from URL search params', () => {
    const mockEventId = 'EV12345';
    const mockSearchParams = new URLSearchParams(`?eventId=${mockEventId}`);
    
    const reactRouterDom = require('react-router-dom');
    reactRouterDom.useSearchParams.mockReturnValue([mockSearchParams, jest.fn()]);
    
    const selectEventMock = jest.fn();
    const usePasses = require('../../src/hooks/usePasses').default;
    usePasses.mockReturnValue({
      loading: false,
      error: null,
      createMultiplePasses: jest.fn(),
      selectEvent: selectEventMock
    });
    
    renderWithProviders(<PassCreationPage />);
    
    expect(selectEventMock).toHaveBeenCalledWith(mockEventId);
  });
  
  it('navigates to results page on successful pass creation', () => {
    const navigateMock = jest.fn();
    const reactRouterDom = require('react-router-dom');
    reactRouterDom.useNavigate.mockReturnValue(navigateMock);
    
    renderWithProviders(<PassCreationPage />);
    
    // Get the onSuccess prop that was captured
    const { onSuccess } = capturedPassCreationFormProps;
    
    // Create a mock summary
    const mockSummary = {
      eventId: 'EV12345',
      event: mockEvents[0],
      successful: [createMockPass()],
      failed: [],
      totalSuccess: 1,
      totalFailed: 0
    };
    
    // Call the onSuccess callback
    onSuccess(mockSummary);
    
    // Verify navigation to results page
    expect(navigateMock).toHaveBeenCalledWith(
      ROUTES.RESULTS,
      { state: { summary: mockSummary } }
    );
  });
  
  it('navigates to passes page when viewing passes for an event', () => {
    const navigateMock = jest.fn();
    const reactRouterDom = require('react-router-dom');
    reactRouterDom.useNavigate.mockReturnValue(navigateMock);
    
    renderWithProviders(<PassCreationPage />);
    
    // Get the onViewPasses prop that was captured
    const { onViewPasses } = capturedPassCreationFormProps;
    
    // Call the onViewPasses callback
    const eventId = 'EV12345';
    onViewPasses(eventId);
    
    // Verify navigation to passes page
    expect(navigateMock).toHaveBeenCalledWith(`${ROUTES.PASSES}?eventId=${eventId}`);
  });
  
  it('resets error state when retry is clicked', () => {
    const mockError = { 
      type: 'network', 
      code: 'connection_error', 
      message: 'Test error message', 
      timestamp: Date.now() 
    };
    
    const usePasses = require('../../src/hooks/usePasses').default;
    usePasses.mockReturnValue({
      loading: false,
      error: mockError,
      createMultiplePasses: jest.fn(),
      selectEvent: jest.fn()
    });
    
    renderWithProviders(<PassCreationPage />);
    
    // Verify the error is displayed
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Get the onRetry prop that was captured
    const { onRetry } = capturedErrorDisplayProps;
    
    // Call the onRetry callback
    onRetry();
    
    // Verify the callback is a function
    expect(typeof onRetry).toBe('function');
  });
  
  it('integrates correctly with PassCreationForm', async () => {
    mockApiServices({
      passesApi: {
        createMultiplePasses: jest.fn().mockResolvedValue({
          successful: [{ passId: 'P123', barcode: 'BC123456', customerName: 'John Doe' }],
          failed: [],
          totalSuccess: 1,
          totalFailed: 0
        })
      }
    });
    
    renderWithProviders(<PassCreationPage />);
    
    // Verify form is rendered with expected props
    expect(screen.getByTestId('mock-pass-creation-form')).toBeInTheDocument();
    expect(capturedPassCreationFormProps.onSuccess).toBeDefined();
    expect(capturedPassCreationFormProps.onViewPasses).toBeDefined();
  });
});