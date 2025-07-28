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

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin.mockResolvedValue('test-token')
    mockRegister.mockResolvedValue('test-token')
  })

  it('integrates mode switching with form state', async () => {
    renderLoginPage()
    
    // Start in login mode
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    
    // Switch to register mode
    const toggleButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleButton)
    
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    
    // Fill and submit registration form
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'newpassword')
    })
  })

  it('integrates error handling with form state', async () => {
    mockRegister.mockRejectedValue(new Error('Network error'))
    renderLoginPage()
    
    // First switch to register mode
    const toggleToRegisterButton = screen.getByRole('button', { name: "Don't have an account? Sign Up" })
    fireEvent.click(toggleToRegisterButton)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
    
    // Error should clear when switching modes
    const toggleToLoginButton = screen.getByRole('button', { name: 'Already have an account? Sign In' })
    fireEvent.click(toggleToLoginButton)
    
    expect(screen.queryByText('Network error')).not.toBeInTheDocument()
  })

  it('integrates loading state with form submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    renderLoginPage()
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })
  })
}) 