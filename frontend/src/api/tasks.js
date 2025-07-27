/**
 * @fileoverview Tasks API functions for CRUD operations
 * @module api/tasks
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import api from './auth.js'

/**
 * Task object type definition
 * @typedef {Object} Task
 * @property {string} _id - Unique task identifier
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {boolean} completed - Task completion status
 * @property {string} userId - User ID who owns the task
 * @property {Date} createdAt - Task creation timestamp
 * @property {Date} updatedAt - Task last update timestamp
 */

/**
 * New task object type definition
 * @typedef {Object} NewTask
 * @property {string} title - Task title (required)
 * @property {string} [description] - Task description (optional)
 * @property {boolean} [completed=false] - Task completion status (optional)
 */

/**
 * Task update object type definition
 * @typedef {Object} TaskUpdate
 * @property {string} [title] - New task title (optional)
 * @property {string} [description] - New task description (optional)
 * @property {boolean} [completed] - New completion status (optional)
 */

/**
 * Retrieves all tasks for the authenticated user
 * @function getTasks
 * @description Fetches all tasks belonging to the current user
 * @returns {Promise<Task[]>} Array of user's tasks
 * @throws {Error} When API request fails
 * @example
 * // Get all tasks
 * try {
 *   const tasks = await getTasks();
 *   console.log('Tasks loaded:', tasks);
 * } catch (error) {
 *   console.error('Failed to load tasks:', error.message);
 * }
 */
export const getTasks = async () => {
  try {
    const response = await api.get('/tasks')
    return response.data
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to load tasks')
  }
}

/**
 * Creates a new task
 * @function createTask
 * @description Creates a new task for the authenticated user
 * @param {NewTask} taskData - Task data to create
 * @returns {Promise<Task>} Created task object
 * @throws {Error} When task creation fails
 * @example
 * // Create a new task
 * try {
 *   const newTask = await createTask({
 *     title: 'Complete project',
 *     description: 'Finish the task management app',
 *     completed: false
 *   });
 *   console.log('Task created:', newTask);
 * } catch (error) {
 *   console.error('Failed to create task:', error.message);
 * }
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData)
    return response.data
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to create task')
  }
}

/**
 * Updates an existing task
 * @function updateTask
 * @description Updates a specific task by ID
 * @param {string} taskId - ID of the task to update
 * @param {TaskUpdate} updateData - Updated task data
 * @returns {Promise<Task>} Updated task object
 * @throws {Error} When task update fails
 * @example
 * // Update task completion status
 * try {
 *   const updatedTask = await updateTask(taskId, { completed: true });
 *   console.log('Task updated:', updatedTask);
 * } catch (error) {
 *   console.error('Failed to update task:', error.message);
 * }
 * 
 * // Update task title and description
 * try {
 *   const updatedTask = await updateTask(taskId, {
 *     title: 'Updated title',
 *     description: 'Updated description'
 *   });
 *   console.log('Task updated:', updatedTask);
 * } catch (error) {
 *   console.error('Failed to update task:', error.message);
 * }
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, updateData)
    return response.data
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to update task')
  }
}

/**
 * Deletes a task
 * @function deleteTask
 * @description Deletes a specific task by ID
 * @param {string} taskId - ID of the task to delete
 * @returns {Promise<void>} Resolves when task is deleted
 * @throws {Error} When task deletion fails
 * @example
 * // Delete a task
 * try {
 *   await deleteTask(taskId);
 *   console.log('Task deleted successfully');
 * } catch (error) {
 *   console.error('Failed to delete task:', error.message);
 * }
 */
export const deleteTask = async (taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`)
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to delete task')
  }
}

/**
 * Retrieves a specific task by ID
 * @function getTask
 * @description Fetches a single task by its ID
 * @param {string} taskId - ID of the task to retrieve
 * @returns {Promise<Task>} Task object
 * @throws {Error} When task retrieval fails
 * @example
 * // Get a specific task
 * try {
 *   const task = await getTask(taskId);
 *   console.log('Task details:', task);
 * } catch (error) {
 *   console.error('Failed to get task:', error.message);
 * }
 */
export const getTask = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Failed to get task')
  }
} 