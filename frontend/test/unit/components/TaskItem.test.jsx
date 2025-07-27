import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskItem from '../../../src/components/TaskItem'

describe('TaskItem Component', () => {
  const mockTask = {
    _id: '1',
    title: 'Test Task',
    completed: false
  }

  const mockOnToggle = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task item with correct content', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
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
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
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
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    expect(checkbox).toBeInTheDocument()
  })

  it('should call onToggle when checkbox is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
      />
    )

    const checkbox = screen.getByTestId('task-checkbox-1')
    fireEvent.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith('1', true)
  })

  it('should call onDelete when delete button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
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
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
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
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
      />
    )

    const taskTitle = screen.getByTestId('task-title-1')
    expect(taskTitle).toHaveClass('line-through')
    expect(taskTitle).toHaveClass('text-gray-500')
  })

  it('should not apply completed class when task is incomplete', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onToggle={mockOnToggle} 
        onDelete={mockOnDelete} 
      />
    )

    const taskTitle = screen.getByTestId('task-title-1')
    expect(taskTitle).toHaveClass('text-gray-900')
    expect(taskTitle).not.toHaveClass('line-through')
    expect(taskTitle).not.toHaveClass('text-gray-500')
  })
}) 