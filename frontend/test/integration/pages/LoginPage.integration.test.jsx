import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPage from '../../../src/pages/LoginPage';

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
const mockLogin = vi.fn();
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false
  })
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render login form with all required elements', () => {
      renderLoginPage();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display proper form labels and placeholders', () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error for empty email', async () => {
      renderLoginPage();

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for empty password', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email format', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should not show validation errors for valid inputs', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Password is required/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials', async () => {
      mockLogin.mockResolvedValueOnce();

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show loading state during submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
      expect(loginButton).toHaveTextContent(/processing/i);
    });
  });

  describe('User Interaction', () => {
    it('should update input values on change', () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

      expect(emailInput).toHaveValue('new@example.com');
      expect(passwordInput).toHaveValue('newpassword');
    });

    it('should submit form on Enter key press', async () => {
      mockLogin.mockResolvedValueOnce();

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      // Submit form by pressing Enter on the password input
      fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      }, { timeout: 3000 });
    });

    it('should clear error messages when user starts typing', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      // Submit form to trigger validation errors
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });

      // Start typing to clear the error
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Network error'));

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle server errors', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Server error'));

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('should handle generic errors', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Unknown error'));

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText(/enter your email/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Unknown error')).toBeInTheDocument();
      });
    });
  });
}); 