/**
 * @fileoverview Task model schema and methods for task management
 * @module models/Task
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const mongoose = require("mongoose");

/**
 * Task schema definition
 * @typedef {Object} TaskSchema
 * @property {string} title - Task title (required)
 * @property {string} description - Task description (optional)
 * @property {boolean} completed - Task completion status (default: false)
 * @property {ObjectId} userId - Reference to the user who owns the task (required)
 * @property {Date} createdAt - Timestamp when task was created
 * @property {Date} updatedAt - Timestamp when task was last updated
 */
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  completed: {
    type: Boolean,
    default: false
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

/**
 * Task model
 * @class Task
 * @extends mongoose.Model
 * @description Mongoose model for task management and CRUD operations
 * @example
 * // Create a new task
 * const task = new Task({
 *   title: 'Complete project',
 *   description: 'Finish the task management app',
 *   completed: false,
 *   userId: userObjectId
 * });
 * await task.save();
 * 
 * // Find tasks by user
 * const tasks = await Task.find({ userId: userObjectId });
 * 
 * // Update task completion status
 * await Task.findByIdAndUpdate(taskId, { completed: true });
 */
module.exports = mongoose.model("Task", taskSchema); 