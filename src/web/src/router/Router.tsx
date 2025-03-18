import React from 'react'; // ^18.2.0
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'; // ^6.x
import { ThemeProvider, createTheme } from '@mui/material/styles'; // ^5.14.0
import { CssBaseline } from '@mui/material'; // ^5.14.0

import routes from './routes'; // Import route configuration array defining the application's routing structure
import Layout from '../components/layout/Layout'; // Import main layout component that provides consistent UI structure
import { ApiKeyProvider } from '../context/ApiKeyContext'; // Import API key context provider for authentication state management
import { NotificationProvider } from '../context/NotificationContext'; // Import notification context provider for application-wide notifications

/**
 * Component that wraps the application with the Layout component and renders child routes
 * @returns The rendered layout with child routes
 */
const AppLayout = (): JSX.Element => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

/**
 * Main router component that configures and renders the application's routing structure
 * @returns The rendered application with routing and context providers
 */
const Router = (): JSX.Element => {
  // Create a default theme for consistent styling
  const defaultTheme = createTheme();

  // Create a browser router instance with the route configuration
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AppLayout />,
      children: routes
    }
  ]);

  // Return the router provider wrapped with necessary context providers
  return (
    <NotificationProvider>
      <ApiKeyProvider>
        <ThemeProvider theme={defaultTheme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </ApiKeyProvider>
    </NotificationProvider>
  );
};

export default Router;