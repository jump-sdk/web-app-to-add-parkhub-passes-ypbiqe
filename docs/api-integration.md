# ParkHub API Integration

This document provides comprehensive documentation for integrating with the ParkHub API in the ParkHub Passes Creation Web Application. The application uses a direct API integration approach with ParkHub services to enable viewing events, managing passes, and creating new parking passes.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [React Hooks](#react-hooks)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)

## Introduction

### Purpose

The ParkHub API integration enables the core functionality of the application:

- Retrieving game events from the ParkHub system
- Viewing parking passes for specific events
- Creating new parking passes that can be validated at stadium entrances

### Architecture Overview

The application uses a frontend-only architecture that communicates directly with the ParkHub API. Key components include:

- API Client: Core service for making HTTP requests to ParkHub endpoints
- API Services: Specialized services for events and passes operations
- React Hooks: Custom hooks for data fetching and mutations
- Error Handling: Comprehensive error handling with retry capabilities

## Authentication

### API Key Authentication

The ParkHub API uses API key authentication for all requests. The API key must be included in the `Authorization` header of each request using the Bearer token format.

```typescript
Authorization: Bearer {api_key}
```

### Secure Storage

API keys are stored securely in the browser using the browser's localStorage or sessionStorage with encryption. The `apiKeyStorage` service handles secure storage and retrieval of API keys.

### Setting Up API Keys

#### Development Environment

For development, you can set the API key in the application using:

```typescript
import { apiClient } from '../services/api/apiClient';

// Set the API key for the current session
apiClient.setApiKey('your-api-key');
```

#### Production Environment

In production, users will be prompted to enter their API key if one is not already stored. The application will securely store this key for future use.

## API Endpoints

### Base URL

All API requests use the following base URL:

```
https://api.parkhub.com
```

### Events Endpoint

#### Get Events

```
GET /events/{landMarkId}?dateFrom={dateFrom}
```

**Parameters:**

- `landMarkId` (path parameter): The landmark ID (default: 7fc72127-c601-46f3-849b-0fdea9f370ae)
- `dateFrom` (query parameter): Start date for events in ISO format (e.g., 2023-10-01T00:00:00.000Z)

**Response:**

```json
[
  {
    "id": "EV12345",
    "name": "Football vs. Rivals",
    "date": "2023-10-15T19:00:00Z",
    "venue": "Stadium1",
    "status": "active"
  },
  ...
]
```

### Passes Endpoint

#### Get Passes for Event

```
GET /passes?landMarkId={landMarkId}&eventId={eventId}
```

**Parameters:**

- `landMarkId` (query parameter): The landmark ID (default: 7fc72127-c601-46f3-849b-0fdea9f370ae)
- `eventId` (query parameter): The ParkHub event ID

**Response:**

```json
[
  {
    "id": "P98765",
    "eventId": "EV12345",
    "accountId": "ABC123",
    "barcode": "BC100001",
    "customerName": "John Smith",
    "spotType": "VIP",
    "lotId": "LOT-A",
    "createdAt": "2023-09-01T14:30:00Z",
    "status": "active"
  },
  ...
]
```

#### Create Pass

```
POST /passes
```

**Request Body:**

```json
{
  "eventId": "EV12345",
  "accountId": "ABC123",
  "barcode": "BC100004",
  "customerName": "Michael Williams",
  "spotType": "Regular",
  "lotId": "LOT-A"
}
```

**Response:**

```json
{
  "success": true,
  "passId": "P98768"
}
```

Or in case of error:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_BARCODE",
    "message": "Barcode already exists",
    "field": "barcode"
  }
}
```

## Data Models

### ParkHubEvent

```typescript
interface ParkHubEvent {
  id: string;           // Unique event identifier
  name: string;         // Event name
  date: string;         // Event date in ISO format
  venue: string;        // Venue name
  status: string;       // Event status (active, cancelled, etc.)
  additionalDetails?: Record<string, any>; // Optional additional details
}
```

### ParkHubPass

```typescript
interface ParkHubPass {
  id: string;           // Unique pass identifier
  eventId: string;      // Associated event ID
  accountId: string;    // Account ID
  barcode: string;      // Unique barcode for scanning
  customerName: string; // Customer name
  spotType: string;     // Parking spot type (Regular, VIP, Premium)
  lotId: string;        // Parking lot identifier
  createdAt: string;    // Creation timestamp in ISO format
  status: string;       // Pass status
  additionalDetails?: Record<string, any>; // Optional additional details
}
```

### CreatePassRequest

```typescript
interface CreatePassRequest {
  eventId: string;      // Associated event ID
  accountId: string;    // Account ID
  barcode: string;      // Unique barcode for scanning
  customerName: string; // Customer name
  spotType: string;     // Parking spot type (Regular, VIP, Premium)
  lotId: string;        // Parking lot identifier
}
```

### CreatePassResponse

```typescript
interface CreatePassResponse {
  success: boolean;     // Whether the creation was successful
  passId?: string;      // Created pass ID (if successful)
  error?: {             // Error details (if unsuccessful)
    code: string;       // Error code
    message: string;    // Error message
    field?: string;     // Field that caused the error (for validation errors)
  };
}
```

### BatchPassCreationResult

```typescript
interface BatchPassCreationResult {
  successful: Array<{   // Successfully created passes
    passId: string;     // Created pass ID
    barcode: string;    // Pass barcode
    customerName: string; // Customer name
  }>;
  failed: Array<{       // Failed pass creations
    barcode: string;    // Pass barcode
    customerName: string; // Customer name
    error: ApiError;    // Error details
  }>;
  totalSuccess: number; // Total number of successful creations
  totalFailed: number;  // Total number of failed creations
}
```

## Error Handling

### Error Types

The application categorizes API errors into the following types:

- **Network Errors**: Connection issues, timeouts
- **Authentication Errors**: Invalid or missing API key
- **Validation Errors**: Invalid input data
- **Server Errors**: ParkHub API server issues
- **Client Errors**: Issues with the request format
- **Unknown Errors**: Unclassified errors

### Error Handling Strategy

#### Automatic Retry

Network errors and certain server errors (like rate limiting) are automatically retried with exponential backoff:

```typescript
retry(() => apiClient.get('/events'), {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 3000,
  onRetry: (error, retryCount, delayMs) => {
    console.log(`Retrying after ${delayMs}ms (attempt ${retryCount})`);
  }
});
```

#### Error Mapping

All errors are mapped to application-specific error types using the `mapErrorToAppError` function:

```typescript
try {
  const response = await apiClient.get('/events');
  // Handle success
} catch (error) {
  const appError = mapErrorToAppError(error);
  // Handle typed error
}
```

#### Field-Level Validation Errors

Validation errors include field information to highlight specific form fields:

```typescript
// Example validation error
{
  type: ErrorType.VALIDATION,
  code: ErrorCode.INVALID_INPUT,
  message: 'Invalid barcode format',
  field: 'barcode',
  fieldErrors: {
    barcode: 'Invalid barcode format'
  }
}
```

### Error Recovery

#### User-Initiated Retry

For non-automatically retried errors, the UI provides retry options:

```typescript
const { data, error, refetch } = useQuery('/events');

if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={refetch}>Retry</button>
    </div>
  );
}
```

#### API Key Recovery

For authentication errors, the application prompts for a new API key:

```typescript
if (error?.type === ErrorType.AUTHENTICATION) {
  return <ApiKeyPrompt onSubmit={handleApiKeySubmit} />;
}
```

## Rate Limiting

### ParkHub API Rate Limits

The ParkHub API implements rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for GET operations
- 50 requests per minute for POST operations

### Client-Side Throttling

To prevent hitting rate limits, the application implements client-side throttling for batch operations:

```typescript
async function createMultiplePasses(passesData: CreatePassRequest[]): Promise<BatchPassCreationResult> {
  // Process in batches of 10 concurrent requests
  const batchSize = 10;
  const results = { successful: [], failed: [], totalSuccess: 0, totalFailed: 0 };
  
  // Process in batches
  for (let i = 0; i < passesData.length; i += batchSize) {
    const batch = passesData.slice(i, i + batchSize);
    const batchPromises = batch.map(passData => createPass(passData));
    
    // Wait for all requests in the batch to complete
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process results...
  }
  
  return results;
}
```

### Handling Rate Limit Errors

When a rate limit error is encountered (HTTP 429), the application implements exponential backoff:

```typescript
if (error.code === ErrorCode.RATE_LIMIT_EXCEEDED) {
  // Calculate backoff delay based on retry count
  const delayMs = calculateBackoffDelay(retryCount, 300, 10000);
  
  // Wait for the backoff period
  await delay(delayMs);
  
  // Retry the request
  return retry(fn, { ...options, retryCount: retryCount + 1 });
}
```

## React Hooks

### useQuery Hook

The `useQuery` hook provides a simple interface for fetching data from the ParkHub API with built-in caching, loading states, and error handling:

```typescript
import { useQuery } from '../hooks/useQuery';
import { ParkHubEvent } from '../types/api.types';

function EventsList() {
  const { 
    data: events, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<ParkHubEvent[]>('/events', {
    enabled: true,
    retry: true,
    retryCount: 3,
    cacheTime: 3600000 // 1 hour
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  
  return (
    <div>
      {events?.map(event => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### useMutation Hook

The `useMutation` hook simplifies data mutation operations like creating passes:

```typescript
import { useMutation } from '../hooks/useMutation';
import { passesApi } from '../services/api/passesApi';
import { CreatePassRequest, CreatePassResponse } from '../types/api.types';

function PassCreationForm() {
  const { 
    mutate: createPass, 
    isLoading, 
    error, 
    data: result 
  } = useMutation<CreatePassRequest, CreatePassResponse>(
    passesApi.createPass,
    {
      showSuccessNotification: true,
      successMessage: 'Pass created successfully!',
      onSuccess: (data) => {
        console.log('Created pass ID:', data.passId);
      }
    }
  );
  
  const handleSubmit = (formData) => {
    createPass(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay error={error} />}
      {result && <SuccessMessage passId={result.passId} />}
    </form>
  );
}
```

### useEvents Hook

The application also provides domain-specific hooks that build on top of useQuery and useMutation:

```typescript
import { useEvents } from '../hooks/useEvents';

function EventsPage() {
  const { 
    events, 
    isLoading, 
    error, 
    refetchEvents 
  } = useEvents();
  
  // Component implementation
}
```

### usePasses Hook

```typescript
import { usePasses } from '../hooks/usePasses';

function PassesPage() {
  const eventId = 'EV12345';
  const { 
    passes, 
    isLoading, 
    error, 
    createPass, 
    isCreating, 
    creationError 
  } = usePasses(eventId);
  
  // Component implementation
}
```

## Best Practices

### Caching

Implement appropriate caching strategies to reduce API calls:

```typescript
// Configure caching in useQuery
const { data: events } = useQuery<ParkHubEvent[]>('/events', {
  cacheTime: 3600000, // Cache for 1 hour
});

// Manually invalidate cache when needed
cacheStorage.removeItem('query:/events');
```

### Batch Operations

Use batch operations for creating multiple passes:

```typescript
// Instead of multiple individual calls
const results = await passesApi.createMultiplePasses(passesData);

// Process results
console.log(`Created ${results.totalSuccess} passes successfully`);
console.log(`Failed to create ${results.totalFailed} passes`);
```

### Error Handling

Implement comprehensive error handling:

```typescript
try {
  const response = await passesApi.createPass(passData);
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
    handleApiError(response.error);
  }
} catch (error) {
  // Handle unexpected errors
  handleUnexpectedError(error);
}
```

### API Key Management

Securely manage API keys:

```typescript
// Never hardcode API keys
const apiKey = apiKeyStorage.getApiKey();

// Securely store API keys
apiKeyStorage.setApiKey(userProvidedApiKey);

// Clear API keys when needed
apiKeyStorage.clearApiKey();
```

### Validation

Validate data before sending to the API:

```typescript
function validatePassData(data: CreatePassRequest): boolean {
  if (!data.eventId || !data.accountId || !data.barcode || 
      !data.customerName || !data.spotType || !data.lotId) {
    return false;
  }
  
  // Validate barcode format
  if (!/^BC\d{6}$/.test(data.barcode)) {
    return false;
  }
  
  return true;
}
```

### Retry Strategy

Implement appropriate retry strategies:

```typescript
// Automatic retry for network errors
retry(() => apiClient.get('/events'), {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 3000
});

// Manual retry for user-initiated actions
function handleRetry() {
  setLoading(true);
  apiClient.get('/events')
    .then(handleSuccess)
    .catch(handleError)
    .finally(() => setLoading(false));
}
```

## Troubleshooting

### Common Issues

#### Authentication Errors

**Issue**: API requests fail with 401 Unauthorized errors.

**Solution**:

1. Check if the API key is correctly set:

```typescript
const apiKey = apiClient.getApiKey();
console.log('API Key available:', !!apiKey);
```

2. Verify the API key format (should be a valid UUID).

3. Try setting a new API key:

```typescript
apiClient.setApiKey(newApiKey);
```

#### Rate Limiting

**Issue**: API requests fail with 429 Too Many Requests errors.

**Solution**:

1. Implement throttling for batch operations:

```typescript
// Process in smaller batches
const batchSize = 5; // Reduce from 10 to 5
```

2. Add delays between batches:

```typescript
// Add delay between batches
await delay(1000); // 1 second delay between batches
```

#### Network Errors

**Issue**: API requests fail with network errors.

**Solution**:

1. Check internet connectivity.

2. Verify the API base URL is correct:

```typescript
console.log('API Base URL:', API_BASE_URL);
```

3. Implement more aggressive retry logic:

```typescript
retry(() => apiClient.get('/events'), {
  maxRetries: 5, // Increase from 3 to 5
  baseDelay: 500, // Increase from 300 to 500
  maxDelay: 10000 // Increase from 3000 to 10000
});
```

#### Validation Errors

**Issue**: Pass creation fails with validation errors.

**Solution**:

1. Check the error response for field-specific errors:

```typescript
if (error?.type === ErrorType.VALIDATION) {
  console.log('Field with error:', error.field);
  console.log('Error message:', error.message);
}
```

2. Implement client-side validation before API calls:

```typescript
function validateBarcode(barcode: string): boolean {
  return /^BC\d{6}$/.test(barcode);
}
```

#### Debugging API Calls

To debug API calls, you can add request and response interceptors:

```typescript
// Add request interceptor
apiClient.addRequestInterceptor(config => {
  console.log('Request:', config.method, config.url, config.data);
  return config;
});

// Add response interceptor
apiClient.addResponseInterceptor(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);
```

## API Reference

### API Client

#### apiClient

The main API client instance for making HTTP requests to the ParkHub API.

```typescript
import { apiClient } from '../services/api/apiClient';

// GET request
const response = await apiClient.get<ParkHubEvent[]>('/events');

// POST request
const response = await apiClient.post<CreatePassResponse>('/passes', passData);

// Set API key
apiClient.setApiKey('your-api-key');

// Get current API key
const apiKey = apiClient.getApiKey();
```

### API Services

#### eventsApi

Specialized service for events-related operations.

```typescript
import { eventsApi } from '../services/api/eventsApi';

// Get all events
const response = await eventsApi.getEvents();

// Get events with parameters
const response = await eventsApi.getEvents({
  dateFrom: '2023-10-01T00:00:00.000Z'
});
```

#### passesApi

Specialized service for passes-related operations.

```typescript
import { passesApi } from '../services/api/passesApi';

// Get passes for an event
const response = await passesApi.getPassesForEvent({
  eventId: 'EV12345'
});

// Create a single pass
const response = await passesApi.createPass({
  eventId: 'EV12345',
  accountId: 'ABC123',
  barcode: 'BC100004',
  customerName: 'Michael Williams',
  spotType: 'Regular',
  lotId: 'LOT-A'
});

// Create multiple passes
const results = await passesApi.createMultiplePasses(passesDataArray);
```

### React Hooks

#### useQuery

Hook for data fetching with caching and error handling.

```typescript
import { useQuery } from '../hooks/useQuery';

const { 
  data, 
  isLoading, 
  error, 
  refetch,
  isSuccess,
  isError 
} = useQuery<DataType>(url, options);
```

#### useMutation

Hook for data mutation operations.

```typescript
import { useMutation } from '../hooks/useMutation';

const { 
  mutate, 
  isLoading, 
  error, 
  data,
  reset,
  isSuccess,
  isError 
} = useMutation<RequestType, ResponseType>(mutationFunction, options);
```

### Utility Functions

#### Error Handling

```typescript
import { mapErrorToAppError, handleError } from '../utils/error-handling';

// Map any error to a typed AppError
const appError = mapErrorToAppError(error);

// Handle error with retry logic
try {
  // API operation
} catch (error) {
  await handleError(error, {
    retry: true,
    maxRetries: 3,
    onRetry: (error, retryCount) => console.log(`Retry ${retryCount}`),
    onError: (error) => console.error('Final error:', error)
  });
}
```

#### Retry Logic

```typescript
import { retry, retryWithBackoff } from '../utils/retry-logic';

// Retry a function
const result = await retry(() => apiClient.get('/events'), {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 3000
});

// Create a function with built-in retry
const getEventsWithRetry = retryWithBackoff(apiClient.get, {
  maxRetries: 3,
  baseDelay: 300,
  maxDelay: 3000
});

const result = await getEventsWithRetry('/events');
```