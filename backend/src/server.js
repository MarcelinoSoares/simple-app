/**
 * @fileoverview Main server entry point for the Simple Task Management API
 * @module server
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = require('./app');

/**
 * Server port configuration
 * @type {number}
 * @default 3001
 */
const PORT = process.env.PORT || 3001;

/**
 * MongoDB connection URI
 * @type {string}
 * @default 'mongodb://localhost:27017/simple-app'
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simple-app';

/**
 * Connects to MongoDB database
 * @async
 * @function connectToDatabase
 * @description Establishes connection to MongoDB using the configured URI
 * @returns {Promise<void>} Resolves when connection is established
 * @throws {Error} If connection fails, logs error and exits process
 * @example
 * // Connect to MongoDB
 * await connectToDatabase();
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    process.exit(1);
  }
};

/**
 * Starts the Express server
 * @function startServer
 * @description Initializes and starts the HTTP server on the configured port
 * @returns {void}
 * @example
 * // Start the server
 * startServer();
 */
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Initialize server
connectToDatabase()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    process.exit(1);
  });

module.exports = app; 