import React from 'react'; // v18.2.0
import { Button as MuiButton, ButtonProps } from '@mui/material'; // v5.14.0
import { styled } from '@mui/material/styles'; // v5.14.0
import LoadingSpinner from './LoadingSpinner';

/**
 * Interface extending Material UI ButtonProps with additional properties
 * like loading state and custom styling options.
 */
export interface CustomButtonProps extends Omit<ButtonProps, 'css'> {
  /**
   * Children elements to render inside the button
   */
  children: React.ReactNode;
  
  /**
   * Click handler function
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Button variant
   * @default 'contained'
   */
  variant?: 'contained' | 'outlined' | 'text';
  
  /**
   * Button color
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  
  /**
   * Whether the button should take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Icon to display at the start of the button
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon to display at the end of the button
   */
  endIcon?: React.ReactNode;
}

/**
 * Styled version of Material UI Button with custom styling
 */
export const StyledButton = styled(MuiButton)(({ theme }) => ({
  // Minimum height for touch targets (mobile considerations)
  minHeight: '48px',
  
  // Consistent padding based on theme spacing
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  
  // Border radius from theme variables
  borderRadius: theme.shape.borderRadius,
  
  // Transition effects for hover and focus states
  transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color', 'color']),
  
  // Custom focus visible styling for accessibility
  '&.Mui-focusVisible': {
    boxShadow: `0 0 0 3px ${theme.palette.primary.light}`,
    outline: 'none',
  },
  
  // Disabled state styling with reduced opacity
  '&.Mui-disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  
  // Loading state styling with cursor not-allowed
  '&.loading': {
    cursor: 'not-allowed',
    position: 'relative',
  },
  
  // Ensure proper spacing for icons
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
  
  '& .MuiButton-endIcon': {
    marginLeft: theme.spacing(1),
  },
  
  // Responsive adjustments for different screen sizes
  [theme.breakpoints.down('sm')]: {
    fontSize: theme.typography.body2.fontSize,
    padding: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
  },
}));

/**
 * A customizable button component that extends Material UI's Button with
 * additional features like loading state, consistent styling, and enhanced accessibility.
 * This component is used throughout the application for user interactions and form submissions.
 * 
 * @example
 * // Basic usage
 * <Button onClick={handleClick}>Click Me</Button>
 * 
 * @example
 * // With loading state
 * <Button loading={isLoading} onClick={handleSubmit}>Submit</Button>
 * 
 * @example
 * // Different variants
 * <Button variant="contained" color="primary">Primary</Button>
 * <Button variant="outlined" color="secondary">Secondary</Button>
 * <Button variant="text">Text</Button>
 */
const Button = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  size = 'medium',
  className = '',
  type = 'button',
  startIcon,
  endIcon,
  ...rest
}: CustomButtonProps) => {
  // Create a handler function that prevents click when button is disabled or loading
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    if (onClick) onClick(event);
  };
  
  // Combine classNames for proper styling
  const buttonClassName = `${className} ${loading ? 'loading' : ''}`.trim();
  
  return (
    <StyledButton
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      size={size}
      className={buttonClassName}
      type={type}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      data-testid="custom-button"
      {...rest}
    >
      {/* If loading is true, render LoadingSpinner inside the button */}
      {loading ? (
        <>
          <LoadingSpinner size={24} color="inherit" />
          {/* Keep hidden button text to maintain button width during loading */}
          <span style={{ visibility: 'hidden' }}>{children}</span>
        </>
      ) : (
        /* If loading is false, render the children (button content) */
        children
      )}
    </StyledButton>
  );
};

export default Button;