import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'; // ^6.14.0
import { Box, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Layout from '../components/layout/Layout';
import PassCreationForm from '../components/forms/PassCreationForm';
import ErrorDisplay from '../components/feedback/ErrorDisplay';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import usePasses from '../hooks/usePasses';
import useErrorHandler from '../hooks/useErrorHandler';
import { PassCreationSummary } from '../types/pass.types';
import { AppError } from '../types/error.types';
import { ROUTES } from '../constants/routes';

// Styled component for the page container
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

// Styled component for the content container
const ContentPaper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px', 
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
}));

// Styled component for the page title
const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.primary.main,
}));

/**
 * Main component for the Pass Creation page that allows creating multiple parking passes
 * 
 * @returns The rendered Pass Creation page component
 */
const PassCreationPage: React.FC = () => {
  // Initialize navigation with useNavigate hook
  const navigate = useNavigate();
  // Get location and search params with useLocation and useSearchParams hooks
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Extract eventId from search parameters if available
  const eventIdFromUrl = searchParams.get('eventId') || '';
  
  // Initialize error handling state
  const [error, setError] = useState<AppError | null>(null);
  
  // Initialize usePasses hook for pass management functionality
  const { loading, error: passesError } = usePasses();
  
  // Initialize error handler with useErrorHandler
  const { handleError } = useErrorHandler();
  
  // Handle API errors from usePasses hook
  useEffect(() => {
    if (passesError) {
      setError(passesError);
      handleError(passesError);
    }
  }, [passesError, handleError]);
  
  /**
   * Handles successful pass creation by navigating to the results page
   * @param summary The creation summary containing results information
   */
  const handleSuccess = (summary: PassCreationSummary) => {
    navigate(ROUTES.RESULTS, { state: { summary } });
  };
  
  /**
   * Handles navigation to the passes page for a specific event
   * @param eventId The ID of the event to view passes for
   */
  const handleViewPasses = (eventId: string) => {
    navigate(`${ROUTES.PASSES}?eventId=${eventId}`);
  };
  
  /**
   * Handles retry after an error occurs
   */
  const handleRetry = () => {
    setError(null);
  };
  
  return (
    <Layout>
      <PageContainer>
        <PageTitle variant="h4">Create Parking Passes</PageTitle>
        <ContentPaper>
          {loading && <LoadingSpinner />}
          
          {error && (
            <ErrorDisplay
              error={error}
              onRetry={handleRetry}
            />
          )}
          
          <PassCreationForm
            initialEventId={eventIdFromUrl}
            onSuccess={handleSuccess}
            onViewPasses={handleViewPasses}
          />
        </ContentPaper>
      </PageContainer>
    </Layout>
  );
};

export default PassCreationPage;