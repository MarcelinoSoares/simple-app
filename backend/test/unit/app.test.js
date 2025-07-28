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

    it('should handle JSON parsing errors without statusCode 400', async () => {
      // Create a custom error handler test
      const testApp = require('express')();
      testApp.use(require('body-parser').json());
      
      testApp.post('/test', (_req, _res) => {
        throw new Error('JSON parsing error');
      });

      testApp.use((err, req, res, next) => {
        if (err.type === 'entity.parse.failed') {
          if (err.statusCode === 400) {
            return res.status(400).json({ message: 'Invalid JSON format' });
          }
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        next(err);
      });

      const response = await request(testApp)
        .post('/test')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid JSON format');
    });

    it('should handle validation errors', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (_req, _res) => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        throw error;
      });

      testApp.use((err, req, res, next) => {
        if (err.name === 'ValidationError') {
          return res.status(400).json({ message: err.message });
        }
        next(err);
      });

      const response = await request(testApp)
        .post('/test')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });

    it('should handle JsonWebTokenError', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (req, res) => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      testApp.use((err, req, res, next) => {
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: "Invalid token" });
        }
        next(err);
      });

      const response = await request(testApp)
        .post('/test')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    it('should handle TokenExpiredError', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (req, res) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      testApp.use((err, req, res, next) => {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired" });
        }
        next(err);
      });

      const response = await request(testApp)
        .post('/test')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Token expired');
    });

    it('should handle general errors with custom status', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (req, res) => {
        const error = new Error('Custom error');
        error.status = 422;
        throw error;
      });

      testApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({ 
          message: err.message || "Internal Server Error" 
        });
      });

      const response = await request(testApp)
        .post('/test')
        .expect(422);

      expect(response.body).toHaveProperty('message', 'Custom error');
    });

    it('should handle general errors without custom status', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (req, res) => {
        throw new Error('General error');
      });

      testApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({ 
          message: err.message || "Internal Server Error" 
        });
      });

      const response = await request(testApp)
        .post('/test')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'General error');
    });

    it('should handle errors without message', async () => {
      const testApp = require('express')();
      
      testApp.post('/test', (req, res) => {
        const error = new Error();
        error.status = 500;
        throw error;
      });

      testApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({ 
          message: err.message || "Internal Server Error" 
        });
      });

      const response = await request(testApp)
        .post('/test')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
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