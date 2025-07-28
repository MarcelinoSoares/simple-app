/**
 * @fileoverview Login page component with authentication form
 * @module pages/LoginPage
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const { login, register } = useAuth()

  /**
   * Validates form inputs
   * @function validateForm
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = {}

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password.trim()) {
      errors.password = 'Password is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Handles form submission
   * @function handleSubmit
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles input changes and clears validation errors
   * @function handleInputChange
   * @param {string} field - Field name (email or password)
   * @param {string} value - New input value
   */
  const handleInputChange = (field, value) => {
    // Update field value
    if (field === 'email') {
      setEmail(value)
    } else if (field === 'password') {
      setPassword(value)
    }

    // Clear validation error for this field when user starts typing
    // This ensures we clear errors as soon as user starts correcting them
    if (validationErrors[field] && value.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  /**
   * Handles key press events on form inputs
   * @function handleKeyPress
   * @param {KeyboardEvent} e - The keyboard event
   */
  const handleKeyPress = (e) => {
    // Only handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      
      // Validate form before submitting
      if (validateForm()) {
        handleSubmit(e)
      }
    }
  }

  /**
   * Toggles between login and register modes
   * @function toggleMode
   */
  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setValidationErrors({})
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 via-secondary-500 to-primary-600 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-white font-display font-bold text-3xl mb-2">Welcome Back</h1>
          <p className="text-white/80 font-medium">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-glow border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
                required
              />
              {validationErrors.email && (
                <p className="text-red-200 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
                required
              />
              {validationErrors.password && (
                <p className="text-red-200 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-white/80 hover:text-white text-sm transition-colors duration-200"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 