import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ROUTES } from '../constants/routes';
import useEvents from '../hooks/useEvents';
import usePasses from '../hooks/usePasses';

// Styled components for the dashboard
const WelcomeSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

/**
 * The main Dashboard component that serves as the landing page for the application.
 * It provides an overview of the system with quick access to key features like
 * viewing events, managing passes, and creating new passes.
 * 
 * @returns The rendered Dashboard component
 */
const Dashboard: React.FC = () => {
  // Initialize navigate function for routing
  const navigate = useNavigate();
  
  // Local state for tracking if dashboard has initialized
  const [initialized, setInitialized] = useState(false);
  
  // Fetch summary data for events and passes
  const { events, loading: eventsLoading } = useEvents();
  const { passes, loading: passesLoading } = usePasses();
  
  // Side effect to set document title and mark initialization
  useEffect(() => {
    document.title = 'ParkHub Passes - Dashboard';
    setInitialized(true);
    
    // Optional cleanup function
    return () => {
      document.title = 'ParkHub Passes';
    };
  }, []);
  
  // Navigation handler functions
  const handleNavigateToEvents = () => {
    navigate(ROUTES.EVENTS);
  };
  
  const handleNavigateToPasses = () => {
    navigate(ROUTES.PASSES);
  };
  
  const handleNavigateToCreatePasses = () => {
    navigate(ROUTES.CREATE_PASSES);
  };
  
  return (
    <Layout>
      <Container>
        {/* Welcome section */}
        <WelcomeSection>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to ParkHub Passes
          </Typography>
          <Typography variant="body1">
            Create and manage parking passes for ParkHub validation. This application enables legitimate
            parking validation by creating valid passes in the ParkHub system that can be properly
            scanned and validated at stadium entrances.
          </Typography>
        </WelcomeSection>
        
        {/* Stats section */}
        <StatsContainer>
          <Box>
            <Typography variant="h6">Events</Typography>
            <Typography variant="h4">
              {eventsLoading ? '...' : events.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6">Passes</Typography>
            <Typography variant="h4">
              {passesLoading ? '...' : passes.length}
            </Typography>
          </Box>
        </StatsContainer>
        
        {/* Features section */}
        <Grid container spacing={3}>
          {/* View Events Card */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard title="View Events" onClick={handleNavigateToEvents}>
              <Typography>
                Browse all game events from the ParkHub system.
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleNavigateToEvents}
              >
                View Events
              </Button>
            </FeatureCard>
          </Grid>
          
          {/* View Passes Card */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard title="View Passes" onClick={handleNavigateToPasses}>
              <Typography>
                View all parking passes for specific events.
              </Typography>
              <Button 
                variant="contained" 
                onClick={handleNavigateToPasses}
              >
                View Passes
              </Button>
            </FeatureCard>
          </Grid>
          
          {/* Create Passes Card */}
          <Grid item xs={12} sm={6} md={4}>
            <FeatureCard title="Create Passes" onClick={handleNavigateToCreatePasses}>
              <Typography>
                Create multiple new parking passes for events.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNavigateToCreatePasses}
              >
                Create Passes
              </Button>
            </FeatureCard>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default Dashboard;