import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import TodoPage from '../../../src/pages/TodoPage'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock the auth context
const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the AuthContext
vi.mock('../../../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    logout: mockLogout,
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com' }
  })
}));

// Mock the API to include token
vi.mock('../../../src/api/tasks', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn()
}));

// Import mocked functions after mocking
import { getTasks, createTask, updateTask, deleteTask } from '../../../src/api/tasks';

const renderTodoPage = () => {
  return render(
    <BrowserRouter>
      <TodoPage />
    </BrowserRouter>
  )
}

describe('TodoPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render todo page with empty state', async () => {
    getTasks.mockResolvedValueOnce([])

    renderTodoPage()

    await waitFor(() => {
      expect(screen.getByText('My Tasks')).toBeInTheDocument()
      expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    })
  })

  it('should render tasks when data is available', async () => {
    const mockTasks = [
      { _id: '1', title: 'Task 1', completed: false },
      { _id: '2', title: 'Task 2', completed: true }
    ]
    getTasks.mockResolvedValueOnce(mockTasks)

    renderTodoPage()

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })

  it('should create a new task', async () => {
    const newTask = { _id: '1', title: 'New Task', completed: false }
    getTasks.mockResolvedValueOnce([])
    createTask.mockResolvedValueOnce(newTask)
    getTasks.mockResolvedValueOnce([newTask])

    renderTodoPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Add a new task...')
    const createButton = screen.getByRole('button', { name: /add task/i })

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: '',
        completed: false
      })
    })
  })

  it('should toggle task completion', async () => {
    // Clear all mocks first
    vi.clearAllMocks()
    
    // Start with a task that is NOT completed
    const mockTasks = [{ _id: '1', title: 'Task 1', completed: false }]
    getTasks.mockResolvedValue(mockTasks)
    
    // When toggle is called, it should update to completed: true
    updateTask.mockResolvedValue({ _id: '1', title: 'Task 1', completed: true })

    renderTodoPage()

    await waitFor(() => {
      expect(screen.getByTestId('task-checkbox-1')).toBeInTheDocument()
    })

    const checkbox = screen.getByTestId('task-checkbox-1')
    fireEvent.click(checkbox)

    await waitFor(() => {
      // The component should call updateTask with the OPPOSITE of current status
      // Since task.completed is false, it should call with completed: true
      expect(updateTask).toHaveBeenCalledWith('1', { completed: true })
    })
  })

  it('should delete a task', async () => {
    const mockTasks = [{ _id: '1', title: 'Task 1', completed: false }]
    getTasks.mockResolvedValueOnce(mockTasks)
    deleteTask.mockResolvedValueOnce({})
    getTasks.mockResolvedValueOnce([])

    renderTodoPage()

    await waitFor(() => {
      expect(screen.getByTestId('delete-task-1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByTestId('delete-task-1')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith('1')
    })
  })

  it('should show completed tasks with strikethrough', async () => {
    const mockTasks = [{ _id: '1', title: 'Task 1', completed: true }]
    getTasks.mockResolvedValueOnce(mockTasks)

    renderTodoPage()

    await waitFor(() => {
      const taskTitle = screen.getByTestId('task-title-1')
      expect(taskTitle).toHaveClass('line-through')
    })
  })

  it('should handle API errors gracefully', async () => {
    getTasks.mockRejectedValueOnce(new Error('API Error'))

    renderTodoPage()

    // Wait for the error to be displayed in the UI
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument()
    })
  })

  it('should not create task with empty title', async () => {
    getTasks.mockResolvedValueOnce([])

    renderTodoPage()

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument()
    })

    const createButton = screen.getByRole('button', { name: /add task/i })
    fireEvent.click(createButton)

    // Should not make API call for empty task
    expect(createTask).not.toHaveBeenCalled()
  })

  it('should handle network errors when creating task', async () => {
    getTasks.mockResolvedValueOnce([])
    createTask.mockRejectedValueOnce(new Error('Network error'))

    renderTodoPage()

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Add a new task...')
    const createButton = screen.getByRole('button', { name: /add task/i })

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.click(createButton)

    // Wait for the error to be displayed in the UI
    await waitFor(() => {
      expect(screen.getByText('Failed to create task')).toBeInTheDocument()
    })
  })

  it('should clear error when new action is performed', async () => {
    getTasks.mockRejectedValueOnce(new Error('API Error'))
    getTasks.mockResolvedValueOnce([])

    renderTodoPage()

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch tasks')).toBeInTheDocument()
    })

    // Trigger a new action that should clear the error
    const input = screen.getByPlaceholderText('Add a new task...')
    const createButton = screen.getByRole('button', { name: /add task/i })

    fireEvent.change(input, { target: { value: 'New Task' } })
    fireEvent.click(createButton)

    // Error should be cleared when new action is performed
    await waitFor(() => {
      expect(screen.queryByText('Failed to fetch tasks')).not.toBeInTheDocument()
    })
  })
}) 