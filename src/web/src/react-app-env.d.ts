/// <reference types="react-scripts" />

/**
 * Environment variable type extensions for the ParkHub Passes Creation Web Application
 * This declaration file enhances TypeScript's type checking for environment variables
 * injected during the build process.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * Base URL for the ParkHub API
     * Example: "https://api.parkhub.com"
     */
    REACT_APP_API_BASE_URL: string;
    
    /**
     * Default API key for development (not used in production)
     * This should only be used in development environments
     */
    REACT_APP_API_KEY?: string;
    
    /**
     * Application version from package.json
     * Automatically injected during build
     */
    REACT_APP_VERSION: string;
    
    /**
     * Current environment (development, production, test)
     * Set by React Scripts based on the build or start command
     */
    NODE_ENV: 'development' | 'production' | 'test';

    /**
     * Flag to enable or disable certain features
     * Can be used for feature toggling between environments
     */
    REACT_APP_FEATURE_FLAGS?: string;

    /**
     * Optional API rate limit configuration
     * Maximum number of requests allowed per minute
     */
    REACT_APP_API_RATE_LIMIT?: string;
  }
}

/**
 * Additional global type definitions for the application
 */
interface Window {
  /**
   * Optional configuration that can be injected at runtime
   */
  __APP_CONFIG__?: {
    apiBaseUrl?: string;
    featureFlags?: Record<string, boolean>;
  };
}