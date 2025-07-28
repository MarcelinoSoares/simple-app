import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      defaults: {
        headers: {
          common: {}
        }
      }
    }))
  }
}))

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

import { getToken, setToken, removeToken } from '../../../src/api/auth'

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
}) 