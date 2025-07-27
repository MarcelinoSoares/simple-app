import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskForm from '../../../src/components/TaskForm'

describe('TaskForm Component', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form with input and button', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    expect(screen.getByTestId('task-form')).toBeInTheDocument()
    expect(screen.getByTestId('task-input')).toBeInTheDocument()
    expect(screen.getByTestId('create-task-btn')).toBeInTheDocument()
  })

  it('should have correct placeholder text', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    expect(input).toHaveAttribute('placeholder', 'Nova tarefa')
  })

  it('should have correct button text', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const button = screen.getByTestId('create-task-btn')
    expect(button).toHaveTextContent('Criar')
  })

  it('should update input value when typing', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    fireEvent.change(input, { target: { value: 'New Task' } })

    expect(input.value).toBe('New Task')
  })

  it('should call onSubmit with task data when form is submitted', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.submit(form)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      completed: false
    })
  })

  it('should clear input after successful submission', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.submit(form)

    expect(input.value).toBe('')
  })

  it('should not call onSubmit when input is empty', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const form = screen.getByTestId('task-form')
    fireEvent.submit(form)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should not call onSubmit when input has only whitespace', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(form)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should trim whitespace from input before submission', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')
    const form = screen.getByTestId('task-form')

    fireEvent.change(input, { target: { value: '  Task with spaces  ' } })
    fireEvent.submit(form)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Task with spaces',
      completed: false
    })
  })

  it('should handle Enter key press to submit form', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />)

    const input = screen.getByTestId('task-input')

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      completed: false
    })
  })
}) 