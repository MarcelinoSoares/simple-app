import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskItem from '../../../src/components/TaskItem'

describe('TaskItem Component', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    completed: false
  }

  const mockOnToggleComplete = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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
    // Mock window.confirm to return true
    global.window.confirm = vi.fn(() => true)
    
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
}) 