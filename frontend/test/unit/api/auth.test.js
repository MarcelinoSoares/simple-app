import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios
vi.mock('axios', () => {
  const mockApi = {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
  
  return {
    default: {
      create: vi.fn(() => mockApi)
    }
  }
})

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

import { login, register, getToken, setToken, removeToken, setupAuthHeader } from '../../../src/api/auth'
import axios from 'axios'

describe('Auth API', () => {
  let mockApi

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi = axios.create()
  })

  describe('login', () => {
    it('should login successfully and return token', async () => {
      const mockResponse = { data: { token: 'fake-token' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await login('test@example.com', 'password123')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result).toBe('fake-token')
    })

    it('should handle login error with response message', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      }
      mockApi.post.mockRejectedValue(mockError)

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
    })

    it('should handle login error without response message', async () => {
      const mockError = new Error('Network error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(login('test@example.com', 'password123')).rejects.toThrow('Login failed. Please try again.')
    })
  })

  describe('register', () => {
    it('should register successfully and return token', async () => {
      const mockResponse = { data: { token: 'fake-token' } }
      mockApi.post.mockResolvedValue(mockResponse)

      const result = await register('newuser@example.com', 'password123')

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@example.com',
        password: 'password123'
      })
      expect(result).toBe('fake-token')
    })

    it('should handle registration error with response message', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      }
      mockApi.post.mockRejectedValue(mockError)

      await expect(register('existing@example.com', 'password123')).rejects.toThrow('Email already exists')
    })

    it('should handle registration error without response message', async () => {
      const mockError = new Error('Network error')
      mockApi.post.mockRejectedValue(mockError)

      await expect(register('newuser@example.com', 'password123')).rejects.toThrow('Registration failed. Please try again.')
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

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      removeToken()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })
  })

  describe('setupAuthHeader', () => {
    it('should set Authorization header when token exists', () => {
      localStorageMock.getItem.mockReturnValue('fake-token')

      setupAuthHeader()

      expect(mockApi.defaults.headers.common['Authorization']).toBe('Bearer fake-token')
    })

    it('should remove Authorization header when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null)
      mockApi.defaults.headers.common['Authorization'] = 'Bearer old-token'

      setupAuthHeader()

      expect(mockApi.defaults.headers.common['Authorization']).toBeUndefined()
    })

    it('should handle case when api.defaults is not available', () => {
      localStorageMock.getItem.mockReturnValue('fake-token')
      const originalDefaults = mockApi.defaults
      delete mockApi.defaults

      // Should not throw error
      expect(() => setupAuthHeader()).not.toThrow()

      // Restore for other tests
      mockApi.defaults = originalDefaults
    })

    it('should handle case when api.defaults.headers is not available', () => {
      localStorageMock.getItem.mockReturnValue('fake-token')
      const originalHeaders = mockApi.defaults.headers
      delete mockApi.defaults.headers

      // Should not throw error
      expect(() => setupAuthHeader()).not.toThrow()

      // Restore for other tests
      mockApi.defaults.headers = originalHeaders
    })
  })
}) 