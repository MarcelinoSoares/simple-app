/**
 * @fileoverview Unit tests for app.js
 * @module test/unit/app
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const request = require('supertest');
const app = require('../../src/app');

describe('Express App', () => {
  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/undefined-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should return 404 for POST to undefined routes', async () => {
      const response = await request(app)
        .post('/undefined-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should return 404 for PUT to undefined routes', async () => {
      const response = await request(app)
        .put('/undefined-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should return 404 for DELETE to undefined routes', async () => {
      const response = await request(app)
        .delete('/undefined-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });

  describe('Global Error Handler', () => {
    it('should handle JSON parsing errors with statusCode 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid JSON format');
    });

    it('should handle JSON parsing errors without statusCode 400', () => {
      const error = new Error('JSON parsing failed');
      error.type = 'entity.parse.failed';
      // No statusCode property

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('should handle JsonWebTokenError', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should handle JSON parsing errors with different statusCode', () => {
      const error = new Error('JSON parsing failed');
      error.type = 'entity.parse.failed';
      error.statusCode = 422; // Different status code

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation failed')
      error.name = 'ValidationError'

      const req = {}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const next = jest.fn()

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' })
    })

    it('should handle TokenExpiredError', () => {
      const error = new Error('Token expired')
      error.name = 'TokenExpiredError'

      const req = {}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const next = jest.fn()

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' })
    })

    it('should handle general errors with custom status', () => {
      const error = new Error('Custom error')
      error.status = 422

      const req = {}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const next = jest.fn()

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({ message: 'Custom error' })
    })

    it('should handle general errors without custom status', () => {
      const error = new Error('General error')
      // No status property

      const req = {}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const next = jest.fn()

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ message: 'General error' })
    })

    it('should handle errors without message', () => {
      const error = new Error()
      // No message property

      const req = {}
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      }
      const next = jest.fn()

      app._router.stack[app._router.stack.length - 1].handle(error, req, res, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' })
    })
  });

  describe('CORS Configuration', () => {
    it('should allow requests from configured origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should use default origin when FRONTEND_URL is not set', async () => {
      const originalFrontendUrl = process.env.FRONTEND_URL;
      delete process.env.FRONTEND_URL;

      const testApp = require('../../src/app');
      
      const response = await request(testApp)
        .get('/health')
        .set('Origin', 'http://localhost:5173')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');

      // Restore original environment variable
      if (originalFrontendUrl) {
        process.env.FRONTEND_URL = originalFrontendUrl;
      }
    });
  });

  describe('Body Parser Configuration', () => {
    it('should parse JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email: 'test@example.com', password: 'password' })
        .expect(401); // Will fail authentication but proves JSON parsing works

      expect(response.body).toHaveProperty('message');
    });

    it('should parse URL encoded requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=test@example.com&password=password')
        .expect(401); // Will fail authentication but proves URL encoding parsing works

      expect(response.body).toHaveProperty('message');
    });

    it('should parse complex URL encoded requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=test%40example.com&password=password%20123&remember=true')
        .expect(401); // Will fail authentication but proves URL encoding parsing works

      expect(response.body).toHaveProperty('message');
    });
  });
}); 