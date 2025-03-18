import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button } from '@mui/material';

import Layout from '../components/layout/Layout';
import PassesTable from '../components/passes/PassesTable';
import EventSelectionForm from '../components/forms/EventSelectionForm';
import ErrorDisplay from '../components/feedback/ErrorDisplay';
import usePasses from '../hooks/usePasses';
import { Pass } from '../types/pass.types';
import { ROUTES } from '../constants/routes';

/**
 * Page component that displays parking passes for a specific event in the ParkHub system.
 * It allows users to enter an event ID, view passes in a tabular format, and navigate to
 * the pass creation page.
 * 
 * @returns The rendered Passes page component
 */
const PassesPage: React.FC = () => {
  // State for the event ID input value
  const [eventIdValue, setEventIdValue] = useState<string>('');
  
  // Get navigation function for routing
  const navigate = useNavigate();
  
  // Get passes data and management functions from usePasses hook
  const {
    paginatedPasses,
    loading,
    error,
    selectedEventId,
    selectEvent,
    refetch
  } = usePasses();
  
  // Handle event selection form submission
  const handleEventSelection = useCallback((eventId: string) => {
    setEventIdValue(eventId);
    selectEvent(eventId);
  }, [selectEvent]);
  
  // Handle pass selection
  const handlePassSelect = useCallback((pass: Pass) => {
    // Implementation for pass selection (could show details sidebar or highlight row)
    console.log('Pass selected:', pass);
  }, []);
  
  // Handle viewing pass details
  const handlePassDetails = useCallback((pass: Pass) => {
    // Implementation for viewing pass details (could open modal)
    console.log('View pass details:', pass);
  }, []);
  
  // Handle navigation to pass creation
  const handleCreatePasses = useCallback(() => {
    if (selectedEventId) {
      navigate(ROUTES.CREATE_PASSES, { state: { eventId: selectedEventId } });
    } else {
      navigate(ROUTES.CREATE_PASSES);
    }
  }, [navigate, selectedEventId]);
  
  // Handle retrying API calls on error
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);
  
  // Set event ID from URL parameters if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('eventId');
    
    if (eventIdParam) {
      setEventIdValue(eventIdParam);
      selectEvent(eventIdParam);
    }
  }, [selectEvent]);
  
  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Passes
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          View parking passes for a specific event. Enter an event ID to see passes.
        </Typography>
        
        {/* Event Selection Form */}
        <EventSelectionForm
          initialEventId={eventIdValue}
          onSubmit={handleEventSelection}
          loading={loading}
          label="Event ID"
        />
        
        {/* Error Display */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={handleRetry}
          />
        )}
        
        {/* Loading, Empty, or Data State */}
        {!error && (
          <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <Typography>Loading passes...</Typography>
              </Box>
            ) : !selectedEventId ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <Typography>
                  Please enter an event ID to view passes.
                </Typography>
              </Box>
            ) : paginatedPasses.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" p={4}>
                <Typography gutterBottom>
                  No passes found for this event.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleCreatePasses}
                >
                  Create New Passes
                </Button>
              </Box>
            ) : (
              <>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={2}
                >
                  <Typography variant="h6">
                    Passes for Event: {selectedEventId}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleCreatePasses}
                  >
                    Create New Passes
                  </Button>
                </Box>
                
                <PassesTable
                  eventId={selectedEventId}
                  onPassSelect={handlePassSelect}
                  onPassDetails={handlePassDetails}
                />
              </>
            )}
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default PassesPage;