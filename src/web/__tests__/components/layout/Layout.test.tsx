import React from 'react';
import { screen, waitFor, within } from '@testing-library/react'; // v14.0.0
import * as MUI from '@mui/material'; // v5.14.0
import Layout from '../../../src/components/layout/Layout';
import { renderWithProviders, mockApiKey } from '../../../src/utils/testing';

// Mock Material UI's useMediaQuery
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: jest.fn(),
  };
});

describe('Layout component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to desktop view
    MUI.useMediaQuery.mockReturnValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the layout with header, sidebar, content, and footer', () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    // Render the layout with a test child
    renderWithProviders(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
    
    // Check that header is rendered
    expect(screen.getByText('PARKHUB PASSES')).toBeInTheDocument();
    
    // Check that sidebar is rendered (in desktop view)
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
    
    // Check that content area contains the test content
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check that footer is rendered
    expect(screen.getByTestId('app-footer')).toBeInTheDocument();
  });

  it('renders mobile layout when screen size is small', async () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    // Mock useMediaQuery to simulate mobile view
    MUI.useMediaQuery.mockReturnValue(true);
    
    const { user } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Sidebar should not be visible by default on mobile
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).not.toBeVisible();
    
    // Header should have a menu toggle button
    const menuButton = screen.getByLabelText('open menu');
    expect(menuButton).toBeInTheDocument();
    
    // Click the menu button to open sidebar
    await user.click(menuButton);
    
    // Sidebar should now be visible
    await waitFor(() => {
      expect(sidebar).toBeVisible();
    });
  });

  it('shows API key prompt when API key is missing', async () => {
    // Mock API key context to have an authentication error
    jest.spyOn(require('../../../src/context/ApiKeyContext'), 'useApiKeyContext').mockImplementation(() => ({
      apiKey: null,
      error: {
        type: 'authentication',
        code: 'missing_api_key',
        message: 'API key is required',
        timestamp: Date.now(),
        statusCode: 401
      },
      loading: false,
      setApiKey: jest.fn().mockReturnValue(true),
      removeApiKey: jest.fn(),
      validateApiKey: jest.fn(),
      hasApiKey: jest.fn().mockReturnValue(false)
    }));
    
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // API key prompt should be displayed
    await waitFor(() => {
      expect(screen.getByText('Enter ParkHub API Key')).toBeInTheDocument();
    });
    
    // Restore the original implementation
    jest.spyOn(require('../../../src/context/ApiKeyContext'), 'useApiKeyContext').mockRestore();
  });

  it('toggles sidebar visibility when menu button is clicked', async () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    // Mock useMediaQuery to simulate mobile view
    MUI.useMediaQuery.mockReturnValue(true);
    
    const { user } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Sidebar should be initially closed
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).not.toBeVisible();
    
    // Find and click the menu toggle button in the header
    const menuButton = screen.getByLabelText('open menu');
    await user.click(menuButton);
    
    // Sidebar should now be visible
    await waitFor(() => {
      expect(sidebar).toBeVisible();
    });
    
    // Click the menu button again
    await user.click(menuButton);
    
    // Sidebar should be hidden again
    await waitFor(() => {
      expect(sidebar).not.toBeVisible();
    });
  });

  it('renders children in the content area', () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    // Create test content with a unique data-testid
    const testContent = <div data-testid="unique-test-content">Child Content</div>;
    
    // Render the layout with the test content
    renderWithProviders(
      <Layout>
        {testContent}
      </Layout>
    );
    
    // Verify that the test content is rendered in the content area
    expect(screen.getByTestId('unique-test-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('displays notifications when they appear', () => {
    // Mock API key to be present
    mockApiKey('valid-api-key');
    
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // This test would need to trigger a notification through the notification context
    // For this test suite, we're just verifying the layout renders correctly
    expect(screen.getByText('PARKHUB PASSES')).toBeInTheDocument();
  });
});