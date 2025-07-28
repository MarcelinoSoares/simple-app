/**
 * @fileoverview Express application configuration and middleware setup
 * @module app
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

/**
 * CORS configuration for cross-origin requests
 * @type {Object}
 * @property {string|string[]} origin - Allowed origins
 * @property {boolean} credentials - Allow credentials
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

/**
 * Body parsing middleware configuration
 * @type {Object}
 * @property {number} limit - Maximum request body size (10MB)
 * @property {boolean} extended - Enable extended URL encoding
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

/**
 * Health check endpoint
 * @route GET /health
 * @description Returns server status and timestamp
 * @returns {Object} Server status information
 * @example
 * // GET /health
 * // Returns: { status: "OK", timestamp: "2023-01-01T00:00:00.000Z" }
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

/**
 * 404 handler for undefined routes
 * @route *
 * @description Handles all undefined routes
 * @returns {Object} Error message for route not found
 */
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Global error handler middleware
 * @function globalErrorHandler
 * @description Centralized error handling for all application errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} Error response with appropriate status code
 * @example
 * // Handles various error types:
 * // - JSON parsing errors
 * // - Validation errors
 * // - JWT errors
 * // - General server errors
 */
app.use((err, req, res, next) => {
  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    if (err.statusCode === 400) {
      return res.status(400).json({ message: "Invalid JSON format" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: "Invalid token" });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: "Token expired" });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    message: err.message || "Internal Server Error" 
  });
});

module.exports = app;
