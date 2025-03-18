import React from 'react'; // ^18.2.0
import { ThemeProvider, createTheme } from '@mui/material/styles'; // ^5.14.0
import { CssBaseline } from '@mui/material'; // ^5.14.0

import Router from './router/Router';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { NotificationProvider } from './context/NotificationContext';

/**
 * Main application component that configures the app with providers and routing
 * @returns The rendered application with all necessary providers and routing
 */
const App = (): JSX.Element => {
  // Create a theme for the application with the color palette defined in the specifications
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // Primary blue
      },
      secondary: {
        main: '#00796b', // Secondary teal
      },
      error: {
        main: '#d32f2f', // Error red
      },
      warning: {
        main: '#ffa000', // Warning amber
      },
      success: {
        main: '#43a047', // Success green
      },
      info: {
        main: '#0288d1', // Info blue
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 500,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 4,
    },
  });

  return (
    <NotificationProvider>
      <ApiKeyProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router />
        </ThemeProvider>
      </ApiKeyProvider>
    </NotificationProvider>
  );
};

export default App;