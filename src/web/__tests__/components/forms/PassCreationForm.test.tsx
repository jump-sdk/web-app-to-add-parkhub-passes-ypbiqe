import React from 'react';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, jest } from '@jest/globals';

import PassCreationForm from '../../../src/components/forms/PassCreationForm';
import { renderWithProviders, mockApiKey } from '../../../src/utils/testing';
import { mockEvents, createMockEvent } from '../../__mocks__/eventsMock';
import { mockPasses, createMockPass } from '../../__mocks__/passesMock';
import { handlers } from '../../__mocks__/handlers';

// Set up MSW server
const server = setupServer(...handlers);

beforeAll(() => {
  mockApiKey('test-api-key');
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Helper function to render the PassCreationForm with default props
const renderPassCreationForm = (props = {}) => {
  const defaultProps = {
    initialEventId: '',
    onSuccess: jest.fn(),
    onViewPasses: jest.fn(),
  };
  
  const mergedProps = { ...defaultProps, ...props };
  const result = renderWithProviders(
    <PassCreationForm {...mergedProps} />
  );
  
  return {
    ...result,
    user: userEvent.setup(),
  };
};

describe('PassCreationForm', () => {
  it('renders the event selection form initially', () => {
    renderPassCreationForm();
    
    // Check that the event selection form is displayed
    expect(screen.getByTestId('event-selection-form')).toBeInTheDocument();
    
    // Check that the pass creation form is not yet displayed
    expect(screen.queryByTestId('pass-creation-form')).not.toBeInTheDocument();
  });

  it('allows selecting an event and displays the pass form', async () => {
    const { user } = renderPassCreationForm();
    
    // Enter an event ID
    await user.type(
      screen.getByTestId('input-eventId'), 
      mockEvents[0].id
    );
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Check that the event details are displayed
    expect(screen.getByText(RegExp(mockEvents[0].name, 'i'))).toBeInTheDocument();
  });

  it('allows adding multiple pass forms', async () => {
    const { user } = renderPassCreationForm({ initialEventId: mockEvents[0].id });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Click the Add Pass button twice
    await user.click(screen.getByTestId('add-pass-button'));
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Check that two pass forms are displayed
    const passForms = screen.getAllByTestId(/pass-form-item-\d+/);
    expect(passForms).toHaveLength(2);
  });

  it('allows removing pass forms', async () => {
    const { user } = renderPassCreationForm({ initialEventId: mockEvents[0].id });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add multiple pass forms
    await user.click(screen.getByTestId('add-pass-button'));
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Verify that two forms exist
    let passForms = screen.getAllByTestId(/pass-form-item-\d+/);
    expect(passForms).toHaveLength(2);
    
    // Remove a pass form
    await user.click(screen.getAllByRole('button', { name: /remove/i })[0]);
    
    // Verify that only one form remains
    passForms = screen.getAllByTestId(/pass-form-item-\d+/);
    expect(passForms).toHaveLength(1);
  });

  it('validates form fields before submission', async () => {
    const onSuccessMock = jest.fn();
    const { user } = renderPassCreationForm({ 
      initialEventId: mockEvents[0].id,
      onSuccess: onSuccessMock
    });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add a pass form
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Fill in only some fields (leaving others empty)
    await user.type(screen.getByTestId('input-accountId'), 'ABC123');
    await user.type(screen.getByTestId('input-customerName'), 'Test Customer');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Check for validation errors
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/required|invalid/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
    
    // Verify the form was not submitted
    expect(onSuccessMock).not.toHaveBeenCalled();
  });

  it('submits valid forms and displays results', async () => {
    const onSuccessMock = jest.fn();
    const { user } = renderPassCreationForm({ 
      initialEventId: mockEvents[0].id,
      onSuccess: onSuccessMock
    });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add a pass form
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Fill in all required fields with valid data
    await user.type(screen.getByTestId('input-accountId'), 'ABC123');
    await user.type(screen.getByTestId('input-barcode'), 'BC100099');
    await user.type(screen.getByTestId('input-customerName'), 'Test Customer');
    
    // For select field, we need to interact with it properly
    const spotTypeSelect = screen.getByLabelText(/spot type/i);
    await user.click(spotTypeSelect);
    const regularOption = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption);
    
    await user.type(screen.getByTestId('input-lotId'), 'LOT-A');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Wait for loading state during submission
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    
    // Wait for results to be displayed
    await waitFor(() => {
      const successMessage = screen.queryByText(/success|created/i);
      expect(successMessage).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify the onSuccess callback was called
    expect(onSuccessMock).toHaveBeenCalled();
  });

  it('handles API errors during submission', async () => {
    // Override the MSW handler to return an error
    server.use(
      rest.post('*/passes', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            success: false,
            error: {
              code: 'SERVER_ERROR',
              message: 'Server error occurred during pass creation'
            }
          })
        );
      })
    );
    
    const { user } = renderPassCreationForm({ initialEventId: mockEvents[0].id });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add a pass form
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Fill in all required fields
    await user.type(screen.getByTestId('input-accountId'), 'ABC123');
    await user.type(screen.getByTestId('input-barcode'), 'BC100099');
    await user.type(screen.getByTestId('input-customerName'), 'Test Customer');
    
    const spotTypeSelect = screen.getByLabelText(/spot type/i);
    await user.click(spotTypeSelect);
    const regularOption = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption);
    
    await user.type(screen.getByTestId('input-lotId'), 'LOT-A');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('api-error')).toBeInTheDocument();
    });
    
    // Verify that the form is still displayed for correction
    expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
  });

  it('allows creating more passes after successful submission', async () => {
    const { user } = renderPassCreationForm({ initialEventId: mockEvents[0].id });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add a pass form
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Fill in all required fields
    await user.type(screen.getByTestId('input-accountId'), 'ABC123');
    await user.type(screen.getByTestId('input-barcode'), 'BC100099');
    await user.type(screen.getByTestId('input-customerName'), 'Test Customer');
    
    const spotTypeSelect = screen.getByLabelText(/spot type/i);
    await user.click(spotTypeSelect);
    const regularOption = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption);
    
    await user.type(screen.getByTestId('input-lotId'), 'LOT-A');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Wait for the results to be displayed
    await waitFor(() => {
      const createMoreButton = screen.queryByRole('button', { name: /create more passes/i });
      expect(createMoreButton).toBeInTheDocument();
    });
    
    // Click the "Create More Passes" button
    await user.click(screen.getByRole('button', { name: /create more passes/i }));
    
    // Verify that a new empty form is displayed
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Verify that the same event is selected
    expect(screen.getByText(RegExp(mockEvents[0].name, 'i'))).toBeInTheDocument();
  });

  it('allows viewing all passes for the event after submission', async () => {
    const mockViewPassesCallback = jest.fn();
    const { user } = renderPassCreationForm({
      initialEventId: mockEvents[0].id,
      onViewPasses: mockViewPassesCallback
    });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add a pass form
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Fill in all required fields
    await user.type(screen.getByTestId('input-accountId'), 'ABC123');
    await user.type(screen.getByTestId('input-barcode'), 'BC100099');
    await user.type(screen.getByTestId('input-customerName'), 'Test Customer');
    
    const spotTypeSelect = screen.getByLabelText(/spot type/i);
    await user.click(spotTypeSelect);
    const regularOption = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption);
    
    await user.type(screen.getByTestId('input-lotId'), 'LOT-A');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Wait for the results to be displayed
    await waitFor(() => {
      const viewAllButton = screen.queryByRole('button', { name: /view all passes/i });
      expect(viewAllButton).toBeInTheDocument();
    });
    
    // Click the "View All Passes" button
    await user.click(screen.getByRole('button', { name: /view all passes/i }));
    
    // Verify that the onViewPasses callback was called with the correct event ID
    expect(mockViewPassesCallback).toHaveBeenCalledWith(mockEvents[0].id);
  });

  it('handles partial success in batch creation', async () => {
    // Override the MSW handler to return a partial success response
    server.use(
      rest.post('*/passes', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            success: true,
            data: {
              successful: [
                { passId: 'P98768', barcode: 'BC100004', customerName: 'Customer 1' }
              ],
              failed: [
                { 
                  barcode: 'BC100005', 
                  customerName: 'Customer 2',
                  error: {
                    code: 'DUPLICATE',
                    message: 'Barcode already exists',
                    field: 'barcode'
                  }
                }
              ],
              totalSuccess: 1,
              totalFailed: 1
            }
          })
        );
      })
    );
    
    const { user } = renderPassCreationForm({ initialEventId: mockEvents[0].id });
    
    // Wait for the pass creation form to appear
    await waitFor(() => {
      expect(screen.getByTestId('pass-creation-form')).toBeInTheDocument();
    });
    
    // Add two pass forms
    await user.click(screen.getByTestId('add-pass-button'));
    await user.click(screen.getByTestId('add-pass-button'));
    
    // Get the forms
    const forms = screen.getAllByTestId(/pass-form-item-\d+/);
    
    // Fill first form
    await user.type(within(forms[0]).getByTestId('input-accountId'), 'ABC123');
    await user.type(within(forms[0]).getByTestId('input-barcode'), 'BC100004');
    await user.type(within(forms[0]).getByTestId('input-customerName'), 'Customer 1');
    
    const spotTypeSelect1 = within(forms[0]).getByLabelText(/spot type/i);
    await user.click(spotTypeSelect1);
    const regularOption1 = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption1);
    
    await user.type(within(forms[0]).getByTestId('input-lotId'), 'LOT-A');
    
    // Fill second form
    await user.type(within(forms[1]).getByTestId('input-accountId'), 'ABC123');
    await user.type(within(forms[1]).getByTestId('input-barcode'), 'BC100005');
    await user.type(within(forms[1]).getByTestId('input-customerName'), 'Customer 2');
    
    const spotTypeSelect2 = within(forms[1]).getByLabelText(/spot type/i);
    await user.click(spotTypeSelect2);
    const regularOption2 = await screen.findByRole('option', { name: /regular/i });
    await user.click(regularOption2);
    
    await user.type(within(forms[1]).getByTestId('input-lotId'), 'LOT-A');
    
    // Submit the forms
    await user.click(screen.getByTestId('submit-batch-button'));
    
    // Wait for results to be displayed
    await waitFor(() => {
      const partialSuccessMessage = screen.queryByText(/1.*success.*1.*failed/i);
      expect(partialSuccessMessage).toBeInTheDocument();
    });
    
    // Check for both successful and failed creations
    expect(screen.getByText(/successful creations/i)).toBeInTheDocument();
    expect(screen.getByText(/failed creations/i)).toBeInTheDocument();
    
    // Verify details of successful and failed passes
    expect(screen.getByText('Customer 1')).toBeInTheDocument();
    expect(screen.getByText('Customer 2')).toBeInTheDocument();
    expect(screen.getByText(/barcode already exists/i)).toBeInTheDocument();
    
    // Verify that retry options are available for failed passes
    expect(screen.getByRole('button', { name: /retry failed/i })).toBeInTheDocument();
  });
});