import { RouteObject } from 'react-router-dom'; // ^6.x
import PrivateRoute from './PrivateRoute';
import { ROUTES } from '../constants/routes';
import {
  Dashboard,
  EventsPage,
  PassesPage,
  PassCreationPage,
  ResultsPage,
  NotFound
} from '../pages';

/**
 * Extended RouteObject type with additional properties specific to the application
 */
interface AppRouteObject extends RouteObject {
  requiresAuth: boolean;
  title: string;
}

/**
 * Application routes configuration defining the routing structure of the ParkHub Passes Creation Web Application
 * Includes protected routes that require API key authentication and are wrapped with the PrivateRoute component
 */
const routes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD,
    element: <Dashboard />,
    index: true
  },
  {
    path: ROUTES.EVENTS,
    element: <EventsPage />
  },
  {
    path: ROUTES.PASSES,
    element: <PrivateRoute><PassesPage /></PrivateRoute>
  },
  {
    path: ROUTES.CREATE_PASSES,
    element: <PrivateRoute><PassCreationPage /></PrivateRoute>
  },
  {
    path: ROUTES.RESULTS,
    element: <PrivateRoute><ResultsPage /></PrivateRoute>
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFound />
  }
];

export default routes;