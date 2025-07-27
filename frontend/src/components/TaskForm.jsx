/**
 * @fileoverview Task form component for creating new tasks
 * @module components/TaskForm
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { useState } from 'react'

/**
 * Task form component props type definition
 * @typedef {Object} TaskFormProps
 * @property {Function} onAddTask - Callback function called when a new task is submitted
 */

/**
 * Task form component
 * @function TaskForm
 * @description Renders a form for creating new tasks with title and description fields
 * @param {TaskFormProps} props - Component props
 * @returns {JSX.Element} Task creation form
 * @example
 * // Use TaskForm component
 * <TaskForm onAddTask={handleAddTask} />
 */
function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Handles form submission for creating a new task
   * @function handleSubmit
   * @description Processes form submission and calls onAddTask callback
   * @param {Event} e - Form submission event
   * @returns {Promise<void>} Resolves when task is created
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    try {
      setLoading(true)
      await onAddTask({
        title: title.trim(),
        description: description.trim()
      })
      
      // Reset form after successful submission
      setTitle('')
      setDescription('')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles Enter key press in input fields
   * @function handleKeyPress
   * @description Submits form when Enter key is pressed
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="task-title" className="block text-white font-medium mb-2">
          Task Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter task title..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200"
          required
        />
      </div>

      <div>
        <label htmlFor="task-description" className="block text-white font-medium mb-2">
          Description (Optional)
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter task description..."
          rows="3"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full bg-white text-primary-600 font-semibold py-3 px-6 rounded-xl hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
            Creating Task...
          </div>
        ) : (
          'Create Task'
        )}
      </button>
    </form>
  )
}

export default TaskForm 