const request = require('supertest');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Task = require('../../../src/models/Task');
const jwt = require('jsonwebtoken');

describe('Integration Tests - Complete Coverage', () => {
  let token;
  let userId;
  let testEmail;

  beforeEach(async () => {
    // Generate unique email for each test using timestamp + random
    testEmail = `test${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`;
    
    // Create a test user
    const user = await User.create({
      email: testEmail,
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
            email: testEmail,
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
          .send({ email: testEmail });

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
            email: testEmail,
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
      });

      it('should reject registration for existing user', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            email: testEmail,
            password: '123456'
          });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
      });
    });
  });

  describe('Task Routes - Extended Coverage', () => {
    describe('GET /api/tasks', () => {
      it('should return user\'s tasks with all properties', async () => {
        // Create test tasks
        await Task.create([
          { title: 'Task 1', description: 'Description 1', userId },
          { title: 'Task 2', description: 'Description 2', userId }
        ]);

        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
        
        // Check that both tasks exist (order may vary)
        const taskTitles = res.body.map(task => task.title);
        expect(taskTitles).toContain('Task 1');
        expect(taskTitles).toContain('Task 2');
      });

      it('should return 401 with malformed authorization header', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', 'InvalidToken');

        expect(res.statusCode).toBe(401);
      });

      it('should return 401 with empty authorization header', async () => {
        const res = await request(app)
          .get('/api/tasks')
          .set('Authorization', '');

        expect(res.statusCode).toBe(401);
      });
    });

    describe('POST /api/tasks', () => {
      it('should create task with all properties', async () => {
        const taskData = {
          title: 'New Task',
          description: 'Task description',
          completed: false
        };

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(taskData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'New Task');
        expect(res.body).toHaveProperty('description', 'Task description');
        expect(res.body).toHaveProperty('completed', false);
      });

      it('should create task with only title', async () => {
        const taskData = { title: 'Simple Task' };

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(taskData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title', 'Simple Task');
      });

      it('should return 401 with expired token', async () => {
        const expiredToken = jwt.sign(
          { id: userId.toString(), email: testEmail },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '-1h' }
        );

        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send({ title: 'Test Task' });

        expect(res.statusCode).toBe(401);
      });
    });

    describe('PUT /api/tasks/:id', () => {
      it('should update task with partial data', async () => {
        const task = await Task.create({
          title: 'Original Task',
          description: 'Original description',
          userId
        });

        const updateData = { title: 'Updated Task' };

        const res = await request(app)
          .put(`/api/tasks/${task._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Task');
        expect(res.body).toHaveProperty('description', 'Original description');
      });

      it('should return 401 with token without user id', async () => {
        const invalidToken = jwt.sign(
          { email: testEmail },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        const res = await request(app)
          .put('/api/tasks/123')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({ title: 'Updated Task' });

        expect(res.statusCode).toBe(401);
      });
    });

    describe('DELETE /api/tasks/:id', () => {
      it('should return 401 with token without user id', async () => {
        const invalidToken = jwt.sign(
          { email: testEmail },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '1h' }
        );

        const res = await request(app)
          .delete('/api/tasks/123')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(res.statusCode).toBe(401);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(res.statusCode).toBe(400);
    });
  });

  describe('CORS and Middleware', () => {
    it('should handle OPTIONS requests for CORS', async () => {
      const res = await request(app)
        .options('/api/tasks')
        .set('Origin', 'http://localhost:3000');

      expect(res.statusCode).toBe(204);
    });

    it('should handle requests with different content types', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'text/plain')
        .send('plain text');

      expect(res.statusCode).toBe(400);
    });
  });
}); 