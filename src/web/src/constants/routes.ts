/**
 * routes.ts
 * 
 * This file defines all the route paths used in the ParkHub Passes Creation Web Application.
 * Having centralized route definitions prevents hardcoded path strings and ensures consistency
 * across the application's navigation and routing components.
 */

/**
 * Application route constants
 * These constants define all navigation paths within the application
 * and are used by router components to set up routes and by navigation
 * components to create links.
 */
export const ROUTES = {
  /**
   * Dashboard/home page - the main entry point of the application
   * @type {string}
   */
  DASHBOARD: '/',
  
  /**
   * Events listing page - displays all ParkHub game events
   * @type {string}
   */
  EVENTS: '/events',
  
  /**
   * Passes viewing page - displays passes for a specific event
   * @type {string}
   */
  PASSES: '/passes',
  
  /**
   * Pass creation page - allows creating multiple new parking passes
   * @type {string}
   */
  CREATE_PASSES: '/create-passes',
  
  /**
   * Creation results page - displays results after pass creation
   * @type {string}
   */
  RESULTS: '/results',
  
  /**
   * Catch-all route for 404 not found pages
   * @type {string}
   */
  NOT_FOUND: '*'
} as const;