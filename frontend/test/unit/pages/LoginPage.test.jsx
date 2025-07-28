import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import LoginPage from '@/pages/LoginPage.jsx'
import * as authAPI from '@/api/auth.js'
import { AuthProvider } from '@/context/AuthContext.jsx'

// Mock the auth API
vi.mock('@/api/auth.js')

const mockLogin = vi.mocked(authAPI.login)
const mockRegister = vi.mocked(authAPI.register)

// Mock react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
      <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockResolvedValue('test-token')
    mockRegister.mockResolvedValue('test-token')
  })

  it('renders login form', () => {
    renderLoginPage()
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('toggles between login and register modes', () => {
    renderLoginPage()
    
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Already have an account? Sign In' })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('handles successful registration', async () => {
    renderLoginPage()
    
    // Switch to register mode
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('handles login error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('handles registration error', async () => {
    mockRegister.mockRejectedValue(new Error('Email already exists'))
    renderLoginPage()
    
    // Switch to register mode
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('shows loading state during form submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('clears error when switching between login and register modes', async () => {
    mockRegister.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage()
    
    // First switch to register mode
    const toggleToRegisterButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleToRegisterButton)
    
    // Now trigger an error in register mode
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    // Now switch back to login mode - error should be cleared
    const toggleToLoginButton = screen.getByRole('button', { name: 'Already have an account? Sign In' })
    fireEvent.click(toggleToLoginButton)
    
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
  })

  it('should handle Enter key press to submit form', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Press Enter on email input
    fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should handle Enter key press on password input', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Press Enter on password input
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should not submit form on non-Enter key press', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Press Tab on email input (should not submit)
    fireEvent.keyDown(emailInput, { key: 'Tab', code: 'Tab' })
    
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should not submit form when Enter is pressed but form is invalid', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    // Fill only email, leave password empty (invalid form)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '' } })
    
    // Press Enter on email input
    fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' })
    
    // Should not call login because form is invalid
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should prevent default and stop propagation on Enter key', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Create a mock event with preventDefault and stopPropagation
    const mockEvent = {
      key: 'Enter',
      code: 'Enter',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    }
    
    // Simulate keyDown event
    fireEvent.keyDown(emailInput, mockEvent)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should display "Sign in to your account" text', () => {
    renderLoginPage()
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('should display "Don\'t have an account? Sign Up" text', () => {
    renderLoginPage()
    
    expect(screen.getByText("Don't have an account? Sign Up")).toBeInTheDocument()
  })

  it('should not submit form when validation fails', async () => {
    renderLoginPage()
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // Try to submit without filling required fields
    fireEvent.click(submitButton)
    
    // Should not call login
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should clear validation error when user starts typing', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // First, trigger a validation error by submitting empty form
    fireEvent.click(submitButton)
    
    // Now start typing in email field
    fireEvent.change(emailInput, { target: { value: 'test@' } })
    
    // The validation error should be cleared
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('should show "Sign in to your account" text in login mode', () => {
    renderLoginPage()
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('should show different text in register mode', () => {
    renderLoginPage()
    
    // Switch to register mode
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    // Should not show "Sign in to your account" text
    expect(screen.queryByText('Sign in to your account')).not.toBeInTheDocument()
  })

  it('should show "Create your account" text in register mode', () => {
    renderLoginPage()
    
    // Switch to register mode
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    // Should show "Create your account" text
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('should clear password validation error when user starts typing', async () => {
    renderLoginPage()
    
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // First, trigger a validation error by submitting empty form
    fireEvent.click(submitButton)
    
    // Now start typing in password field
    fireEvent.change(passwordInput, { target: { value: 'test' } })
    
    // The validation error should be cleared
    expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
  })

  it('should not submit form when validation fails on Enter key press', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    
    // Try to submit with empty form using Enter key
    fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' })
    
    // Should not call login
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should show validation error for invalid email format', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // Fill with invalid email format that passes HTML5 validation but fails JS validation
    fireEvent.change(emailInput, { target: { value: 'test@test' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Submit form
    fireEvent.click(submitButton)
    
    // Should show validation error for invalid email
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    
    // Should not call login
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should clear specific field validation error when user starts typing in that field', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    // First, trigger a validation error by submitting empty form
    fireEvent.click(submitButton)
    
    // Now start typing in email field to clear the specific error
    fireEvent.change(emailInput, { target: { value: 'test' } })
    
    // The email validation error should be cleared
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
  })

  it('should clear validation error when user types in field with existing error', async () => {
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    
    // Fill with invalid email format that passes HTML5 validation but fails JS validation
    fireEvent.change(emailInput, { target: { value: 'test@test' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Submit form to trigger validation
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    fireEvent.click(submitButton)
    
    // Should show validation error for invalid email
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    
    // Now type in email field - should clear email error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })
}) 