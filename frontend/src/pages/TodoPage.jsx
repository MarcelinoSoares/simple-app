/**
 * @fileoverview Todo page component for task management
 * @module pages/TodoPage
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.js'
import TaskForm from '../components/TaskForm.jsx'
import TaskItem from '../components/TaskItem.jsx'

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
 * Todo page component
 * @function TodoPage
 * @description Main task management page with CRUD operations
 * @returns {JSX.Element} Todo page with task list and management functionality
 * @example
 * // Route to todo page
 * <Route path="/" element={<TodoPage />} />
 */
function TodoPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { logout } = useAuth()

  /**
   * Fetches all tasks from the API
   * @function fetchTasks
   * @description Retrieves all tasks for the authenticated user
   * @returns {Promise<void>} Resolves when tasks are loaded
   * @example
   * // Load tasks on component mount
   * useEffect(() => {
   *   fetchTasks();
   * }, []);
   */
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const fetchedTasks = await getTasks()
      setTasks(fetchedTasks)
      setError('')
    } catch (err) {
      setError('Failed to load tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Adds a new task to the list
   * @function handleAddTask
   * @description Creates a new task and adds it to the local state
   * @param {Object} newTask - New task object
   * @param {string} newTask.title - Task title
   * @param {string} newTask.description - Task description
   * @returns {Promise<void>} Resolves when task is created
   * @example
   * // Add new task
   * await handleAddTask({
   *   title: 'New Task',
   *   description: 'Task description'
   * });
   */
  const handleAddTask = async (newTask) => {
    try {
      const createdTask = await createTask(newTask)
      setTasks(prev => [...prev, createdTask])
      setError('')
    } catch (err) {
      setError('Failed to create task')
      console.error('Error creating task:', err)
    }
  }

  /**
   * Updates an existing task
   * @function handleUpdateTask
   * @description Updates a task and refreshes the local state
   * @param {string} taskId - ID of the task to update
   * @param {Object} updatedData - Updated task data
   * @returns {Promise<void>} Resolves when task is updated
   * @example
   * // Update task completion status
   * await handleUpdateTask(taskId, { completed: true });
   */
  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const updatedTask = await updateTask(taskId, updatedData)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ))
      setError('')
    } catch (err) {
      setError('Failed to update task')
      console.error('Error updating task:', err)
    }
  }

  /**
   * Deletes a task from the list
   * @function handleDeleteTask
   * @description Removes a task from the API and local state
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise<void>} Resolves when task is deleted
   * @example
   * // Delete task
   * await handleDeleteTask(taskId);
   */
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(task => task._id !== taskId))
      setError('')
    } catch (err) {
      setError('Failed to delete task')
      console.error('Error deleting task:', err)
    }
  }

  /**
   * Toggles the completion status of a task
   * @function handleToggleComplete
   * @description Updates task completion status
   * @param {string} taskId - ID of the task to toggle
   * @param {boolean} completed - New completion status
   * @returns {Promise<void>} Resolves when task is updated
   * @example
   * // Toggle task completion
   * await handleToggleComplete(taskId, !task.completed);
   */
  const handleToggleComplete = async (taskId, completed) => {
    await handleUpdateTask(taskId, { completed })
  }

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-secondary-500 to-primary-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white font-display font-bold text-4xl mb-2">Task Manager</h1>
            <p className="text-white/80 font-medium">Organize your tasks efficiently</p>
          </div>
          <button
            onClick={logout}
            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-glow"
          >
            Logout
          </button>
        </div>

        {/* Task Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20 shadow-glow">
          <TaskForm onAddTask={handleAddTask} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Task List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-glow">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/80">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-white/80 font-medium">No tasks yet</p>
              <p className="text-white/60 text-sm">Create your first task above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TodoPage 