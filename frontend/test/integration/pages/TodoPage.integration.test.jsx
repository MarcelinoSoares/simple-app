import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import TodoPage from '../../../src/pages/TodoPage';

// Mock the API modules
vi.mock('../../../src/api/tasks', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn()
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
import { getTasks, createTask, updateTask, deleteTask } from '../../../src/api/tasks';

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
    getTasks.mockResolvedValue([]);
  });

  describe('Component Rendering', () => {
    it('should render todo page with all required elements', async () => {
      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText(/my tasks/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/add a new task/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', async () => {
      // Mock getTasks to delay response
      getTasks.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
      
      renderTodoPage();

      // The loading state shows a spinner
      expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
    });
  });

  describe('Task Loading', () => {
    it('should load and display tasks successfully', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false },
        { _id: '2', title: 'Task 2', completed: true }
      ];
      getTasks.mockResolvedValueOnce(mockTasks);

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
      });

      expect(getTasks).toHaveBeenCalledTimes(1);
    });

    it('should display empty state when no tasks', async () => {
      getTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      });
    });

    it('should handle task loading error', async () => {
      getTasks.mockRejectedValueOnce(new Error('API Error'));

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Task Creation', () => {
    it('should create a new task successfully', async () => {
      const newTask = { _id: '1', title: 'New Task', completed: false };
      createTask.mockResolvedValueOnce(newTask);
      getTasks.mockResolvedValueOnce([]);
      getTasks.mockResolvedValueOnce([newTask]);

      renderTodoPage();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/add a new task/i);
      const addButton = screen.getByRole('button', { name: /add task/i });

      fireEvent.change(input, { target: { value: 'New Task' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: '',
          completed: false
        });
      });
    });

    it('should not create task with empty title', async () => {
      getTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      expect(createTask).not.toHaveBeenCalled();
    });
  });

  describe('Task Updates', () => {
    it('should toggle task completion status', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false }
      ];
      getTasks.mockResolvedValueOnce(mockTasks);
      updateTask.mockResolvedValueOnce({ ...mockTasks[0], completed: true });

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const toggleButton = screen.getByTestId('task-checkbox-1');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(updateTask).toHaveBeenCalledWith('1', { completed: true });
      });
    });

    it('should delete task successfully', async () => {
      const mockTasks = [
        { _id: '1', title: 'Task 1', completed: false }
      ];
      getTasks.mockResolvedValueOnce(mockTasks);
      deleteTask.mockResolvedValueOnce({});

      renderTodoPage();

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTestId(/delete-task-/);
      const deleteButton = deleteButtons[0];
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(deleteTask).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('User Interaction', () => {
    it('should submit task on Enter key press', async () => {
      const newTask = { _id: '1', title: 'New Task', completed: false };
      createTask.mockResolvedValueOnce(newTask);
      getTasks.mockResolvedValueOnce([]);

      renderTodoPage();

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/add a new task/i);

      fireEvent.change(input, { target: { value: 'New Task' } });
      
      // Try different approaches for Enter key
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: '',
          completed: false
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