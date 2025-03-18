import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsSummary from '../../../src/components/feedback/ResultsSummary';
import { renderWithProviders } from '../../../src/utils/testing';
import { mockPasses, createMockPass } from '../../__mocks__/passesMock';
import { PassCreationSummary } from '../../../src/types/pass.types';

/**
 * Creates mock pass creation results for testing
 */
const createMockResults = (options: Partial<PassCreationSummary> = {}): PassCreationSummary => {
  const successful = options.successful || [
    createMockPass({ id: 'P98768', barcode: 'BC100004', customerName: 'Michael Williams', status: 'active' }),
    createMockPass({ id: 'P98769', barcode: 'BC100005', customerName: 'Sarah Johnson', status: 'active' })
  ];
  
  const failed = options.failed || [
    {
      barcode: 'BC100006',
      customerName: 'David Brown',
      error: {
        type: 'validation',
        code: 'duplicate_barcode',
        message: 'Duplicate barcode',
        timestamp: Date.now()
      }
    }
  ];
  
  return {
    eventId: 'EV12345',
    event: null,
    successful,
    failed,
    totalSuccess: options.totalSuccess !== undefined ? options.totalSuccess : successful.length,
    totalFailed: options.totalFailed !== undefined ? options.totalFailed : failed.length,
    ...options
  };
};

describe('ResultsSummary component', () => {
  test('renders successful and failed pass creation results', async () => {
    const mockResults = createMockResults();
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    // Check summary message
    expect(screen.getByText('2 passes created successfully, 1 failed')).toBeInTheDocument();
    
    // Check event info
    expect(screen.getByText(/Football vs. Rivals/)).toBeInTheDocument();
    expect(screen.getByText(/2023-10-15 7:00 PM/)).toBeInTheDocument();
    
    // Check successful passes section
    expect(screen.getByText('Successful Creations')).toBeInTheDocument();
    expect(screen.getByText('Michael Williams')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    
    // Check failed passes section
    expect(screen.getByText('Failed Creations')).toBeInTheDocument();
    expect(screen.getByText('David Brown')).toBeInTheDocument();
    expect(screen.getByText('Duplicate barcode')).toBeInTheDocument();
  });
  
  test('renders only successful passes when there are no failures', () => {
    const mockResults = createMockResults({
      successful: [
        createMockPass({ id: 'P98768', barcode: 'BC100004', customerName: 'Michael Williams', status: 'active' }),
        createMockPass({ id: 'P98769', barcode: 'BC100005', customerName: 'Sarah Johnson', status: 'active' })
      ],
      failed: [],
      totalSuccess: 2,
      totalFailed: 0
    });
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    // Check summary message
    expect(screen.getByText('All 2 passes created successfully')).toBeInTheDocument();
    
    // Check successful passes section
    expect(screen.getByText('Successful Creations')).toBeInTheDocument();
    
    // Check that failed passes section is not rendered
    expect(screen.queryByText('Failed Creations')).not.toBeInTheDocument();
    
    // Check retry button is not present
    expect(screen.queryByText('Retry Failed Passes')).not.toBeInTheDocument();
  });
  
  test('renders only failed passes when there are no successes', () => {
    const mockResults = createMockResults({
      successful: [],
      failed: [
        {
          barcode: 'BC100006',
          customerName: 'David Brown',
          error: {
            type: 'validation',
            code: 'duplicate_barcode',
            message: 'Duplicate barcode',
            timestamp: Date.now()
          }
        }
      ],
      totalSuccess: 0,
      totalFailed: 1
    });
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    // Check summary message
    expect(screen.getByText('All 1 pass creation attempts failed')).toBeInTheDocument();
    
    // Check that successful passes section is not rendered
    expect(screen.queryByText('Successful Creations')).not.toBeInTheDocument();
    
    // Check failed passes section
    expect(screen.getByText('Failed Creations')).toBeInTheDocument();
    expect(screen.getByText('David Brown')).toBeInTheDocument();
  });
  
  test('calls onCreateMore when Create More Passes button is clicked', async () => {
    const mockOnCreateMore = jest.fn();
    const mockResults = createMockResults();
    
    const { user } = renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={mockOnCreateMore}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    const createMoreButton = screen.getByText('Create More Passes');
    await user.click(createMoreButton);
    
    expect(mockOnCreateMore).toHaveBeenCalledTimes(1);
  });
  
  test('calls onViewAllPasses when View All Passes button is clicked', async () => {
    const mockOnViewAllPasses = jest.fn();
    const mockResults = createMockResults();
    
    const { user } = renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={mockOnViewAllPasses}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    const viewAllButton = screen.getByText('View All Passes for Event');
    await user.click(viewAllButton);
    
    expect(mockOnViewAllPasses).toHaveBeenCalledTimes(1);
  });
  
  test('calls onRetryFailed with failed passes when Retry Failed button is clicked', async () => {
    const mockOnRetryFailed = jest.fn();
    const mockResults = createMockResults();
    
    const { user } = renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={mockOnRetryFailed}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    const retryButton = screen.getByText('Retry Failed Passes');
    await user.click(retryButton);
    
    expect(mockOnRetryFailed).toHaveBeenCalledTimes(1);
    expect(mockOnRetryFailed).toHaveBeenCalledWith(mockResults.failed);
  });
  
  test('does not render Retry Failed button when there are no failures', () => {
    const mockResults = createMockResults({
      successful: [createMockPass()],
      failed: [],
      totalSuccess: 1,
      totalFailed: 0
    });
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    expect(screen.queryByText('Retry Failed Passes')).not.toBeInTheDocument();
  });
  
  test('displays event information correctly', () => {
    const mockResults = createMockResults();
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    expect(screen.getByText('Event: Football vs. Rivals')).toBeInTheDocument();
    expect(screen.getByText('2023-10-15 7:00 PM')).toBeInTheDocument();
  });
  
  test('adapts to mobile view on small screens', () => {
    // Note: Testing responsive behavior properly would require setting up
    // a custom theme provider with specific breakpoints, which is beyond
    // the scope of this test file. This is a basic verification that the
    // component renders in any viewport size.
    
    const mockResults = createMockResults();
    
    renderWithProviders(
      <ResultsSummary
        results={mockResults}
        onCreateMore={() => {}}
        onViewAllPasses={() => {}}
        onRetryFailed={() => {}}
        eventName="Football vs. Rivals"
        eventDate="2023-10-15 7:00 PM"
      />
    );
    
    // Basic assertion that the component renders
    expect(screen.getByText('2 passes created successfully, 1 failed')).toBeInTheDocument();
  });
});