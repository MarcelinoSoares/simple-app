import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskForm from '../../../src/components/TaskForm'

describe('TaskForm Component', () => {
  const mockOnAddTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form with input and button', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    expect(screen.getByTestId('task-form')).toBeInTheDocument()
    expect(screen.getByTestId('task-input')).toBeInTheDocument()
    expect(screen.getByTestId('create-task-btn')).toBeInTheDocument()
  })

  it('should have correct placeholder text', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    expect(input).toHaveAttribute('placeholder', 'Enter task title...')
  })

  it('should have correct button text', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const button = screen.getByTestId('create-task-btn')
    expect(button).toHaveTextContent('Create Task')
  })

  it('should update input value when typing', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    fireEvent.change(input, { target: { value: 'New Task' } })

    expect(input.value).toBe('New Task')
  })

  it('should call onAddTask with task data when form is submitted', async () => {
    mockOnAddTask.mockResolvedValueOnce({})
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.submit(form)

    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: ''
    })
  })

  it('should clear input after successful submission', async () => {
    mockOnAddTask.mockResolvedValueOnce({})
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.submit(form)

    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(input.value).toBe('')
  })

  it('should not call onAddTask when input is empty', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const form = screen.getByTestId('task-form')
    fireEvent.submit(form)

    expect(mockOnAddTask).not.toHaveBeenCalled()
  })

  it('should not call onAddTask when input has only whitespace', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(form)

    expect(mockOnAddTask).not.toHaveBeenCalled()
  })

  it('should trim whitespace from input before submission', () => {
    render(<TaskForm onAddTask={mockOnAddTask} />)
    
    const input = screen.getByTestId('task-input')
    fireEvent.change(input, { target: { value: '  New Task  ' } })
    
    const submitButton = screen.getByTestId('create-task-btn')
    fireEvent.click(submitButton)
    
    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: ''
    })
  })

  it('should handle error when creating task', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockOnAddTask.mockRejectedValueOnce(new Error('Task creation failed'))
    
    render(<TaskForm onAddTask={mockOnAddTask} />)
    
    const input = screen.getByTestId('task-input')
    const submitButton = screen.getByTestId('create-task-btn')
    
    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error creating task:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
}) 