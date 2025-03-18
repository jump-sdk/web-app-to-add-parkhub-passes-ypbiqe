/// <reference types="vite/client" />

// This file provides TypeScript type definitions for Vite-specific features
// and environment variables to ensure type safety when accessing these values
// throughout the application.

// Extends the ImportMeta interface to include our custom environment variables
interface ImportMetaEnv {
  // Base URL for the ParkHub API
  readonly VITE_API_BASE_URL: string;
  // Default API key for development (not used in production)
  readonly VITE_API_KEY?: string;
  // Application version from package.json
  readonly VITE_APP_VERSION: string;
  // Vite's built-in env vars:
  // readonly MODE: string;
  // readonly DEV: boolean;
  // readonly PROD: boolean;
}

// Extends the import.meta object with our environment variables
interface ImportMeta {
  readonly env: ImportMetaEnv;
}