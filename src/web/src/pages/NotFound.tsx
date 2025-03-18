import React from 'react'; // ^18.2.0
import { Box, Typography, Container } from '@mui/material'; // ^5.14.0
import { useNavigate } from 'react-router-dom'; // ^6.x
import { ErrorOutline } from '@mui/icons-material'; // ^5.14.0
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { ROUTES } from '../constants/routes';

/**
 * 404 Not Found page component that displays when a user navigates to a non-existent route.
 * Provides a user-friendly error message and navigation options to return to valid
 * parts of the application.
 * 
 * @returns {JSX.Element} The rendered NotFound page component
 */
const NotFound = (): JSX.Element => {
  // Initialize navigation function
  const navigate = useNavigate();

  /**
   * Navigate to the home/dashboard page
   */
  const handleNavigateHome = (): void => {
    navigate(ROUTES.DASHBOARD);
  };

  /**
   * Navigate to the events page
   */
  const handleNavigateToEvents = (): void => {
    navigate(ROUTES.EVENTS);
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="80vh"
        py={4}
        data-testid="not-found-page"
      >
        <Card 
          elevation={3} 
          title="404 - Page Not Found"
          data-testid="not-found-card"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
          >
            <ErrorOutline 
              color="error" 
              sx={{ fontSize: 64, mb: 2 }} 
              aria-hidden="true"
            />
            <Typography variant="body1" color="textSecondary" paragraph>
              The page you are looking for doesn't exist or has been moved.
              Please check the URL or navigate to an existing page.
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
              mt={3}
            >
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNavigateHome}
                data-testid="go-to-dashboard-button"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleNavigateToEvents}
                data-testid="view-events-button"
              >
                View Events
              </Button>
            </Box>
          </Box>
        </Card>
        <Typography 
          variant="caption" 
          color="textSecondary" 
          sx={{ mt: 2 }}
        >
          {`Last navigation attempt: ${new Date().toLocaleString()}`}
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;