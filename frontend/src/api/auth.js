/**
 * @fileoverview Authentication API functions for user login and registration
 * @module api/auth
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import axios from 'axios'

/**
 * Base API configuration
 * @type {Object}
 * @property {string} baseURL - API base URL
 * @property {Object} headers - Default request headers
 */
const API_BASE_URL = 'http://localhost:3001/api'

/**
 * Axios instance for API requests
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Authenticates user with email and password
 * @function login
 * @description Sends login request to the authentication API
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<string>} JWT token for authentication
 * @throws {Error} When authentication fails
 * @example
 * // Login user
 * try {
 *   const token = await login('user@example.com', 'password123');
 *   console.log('Login successful, token:', token);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data.token
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Login failed. Please try again.')
  }
}

/**
 * Registers a new user account
 * @function register
 * @description Sends registration request to create a new user account
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<string>} JWT token for authentication
 * @throws {Error} When registration fails
 * @example
 * // Register new user
 * try {
 *   const token = await register('newuser@example.com', 'password123');
 *   console.log('Registration successful, token:', token);
 * } catch (error) {
 *   console.error('Registration failed:', error.message);
 * }
 */
export const register = async (email, password) => {
  try {
    const response = await api.post('/auth/register', { email, password })
    return response.data.token
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw new Error('Registration failed. Please try again.')
  }
}

/**
 * Gets the stored authentication token
 * @function getToken
 * @description Retrieves JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 * @example
 * // Get stored token
 * const token = getToken();
 * if (token) {
 *   // User is authenticated
 *   console.log('Token found:', token);
 * }
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Sets the authentication token in localStorage
 * @function setToken
 * @description Stores JWT token in localStorage
 * @param {string} token - JWT token to store
 * @returns {void}
 * @example
 * // Store token after login
 * setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 */
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

/**
 * Removes the authentication token from localStorage
 * @function removeToken
 * @description Clears JWT token from localStorage
 * @returns {void}
 * @example
 * // Remove token on logout
 * removeToken();
 */
export const removeToken = () => {
  localStorage.removeItem('token')
}

/**
 * Configures axios to include authentication token in requests
 * @function setupAuthHeader
 * @description Adds Authorization header with JWT token to axios requests
 * @returns {void}
 * @example
 * // Setup auth header for API requests
 * setupAuthHeader();
 */
export const setupAuthHeader = () => {
  const token = getToken()
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Setup auth header on module load
setupAuthHeader()

export default api 