/**
 * @fileoverview Unit tests for task routes
 * @module test/unit/routes/taskRoutes
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const Task = require('../../../src/models/Task');
const User = require('../../../src/models/User');

// Mock auth middleware
jest.mock('../../../src/middlewares/authMiddleware', () => {
  return jest.fn((req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011' };
    next();
  });
});

describe('Task Routes', () => {
  let testUser;
  let testTask;
  let token;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();

    // Create test task
    testTask = new Task({
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      userId: testUser._id
    });
    await testTask.save();

    // Generate token
    token = jwt.sign(
      { id: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Update mock to use the actual user ID
    const authMiddleware = require('../../../src/middlewares/authMiddleware');
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { id: testUser._id.toString() };
      next();
    });
  });

  afterEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should handle internal server error during task fetching', async () => {
      // Mock Task.find to throw an error
      const originalFind = Task.find;
      Task.find = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.find = originalFind;
    });

    it('should handle invalid ObjectId conversion', async () => {
      // Mock mongoose.Types.ObjectId.isValid to return false
      const originalIsValid = mongoose.Types.ObjectId.isValid;
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Restore original method
      mongoose.Types.ObjectId.isValid = originalIsValid;
    });
  });

  describe('POST /api/tasks', () => {
    it('should create new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        completed: true
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask)
        .expect(201);

      expect(response.body.title).toBe(newTask.title);
      expect(response.body.description).toBe(newTask.description);
      expect(response.body.completed).toBe(newTask.completed);
    });

    it('should create task with minimal data', async () => {
      const newTask = {
        title: 'Minimal Task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask)
        .expect(201);

      expect(response.body.title).toBe(newTask.title);
      expect(response.body.description).toBe('');
      expect(response.body.completed).toBe(false);
    });

    it('should reject task creation without title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' })
        .expect(400);

      expect(response.body.message).toBe('Title is required');
    });

    it('should handle internal server error during task creation', async () => {
      // Mock Task.save to throw an error
      const originalSave = Task.prototype.save;
      Task.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Task' })
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.prototype.save = originalSave;
    });

    it('should handle internal server error during task fetching', async () => {
      // Mock Task.find to throw an error
      const originalFind = Task.find;
      Task.find = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.find = originalFind;
    });

    it('should handle invalid ObjectId conversion during creation', async () => {
      // Mock mongoose.Types.ObjectId.isValid to return false
      const originalIsValid = mongoose.Types.ObjectId.isValid;
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      const newTask = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask)
        .expect(201);

      expect(response.body.title).toBe(newTask.title);

      // Restore original method
      mongoose.Types.ObjectId.isValid = originalIsValid;
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update existing task', async () => {
      const updates = {
        title: 'Updated Task',
        completed: true
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.completed).toBe(updates.completed);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });

    it('should handle invalid task ID', async () => {
      const response = await request(app)
        .put('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(400);

      expect(response.body.message).toBe('Invalid task ID');
    });

    it('should handle internal server error during task update', async () => {
      // Mock Task.findOne to throw an error
      const originalFindOne = Task.findOne;
      Task.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.findOne = originalFindOne;
    });

    it('should handle CastError during task update', async () => {
      // Mock Task.findOne to throw a CastError
      const originalFindOne = Task.findOne;
      const castError = new Error('Cast to ObjectId failed');
      castError.name = 'CastError';
      Task.findOne = jest.fn().mockRejectedValue(castError);

      const response = await request(app)
        .put('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task' })
        .expect(400);

      expect(response.body.message).toBe('Invalid task ID');

      // Restore original method
      Task.findOne = originalFindOne;
    });

    it('should handle invalid ObjectId conversion during update', async () => {
      // Mock mongoose.Types.ObjectId.isValid to return false
      const originalIsValid = mongoose.Types.ObjectId.isValid;
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      const updates = {
        title: 'Updated Task'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);

      // Restore original method
      mongoose.Types.ObjectId.isValid = originalIsValid;
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete existing task', async () => {
      await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify task was deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });

    it('should handle invalid task ID', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toBe('Invalid task ID');
    });

    it('should handle internal server error during task deletion', async () => {
      // Mock Task.findOneAndDelete to throw an error
      const originalFindOneAndDelete = Task.findOneAndDelete;
      Task.findOneAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.findOneAndDelete = originalFindOneAndDelete;
    });

    it('should handle invalid ObjectId conversion during deletion', async () => {
      // Mock mongoose.Types.ObjectId.isValid to return false
      const originalIsValid = mongoose.Types.ObjectId.isValid;
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      await request(app)
        .delete(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Restore original method
      mongoose.Types.ObjectId.isValid = originalIsValid;
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get specific task by ID', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(testTask._id.toString());
      expect(response.body.title).toBe(testTask.title);
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });

    it('should handle invalid task ID', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toBe('Invalid task ID');
    });

    it('should handle internal server error during task fetch', async () => {
      // Mock Task.findOne to throw an error
      const originalFindOne = Task.findOne;
      Task.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.message).toBe('Internal server error');

      // Restore original method
      Task.findOne = originalFindOne;
    });

    it('should handle invalid ObjectId conversion during fetch', async () => {
      // Mock mongoose.Types.ObjectId.isValid to return false
      const originalIsValid = mongoose.Types.ObjectId.isValid;
      mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(false);

      const response = await request(app)
        .get(`/api/tasks/${testTask._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(testTask._id.toString());

      // Restore original method
      mongoose.Types.ObjectId.isValid = originalIsValid;
    });
  });
}); 