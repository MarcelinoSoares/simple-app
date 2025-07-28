import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../src/context/AuthContext'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock the API module
vi.mock('../../../src/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn()
}))

// Test component to access context
const TestComponent = () => {
  const { isAuthenticated, loading, login, logout } = useAuth()
  
  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password')
    } catch (error) {
      // Handle error silently for testing
      console.error('Login error:', error.message)
    }
  }
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <button onClick={handleLogin} data-testid="login-btn">
        Login
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  )
}

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  let mockAuthApi

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAuthApi = await import('../../../src/api/auth')
    // Clear localStorage mock before each test
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  describe('AuthProvider', () => {
    it('should render children', () => {
      renderWithAuth(<div data-testid="child">Child Component</div>)
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should initialize with loading state', async () => {
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish (useEffect runs)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // After initialization, loading should be false
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    it('should set authenticated to true when token exists', async () => {
      // Set token in localStorage mock
      localStorageMock.getItem.mockReturnValue('fake-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    it('should set authenticated to false when no token exists', async () => {
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  describe('useAuth hook', () => {
    it('should provide login function', async () => {
      mockAuthApi.login.mockResolvedValueOnce('new-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      const loginButton = screen.getByTestId('login-btn')
      
      await act(async () => {
        loginButton.click()
      })
      
      expect(mockAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password')
    })

    it('should provide logout function', async () => {
      // Set token first
      localStorageMock.getItem.mockReturnValue('fake-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      const logoutButton = screen.getByTestId('logout-btn')
      
      await act(async () => {
        logoutButton.click()
      })
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('Context state management', () => {
    it('should update state after successful login', async () => {
      mockAuthApi.login.mockResolvedValueOnce('new-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Initially not authenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      
      // Perform login
      const loginButton = screen.getByTestId('login-btn')
      await act(async () => {
        loginButton.click()
      })
      
      // Should be authenticated after login
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    it('should clear state after logout', async () => {
      // Set token first
      localStorageMock.getItem.mockReturnValue('fake-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Initially authenticated
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      
      // Perform logout
      const logoutButton = screen.getByTestId('logout-btn')
      await act(async () => {
        logoutButton.click()
      })
      
      // Should not be authenticated after logout
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })
}) 