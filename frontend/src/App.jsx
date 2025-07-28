/**
 * @fileoverview Main application component with routing and authentication
 * @module App
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import TodoPage from './pages/TodoPage.jsx'

/**
 * Loading screen component displayed while authentication state is being determined
 * @function LoadingScreen
 * @description Renders a modern loading screen with animated elements
 * @returns {JSX.Element} Loading screen with animated spinner and branding
 * @example
 * // Used internally by AppRoutes when auth state is loading
 * <LoadingScreen />
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-400 via-secondary-500 to-primary-600">
      <div className="text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow animate-pulse-gentle">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="text-white font-display font-semibold text-xl mb-2">Loading...</div>
        <div className="flex space-x-1 justify-center">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-gentle"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-gentle" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Main routing component that handles authentication-based navigation
 * @function AppRoutes
 * @description Manages route protection and navigation based on authentication state
 * @returns {JSX.Element} Routes with authentication guards
 * @example
 * // Used internally by App component
 * <AppRoutes />
 */
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage data-testid="login-page" /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={isAuthenticated ? <TodoPage data-testid="todo-page" /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}

/**
 * Main application component
 * @function App
 * @description Root component that provides authentication context and routing
 * @returns {JSX.Element} Application with authentication provider and routes
 * @example
 * // Main application entry point
 * ReactDOM.render(<App />, document.getElementById('root'));
 */
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App 