import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskItem from '../../../src/components/TaskItem'

describe('TaskItem Component', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false
  }

  const mockOnToggleComplete = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.confirm mock
    global.window.confirm = vi.fn(() => true)
  })

  it('should render task item with correct content', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-task-1')).toBeInTheDocument()
  })

  it('should show unchecked checkbox for incomplete task', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    expect(checkbox).toBeInTheDocument()
  })

  it('should show checked checkbox for completed task', () => {
    const completedTask = { ...mockTask, completed: true }
    
    render(
      <TaskItem 
        task={completedTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    expect(checkbox).toBeInTheDocument()
  })

  it('should call onToggleComplete when checkbox is clicked', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    fireEvent.click(checkbox)

    expect(mockOnToggleComplete).toHaveBeenCalledWith('1', true)
  })

  it('should call onDelete when delete button is clicked', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const deleteButton = screen.getByTestId('delete-task-1')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should not call onDelete when user cancels confirmation', async () => {
    global.window.confirm = vi.fn(() => false)
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const deleteButton = screen.getByTestId('delete-task-1')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('should have correct data-testid attributes', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-title-1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-task-1')).toBeInTheDocument()
  })

  it('should apply completed class when task is completed', () => {
    const completedTask = { ...mockTask, completed: true }
    
    render(
      <TaskItem 
        task={completedTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const taskTitle = screen.getByTestId('task-title-1')
    expect(taskTitle).toHaveClass('line-through')
  })

  it('should not apply completed class when task is incomplete', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const taskTitle = screen.getByTestId('task-title-1')
    expect(taskTitle).not.toHaveClass('line-through')
  })

  it('should enter edit mode when edit button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Should show edit form
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should save task when save button is clicked', async () => {
    mockOnUpdate.mockResolvedValueOnce()
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Click save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        title: 'Test Task',
        description: 'Test Description'
      })
    })
  })

  it('should cancel edit mode when cancel button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Click cancel
    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    // Should exit edit mode
    expect(screen.queryByDisplayValue('Test Task')).not.toBeInTheDocument()
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('should not save task when title is empty', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Clear title
    const titleInput = screen.getByDisplayValue('Test Task')
    fireEvent.change(titleInput, { target: { value: '' } })

    // Try to save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('should handle task with no description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined }
    
    render(
      <TaskItem 
        task={taskWithoutDescription} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('should handle error when updating task', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockOnUpdate.mockRejectedValueOnce(new Error('Update failed'))
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    // Try to save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating task:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('should handle Enter key press to save task', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    // Press Enter on title input
    const titleInput = screen.getByPlaceholderText('Task title')
    fireEvent.keyDown(titleInput, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTask._id, {
        title: mockTask.title,
        description: mockTask.description
      })
    })
  })

  it('should handle Enter key press on description textarea', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    // Press Enter on description textarea
    const descriptionTextarea = screen.getByPlaceholderText('Task description (optional)')
    fireEvent.keyDown(descriptionTextarea, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith(mockTask._id, {
        title: mockTask.title,
        description: mockTask.description
      })
    })
  })

  it('should not save on Shift+Enter key press', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    // Press Shift+Enter on title input
    const titleInput = screen.getByPlaceholderText('Task title')
    fireEvent.keyDown(titleInput, { key: 'Enter', code: 'Enter', shiftKey: true })
    
    // Should not call onUpdate
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('should not save on Enter when title is empty', async () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )
    
    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)
    
    // Clear the title
    const titleInput = screen.getByPlaceholderText('Task title')
    fireEvent.change(titleInput, { target: { value: '' } })
    
    // Press Enter on empty title input
    fireEvent.keyDown(titleInput, { key: 'Enter', code: 'Enter' })
    
    // Should not call onUpdate
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

  it('should not delete task when user cancels confirmation', async () => {
    // Mock window.confirm to return false (user cancels)
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => false)

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Click delete button
    const deleteButton = screen.getByTitle('Delete task')
    fireEvent.click(deleteButton)

    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')

    // Should not call onDelete since user cancelled
    expect(mockOnDelete).not.toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('should not save when title is empty in handleSave function', async () => {
    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Clear the title
    const titleInput = screen.getByPlaceholderText('Task title')
    fireEvent.change(titleInput, { target: { value: '' } })

    // Try to save with empty title
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should not call onUpdate
    expect(mockOnUpdate).not.toHaveBeenCalled()
  })

    it('should log warning when trying to save with empty title', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Clear the title
    const titleInput = screen.getByPlaceholderText('Task title')
    fireEvent.change(titleInput, { target: { value: '' } })

    // Try to save with empty title by pressing Enter
    fireEvent.keyDown(titleInput, { key: 'Enter', code: 'Enter' })

    // Should log warning
    expect(consoleSpy).toHaveBeenCalledWith('Cannot save task with empty title')
    
    consoleSpy.mockRestore()
  })

  it('should log when user cancels task deletion', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => false) // User cancels

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockOnToggleComplete}
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Click delete button
    const deleteButton = screen.getByTitle('Delete task')
    fireEvent.click(deleteButton)

    // Should show confirmation dialog
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?')

    // Should log cancellation
    expect(consoleSpy).toHaveBeenCalledWith('Task deletion cancelled by user')

    // Should not call onDelete
    expect(mockOnDelete).not.toHaveBeenCalled()

    // Restore original confirm
    window.confirm = originalConfirm
    consoleSpy.mockRestore()
  })

  it('should handle delete error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockOnDelete.mockRejectedValueOnce(new Error('Delete failed'))
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const deleteButton = screen.getByTestId('delete-task-1')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting task:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should handle toggle completion error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockOnToggleComplete.mockRejectedValueOnce(new Error('Toggle failed'))
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    fireEvent.click(checkbox)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error toggling task completion:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should trim whitespace from title and description when saving', async () => {
    mockOnUpdate.mockResolvedValueOnce()
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Add whitespace to title and description
    const titleInput = screen.getByDisplayValue('Test Task')
    const descriptionInput = screen.getByDisplayValue('Test Description')
    
    fireEvent.change(titleInput, { target: { value: '  Test Task  ' } })
    fireEvent.change(descriptionInput, { target: { value: '  Test Description  ' } })

    // Save
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith('1', {
        title: 'Test Task',
        description: 'Test Description'
      })
    })
  })

  it('should disable buttons when loading', async () => {
    mockOnUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <TaskItem 
        task={mockTask} 
        onToggleComplete={mockOnToggleComplete} 
        onDelete={mockOnDelete}
        onUpdate={mockOnUpdate}
      />
    )

    // Enter edit mode
    const editButton = screen.getByTitle('Edit task')
    fireEvent.click(editButton)

    // Start saving
    const saveButton = screen.getByText('Save')
    fireEvent.click(saveButton)

    // Should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })
}) 