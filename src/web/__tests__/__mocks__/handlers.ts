import { rest } from 'msw';
import { 
  mockParkHubEvents, 
  createMockEventResponse 
} from './eventsMock';
import { 
  mockParkHubPasses, 
  createMockPassesResponse, 
  mockBatchPassCreationResult 
} from './passesMock';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createAuthenticationError, 
  createValidationError, 
  createServerError 
} from './apiResponseMock';
import { 
  API_BASE_URL, 
  LANDMARK_ID, 
  ENDPOINTS 
} from '../../src/constants/apiEndpoints';

/**
 * MSW handler for the events endpoint
 * @returns MSW REST handler for GET requests to the events endpoint
 */
export const getEventsHandler = () => {
  // Use the events endpoint format from ENDPOINTS constant
  const endpoint = ENDPOINTS.EVENTS.replace('{landMarkId}', LANDMARK_ID);
  
  return rest.get(`${API_BASE_URL}${endpoint}`, (req, res, ctx) => {
    // Check for authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json(createAuthenticationError())
      );
    }

    // Check for server error simulation via custom header
    if (req.headers.get('x-simulate-error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json(createServerError())
      );
    }

    // Get query parameters
    const landMarkId = req.url.searchParams.get('landMarkId');
    const dateFrom = req.url.searchParams.get('dateFrom');

    // Filter events based on dateFrom if provided
    let events = [...mockParkHubEvents];
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      events = events.filter(event => new Date(event.date) >= fromDate);
    }

    // Return successful response
    return res(
      ctx.status(200),
      ctx.json(createMockEventResponse(events))
    );
  });
};

/**
 * MSW handler for the passes endpoint
 * @returns MSW REST handler for GET requests to the passes endpoint
 */
export const getPassesHandler = () => {
  // Use the passes endpoint format from ENDPOINTS constant
  const endpoint = ENDPOINTS.PASSES.replace('{landMarkId}', LANDMARK_ID);
  
  return rest.get(`${API_BASE_URL}${endpoint}`, (req, res, ctx) => {
    // Check for authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json(createAuthenticationError())
      );
    }

    // Get query parameters
    const eventId = req.url.searchParams.get('eventId');
    const landMarkId = req.url.searchParams.get('landMarkId');

    // Validate eventId
    if (!eventId) {
      return res(
        ctx.status(400),
        ctx.json(createValidationError('eventId', 'Event ID is required'))
      );
    }

    // Check for server error simulation via custom header
    if (req.headers.get('x-simulate-error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json(createServerError())
      );
    }

    // Filter passes by eventId
    const passes = mockParkHubPasses.filter(pass => pass.eventId === eventId);

    // Return successful response
    return res(
      ctx.status(200),
      ctx.json(createMockPassesResponse(passes))
    );
  });
};

/**
 * MSW handler for the pass creation endpoint
 * @returns MSW REST handler for POST requests to the pass creation endpoint
 */
export const createPassHandler = () => {
  // Use the pass creation endpoint format from ENDPOINTS constant
  const endpoint = ENDPOINTS.CREATE_PASS.replace('{landMarkId}', LANDMARK_ID);
  
  return rest.post(`${API_BASE_URL}${endpoint}`, async (req, res, ctx) => {
    // Check for authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json(createAuthenticationError())
      );
    }

    // Parse request body
    const passData = await req.json();

    // Check if this is a batch request (array of passes)
    if (Array.isArray(passData)) {
      return handleBatchPassCreation(passData, req, res, ctx);
    }

    // Validate required fields
    const requiredFields = ['eventId', 'accountId', 'barcode', 'customerName', 'spotType', 'lotId'];
    for (const field of requiredFields) {
      if (!passData[field]) {
        return res(
          ctx.status(400),
          ctx.json(createValidationError(field, `${field} is required`))
        );
      }
    }

    // Check for duplicate barcode
    if (mockParkHubPasses.some(pass => pass.barcode === passData.barcode)) {
      return res(
        ctx.status(409),
        ctx.json(createErrorResponse({
          code: 'DUPLICATE',
          message: 'Barcode already exists',
          field: 'barcode'
        }))
      );
    }

    // Check for server error simulation via custom header
    if (req.headers.get('x-simulate-error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json(createServerError())
      );
    }

    // Generate a new pass ID
    const passId = `P${Math.floor(90000 + Math.random() * 10000)}`;

    // Return successful response
    return res(
      ctx.status(201),
      ctx.json(createSuccessResponse({
        success: true,
        passId
      }))
    );
  });
};

/**
 * MSW handler for batch pass creation
 * @returns MSW REST handler for POST requests to the batch pass creation endpoint
 */
export const createBatchPassesHandler = () => {
  // Use the same endpoint as pass creation but handle batches separately
  const endpoint = ENDPOINTS.CREATE_PASS.replace('{landMarkId}', LANDMARK_ID);
  
  return rest.post(`${API_BASE_URL}${endpoint}/batch`, async (req, res, ctx) => {
    // Check for authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json(createAuthenticationError())
      );
    }

    // Parse request body
    const passesData = await req.json();

    // Check if we have an array of passes
    if (!Array.isArray(passesData)) {
      return res(
        ctx.status(400),
        ctx.json(createValidationError('passesData', 'Expected an array of passes'))
      );
    }

    // Check for server error simulation via custom header
    if (req.headers.get('x-simulate-error') === 'server') {
      return res(
        ctx.status(500),
        ctx.json(createServerError())
      );
    }

    // Process batch creation
    const batchResult = processBatchCreation(passesData, req);
    
    // Return successful response
    return res(
      ctx.status(200),
      ctx.json(createSuccessResponse(batchResult))
    );
  });
};

/**
 * Helper function to process batch pass creation
 */
const processBatchCreation = (passesData, req) => {
  const successful = [];
  const failed = [];

  // Process each pass in the batch
  for (let i = 0; i < passesData.length; i++) {
    const passData = passesData[i];
    
    // Validate required fields
    const requiredFields = ['eventId', 'accountId', 'barcode', 'customerName', 'spotType', 'lotId'];
    const missingField = requiredFields.find(field => !passData[field]);
    
    if (missingField) {
      failed.push({
        barcode: passData.barcode || `Unknown-${i}`,
        customerName: passData.customerName || `Unknown-${i}`,
        error: {
          code: 'VALIDATION_ERROR',
          message: `${missingField} is required`,
          field: missingField
        }
      });
      continue;
    }

    // Check for duplicate barcode
    if (mockParkHubPasses.some(pass => pass.barcode === passData.barcode) || 
        successful.some(pass => pass.barcode === passData.barcode)) {
      failed.push({
        barcode: passData.barcode,
        customerName: passData.customerName,
        error: {
          code: 'DUPLICATE',
          message: 'Barcode already exists',
          field: 'barcode'
        }
      });
      continue;
    }

    // Simulate random failures for testing partial success scenarios
    // Fail approximately 20% of passes
    if (Math.random() < 0.2) {
      failed.push({
        barcode: passData.barcode,
        customerName: passData.customerName,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Error processing pass',
          field: null
        }
      });
      continue;
    }

    // Success - generate a pass ID
    const passId = `P${Math.floor(90000 + Math.random() * 10000)}`;
    successful.push({
      passId,
      barcode: passData.barcode,
      customerName: passData.customerName
    });
  }

  // Return batch results
  return {
    successful,
    failed,
    totalSuccess: successful.length,
    totalFailed: failed.length
  };
};

/**
 * Helper function to handle batch pass creation from the main pass endpoint
 */
const handleBatchPassCreation = async (passesData, req, res, ctx) => {
  // Process batch creation and return results
  const batchResult = processBatchCreation(passesData, req);
  
  // Return successful response
  return res(
    ctx.status(200),
    ctx.json(createSuccessResponse(batchResult))
  );
};

// Export all handlers
export const handlers = [
  getEventsHandler(),
  getPassesHandler(),
  createPassHandler(),
  createBatchPassesHandler()
];