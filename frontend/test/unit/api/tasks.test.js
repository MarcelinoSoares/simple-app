import { describe, it, expect, beforeEach, vi } from 'vitest'

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

// Mock the auth module (which exports the api instance)
vi.mock('../../../src/api/auth', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  },
  getToken: vi.fn(() => localStorageMock.getItem('token')),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  setupAuthHeader: vi.fn()
}))

import { getTasks, createTask, updateTask, deleteTask, getTask } from '../../../src/api/tasks'

describe('Tasks API', () => {
  let mockApi

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('fake-token')
    
    // Get the mocked api instance
    const authModule = await import('../../../src/api/auth')
    mockApi = authModule.default
  })

  describe('getTasks', () => {
    it('should call getTasks function and return tasks', async () => {
      const mockTasks = [{ _id: '1', title: 'Task 1', completed: false }]
      mockApi.get.mockResolvedValue({ data: mockTasks })

      const result = await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
      expect(result).toEqual(mockTasks)
    })

    it('should throw error when request fails', async () => {
      const error = new Error('Failed to load tasks')
      mockApi.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Failed to load tasks')
    })

    it('should throw error with response message when available', async () => {
      const error = {
        response: {
          data: {
            message: 'Custom error message'
          }
        }
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Custom error message')
    })

    it('should use token from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('different-token')
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
    })

    it('should handle error with response but no data', async () => {
      const error = {
        response: {}
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Failed to load tasks')
    })

    it('should handle error with response.data but no message', async () => {
      const error = {
        response: {
          data: {}
        }
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Failed to load tasks')
    })

    it('should handle network error without response', async () => {
      const error = new Error('Network Error')
      error.code = 'NETWORK_ERROR'
      mockApi.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Failed to load tasks')
    })
  })

  describe('createTask', () => {
    it('should call createTask function with correct data', async () => {
      const task = { title: 'New Task', completed: false }
      const mockResponse = { _id: '1', ...task }
      mockApi.post.mockResolvedValue({ data: mockResponse })

      const result = await createTask(task)

      expect(mockApi.post).toHaveBeenCalledWith('/tasks', task)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when creation fails', async () => {
      const task = { title: 'New Task', completed: false }
      const error = new Error('Failed to create task')
      mockApi.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Failed to create task')
    })

    it('should throw error with response message when available', async () => {
      const task = { title: 'New Task', completed: false }
      const error = {
        response: {
          data: {
            message: 'Task creation failed'
          }
        }
      }
      mockApi.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Task creation failed')
    })

    it('should handle error with response but no data', async () => {
      const task = { title: 'New Task', completed: false }
      const error = {
        response: {}
      }
      mockApi.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Failed to create task')
    })

    it('should handle error with response.data but no message', async () => {
      const task = { title: 'New Task', completed: false }
      const error = {
        response: {
          data: {}
        }
      }
      mockApi.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Failed to create task')
    })

    it('should handle network error without response', async () => {
      const task = { title: 'New Task', completed: false }
      const error = new Error('Network Error')
      error.code = 'NETWORK_ERROR'
      mockApi.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Failed to create task')
    })
  })

  describe('updateTask', () => {
    it('should call updateTask function with correct data', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const mockResponse = { _id: '1', title: 'Task 1', completed: true }
      mockApi.put.mockResolvedValue({ data: mockResponse })

      const result = await updateTask(taskId, updates)

      expect(mockApi.put).toHaveBeenCalledWith(`/tasks/${taskId}`, updates)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error when update fails', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = new Error('Failed to update task')
      mockApi.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Failed to update task')
    })

    it('should throw error with response message when available', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = {
        response: {
          data: {
            message: 'Task update failed'
          }
        }
      }
      mockApi.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Task update failed')
    })

    it('should handle error with response but no data', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = {
        response: {}
      }
      mockApi.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Failed to update task')
    })

    it('should handle error with response.data but no message', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = {
        response: {
          data: {}
        }
      }
      mockApi.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Failed to update task')
    })

    it('should handle network error without response', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = new Error('Network Error')
      error.code = 'NETWORK_ERROR'
      mockApi.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Failed to update task')
    })
  })

  describe('deleteTask', () => {
    it('should call deleteTask function with correct taskId', async () => {
      const taskId = '1'
      mockApi.delete.mockResolvedValue({ data: { message: 'Task deleted successfully' } })

      await deleteTask(taskId)

      expect(mockApi.delete).toHaveBeenCalledWith(`/tasks/${taskId}`)
    })

    it('should throw error when deletion fails', async () => {
      const taskId = '1'
      const error = new Error('Failed to delete task')
      mockApi.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Failed to delete task')
    })

    it('should throw error with response message when available', async () => {
      const taskId = '1'
      const error = {
        response: {
          data: {
            message: 'Task deletion failed'
          }
        }
      }
      mockApi.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Task deletion failed')
    })

    it('should handle error with response but no data', async () => {
      const taskId = '1'
      const error = {
        response: {}
      }
      mockApi.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Failed to delete task')
    })

    it('should handle error with response.data but no message', async () => {
      const taskId = '1'
      const error = {
        response: {
          data: {}
        }
      }
      mockApi.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Failed to delete task')
    })

    it('should handle network error without response', async () => {
      const taskId = '1'
      const error = new Error('Network Error')
      error.code = 'NETWORK_ERROR'
      mockApi.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Failed to delete task')
    })
  })

  describe('getTask', () => {
    it('should call getTask function and return task', async () => {
      const taskId = '1'
      const mockTask = { _id: '1', title: 'Task 1', completed: false }
      mockApi.get.mockResolvedValue({ data: mockTask })

      const result = await getTask(taskId)

      expect(mockApi.get).toHaveBeenCalledWith(`/tasks/${taskId}`)
      expect(result).toEqual(mockTask)
    })

    it('should throw error when request fails', async () => {
      const taskId = '1'
      const error = new Error('Failed to get task')
      mockApi.get.mockRejectedValue(error)

      await expect(getTask(taskId)).rejects.toThrow('Failed to get task')
    })

    it('should throw error with response message when available', async () => {
      const taskId = '1'
      const error = {
        response: {
          data: {
            message: 'Task not found'
          }
        }
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTask(taskId)).rejects.toThrow('Task not found')
    })

    it('should handle error with response but no data', async () => {
      const taskId = '1'
      const error = {
        response: {}
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTask(taskId)).rejects.toThrow('Failed to get task')
    })

    it('should handle error with response.data but no message', async () => {
      const taskId = '1'
      const error = {
        response: {
          data: {}
        }
      }
      mockApi.get.mockRejectedValue(error)

      await expect(getTask(taskId)).rejects.toThrow('Failed to get task')
    })

    it('should handle network error without response', async () => {
      const taskId = '1'
      const error = new Error('Network Error')
      error.code = 'NETWORK_ERROR'
      mockApi.get.mockRejectedValue(error)

      await expect(getTask(taskId)).rejects.toThrow('Failed to get task')
    })
  })

  describe('API calls', () => {
    it('should make correct API calls', async () => {
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })
      mockApi.post.mockResolvedValue({ data: { _id: '1', title: 'Task' } })
      mockApi.put.mockResolvedValue({ data: { _id: '1', title: 'Task', completed: true } })
      mockApi.delete.mockResolvedValue({ data: { message: 'Deleted' } })

      await getTasks()
      await createTask({ title: 'Task' })
      await updateTask('1', { completed: true })
      await deleteTask('1')
      await getTask('1')

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
      expect(mockApi.post).toHaveBeenCalledWith('/tasks', { title: 'Task' })
      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', { completed: true })
      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1')
      expect(mockApi.get).toHaveBeenCalledWith('/tasks/1')
    })

    it('should handle missing token gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
    })

    it('should handle empty token gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('')
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
    })

    it('should handle undefined token gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(undefined)
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
    })
  })
}) 