import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTasks, createTask, updateTask, deleteTask } from '../../../src/api/tasks'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
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

describe('Tasks API', () => {
  let mockAxios

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAxios = await import('axios')
    localStorageMock.getItem.mockReturnValue('fake-token')
  })

  describe('getTasks', () => {
    it('should make GET request to tasks endpoint with auth headers', async () => {
      const mockResponse = { data: [{ _id: '1', title: 'Task 1', completed: false }] }
      mockAxios.default.get.mockResolvedValue(mockResponse)

      const result = await getTasks()

      expect(mockAxios.default.get).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks',
        {
          headers: { Authorization: 'Bearer fake-token' }
        }
      )
      expect(result).toEqual([{ _id: '1', title: 'Task 1', completed: false }])
    })

    it('should throw error when request fails', async () => {
      const error = new Error('Failed to fetch tasks')
      mockAxios.default.get.mockRejectedValue(error)

      await expect(getTasks()).rejects.toThrow('Failed to fetch tasks')
    })

    it('should use token from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('different-token')
      const mockResponse = { data: [] }
      mockAxios.default.get.mockResolvedValue(mockResponse)

      await getTasks()

      expect(mockAxios.default.get).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks',
        {
          headers: { Authorization: 'Bearer different-token' }
        }
      )
    })
  })

  describe('createTask', () => {
    it('should make POST request to create task with correct data', async () => {
      const task = { title: 'New Task', completed: false }
      const mockResponse = { data: { _id: '1', ...task } }
      mockAxios.default.post.mockResolvedValue(mockResponse)

      const result = await createTask(task)

      expect(mockAxios.default.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks',
        task,
        {
          headers: { Authorization: 'Bearer fake-token' }
        }
      )
      expect(result).toEqual({ _id: '1', title: 'New Task', completed: false })
    })

    it('should throw error when creation fails', async () => {
      const task = { title: 'New Task', completed: false }
      const error = new Error('Failed to create task')
      mockAxios.default.post.mockRejectedValue(error)

      await expect(createTask(task)).rejects.toThrow('Failed to create task')
    })
  })

  describe('updateTask', () => {
    it('should make PUT request to update task with correct data', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const mockResponse = { data: { _id: '1', title: 'Task 1', completed: true } }
      mockAxios.default.put.mockResolvedValue(mockResponse)

      const result = await updateTask(taskId, updates)

      expect(mockAxios.default.put).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks/1',
        updates,
        {
          headers: { Authorization: 'Bearer fake-token' }
        }
      )
      expect(result).toEqual({ _id: '1', title: 'Task 1', completed: true })
    })

    it('should throw error when update fails', async () => {
      const taskId = '1'
      const updates = { completed: true }
      const error = new Error('Failed to update task')
      mockAxios.default.put.mockRejectedValue(error)

      await expect(updateTask(taskId, updates)).rejects.toThrow('Failed to update task')
    })
  })

  describe('deleteTask', () => {
    it('should make DELETE request to delete task', async () => {
      const taskId = '1'
      const mockResponse = { data: { message: 'Task deleted' } }
      mockAxios.default.delete.mockResolvedValue(mockResponse)

      const result = await deleteTask(taskId)

      expect(mockAxios.default.delete).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks/1',
        {
          headers: { Authorization: 'Bearer fake-token' }
        }
      )
      expect(result).toEqual({ message: 'Task deleted' })
    })

    it('should throw error when deletion fails', async () => {
      const taskId = '1'
      const error = new Error('Failed to delete task')
      mockAxios.default.delete.mockRejectedValue(error)

      await expect(deleteTask(taskId)).rejects.toThrow('Failed to delete task')
    })
  })

  describe('Authentication headers', () => {
    it('should include Authorization header in all requests', async () => {
      const mockResponse = { data: [] }
      mockAxios.default.get.mockResolvedValue(mockResponse)
      mockAxios.default.post.mockResolvedValue(mockResponse)
      mockAxios.default.put.mockResolvedValue(mockResponse)
      mockAxios.default.delete.mockResolvedValue(mockResponse)

      await getTasks()
      await createTask({ title: 'Task' })
      await updateTask('1', { completed: true })
      await deleteTask('1')

      expect(mockAxios.default.get).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: 'Bearer fake-token' } }
      )
      expect(mockAxios.default.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { headers: { Authorization: 'Bearer fake-token' } }
      )
      expect(mockAxios.default.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        { headers: { Authorization: 'Bearer fake-token' } }
      )
      expect(mockAxios.default.delete).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: 'Bearer fake-token' } }
      )
    })

    it('should handle missing token gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      const mockResponse = { data: [] }
      mockAxios.default.get.mockResolvedValue(mockResponse)

      await getTasks()

      expect(mockAxios.default.get).toHaveBeenCalledWith(
        'http://localhost:3001/api/tasks',
        {
          headers: { Authorization: 'Bearer null' }
        }
      )
    })
  })
}) 