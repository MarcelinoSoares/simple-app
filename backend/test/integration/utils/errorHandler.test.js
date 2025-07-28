const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Task = require('../../../src/models/Task');
const jwt = require('jsonwebtoken');
const {
  createErrorResponse,
  handleValidationError,
  handleAuthError,
  handleAuthorizationError,
  handleNotFoundError
} = require('../../../src/utils/errorHandler');

describe('Error Handler Integration Tests', () => {
  let token;
  let userId;
  let testEmail;

  beforeEach(async () => {
    // Generate unique email for each test
    testEmail = `test${Date.now()}@example.com`;
    
    const user = await User.create({ email: testEmail, password: "123456" });
    userId = user._id;
    token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });
  });

  describe('Error Handler Utility Functions', () => {
    describe('createErrorResponse', () => {
      it('should create error response with default status', () => {
        const error = new Error('Test error');
        const response = createErrorResponse(error);
        
        expect(response).toHaveProperty('status', 500);
        expect(response).toHaveProperty('message', 'Test error');
      });

      it('should create error response with custom status', () => {
        const error = new Error('Custom error');
        error.status = 400;
        const response = createErrorResponse(error);
        
        expect(response).toHaveProperty('status', 400);
        expect(response).toHaveProperty('message', 'Custom error');
      });

      it('should create error response with statusCode property', () => {
        const error = new Error('Status code error');
        error.statusCode = 404;
        const response = createErrorResponse(error);
        
        expect(response).toHaveProperty('status', 404);
        expect(response).toHaveProperty('message', 'Status code error');
      });

      it('should include stack trace in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const error = new Error('Development error');
        const response = createErrorResponse(error);
        
        expect(response).toHaveProperty('stack');
        expect(response.stack).toBe(error.stack);
        
        process.env.NODE_ENV = originalEnv;
      });

      it('should not include stack trace in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const error = new Error('Production error');
        const response = createErrorResponse(error);
        
        expect(response).not.toHaveProperty('stack');
        
        process.env.NODE_ENV = originalEnv;
      });

      it('should use default message when error has no message', () => {
        const error = {};
        const response = createErrorResponse(error);
        
        expect(response).toHaveProperty('message', 'Internal Server Error');
      });
    });

    describe('handleValidationError', () => {
      it('should handle validation error with 400 status', () => {
        const error = new Error('Validation failed');
        const response = handleValidationError(error);
        
        expect(response).toHaveProperty('status', 400);
        expect(response).toHaveProperty('message', 'Validation failed');
      });
    });

    describe('handleAuthError', () => {
      it('should handle authentication error with 401 status', () => {
        const error = new Error('Authentication failed');
        const response = handleAuthError(error);
        
        expect(response).toHaveProperty('status', 401);
        expect(response).toHaveProperty('message', 'Authentication failed');
      });
    });

    describe('handleAuthorizationError', () => {
      it('should handle authorization error with 403 status', () => {
        const error = new Error('Authorization failed');
        const response = handleAuthorizationError(error);
        
        expect(response).toHaveProperty('status', 403);
        expect(response).toHaveProperty('message', 'Authorization failed');
      });
    });

    describe('handleNotFoundError', () => {
      it('should handle not found error with 404 status', () => {
        const error = new Error('Resource not found');
        const response = handleNotFoundError(error);
        
        expect(response).toHaveProperty('status', 404);
        expect(response).toHaveProperty('message', 'Resource not found');
      });
    });
  });

  describe('Error Handler Edge Cases', () => {
    it('should handle errors with null or undefined properties', () => {
      const error = { message: null, status: undefined };
      const response = createErrorResponse(error);
      
      expect(response).toHaveProperty('status', 500);
      expect(response).toHaveProperty('message', 'Internal Server Error');
    });

    it('should handle errors with custom properties', () => {
      const error = new Error('Custom error');
      error.customProperty = 'custom value';
      const response = createErrorResponse(error);
      
      expect(response).toHaveProperty('status', 500);
      expect(response).toHaveProperty('message', 'Custom error');
    });

    it('should handle errors with status 0', () => {
      const error = new Error('Zero status error');
      error.status = 0;
      const response = createErrorResponse(error);
      
      expect(response).toHaveProperty('status', 0);
      expect(response).toHaveProperty('message', 'Zero status error');
    });
  });
}); 