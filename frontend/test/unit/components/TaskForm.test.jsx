import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('should trim whitespace from input before submission', async () => {
    mockOnAddTask.mockResolvedValueOnce({})
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: '  Task with spaces  ' } })
    fireEvent.submit(form)

    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'Task with spaces',
      description: ''
    })
  })

  it('should handle Enter key press to submit form', async () => {
    mockOnAddTask.mockResolvedValueOnce({})
    render(<TaskForm onAddTask={mockOnAddTask} />)

    const input = screen.getByTestId('task-input')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })

    // Wait for the async operation to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockOnAddTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: ''
    })
  })
}) 