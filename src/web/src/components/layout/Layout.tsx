import React, { useState, useEffect } from 'react'; // ^18.2.0
import { Box, Container, useTheme, useMediaQuery } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Notification from '../ui/Notification';
import ApiKeyPrompt from '../feedback/ApiKeyPrompt';
import { useApiKeyContext } from '../../context/ApiKeyContext';

/**
 * Interface for layout component props
 */
interface LayoutProps {
  /**
   * Child components to render in the main content area
   */
  children: React.ReactNode;
}

/**
 * Styled container for the main application layout
 */
const MainContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
});

/**
 * Styled container for the content area with responsive padding
 */
const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  paddingTop: 64, // Header height
  transition: theme.transitions.create('padding-left', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: theme.palette.background.default,
  overflow: 'auto',
}));

/**
 * Styled container for the main content with consistent spacing
 */
const MainContent = styled(Container)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.lg,
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/**
 * Main layout component that provides the application's UI structure
 * 
 * This component renders the header, sidebar, content area, footer, and notifications,
 * with responsive design adaptations for different screen sizes. It handles sidebar
 * toggling, API key authentication, and provides a consistent layout across the application.
 * 
 * @param props Component props including children to render in the content area
 * @returns The rendered layout component
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Get theme and check screen size for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Initialize state for sidebar open status (closed by default on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // Initialize state for API key prompt visibility
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  
  // Initialize state for last updated time
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Get API key context to check for authentication errors
  const { apiKey, error: apiKeyError } = useApiKeyContext();
  
  /**
   * Toggle sidebar open/closed
   */
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  /**
   * Handle API key prompt close
   */
  const handleApiKeyPromptClose = () => {
    setShowApiKeyPrompt(false);
  };
  
  /**
   * Handle API key prompt success
   */
  const handleApiKeySuccess = () => {
    setShowApiKeyPrompt(false);
  };
  
  /**
   * Handle data refresh request
   */
  const handleRefresh = () => {
    // Update the last updated timestamp
    setLastUpdated(new Date());
    // In a real implementation, this would also trigger a data refresh
    console.log('Refreshing data...');
  };
  
  // Show API key prompt when authentication errors occur
  useEffect(() => {
    if (apiKeyError) {
      setShowApiKeyPrompt(true);
    }
  }, [apiKeyError]);
  
  // Determine sidebar variant based on screen size
  const sidebarVariant = isMobile ? 'temporary' : 'permanent';
  
  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  return (
    <MainContainer>
      {/* Header with menu toggle */}
      <Header onMenuToggle={handleSidebarToggle} />
      
      {/* Sidebar with appropriate props based on screen size */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        variant={sidebarVariant} 
      />
      
      {/* Main content area with proper spacing for header and sidebar */}
      <ContentContainer
        sx={{
          paddingLeft: {
            xs: 0,
            md: sidebarOpen ? '240px' : 0,
          },
        }}
      >
        <MainContent>
          {children}
        </MainContent>
        
        {/* Footer with status information */}
        <Footer 
          status={apiKeyError ? 'error' : 'normal'}
          lastUpdated={lastUpdated} 
          showRefreshButton={true}
          onRefresh={handleRefresh}
        />
      </ContentContainer>
      
      {/* Notification component for application-wide notifications */}
      <Notification position="bottom-right" />
      
      {/* API key prompt when needed for authentication */}
      <ApiKeyPrompt 
        isOpen={showApiKeyPrompt} 
        onClose={handleApiKeyPromptClose} 
        onSuccess={handleApiKeySuccess}
        errorMessage={apiKeyError?.message || ''}
      />
    </MainContainer>
  );
};

export default Layout;