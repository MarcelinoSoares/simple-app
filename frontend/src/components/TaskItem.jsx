/**
 * @fileoverview Task item component for displaying and managing individual tasks
 * @module components/TaskItem
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { useState } from 'react'

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
 * TaskItem component props type definition
 * @typedef {Object} TaskItemProps
 * @property {Task} task - Task object to display
 * @property {Function} onUpdate - Callback function for updating task
 * @property {Function} onDelete - Callback function for deleting task
 * @property {Function} onToggleComplete - Callback function for toggling completion
 */

/**
 * Task item component
 * @function TaskItem
 * @description Renders an individual task with edit, delete, and completion toggle functionality
 * @param {TaskItemProps} props - Component props
 * @returns {JSX.Element} Task item with management controls
 * @example
 * // Use TaskItem component
 * <TaskItem
 *   task={taskObject}
 *   onUpdate={handleUpdateTask}
 *   onDelete={handleDeleteTask}
 *   onToggleComplete={handleToggleComplete}
 * />
 */
function TaskItem({ task, onUpdate, onDelete, onToggleComplete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [loading, setLoading] = useState(false)

  /**
   * Handles saving task edits
   * @function handleSave
   * @description Saves edited task data and exits edit mode
   * @returns {Promise<void>} Resolves when task is updated
   */
  const handleSave = async () => {
    if (!editTitle.trim()) return
    
    try {
      setLoading(true)
      await onUpdate(task._id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles canceling task edits
   * @function handleCancel
   * @description Cancels edit mode and resets form fields
   * @returns {void}
   */
  const handleCancel = () => {
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setIsEditing(false)
  }

  /**
   * Handles task deletion
   * @function handleDelete
   * @description Deletes the task after confirmation
   * @returns {Promise<void>} Resolves when task is deleted
   */
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true)
        await onDelete(task._id)
      } catch (error) {
        console.error('Error deleting task:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  /**
   * Handles completion status toggle
   * @function handleToggleComplete
   * @description Toggles the completion status of the task
   * @returns {Promise<void>} Resolves when task is updated
   */
  const handleToggleComplete = async () => {
    try {
      await onToggleComplete(task._id, !task.completed)
    } catch (error) {
      console.error('Error toggling task completion:', error)
    }
  }

  /**
   * Handles Enter key press in edit mode
   * @function handleKeyPress
   * @description Saves task when Enter is pressed in edit mode
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 transition-all duration-200 ${task.completed ? 'opacity-75' : ''}`}>
      {isEditing ? (
        // Edit mode
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent resize-none"
            placeholder="Task description (optional)"
            rows="2"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading || !editTitle.trim()}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 ${
              task.completed
                ? 'bg-green-500 border-green-500'
                : 'border-white/40 hover:border-white/60'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {task.completed && (
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-white font-medium ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-white/80 text-sm mt-1 ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskItem 