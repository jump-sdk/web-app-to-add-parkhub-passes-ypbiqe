import React from 'react';
import { screen, waitFor } from '@testing-library/react'; // ^14.0.0
import PassesPage from '../../src/pages/PassesPage';
import { 
  renderWithProviders, 
  mockApiServices, 
  mockApiKey 
} from '../../src/utils/testing';
import { 
  mockPasses, 
  createMockPassResponse 
} from '../__mocks__/passesMock';
import { 
  mockEvents, 
  createMockEventResponse 
} from '../__mocks__/eventsMock';

// Mock the react-router-dom useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

/**
 * Sets up mocks for API services and API key for testing
 */
function setupMocks() {
  // Mock the API key with a valid test key
  mockApiKey('test-api-key');
  
  // Mock the events API to return mock events
  mockApiServices({
    eventsApi: {
      getEvents: jest.fn().mockResolvedValue(createMockEventResponse(mockEvents))
    }
  });
  
  // Mock the passes API to return mock passes when given a valid event ID
  mockApiServices({
    passesApi: {
      getPassesForEvent: jest.fn().mockImplementation(({ eventId }) => {
        const filteredPasses = mockPasses.filter(pass => pass.eventId === eventId);
        return Promise.resolve(createMockPassResponse(filteredPasses));
      })
    }
  });
}

describe('PassesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });
  
  it('renders the page title and description', () => {
    setupMocks();
    renderWithProviders(<PassesPage />);
    
    expect(screen.getByText('Passes')).toBeInTheDocument();
    expect(screen.getByText(/View parking passes for a specific event/i)).toBeInTheDocument();
  });
  
  it('displays the event selection form', () => {
    setupMocks();
    renderWithProviders(<PassesPage />);
    
    expect(screen.getByLabelText(/Event ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });
  
  it('loads and displays passes when an event ID is submitted', async () => {
    setupMocks();
    const { user } = renderWithProviders(<PassesPage />);
    
    // Find the event ID input field and enter a valid event ID
    const input = screen.getByLabelText(/Event ID/i);
    const button = screen.getByRole('button', { name: /Submit/i });
    
    await user.type(input, 'EV12345');
    await user.click(button);
    
    // Wait for the passes to load
    await waitFor(() => {
      expect(screen.getByText('Passes for Event: EV12345')).toBeInTheDocument();
    });
    
    // Verify that pass details are displayed
    expect(screen.getByText('BC100001')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });
  
  it('displays an error message when passes cannot be loaded', async () => {
    // Set up mocks with the passes API returning an error
    mockApiKey('test-api-key');
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockRejectedValue(new Error('Failed to load passes'))
      }
    });
    
    const { user } = renderWithProviders(<PassesPage />);
    
    // Find the event ID input field and enter a valid event ID
    const input = screen.getByLabelText(/Event ID/i);
    const button = screen.getByRole('button', { name: /Submit/i });
    
    await user.type(input, 'EV12345');
    await user.click(button);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      // Look for elements in the error display component
      expect(screen.getByText(/error/i, { exact: false })).toBeInTheDocument();
    });
    
    // Verify that a retry button is displayed
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
  
  it('allows retrying when an error occurs', async () => {
    // Set up mocks with the passes API initially returning an error
    mockApiKey('test-api-key');
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockRejectedValue(new Error('Failed to load passes'))
      }
    });
    
    const { user } = renderWithProviders(<PassesPage />);
    
    // Find the event ID input field and enter a valid event ID
    const input = screen.getByLabelText(/Event ID/i);
    const button = screen.getByRole('button', { name: /Submit/i });
    
    await user.type(input, 'EV12345');
    await user.click(button);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
    
    // Update the mock to return successful data on retry
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockResolvedValue(createMockPassResponse(
          mockPasses.filter(pass => pass.eventId === 'EV12345')
        ))
      }
    });
    
    // Click the retry button
    await user.click(screen.getByRole('button', { name: /Retry/i }));
    
    // Wait for the passes to load
    await waitFor(() => {
      expect(screen.getByText('Passes for Event: EV12345')).toBeInTheDocument();
    });
  });
  
  it('navigates to pass creation when create passes button is clicked', async () => {
    setupMocks();
    const { user } = renderWithProviders(<PassesPage />);
    
    // Find the event ID input field and enter a valid event ID
    const input = screen.getByLabelText(/Event ID/i);
    const button = screen.getByRole('button', { name: /Submit/i });
    
    await user.type(input, 'EV12345');
    await user.click(button);
    
    // Wait for the passes to load
    await waitFor(() => {
      expect(screen.getByText('Passes for Event: EV12345')).toBeInTheDocument();
    });
    
    // Find and click the "Create Passes" button
    await user.click(screen.getByRole('button', { name: /Create New Passes/i }));
    
    // Verify that navigate was called with the correct path including the event ID
    expect(mockNavigate).toHaveBeenCalledWith('/create-passes', { state: { eventId: 'EV12345' } });
  });
  
  it('shows loading state while fetching passes', async () => {
    // Set up mocks with a delayed response
    mockApiKey('test-api-key');
    mockApiServices({
      passesApi: {
        getPassesForEvent: jest.fn().mockImplementation(async ({ eventId }) => {
          await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
          const filteredPasses = mockPasses.filter(pass => pass.eventId === eventId);
          return createMockPassResponse(filteredPasses);
        })
      }
    });
    
    const { user } = renderWithProviders(<PassesPage />);
    
    // Find the event ID input field and enter a valid event ID
    const input = screen.getByLabelText(/Event ID/i);
    const button = screen.getByRole('button', { name: /Submit/i });
    
    await user.type(input, 'EV12345');
    await user.click(button);
    
    // Verify that a loading indicator is displayed
    expect(screen.getByText(/Loading passes/i)).toBeInTheDocument();
    
    // Wait for the passes to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading passes/i)).not.toBeInTheDocument();
      expect(screen.getByText('Passes for Event: EV12345')).toBeInTheDocument();
    });
  });
  
  it('shows empty state when no event is selected', () => {
    setupMocks();
    renderWithProviders(<PassesPage />);
    
    // Verify that an empty state message is displayed
    expect(screen.getByText(/Please enter an event ID to view passes/i)).toBeInTheDocument();
  });
});