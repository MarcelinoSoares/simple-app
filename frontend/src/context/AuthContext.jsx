/**
 * @fileoverview Authentication context for managing user authentication state
 * @module context/AuthContext
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, register as registerApi } from '../api/auth.js'

/**
 * Authentication context type definition
 * @typedef {Object} AuthContextType
 * @property {boolean} isAuthenticated - Whether user is currently authenticated
 * @property {boolean} loading - Whether authentication state is being determined
 * @property {Function} login - Function to authenticate user
 * @property {Function} register - Function to register new user
 * @property {Function} logout - Function to log out user
 */

/**
 * Authentication context for managing user authentication state
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext()

/**
 * Custom hook to use authentication context
 * @function useAuth
 * @description Provides access to authentication context and methods
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} When used outside of AuthProvider
 * @example
 * // Use authentication in a component
 * function MyComponent() {
 *   const { isAuthenticated, login, logout } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     await login('user@example.com', 'password');
 *   };
 *   
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={handleLogin}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Authentication provider component
 * @function AuthProvider
 * @description Provides authentication context to child components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {JSX.Element} Authentication provider with context
 * @example
 * // Wrap your app with AuthProvider
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourAppComponents />
 *     </AuthProvider>
 *   );
 * }
 */
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  /**
   * Authenticates user with email and password
   * @function login
   * @description Performs user authentication and stores JWT token
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>} Resolves when authentication is complete
   * @throws {Error} When authentication fails
   * @example
   * // Login user
   * try {
   *   await login('user@example.com', 'password123');
   *   console.log('Login successful');
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   */
  const login = async (email, password) => {
    try {
      const token = await loginApi(email, password)
      localStorage.setItem('token', token)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    }
  }

  /**
   * Registers a new user account
   * @function register
   * @description Creates new user account and automatically logs in
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<void>} Resolves when registration is complete
   * @throws {Error} When registration fails
   * @example
   * // Register new user
   * try {
   *   await register('newuser@example.com', 'password123');
   *   console.log('Registration successful');
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
   */
  const register = async (email, password) => {
    try {
      const token = await registerApi(email, password)
      localStorage.setItem('token', token)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    }
  }

  /**
   * Logs out the current user
   * @function logout
   * @description Removes authentication token and updates state
   * @returns {void}
   * @example
   * // Logout user
   * logout();
   * // User is now logged out and redirected to login page
   */
  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
  }

  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const value = {
    isAuthenticated,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 