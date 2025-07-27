import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../../src/context/AuthContext'
import LoginPage from '../../../src/pages/LoginPage'

// Mock axios
vi.mock('axios')

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
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

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.setItem.mockClear()
    mockNavigate.mockClear()
  })

  it('should render login form', () => {
    renderLoginPage()
    
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should handle form submission with valid credentials', async () => {
    const mockAxios = await import('axios')
    mockAxios.default.post.mockResolvedValueOnce({
      data: { token: 'fake-token' }
    })

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
      expect(mockAxios.default.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      )
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('should handle login error', async () => {
    const mockAxios = await import('axios')
    mockAxios.default.post.mockRejectedValueOnce(new Error('Login failed'))

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
      expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument()
    })
    
    expect(localStorageMock.setItem).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalled()
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
    const mockAxios = await import('axios')
    
    renderLoginPage()
    
    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Form should prevent submission due to required attributes
    expect(mockAxios.default.post).not.toHaveBeenCalled()
  })

  it('should handle network errors gracefully', async () => {
    const mockAxios = await import('axios')
    mockAxios.default.post.mockRejectedValueOnce({
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
      expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument()
    })
  })
}) 