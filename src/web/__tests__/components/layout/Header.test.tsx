import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Header from '../../../src/components/layout/Header';
import { ROUTES } from '../../../src/constants/routes';
import { renderWithProviders, mockApiKey } from '../../../src/utils/testing';

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock window.matchMedia for testing responsive design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock function for onMenuToggle prop
const mockOnMenuToggle = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders logo and navigation items', () => {
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Check for logo
    expect(screen.getByText('PARKHUB PASSES')).toBeInTheDocument();
    
    // Check for navigation items
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Events' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Passes' })).toBeInTheDocument();
  });

  it('navigates to correct routes when navigation items are clicked', async () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Click on Dashboard navigation item
    screen.getByRole('button', { name: 'Dashboard' }).click();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
    
    // Click on Events navigation item
    screen.getByRole('button', { name: 'Events' }).click();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EVENTS);
    
    // Click on Passes navigation item
    screen.getByRole('button', { name: 'Passes' }).click();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PASSES);
    
    // Click on Create Passes navigation item
    screen.getByRole('button', { name: 'Create Passes' }).click();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CREATE_PASSES);
  });

  it('shows notification when protected route is clicked without API key', async () => {
    // Mock API key to be null
    mockApiKey('');
    
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Click on Passes navigation item (protected route)
    screen.getByRole('button', { name: 'Passes' }).click();
    
    // Verify notification is shown
    await waitFor(() => {
      expect(screen.getByText('Please add your API key to access this feature')).toBeInTheDocument();
    });
    
    // Verify navigate was not called with the protected route
    expect(mockNavigate).not.toHaveBeenCalledWith(ROUTES.PASSES);
  });

  it('renders mobile menu button on small screens', () => {
    // Mock window.matchMedia to simulate small screen
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('(max-width'),  // This matches mobile breakpoints
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
    
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Verify mobile menu button is shown
    expect(screen.getByLabelText('open menu')).toBeInTheDocument();
    
    // Verify navigation items are not visible
    expect(screen.queryByRole('button', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Events' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Passes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create Passes' })).not.toBeInTheDocument();
  });

  it('calls onMenuToggle when mobile menu button is clicked', () => {
    // Mock window.matchMedia to simulate small screen
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query.includes('(max-width'),  // This matches mobile breakpoints
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }));
    
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Find and click mobile menu button
    screen.getByLabelText('open menu').click();
    
    // Verify mockOnMenuToggle was called
    expect(mockOnMenuToggle).toHaveBeenCalled();
  });

  it('navigates to dashboard when logo is clicked', () => {
    renderWithProviders(<Header onMenuToggle={mockOnMenuToggle} />);
    
    // Find and click logo
    screen.getByRole('button', { name: 'Go to dashboard' }).click();
    
    // Verify navigate was called with DASHBOARD route
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });
});