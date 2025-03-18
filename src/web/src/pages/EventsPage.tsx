import React, { useCallback } from 'react';
import { Typography, Box, Container } from '@mui/material'; // ^5.14.0
import { useTheme } from '@mui/material/styles'; // ^5.14.0

import Layout from '../components/layout/Layout';
import EventsList from '../components/events/EventsList';
import useEvents from '../hooks/useEvents';
import { useNotificationContext } from '../context/NotificationContext';

/**
 * Main component for the Events page that displays ParkHub game events.
 * This page allows users to view, filter, sort, and select events for further operations.
 * It serves as the main view for displaying events from the ParkHub system.
 * 
 * @returns Rendered Events page component
 */
const EventsPage: React.FC = () => {
  const theme = useTheme();
  
  // Get events data and management functions from useEvents hook
  const { refetch } = useEvents();
  
  // Get notification context for showing success/error messages
  const { showSuccess, showError } = useNotificationContext();

  /**
   * Handles manual refresh of events data
   */
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      showSuccess('Events data refreshed successfully');
    } catch (err) {
      showError('Failed to refresh events data. Please try again.');
    }
  }, [refetch, showSuccess, showError]);

  return (
    <Layout>
      <Box sx={{ paddingTop: theme.spacing(2) }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ParkHub Events
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" paragraph>
          View and manage events and their parking passes
        </Typography>
        
        {/* Render the EventsList component which handles displaying, filtering, and sorting events */}
        <EventsList />
      </Box>
    </Layout>
  );
};

export default EventsPage;