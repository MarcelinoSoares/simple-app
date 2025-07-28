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

import { getTasks, createTask, updateTask, deleteTask } from '../../../src/api/tasks'

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

    it('should use token from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('different-token')
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
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

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
      expect(mockApi.post).toHaveBeenCalledWith('/tasks', { title: 'Task' })
      expect(mockApi.put).toHaveBeenCalledWith('/tasks/1', { completed: true })
      expect(mockApi.delete).toHaveBeenCalledWith('/tasks/1')
    })

    it('should handle missing token gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      const mockResponse = []
      mockApi.get.mockResolvedValue({ data: mockResponse })

      await getTasks()

      expect(mockApi.get).toHaveBeenCalledWith('/tasks')
    })
  })
}) 