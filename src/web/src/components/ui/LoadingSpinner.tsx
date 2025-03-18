import React from 'react'; // v18.2.0
import { CircularProgress, Box } from '@mui/material'; // v5.14.0
import { styled, useTheme } from '@mui/material/styles'; // v5.14.0

/**
 * Props interface for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /**
   * The size of the spinner in pixels
   * @default 40
   */
  size?: number;
  
  /**
   * The color of the spinner using Material UI's color palette
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
  
  /**
   * Whether the spinner should be displayed as an overlay on top of other content
   * @default false
   */
  overlay?: boolean;
  
  /**
   * Whether the spinner should take up the full page (100vh height)
   * @default false
   */
  fullPage?: boolean;
  
  /**
   * Additional CSS class name for custom styling
   */
  className?: string;
}

/**
 * Styled container for the loading spinner that adapts based on overlay and fullPage props
 */
const SpinnerContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'overlay' && prop !== 'fullPage',
})<{ overlay?: boolean; fullPage?: boolean }>(({ theme, overlay, fullPage }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  width: '100%',
  height: fullPage ? '100vh' : 'auto',
  position: overlay ? 'absolute' : 'relative',
  top: overlay ? 0 : 'auto',
  left: overlay ? 0 : 'auto',
  zIndex: overlay ? 1000 : 'auto',
  backgroundColor: overlay ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
}));

/**
 * A reusable loading spinner component that displays a circular progress indicator
 * to show loading states throughout the application.
 * 
 * @example
 * // Basic usage
 * <LoadingSpinner />
 * 
 * @example
 * // As an overlay
 * <LoadingSpinner overlay size={60} color="secondary" />
 * 
 * @example
 * // Full page loading
 * <LoadingSpinner fullPage />
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = 'primary',
  overlay = false,
  fullPage = false,
  className,
}) => {
  // Access the theme using useTheme hook
  const theme = useTheme();
  
  return (
    <SpinnerContainer 
      overlay={overlay} 
      fullPage={fullPage}
      className={className}
      data-testid="loading-spinner"
    >
      <CircularProgress 
        size={size} 
        color={color} 
        aria-label="Loading content"
      />
    </SpinnerContainer>
  );
};

export default LoadingSpinner;