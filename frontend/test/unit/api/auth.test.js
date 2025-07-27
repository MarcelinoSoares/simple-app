import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, logout, getToken, setToken } from '../../../src/api/auth'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}))

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

describe('Auth API', () => {
  let mockAxios

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAxios = await import('axios')
  })

  describe('login', () => {
    it('should make POST request to login endpoint with correct data', async () => {
      const mockResponse = { data: { token: 'fake-token' } }
      mockAxios.default.post.mockResolvedValue(mockResponse)

      const result = await login('test@example.com', 'password123')

      expect(mockAxios.default.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      )
      expect(result).toEqual({ token: 'fake-token' })
    })

    it('should throw error when login fails', async () => {
      const error = new Error('Login failed')
      mockAxios.default.post.mockRejectedValue(error)

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed')
    })

    it('should handle network errors', async () => {
      const error = { response: { status: 500, data: { message: 'Server error' } } }
      mockAxios.default.post.mockRejectedValue(error)

      await expect(login('test@example.com', 'password123')).rejects.toEqual(error)
    })
  })

  describe('logout', () => {
    it('should remove token from localStorage', () => {
      logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('fake-token')

      const token = getToken()

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
      expect(token).toBe('fake-token')
    })

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)

      const token = getToken()

      expect(token).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should store token in localStorage', () => {
      setToken('new-token')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token')
    })

    it('should handle empty token', () => {
      setToken('')

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', '')
    })
  })
}) 