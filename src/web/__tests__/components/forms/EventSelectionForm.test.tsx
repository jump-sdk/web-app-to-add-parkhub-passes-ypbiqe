import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import EventSelectionForm from '../../../src/components/forms/EventSelectionForm';
import { renderWithProviders } from '../../../src/utils/testing';
import { VALIDATION_PATTERNS } from '../../../src/constants/validation';

describe('EventSelectionForm', () => {
  it('renders correctly with default props', async () => {
    renderWithProviders(<EventSelectionForm onSubmit={() => {}} />);
    
    // Check that the input field is present
    const input = screen.getByLabelText('Event ID');
    expect(input).toBeInTheDocument();
    
    // Check that the submit button is present
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    
    // Check default label is displayed
    expect(screen.getByText('Event ID')).toBeInTheDocument();
  });
  
  it('renders with custom label', async () => {
    renderWithProviders(<EventSelectionForm onSubmit={() => {}} label="Custom Label" />);
    
    // Check that the custom label is used
    const input = screen.getByLabelText('Custom Label');
    expect(input).toBeInTheDocument();
  });
  
  it('renders with initial event ID', async () => {
    const initialEventId = 'EV12345';
    renderWithProviders(<EventSelectionForm onSubmit={() => {}} initialEventId={initialEventId} />);
    
    // Check that the input has the initial value
    const input = screen.getByLabelText('Event ID');
    expect(input).toHaveValue(initialEventId);
  });
  
  it('validates event ID format', async () => {
    const { user } = renderWithProviders(<EventSelectionForm onSubmit={() => {}} />);
    
    // Get the input field
    const input = screen.getByLabelText('Event ID');
    
    // Type an invalid event ID (doesn't match EVENT_ID regex pattern)
    await user.type(input, 'invalid');
    
    // Trigger blur event to validate
    input.blur();
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Event ID must be in the format EV##### \(where # is a digit\)/i)).toBeInTheDocument();
    });
    
    // Check that submit button is disabled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });
  
  it('allows submission with valid event ID', async () => {
    const onSubmit = jest.fn();
    const { user } = renderWithProviders(<EventSelectionForm onSubmit={onSubmit} />);
    
    // Get the input field
    const input = screen.getByLabelText('Event ID');
    
    // Type a valid event ID matching EVENT_ID regex pattern
    await user.type(input, 'EV12345');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Check that onSubmit was called with the event ID
    expect(onSubmit).toHaveBeenCalledWith('EV12345');
  });
  
  it('prevents submission with invalid event ID', async () => {
    const onSubmit = jest.fn();
    const { user } = renderWithProviders(<EventSelectionForm onSubmit={onSubmit} />);
    
    // Get the input field
    const input = screen.getByLabelText('Event ID');
    
    // Type an invalid event ID
    await user.type(input, 'invalid');
    
    // Trigger blur event to validate
    input.blur();
    
    // Check that submit button is disabled
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
    
    // Verify onSubmit was not called
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('shows loading state when loading prop is true', async () => {
    renderWithProviders(<EventSelectionForm onSubmit={() => {}} loading={true} />);
    
    // Check that the loading spinner is present
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Check that the submit button is disabled during loading
    const submitButton = screen.getByTestId('custom-button');
    expect(submitButton).toBeDisabled();
  });
  
  it('updates when initialEventId prop changes', async () => {
    const { rerender } = renderWithProviders(
      <EventSelectionForm onSubmit={() => {}} initialEventId="EV12345" />
    );
    
    // Check initial value
    let input = screen.getByLabelText('Event ID');
    expect(input).toHaveValue('EV12345');
    
    // Rerender with a different initialEventId
    rerender(
      <EventSelectionForm onSubmit={() => {}} initialEventId="EV67890" />
    );
    
    // Check that input field updates to show the new event ID
    input = screen.getByLabelText('Event ID');
    expect(input).toHaveValue('EV67890');
  });
});