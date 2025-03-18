import React, { useState } from 'react'; // ^18.2.0
import { useNavigate, useLocation } from 'react-router-dom'; // ^6.14.0
import { Box, Typography } from '@mui/material'; // ^5.14.0
import { styled } from '@mui/material/styles'; // ^5.14.0

import Layout from '../components/layout/Layout';
import ResultsSummary from '../components/feedback/ResultsSummary';
import ErrorDisplay from '../components/feedback/ErrorDisplay';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import usePasses from '../hooks/usePasses';
import useErrorHandler from '../hooks/useErrorHandler';
import { PassCreationSummary, PassFormData } from '../types/pass.types';
import { AppError } from '../types/error.types';
import { formatDate } from '../utils/date-helpers';
import { ROUTES } from '../constants/routes';

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

const ContentPaper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.primary.main,
}));

const NoResultsMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

/**
 * Main component for the Results page that displays pass creation results
 * @returns The rendered Results page component
 */
const ResultsPage = (): JSX.Element => {
  // Initialize navigation with useNavigate hook
  const navigate = useNavigate();
  
  // Get location state with useLocation hook to access creation summary
  const location = useLocation();
  
  // Initialize loading state for API operations
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get creation summary from location state
  const creationSummary = location.state?.creationSummary as PassCreationSummary | undefined;
  
  // Get createMultiplePasses function from usePasses hook
  const { createMultiplePasses } = usePasses();
  
  // Initialize error handler with useErrorHandler
  const { handleError, error, clearError } = useErrorHandler();
  
  // Format event date for display if event exists in summary
  const eventDate = creationSummary?.event 
    ? formatDate(creationSummary.event.date)
    : '';
  
  /**
   * Handles navigation to create more passes for the same event
   */
  const handleCreateMore = () => {
    // Extract eventId from creation summary
    const eventId = creationSummary?.eventId;
    // Navigate to the create passes page with the event ID as a query parameter
    navigate(`${ROUTES.CREATE_PASSES}?eventId=${eventId}`);
  };
  
  /**
   * Handles navigation to view all passes for the event
   */
  const handleViewAllPasses = () => {
    // Extract eventId from creation summary
    const eventId = creationSummary?.eventId;
    // Navigate to the passes page with the event ID as a query parameter
    navigate(`${ROUTES.PASSES}?eventId=${eventId}`);
  };
  
  /**
   * Handles retry of failed pass creations
   * @param failedPasses Array of failed pass creations
   */
  const handleRetryFailed = async (failedPasses: Array<{ barcode: string; customerName: string; error: Error }>) => {
    try {
      // Set loading state to true
      setLoading(true);
      
      // Get reference data from the successful passes (if any exist)
      const referenceData = {
        eventId: creationSummary?.eventId || '',
        accountId: creationSummary?.successful[0]?.accountId || '',
        spotType: creationSummary?.successful[0]?.spotType || 'Regular',
        lotId: creationSummary?.successful[0]?.lotId || '',
      };
      
      // Convert failed passes to PassFormData format
      const passesData: PassFormData[] = failedPasses.map(failedPass => ({
        eventId: referenceData.eventId,
        accountId: referenceData.accountId,
        barcode: failedPass.barcode,
        customerName: failedPass.customerName,
        spotType: referenceData.spotType,
        lotId: referenceData.lotId,
      }));
      
      // Call createMultiplePasses with the converted data
      const result = await createMultiplePasses(passesData);
      
      // Update creation summary with new results - replace the current location state
      navigate(ROUTES.RESULTS, {
        state: {
          creationSummary: result
        },
        replace: true
      });
    } catch (err) {
      // Handle any errors with error handler
      handleError(err);
    } finally {
      // Set loading state to false
      setLoading(false);
    }
  };
  
  /**
   * Handles retry after an error occurs
   */
  const handleErrorRetry = () => {
    // Reset the error state to null
    clearError();
    
    // Navigate back to create passes page if no summary exists
    if (!creationSummary) {
      navigate(ROUTES.CREATE_PASSES);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageTitle variant="h4">
          Creation Results
        </PageTitle>
        
        {loading ? (
          <LoadingSpinner size={50} />
        ) : error ? (
          <ErrorDisplay 
            error={error} 
            onRetry={handleErrorRetry} 
          />
        ) : creationSummary ? (
          <ContentPaper>
            <ResultsSummary
              results={creationSummary}
              onCreateMore={handleCreateMore}
              onViewAllPasses={handleViewAllPasses}
              onRetryFailed={handleRetryFailed}
              eventName={creationSummary.event?.name || 'Unknown Event'}
              eventDate={eventDate}
            />
          </ContentPaper>
        ) : (
          <ContentPaper>
            <NoResultsMessage variant="body1">
              No creation results found. Please try creating passes first.
            </NoResultsMessage>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button 
                onClick={() => navigate(ROUTES.CREATE_PASSES)}
                variant="contained"
                color="primary"
              >
                Go to Create Passes
              </Button>
            </Box>
          </ContentPaper>
        )}
      </PageContainer>
    </Layout>
  );
};

export default ResultsPage;