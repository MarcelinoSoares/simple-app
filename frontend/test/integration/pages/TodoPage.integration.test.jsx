import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TodoPage from '../../../src/pages/TodoPage';

// Mock the API modules using hoisted
const mockGetTasks = vi.hoisted(() => vi.fn());
const mockCreateTask = vi.hoisted(() => vi.fn());
const mockUpdateTask = vi.hoisted(() => vi.fn());
const mockDeleteTask = vi.hoisted(() => vi.fn());

vi.mock('../../../src/api/tasks', () => ({
  getTasks: mockGetTasks,
  createTask: mockCreateTask,
  updateTask: mockUpdateTask,
  deleteTask: mockDeleteTask
}));

// Mock the auth API
vi.mock('../../../src/api/auth', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  getToken: vi.fn(),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  setupAuthHeader: vi.fn()
}));

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock the AuthContext
const mockLogout = vi.fn();
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    isAuthenticated: true
  })
}));

// Import mocked functions after mocking
// The mocks are now handled by the vi.mock() calls above

const renderTodoPage = () => {
  return render(
    <BrowserRouter>
      <TodoPage />
    </BrowserRouter>
  );
};

describe('TodoPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementations
    mockGetTasks.mockResolvedValue([]);
  });

  describe('Component Rendering', () => {
    it('should render todo page with all required elements', async () => {
      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText(/task manager/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter task title/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', async () => {
      // Mock getTasks to delay response
      mockGetTasks.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
      
      renderTodoPage();

      // The loading state shows a spinner
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    });
  });

  describe('Task Loading', () => {
    it('should load and display tasks successfully', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false },
        { _id: '2', title: 'Task 2', completed: true }
      ];
      mockGetTasks.mockResolvedValueOnce(mockTasks);

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByTestId('task-title-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-title-2')).toBeInTheDocument();
      });

      expect(mockGetTasks).toHaveBeenCalledTimes(1);
    });

    it('should display empty state when no tasks', async () => {
      mockGetTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      });
    });

    it('should handle task loading error', async () => {
      mockGetTasks.mockRejectedValueOnce(new Error('API Error'));

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      });
    });
  });

  describe('Task Creation', () => {
    it('should create a new task successfully', async () => {
      const newTask = { _id: '1', title: 'New Task', completed: false };
      mockCreateTask.mockResolvedValueOnce(newTask);
      mockGetTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter task title...');
      const addButton = screen.getByRole('button', { name: /create task/i });

      fireEvent.change(input, { target: { value: 'New Task' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: ''
        });
      });
    });

    it('should not create task with empty title', async () => {
      mockGetTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      // Wait for loading to finish and check for empty state
      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /create task/i });
      fireEvent.click(addButton);

      expect(mockCreateTask).not.toHaveBeenCalled();
    });
  });

  describe('Task Updates', () => {
    it('should toggle task completion status', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false }
      ];
      mockGetTasks.mockResolvedValueOnce(mockTasks);
      mockUpdateTask.mockResolvedValueOnce({ ...mockTasks[0], completed: true });

      renderTodoPage();

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByTestId('task-title-1')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('task-checkbox-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { completed: true });
      });
    });

    it('should delete task successfully', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false }
      ];
      mockGetTasks.mockResolvedValueOnce(mockTasks);
      mockDeleteTask.mockResolvedValueOnce({});

      renderTodoPage();

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByTestId('task-title-1')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-task-1');
      
      // Mock window.confirm to return true
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);
      
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith('1');
      });
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('User Interaction', () => {
    it('should submit task on Enter key press', async () => {
      const newTask = { _id: '1', title: 'New Task', completed: false };
      mockCreateTask.mockResolvedValueOnce(newTask);
      mockGetTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter task title...');

      fireEvent.change(input, { target: { value: 'New Task' } });
      
      // Submit form with Enter key
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: ''
        });
      });
    });

    it('should handle logout', async () => {
      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });
}); 