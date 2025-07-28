/**
 * @fileoverview Error handling utility functions for standardized error responses
 * @module utils/errorHandler
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * Creates a standardized error response object
 * @function createErrorResponse
 * @description Generates a consistent error response format with status, message, and optional stack trace
 * @param {Error} error - The error object to process
 * @param {number} [defaultStatus=500] - Default HTTP status code if not provided in error
 * @returns {Object} Standardized error response object
 * @returns {number} returns.status - HTTP status code
 * @returns {string} returns.message - Error message
 * @returns {string} [returns.stack] - Error stack trace (only in development)
 * @example
 * // Create error response
 * const error = new Error('Something went wrong');
 * error.status = 400;
 * const response = createErrorResponse(error);
 * // Returns: { status: 400, message: 'Something went wrong' }
 * 
 * // With default status
 * const response = createErrorResponse(error, 500);
 * // Returns: { status: 500, message: 'Something went wrong' }
 */
const createErrorResponse = (error, defaultStatus = 500) => {
  // Check if status is explicitly set (including 0)
  const status = (error.status !== undefined && error.status !== null) || 
                 (error.statusCode !== undefined && error.statusCode !== null)
                 ? (error.status !== undefined ? error.status : error.statusCode)
                 : defaultStatus;
  const message = error.message || 'Internal Server Error';
  
  return {
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

/**
 * Handles validation errors with 400 status code
 * @function handleValidationError
 * @description Processes validation errors and returns standardized 400 response
 * @param {Error} error - Validation error object
 * @returns {Object} Validation error response with 400 status
 * @example
 * // Handle validation error
 * const validationError = new Error('Invalid input data');
 * const response = handleValidationError(validationError);
 * // Returns: { status: 400, message: 'Invalid input data' }
 */
const handleValidationError = (error) => {
  // Force status to 400 for validation errors
  return createErrorResponse(error, 400);
};

/**
 * Handles authentication errors with 401 status code
 * @function handleAuthError
 * @description Processes authentication errors and returns standardized 401 response
 * @param {Error} error - Authentication error object
 * @returns {Object} Authentication error response with 401 status
 * @example
 * // Handle authentication error
 * const authError = new Error('Invalid credentials');
 * const response = handleAuthError(authError);
 * // Returns: { status: 401, message: 'Invalid credentials' }
 */
const handleAuthError = (error) => {
  // Force status to 401 for authentication errors
  return createErrorResponse(error, 401);
};

/**
 * Handles authorization errors with 403 status code
 * @function handleAuthorizationError
 * @description Processes authorization errors and returns standardized 403 response
 * @param {Error} error - Authorization error object
 * @returns {Object} Authorization error response with 403 status
 * @example
 * // Handle authorization error
 * const authzError = new Error('Insufficient permissions');
 * const response = handleAuthorizationError(authzError);
 * // Returns: { status: 403, message: 'Insufficient permissions' }
 */
const handleAuthorizationError = (error) => {
  // Force status to 403 for authorization errors
  return createErrorResponse(error, 403);
};

/**
 * Handles not found errors with 404 status code
 * @function handleNotFoundError
 * @description Processes not found errors and returns standardized 404 response
 * @param {Error} error - Not found error object
 * @returns {Object} Not found error response with 404 status
 * @example
 * // Handle not found error
 * const notFoundError = new Error('Resource not found');
 * const response = handleNotFoundError(notFoundError);
 * // Returns: { status: 404, message: 'Resource not found' }
 */
const handleNotFoundError = (error) => {
  // Force status to 404 for not found errors
  return createErrorResponse(error, 404);
};

module.exports = {
  createErrorResponse,
  handleValidationError,
  handleAuthError,
  handleAuthorizationError,
  handleNotFoundError
}; 