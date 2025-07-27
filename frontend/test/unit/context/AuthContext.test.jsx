import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../../src/context/AuthContext'

// Mock the API module
vi.mock('../../../src/api/auth', () => ({
  login: vi.fn(),
  getToken: vi.fn(),
  setToken: vi.fn(),
  logout: vi.fn()
}))

// Test component to access context
const TestComponent = () => {
  const { isAuthenticated, user, loading, login, logout } = useAuth()
  
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
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
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
  })

  describe('AuthProvider', () => {
    it('should render children', () => {
      renderWithAuth(<div data-testid="child">Child Component</div>)
      
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should initialize with loading state', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish (useEffect runs)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // After initialization, loading should be false
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    it('should set authenticated to true when token exists', async () => {
      mockAuthApi.getToken.mockReturnValue('fake-token')
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('{"token":"fake-token"}')
    })

    it('should set authenticated to false when no token exists', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')
      
      consoleSpy.mockRestore()
    })

    it('should provide login function', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      mockAuthApi.login.mockResolvedValue({ token: 'new-token' })
      
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
      expect(mockAuthApi.setToken).toHaveBeenCalledWith('new-token')
    })

    it('should handle login errors', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      mockAuthApi.login.mockRejectedValue(new Error('Login failed'))
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      const loginButton = screen.getByTestId('login-btn')
      
      // Click login button and wait for error handling
      await act(async () => {
        try {
          loginButton.click()
        } catch (error) {
          // Expected error, ignore it
        }
      })
      
      // Verify that login was called (even though it failed)
      expect(mockAuthApi.login).toHaveBeenCalledWith('test@example.com', 'password')
    })

    it('should provide logout function', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      
      renderWithAuth(<TestComponent />)
      
      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      const logoutButton = screen.getByTestId('logout-btn')
      await act(async () => {
        logoutButton.click()
      })
      
      expect(mockAuthApi.logout).toHaveBeenCalled()
    })
  })

  describe('Context state management', () => {
    it('should update state after successful login', async () => {
      mockAuthApi.getToken.mockReturnValue(null)
      mockAuthApi.login.mockResolvedValue({ token: 'new-token' })
      
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
      expect(screen.getByTestId('user')).toHaveTextContent('{"token":"new-token"}')
    })

    it('should clear state after logout', async () => {
      mockAuthApi.getToken.mockReturnValue('fake-token')
      
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
      expect(screen.getByTestId('user')).toHaveTextContent('null')
    })
  })
}) 