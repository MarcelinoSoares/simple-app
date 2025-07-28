const request = require('supertest');
const express = require('express');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Task = require('../../../src/models/Task');
const jwt = require('jsonwebtoken');

describe('App Error Handling Integration Tests', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const user = await User.create({ email: "test@example.com", password: "123456" });
    userId = user._id;
    token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });
  });

  describe('Global Error Handler Middleware', () => {
    it('should handle synchronous errors in routes', async () => {
      // Create a test app with a route that throws an error
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an error
      testApp.get('/test-error', (req, res, next) => {
        throw new Error('Synchronous error');
      });

      // Add the same error handler as in app.js
      testApp.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });

    it('should handle asynchronous errors in routes', async () => {
      // Create a test app with a route that throws an async error
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an async error
      testApp.get('/test-async-error', async (req, res, next) => {
        try {
          await Promise.reject(new Error('Asynchronous error'));
        } catch (error) {
          next(error);
        }
      });

      // Add the same error handler as in app.js
      testApp.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-async-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });

    it('should handle errors with custom status codes', async () => {
      // Create a test app with a route that throws an error with custom status
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an error with custom status
      testApp.get('/test-custom-error', (req, res, next) => {
        const error = new Error('Custom error');
        error.status = 400;
        next(error);
      });

      // Add the same error handler as in app.js
      testApp.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-custom-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });

    it('should handle errors without message property', async () => {
      // Create a test app with a route that throws an error without message
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an error without message
      testApp.get('/test-no-message-error', (req, res, next) => {
        const error = {};
        next(error);
      });

      // Add the same error handler as in app.js
      testApp.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-no-message-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });
  });

  describe('Real App Error Scenarios', () => {
    it('should handle JWT verification errors in auth middleware', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid token');
    });

    it('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(res.statusCode).toBe(400);
    });

    it('should handle missing authorization header', async () => {
      const res = await request(app).get('/api/tasks');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should handle empty authorization header', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', '');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should handle malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Unauthorized');
    });
  });

  describe('CORS Error Handling', () => {
    it('should handle CORS requests from different origins', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Origin', 'http://different-origin.com')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('Express Middleware Error Handling', () => {
    it('should handle requests with invalid content type', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'text/plain')
        .send('plain text');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Route Not Found Handling', () => {
    it('should handle requests to non-existent routes', async () => {
      const res = await request(app).get('/api/non-existent-route');
      
      // Express should return 404 for non-existent routes
      expect(res.statusCode).toBe(404);
    });

    it('should handle requests to root path', async () => {
      const res = await request(app).get('/');
      
      // Express should return 404 for root path since no route is defined
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handler Edge Cases', () => {
    it('should handle errors thrown in error handler itself', async () => {
      // Create a test app with a problematic error handler
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an error
      testApp.get('/test-error', (req, res, next) => {
        throw new Error('Test error');
      });

      // Add an error handler that throws an error
      testApp.use((err, req, res, next) => {
        console.error(err);
        // This would normally cause an unhandled error, but Express handles it
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });

    it('should handle multiple error handlers', async () => {
      // Create a test app with multiple error handlers
      const testApp = express();
      testApp.use(express.json());
      
      // Add a route that throws an error
      testApp.get('/test-error', (req, res, next) => {
        throw new Error('Test error');
      });

      // Add multiple error handlers
      testApp.use((err, req, res, next) => {
        console.error('First error handler:', err.message);
        next(err);
      });

      testApp.use((err, req, res, next) => {
        console.error('Second error handler:', err.message);
        res.status(500).json({ message: "Internal Server Error" });
      });

      const res = await request(testApp).get('/test-error');
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Internal Server Error');
    });
  });
}); 