const {
  createErrorResponse,
  handleValidationError,
  handleAuthError,
  handleAuthorizationError,
  handleNotFoundError
} = require('../../../src/utils/errorHandler');

describe('Error Handler Utils', () => {
  describe('createErrorResponse', () => {
    it('should create error response with default status', () => {
      const error = new Error('Test error');
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('status', 500);
      expect(response).toHaveProperty('message', 'Test error');
    });

    it('should create error response with custom status', () => {
      const error = new Error('Custom error');
      error.status = 422;
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('status', 422);
      expect(response).toHaveProperty('message', 'Custom error');
    });

    it('should create error response with statusCode property', () => {
      const error = new Error('Status code error');
      error.statusCode = 409;
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('status', 409);
      expect(response).toHaveProperty('message', 'Status code error');
    });

    it('should use default message when error has no message', () => {
      const error = {};
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('status', 500);
      expect(response).toHaveProperty('message', 'Internal Server Error');
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Development error');
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('stack');
      expect(response.stack).toBe(error.stack);

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      const response = createErrorResponse(error);

      expect(response).not.toHaveProperty('stack');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should prioritize status over statusCode', () => {
      const error = new Error('Priority test');
      error.status = 400;
      error.statusCode = 500;
      const response = createErrorResponse(error);

      expect(response).toHaveProperty('status', 400);
    });
  });

  describe('handleValidationError', () => {
    it('should return 400 status for validation errors', () => {
      const error = new Error('Validation failed');
      const response = handleValidationError(error);

      expect(response).toHaveProperty('status', 400);
      expect(response).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('handleAuthError', () => {
    it('should return 401 status for authentication errors', () => {
      const error = new Error('Authentication failed');
      const response = handleAuthError(error);

      expect(response).toHaveProperty('status', 401);
      expect(response).toHaveProperty('message', 'Authentication failed');
    });
  });

  describe('handleAuthorizationError', () => {
    it('should return 403 status for authorization errors', () => {
      const error = new Error('Access denied');
      const response = handleAuthorizationError(error);

      expect(response).toHaveProperty('status', 403);
      expect(response).toHaveProperty('message', 'Access denied');
    });
  });

  describe('handleNotFoundError', () => {
    it('should return 404 status for not found errors', () => {
      const error = new Error('Resource not found');
      const response = handleNotFoundError(error);

      expect(response).toHaveProperty('status', 404);
      expect(response).toHaveProperty('message', 'Resource not found');
    });
  });
}); 