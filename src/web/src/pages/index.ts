/**
 * Barrel file that exports all page components from the pages directory.
 * This file simplifies importing page components throughout the application,
 * particularly in router configuration.
 * 
 * @version 1.0.0
 */

// Import all page components
import Dashboard from './Dashboard';
import EventsPage from './EventsPage';
import NotFound from './NotFound';
import PassCreationPage from './PassCreationPage';
import PassesPage from './PassesPage';
import ResultsPage from './ResultsPage';

// Export all page components as named exports for easy consumption
export {
  Dashboard,
  EventsPage,
  NotFound,
  PassCreationPage,
  PassesPage,
  ResultsPage
};