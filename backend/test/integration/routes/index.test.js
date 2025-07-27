const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Task = require('../../../src/models/Task');
const jwt = require('jsonwebtoken');

describe('Integration Tests - Complete Coverage', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      email: 'test@example.com',
      password: '123456'
    });
    userId = user._id;

    // Generate token
    token = jwt.sign(
      { id: userId.toString(), email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  });

  describe('Authentication Routes', () => {
    describe('POST /api/auth/login', () => {
      it('should login with existing user', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: '123456'
          });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
      });

      it('should reject login with non-existent user', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: '123456'
          });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should return 400 when email is missing', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ password: '123456' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email and password are required');
      });

      it('should return 400 when password is missing', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email and password are required');
      });

      it('should return 400 when both email and password are missing', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'Email and password are required');
      });

      it('should return 401 with wrong password for existing user', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });
    });

    describe('POST /api/auth/register', () => {
      it('should create new user successfully', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'newuser@example.com',
            password: 'newpassword'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');

        // Verify user was created
        const createdUser = await User.findOne({ email: 'newuser@example.com' });
        expect(createdUser).toBeTruthy();
        expect(createdUser.password).toBe('newpassword');
      });

      it('should reject registration for existing user', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password: 'newpassword'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
      });
    });
  });

  describe('Task Routes - Extended Coverage', () => {
    describe('GET /api/tasks', () => {
      it('should return user\'s tasks with all properties', async () => {
        // Create a task for the user
        const task = await Task.create({
          title: 'Test Task',
          description: 'Test Description',
          completed: false,
          userId: userId
        });

        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('_id', task._id.toString());
        expect(res.body[0]).toHaveProperty('title', 'Test Task');
        expect(res.body[0]).toHaveProperty('description', 'Test Description');
        expect(res.body[0]).toHaveProperty('completed', false);
        expect(res.body[0]).toHaveProperty('userId', userId.toString());
      });

      it('should return 401 with malformed authorization header', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', 'InvalidFormat token123');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should return 401 with empty authorization header', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', '');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
      });
    });

    describe('POST /api/tasks', () => {
      it('should create task with all properties', async () => {
        const taskData = {
          title: 'Complete Task',
          description: 'Complete description',
          completed: true
        };

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(taskData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'Complete Task');
        expect(res.body).toHaveProperty('description', 'Complete description');
        expect(res.body).toHaveProperty('completed', true);
        expect(res.body).toHaveProperty('userId', userId.toString());
      });

      it('should create task with only title', async () => {
        const taskData = { title: 'Title Only Task' };

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(taskData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'Title Only Task');
        expect(res.body).toHaveProperty('userId', userId.toString());
        expect(res.body).toHaveProperty('completed', false);
        expect(res.body).toHaveProperty('description', '');
      });

      it('should return 401 with expired token', async () => {
        const expiredToken = jwt.sign(
          { id: userId.toString(), email: 'test@example.com' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '0s' }
        );

        // Wait a bit to ensure token is expired
        await new Promise(resolve => setTimeout(resolve, 100));

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ title: 'Test Task' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Token expired');
      });
    });

    describe('PUT /api/tasks/:id', () => {
      it('should update task with partial data', async () => {
        // Create a task first
        const task = await Task.create({
          title: 'Original Task',
          description: 'Original description',
          completed: false,
          userId: userId
        });

        const res = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ title: 'Updated Title Only' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Title Only');
        expect(res.body).toHaveProperty('description', 'Original description');
        expect(res.body).toHaveProperty('completed', false);
      });

      it('should return 401 with token without user id', async () => {
        const invalidToken = jwt.sign(
          { email: 'test@example.com' }, // Missing id
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        const res = await request(app)
          .put('/api/tasks/507f1f77bcf86cd799439011')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({ title: 'Updated Task' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid token: missing user id');
      });
    });

    describe('DELETE /api/tasks/:id', () => {
      it('should return 401 with token without user id', async () => {
        const invalidToken = jwt.sign(
          { email: 'test@example.com' }, // Missing id
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        const res = await request(app)
          .delete('/api/tasks/507f1f77bcf86cd799439011')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid token: missing user id');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('CORS and Middleware', () => {
    it('should handle OPTIONS requests for CORS', async () => {
      const res = await request(app)
        .options('/api/tasks')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'authorization');

      expect(res.statusCode).toBe(204);
    });

    it('should handle requests with different content types', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send({ title: 'Test Task' });

      expect(res.statusCode).toBe(201);
    });
  });
}); 