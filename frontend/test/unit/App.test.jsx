import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../src/App'

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

// Mock the pages
vi.mock('../../src/pages/LoginPage.jsx', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../../src/pages/TodoPage.jsx', () => ({
  default: () => <div data-testid="todo-page">Todo Page</div>
}))

// Mock the AuthContext
const mockUseAuth = vi.fn()
vi.mock('../../src/context/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => mockUseAuth()
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should redirect to login when no token is present', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Wait for loading to finish and check for login page
    await screen.findByTestId('login-page')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('should show todo page when token is present', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Wait for loading to finish and check for todo page
    await screen.findByTestId('todo-page')
    expect(screen.getByTestId('todo-page')).toBeInTheDocument()
  })

  it('should show loading screen when authentication state is loading', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    renderWithRouter(<App />)
    
    // Should show loading screen
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
    expect(screen.queryByTestId('todo-page')).not.toBeInTheDocument()
  })

  it('should redirect authenticated user away from login page', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Should show todo page instead of login page
    await screen.findByTestId('todo-page')
    expect(screen.getByTestId('todo-page')).toBeInTheDocument()
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })

  it('should redirect unauthenticated user away from todo page', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Should show login page instead of todo page
    await screen.findByTestId('login-page')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-page')).not.toBeInTheDocument()
  })

  it('should render AuthProvider wrapper', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('should handle loading state transition to authenticated', async () => {
    // Start with loading state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    const { rerender } = renderWithRouter(<App />)
    
    // Should show loading screen
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Transition to authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })
    
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should now show todo page
    await screen.findByTestId('todo-page')
    expect(screen.getByTestId('todo-page')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should handle loading state transition to unauthenticated', async () => {
    // Start with loading state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    const { rerender } = renderWithRouter(<App />)
    
    // Should show loading screen
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Transition to unauthenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false
    })
    
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should now show login page
    await screen.findByTestId('login-page')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('should render LoadingScreen with all elements', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    renderWithRouter(<App />)
    
    // Check for loading screen elements
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toHaveClass('text-white', 'font-display', 'font-semibold', 'text-xl')
    
    // Check for SVG icon (it's an inline SVG, not an img)
    const svgElement = document.querySelector('svg')
    expect(svgElement).toBeInTheDocument()
    expect(svgElement).toHaveClass('w-8', 'h-8', 'text-white')
  })

  it('should handle multiple loading state transitions', async () => {
    // Start with loading state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    const { rerender } = renderWithRouter(<App />)
    
    // Should show loading screen
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Transition to authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false
    })
    
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should show todo page
    await screen.findByTestId('todo-page')
    expect(screen.getByTestId('todo-page')).toBeInTheDocument()
    
    // Transition back to loading state
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true
    })
    
    rerender(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should show loading screen again
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByTestId('todo-page')).not.toBeInTheDocument()
  })

  it('should handle edge case with undefined auth state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: undefined,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Should treat undefined as false and show login page
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('should handle edge case with null auth state', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: null,
      loading: false
    })
    
    renderWithRouter(<App />)
    
    // Should treat null as false and show login page
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
}) 