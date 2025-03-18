import React, { useState } from 'react'; // ^18.2.0
import { Navigate, useLocation } from 'react-router-dom'; // ^6.x
import { CircularProgress, Box } from '@mui/material'; // ^5.14.0
import { useApiKeyContext } from '../context/ApiKeyContext';
import ApiKeyPrompt from '../components/feedback/ApiKeyPrompt';
import { ROUTES } from '../constants/routes';

/**
 * Props for the PrivateRoute component
 */
interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Higher-order component that protects routes requiring API key authentication
 * Checks for the presence of a valid API key and either renders the protected
 * component or redirects to an authentication flow.
 * 
 * @param props The component props
 * @returns The protected component or authentication flow
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Get API key state and functions from context
  const { apiKey, loading, setShowApiKeyPrompt } = useApiKeyContext();
  
  // Get current location for potential redirect after authentication
  const location = useLocation();

  // If API key is being loaded, show a loading spinner
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If API key exists, render the protected route children
  if (apiKey) {
    return <>{children}</>;
  }

  // If no API key is available, show the API key prompt modal
  // and render nothing until authentication is complete
  setShowApiKeyPrompt(true);
  
  // Render the ApiKeyPrompt component with onSuccess callback
  // When API key is successfully provided, the component will re-render
  // and return the protected children components
  return (
    <ApiKeyPrompt
      isOpen={true}
      onClose={() => {
        setShowApiKeyPrompt(false);
        // Redirect to events page if user cancels
        return <Navigate to={ROUTES.EVENTS} state={{ from: location }} replace />;
      }}
      onSuccess={() => {
        // On successful API key entry, the apiKey state will update
        // and the component will re-render and show children
      }}
      errorMessage=""
    />
  );
};

export default PrivateRoute;