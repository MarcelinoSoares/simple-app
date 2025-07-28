import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../../src/pages/LoginPage.jsx'
import * as authAPI from '../../src/api/auth.js'

// Mock the auth API
jest.mock('../../src/api/auth.js')

const mockLogin = authAPI.login
const mockRegister = authAPI.register

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}))

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render login form with all elements', () => {
      renderLoginPage()

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /don't have an account/i })).toBeInTheDocument()
    })

    it('should toggle between login and register modes', () => {
      renderLoginPage()

      // Initially in login mode
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()

      // Click toggle button
      const toggleButton = screen.getByRole('button', { name: /don't have an account/i })
      fireEvent.click(toggleButton)

      // Now in register mode
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /already have an account/i })).toBeInTheDocument()

      // Toggle back to login mode
      const backToLoginButton = screen.getByRole('button', { name: /already have an account/i })
      fireEvent.click(backToLoginButton)

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderLoginPage()

      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid email format', async () => {
      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('should show validation error for empty password', async () => {
      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should handle successful login', async () => {
      mockLogin.mockResolvedValueOnce('fake-token')

      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should handle login error', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))

      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should handle successful registration', async () => {
      mockRegister.mockResolvedValueOnce('fake-token')

      renderLoginPage()

      // Switch to register mode
      const toggleButton = screen.getByRole('button', { name: /don't have an account/i })
      fireEvent.click(toggleButton)

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const registerButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(registerButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'password123')
      })
    })

    it('should handle registration error', async () => {
      mockRegister.mockRejectedValueOnce(new Error('Email already exists'))

      renderLoginPage()

      // Switch to register mode
      const toggleButton = screen.getByRole('button', { name: /don't have an account/i })
      fireEvent.click(toggleButton)

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      const registerButton = screen.getByRole('button', { name: /sign up/i })
      fireEvent.click(registerButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })
  })

  describe('User Interaction', () => {
    it('should update form fields on input change', () => {
      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } })

      expect(emailInput.value).toBe('new@example.com')
      expect(passwordInput.value).toBe('newpassword')
    })

    it('should clear error when switching modes', () => {
      renderLoginPage()

      // First, trigger an error
      const loginButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(loginButton)

      // Switch to register mode
      const toggleButton = screen.getByRole('button', { name: /don't have an account/i })
      fireEvent.click(toggleButton)

      // Error should be cleared
      expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument()
    })

    it('should handle Enter key press', async () => {
      mockLogin.mockResolvedValueOnce('fake-token')

      renderLoginPage()

      const emailInput = screen.getByPlaceholderText(/enter your email/i)
      const passwordInput = screen.getByPlaceholderText(/enter your password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // Press Enter on password field
      fireEvent.keyPress(passwordInput, { key: 'Enter', code: 13, charCode: 13 })

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })
  })
}) 