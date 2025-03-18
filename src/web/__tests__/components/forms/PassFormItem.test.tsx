import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import PassFormItem from '../../../src/components/forms/PassFormItem';
import { PASS_CREATION_FIELDS } from '../../../src/constants/formFields';
import { renderWithProviders } from '../../../src/utils/testing';

describe('PassFormItem Component', () => {
  const mockProps = {
    index: 0,
    eventId: 'EV12345',
    formData: {
      eventId: 'EV12345',
      accountId: 'ABC123',
      barcode: 'BC100001',
      customerName: 'John Smith',
      spotType: 'REGULAR',
      lotId: 'LOT-A'
    },
    formState: {
      accountId: { value: 'ABC123', touched: false, error: null },
      barcode: { value: 'BC100001', touched: false, error: null },
      customerName: { value: 'John Smith', touched: false, error: null },
      spotType: { value: 'REGULAR', touched: false, error: null },
      lotId: { value: 'LOT-A', touched: false, error: null }
    },
    onChange: jest.fn(),
    onBlur: jest.fn(),
    onRemove: jest.fn()
  };

  it('renders correctly with all required fields', () => {
    renderWithProviders(<PassFormItem {...mockProps} />);
    
    // Check that the component has the expected test ID
    const formItem = screen.getByTestId('pass-form-item-0');
    expect(formItem).toBeInTheDocument();
    
    // Check that the card title displays the correct pass number
    expect(screen.getByText('PASS #1')).toBeInTheDocument();
    
    // Check that all form fields from PASS_CREATION_FIELDS are rendered except eventId
    PASS_CREATION_FIELDS.forEach(field => {
      if (field.name !== 'eventId') {
        // Check for the field container using data-testid
        const fieldContainer = screen.getByTestId(`field-container-${field.name}`);
        expect(fieldContainer).toBeInTheDocument();
        
        // For text inputs, check that they have the correct value
        if (field.name !== 'spotType') {
          const input = screen.getByTestId(`input-${field.name}`);
          expect(input).toHaveValue(mockProps.formData[field.name]);
        }
      }
    });
    
    // Check that the remove button is rendered
    expect(screen.getByTestId('remove-pass-button-0')).toBeInTheDocument();
  });

  it('handles field change events', () => {
    renderWithProviders(<PassFormItem {...mockProps} />);
    
    // Find the account ID input field
    const accountIdInput = screen.getByTestId('input-accountId');
    
    // Simulate a change event
    fireEvent.change(accountIdInput, { target: { value: 'XYZ789' } });
    
    // Check that onChange was called with the correct parameters
    expect(mockProps.onChange).toHaveBeenCalledWith(0, 'accountId', 'XYZ789');
    
    // Reset mock
    mockProps.onChange.mockClear();
    
    // Test another field
    const barcodeInput = screen.getByTestId('input-barcode');
    fireEvent.change(barcodeInput, { target: { value: 'BC200001' } });
    
    // Check that onChange was called with the correct parameters
    expect(mockProps.onChange).toHaveBeenCalledWith(0, 'barcode', 'BC200001');
  });

  it('handles field blur events', () => {
    renderWithProviders(<PassFormItem {...mockProps} />);
    
    // Find the account ID input field
    const accountIdInput = screen.getByTestId('input-accountId');
    
    // Simulate a blur event
    fireEvent.blur(accountIdInput);
    
    // Check that onBlur was called with the correct parameters
    expect(mockProps.onBlur).toHaveBeenCalledWith(0, 'accountId');
    
    // Reset mock
    mockProps.onBlur.mockClear();
    
    // Test another field
    const barcodeInput = screen.getByTestId('input-barcode');
    fireEvent.blur(barcodeInput);
    
    // Check that onBlur was called with the correct parameters
    expect(mockProps.onBlur).toHaveBeenCalledWith(0, 'barcode');
  });

  it('displays validation errors when present', () => {
    // Create a copy of mockProps with validation errors
    const propsWithErrors = {
      ...mockProps,
      formState: {
        ...mockProps.formState,
        accountId: { value: 'ABC123', touched: true, error: 'Invalid account ID' },
        barcode: { value: 'BC100001', touched: true, error: 'Barcode already exists' }
      }
    };
    
    renderWithProviders(<PassFormItem {...propsWithErrors} />);
    
    // Check that error messages are displayed
    expect(screen.getByText('Invalid account ID')).toBeInTheDocument();
    expect(screen.getByText('Barcode already exists')).toBeInTheDocument();
    
    // Check that fields without errors don't show error messages
    expect(screen.queryByText('Invalid customer name')).not.toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    renderWithProviders(<PassFormItem {...mockProps} />);
    
    // Find the remove button
    const removeButton = screen.getByTestId('remove-pass-button-0');
    
    // Simulate a click event
    fireEvent.click(removeButton);
    
    // Check that onRemove was called
    expect(mockProps.onRemove).toHaveBeenCalledTimes(1);
    
    // Check that no other handlers were called
    expect(mockProps.onChange).not.toHaveBeenCalled();
    expect(mockProps.onBlur).not.toHaveBeenCalled();
  });

  it('renders with responsive grid layout', () => {
    const { container } = renderWithProviders(<PassFormItem {...mockProps} />);
    
    // Check that the component has the expected test ID
    const formItem = screen.getByTestId('pass-form-item-0');
    expect(formItem).toBeInTheDocument();
    
    // Check that Grid container is used
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
    
    // Check that Grid items have appropriate spacing
    expect(gridContainer).toHaveClass('MuiGrid-spacing-xs-2');
    
    // Check that all form fields are rendered in grid items
    PASS_CREATION_FIELDS.forEach(field => {
      if (field.name !== 'eventId') {
        const fieldContainer = screen.getByTestId(`field-container-${field.name}`);
        expect(fieldContainer).toBeInTheDocument();
        
        // Verify field container is within a grid item
        const gridItem = fieldContainer.closest('.MuiGrid-item');
        expect(gridItem).toBeInTheDocument();
        
        // Check that grid items have responsive classes (xs, sm, md)
        expect(gridItem).toHaveClass('MuiGrid-grid-xs-12');
        
        // Customer name should be full width on sm screens
        if (field.name === 'customerName') {
          expect(gridItem).toHaveClass('MuiGrid-grid-sm-12');
        } else {
          // Other fields should be half width on sm screens
          expect(gridItem).toHaveClass('MuiGrid-grid-sm-6');
        }
      }
    });
  });
});