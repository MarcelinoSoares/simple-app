/**
 * @fileoverview Task management routes for CRUD operations
 * @module routes/taskRoutes
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authMiddleware);

/**
 * Get all tasks for authenticated user
 * @route GET /api/tasks
 * @description Retrieves all tasks belonging to the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID from JWT token
 * @returns {Object} 200 - Array of user's tasks
 * @returns {Object} 500 - Internal server error
 * @example
 * // GET /api/tasks
 * // Headers: Authorization: Bearer <token>
 * // Response:
 * [
 *   {
 *     "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
 *     "title": "Complete project",
 *     "description": "Finish the task management app",
 *     "completed": false,
 *     "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
 *   }
 * ]
 */
router.get("/", async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Create a new task
 * @route POST /api/tasks
 * @description Creates a new task for the authenticated user
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Task title (required)
 * @param {string} [req.body.description] - Task description (optional)
 * @param {boolean} [req.body.completed=false] - Task completion status
 * @returns {Object} 201 - Created task object
 * @returns {Object} 400 - Missing title
 * @returns {Object} 500 - Internal server error
 * @example
 * // POST /api/tasks
 * // Headers: Authorization: Bearer <token>
 * // Request body:
 * {
 *   "title": "New task",
 *   "description": "Task description",
 *   "completed": false
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, completed = false } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;

    const task = new Task({
      title,
      description: description || "",
      completed: completed || false,
      userId
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Update an existing task
 * @route PUT /api/tasks/:id
 * @description Updates a specific task by ID (only if owned by authenticated user)
 * @param {string} req.params.id - Task ID
 * @param {Object} req.body - Request body
 * @param {string} [req.body.title] - New task title
 * @param {string} [req.body.description] - New task description
 * @param {boolean} [req.body.completed] - New completion status
 * @returns {Object} 200 - Updated task object
 * @returns {Object} 400 - Invalid task ID
 * @returns {Object} 404 - Task not found
 * @returns {Object} 500 - Internal server error
 * @example
 * // PUT /api/tasks/60f7b3b3b3b3b3b3b3b3b3b3
 * // Headers: Authorization: Bearer <token>
 * // Request body:
 * {
 *   "title": "Updated task",
 *   "completed": true
 * }
 */
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const taskId = req.params.id;
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;

    const task = await Task.findOne({ _id: taskId, userId });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 * @description Deletes a specific task by ID (only if owned by authenticated user)
 * @param {string} req.params.id - Task ID
 * @returns {Object} 204 - Task deleted successfully
 * @returns {Object} 400 - Invalid task ID
 * @returns {Object} 404 - Task not found
 * @returns {Object} 500 - Internal server error
 * @example
 * // DELETE /api/tasks/60f7b3b3b3b3b3b3b3b3b3b3
 * // Headers: Authorization: Bearer <token>
 * // Response: 204 No Content
 */
router.delete("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get a specific task by ID
 * @route GET /api/tasks/:id
 * @description Retrieves a specific task by ID (only if owned by authenticated user)
 * @param {string} req.params.id - Task ID
 * @returns {Object} 200 - Task object
 * @returns {Object} 400 - Invalid task ID
 * @returns {Object} 404 - Task not found
 * @returns {Object} 500 - Internal server error
 * @example
 * // GET /api/tasks/60f7b3b3b3b3b3b3b3b3b3b3
 * // Headers: Authorization: Bearer <token>
 * // Response:
 * {
 *   "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
 *   "title": "Complete project",
 *   "description": "Finish the task management app",
 *   "completed": false,
 *   "userId": "60f7b3b3b3b3b3b3b3b3b3b3"
 * }
 */
router.get("/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id) 
      : req.user.id;
    
    const task = await Task.findOne({ _id: taskId, userId });
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router; 