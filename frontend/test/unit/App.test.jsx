import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    localStorageMock.getItem.mockReturnValue(null)
    
    renderWithRouter(<App />)
    
    // Wait for loading to finish and check for login page
    await screen.findByTestId('login-page')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('should show todo page when token is present', async () => {
    localStorageMock.getItem.mockReturnValue('fake-token')
    
    renderWithRouter(<App />)
    
    // Wait for loading to finish and check for todo page
    await screen.findByTestId('todo-page')
    expect(screen.getByTestId('todo-page')).toBeInTheDocument()
  })

  it('should call localStorage.getItem with correct key', () => {
    localStorageMock.getItem.mockReturnValue('fake-token')
    renderWithRouter(<App />)
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
  })

  it('should handle empty token string', async () => {
    localStorageMock.getItem.mockReturnValue('')
    
    renderWithRouter(<App />)
    
    // Should redirect to login for empty token
    await screen.findByTestId('login-page')
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
}) 