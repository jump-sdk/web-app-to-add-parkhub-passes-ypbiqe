/**
 * Router module entry point for the ParkHub Passes Creation Web Application.
 * This file centralizes all router-related exports to provide a clean interface
 * for importing router components throughout the application.
 * 
 * @module router
 * @version 1.0.0
 */

import Router from './Router';
import PrivateRoute from './PrivateRoute';
import routes from './routes';

export {
  Router,
  PrivateRoute,
  routes
};