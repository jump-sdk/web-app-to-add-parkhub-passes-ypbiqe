import React from 'react';
import { screen } from '@testing-library/react';
import Button from '../../../src/components/ui/Button';
import LoadingSpinner from '../../../src/components/ui/LoadingSpinner';
import { renderWithProviders } from '../../../src/utils/testing';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    renderWithProviders(<Button>Click Me</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
    expect(button).not.toBeDisabled();
  });

  it('renders with different variants', () => {
    const { rerender } = renderWithProviders(
      <Button variant="contained">Contained</Button>
    );
    
    let button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-contained');
    
    rerender(<Button variant="outlined">Outlined</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-outlined');
    
    rerender(<Button variant="text">Text</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-text');
  });

  it('renders with different colors', () => {
    const { rerender } = renderWithProviders(
      <Button color="primary">Primary</Button>
    );
    
    let button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-containedPrimary');
    
    rerender(<Button color="secondary">Secondary</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-containedSecondary');
    
    rerender(<Button color="error">Error</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-containedError');
    
    rerender(<Button color="success">Success</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-containedSuccess');
  });

  it('applies custom className', () => {
    renderWithProviders(<Button className="custom-class">Custom Class</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders with fullWidth prop', () => {
    renderWithProviders(<Button fullWidth>Full Width</Button>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveClass('MuiButton-fullWidth');
  });

  it('renders with startIcon and endIcon', () => {
    const StartIcon = () => <span data-testid="start-icon">Start</span>;
    const EndIcon = () => <span data-testid="end-icon">End</span>;
    
    renderWithProviders(
      <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
        Icon Button
      </Button>
    );
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    expect(screen.getByText('Icon Button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(<Button onClick={handleClick}>Click Me</Button>);
    
    await user.click(screen.getByTestId('custom-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toBeDisabled();
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows loading spinner when loading', () => {
    renderWithProviders(
      <Button loading>Loading Button</Button>
    );
    
    // Check that LoadingSpinner component is rendered
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Text should be hidden but present for maintaining width
    const buttonText = screen.getByText('Loading Button');
    expect(buttonText).toHaveStyle({ visibility: 'hidden' });
  });

  it('does not trigger click when loading', async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(
      <Button onClick={handleClick} loading>
        Loading Button
      </Button>
    );
    
    await user.click(screen.getByTestId('custom-button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    const { rerender } = renderWithProviders(
      <Button loading>Loading Button</Button>
    );
    
    // Test loading state ARIA attributes
    let button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Test disabled state ARIA attributes
    rerender(<Button disabled>Disabled Button</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Test with aria-label
    rerender(<Button aria-label="Custom Label">Button with Label</Button>);
    button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });
});