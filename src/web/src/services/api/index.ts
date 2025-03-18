/**
 * API Services Index
 * 
 * This file serves as a central export point for all API-related services and classes
 * in the ParkHub Passes Creation Web Application. It provides a unified interface for
 * importing API functionality throughout the application.
 * 
 * This module exports:
 * - apiClient: Singleton instance for making HTTP requests to the ParkHub API
 * - ApiClient: Class for creating API client instances
 * - eventsApi: Service for retrieving game events
 * - EventsApi: Class for creating events API service instances
 * - passesApi: Service for retrieving and creating parking passes
 * - PassesApi: Class for creating passes API service instances
 * - authApi: Service for managing API key operations
 * 
 * @module services/api
 * @version 1.0.0
 */

// Import API client and class
import { apiClient, ApiClient } from './apiClient';

// Import events API service and class
import { eventsApi, EventsApi } from './eventsApi';

// Import passes API service and class
import { passesApi, PassesApi } from './passesApi';

// Import auth API service
import { authApi } from './authApi';

// Export all API services and classes
export {
  apiClient,
  ApiClient,
  eventsApi,
  EventsApi,
  passesApi,
  PassesApi,
  authApi
};