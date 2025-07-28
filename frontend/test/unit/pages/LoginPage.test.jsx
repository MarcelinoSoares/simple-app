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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  )
}

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    renderLoginPage()
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should handle form submission with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce('fake-token')

    renderLoginPage()
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should handle login error', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Login failed'))

    renderLoginPage()
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('should update form fields on input change', () => {
    renderLoginPage()
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } })
    
    expect(emailInput.value).toBe('new@example.com')
    expect(passwordInput.value).toBe('newpassword')
  })

  it('should prevent form submission with empty fields', async () => {
    renderLoginPage()
    
    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Form should prevent submission due to required attributes
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should handle network errors gracefully', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Server error' } }
    })

    renderLoginPage()
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
}) 