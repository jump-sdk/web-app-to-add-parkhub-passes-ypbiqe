import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import Input from '../../../src/components/ui/Input';
import { renderWithProviders } from '../../../src/utils/testing';

describe('Input Component', () => {
  // Common props used across tests
  const commonProps = {
    name: 'testInput',
    label: 'Test Input',
    type: 'text' as const,
    value: '',
    onChange: jest.fn(),
    onBlur: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    renderWithProviders(<Input {...commonProps} />);
    
    const input = screen.getByTestId('input-testInput');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });
  
  it('renders with different input types', () => {
    const inputTypes = ['text', 'number', 'password', 'email', 'date'] as const;
    
    inputTypes.forEach(type => {
      const { unmount } = renderWithProviders(
        <Input 
          {...commonProps}
          name={`${type}Input`}
          type={type}
        />
      );
      
      expect(screen.getByTestId(`input-${type}Input`)).toHaveAttribute('type', type);
      unmount();
    });
  });
  
  it('renders with label and placeholder', () => {
    renderWithProviders(
      <Input
        {...commonProps}
        label="Test Label"
        placeholder="Test Placeholder"
      />
    );
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test Placeholder')).toBeInTheDocument();
  });
  
  it('applies custom className', () => {
    renderWithProviders(
      <Input
        {...commonProps}
        className="custom-class"
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    const container = input.closest('.MuiTextField-root');
    expect(container).toHaveClass('custom-class');
  });
  
  it('renders with fullWidth prop', () => {
    // Test with fullWidth=true (default)
    const { unmount } = renderWithProviders(<Input {...commonProps} />);
    
    let container = screen.getByTestId('input-testInput').closest('.MuiTextField-root');
    expect(container).toHaveClass('MuiFormControl-fullWidth');
    
    unmount();
    
    // Test with fullWidth=false
    renderWithProviders(<Input {...commonProps} fullWidth={false} />);
    
    container = screen.getByTestId('input-testInput').closest('.MuiTextField-root');
    expect(container).not.toHaveClass('MuiFormControl-fullWidth');
  });
  
  it('handles change events', async () => {
    const handleChange = jest.fn();
    
    const { user } = renderWithProviders(
      <Input
        {...commonProps}
        onChange={handleChange}
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    await user.type(input, 'test value');
    
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenLastCalledWith('testInput', 'test value');
  });
  
  it('handles blur events', async () => {
    const handleBlur = jest.fn();
    
    const { user } = renderWithProviders(
      <Input
        {...commonProps}
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    await user.click(input);
    await user.tab(); // Move focus away from input
    
    expect(handleBlur).toHaveBeenCalledWith('testInput');
  });
  
  it('does not trigger change when disabled', async () => {
    const handleChange = jest.fn();
    
    const { user } = renderWithProviders(
      <Input
        {...commonProps}
        onChange={handleChange}
        disabled={true}
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    expect(input).toBeDisabled();
    
    await user.type(input, 'test value');
    expect(handleChange).not.toHaveBeenCalled();
  });
  
  it('does not trigger blur when disabled', async () => {
    const handleBlur = jest.fn();
    
    const { user } = renderWithProviders(
      <Input
        {...commonProps}
        onBlur={handleBlur}
        disabled={true}
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    await user.click(input);
    await user.tab();
    
    expect(handleBlur).not.toHaveBeenCalled();
  });
  
  it('displays error state correctly', () => {
    renderWithProviders(
      <Input
        {...commonProps}
        error="Error message"
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Error message')).toBeInTheDocument();
    
    // Verify error styling is applied
    const fieldContainer = input.closest('div.MuiOutlinedInput-root');
    expect(fieldContainer).toHaveClass('Mui-error');
  });
  
  it('renders with start and end adornments', () => {
    renderWithProviders(
      <Input
        {...commonProps}
        startAdornment={<div data-testid="start-adornment">$</div>}
        endAdornment={<div data-testid="end-adornment">%</div>}
      />
    );
    
    const startAdornment = screen.getByTestId('start-adornment');
    const endAdornment = screen.getByTestId('end-adornment');
    
    expect(startAdornment).toBeInTheDocument();
    expect(endAdornment).toBeInTheDocument();
    
    expect(startAdornment).toHaveTextContent('$');
    expect(endAdornment).toHaveTextContent('%');
    
    expect(startAdornment.closest('.MuiInputAdornment-root')).toHaveClass('MuiInputAdornment-positionStart');
    expect(endAdornment.closest('.MuiInputAdornment-root')).toHaveClass('MuiInputAdornment-positionEnd');
  });
  
  it('has correct ARIA attributes', () => {
    renderWithProviders(
      <Input
        {...commonProps}
        required={true}
        error="Error message"
      />
    );
    
    const input = screen.getByTestId('input-testInput');
    
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-label', 'Test Input');
  });
});