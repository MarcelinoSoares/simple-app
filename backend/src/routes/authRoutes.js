/**
 * @fileoverview Authentication routes for user login and registration
 * @module routes/authRoutes
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * User login endpoint
 * @route POST /api/auth/login
 * @description Authenticates user with email and password, returns JWT token
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} 200 - JWT token for authentication
 * @returns {Object} 400 - Missing email or password
 * @returns {Object} 401 - Invalid credentials
 * @example
 * // POST /api/auth/login
 * // Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * // Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  try {
    // Find existing user
    const user = await User.findOne({ email });
    
    // If user doesn't exist, return 401
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check if password matches using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * User registration endpoint
 * @route POST /api/auth/register
 * @description Creates a new user account and returns JWT token
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} 201 - User created successfully with JWT token
 * @returns {Object} 400 - Missing email/password or user already exists
 * @example
 * // POST /api/auth/register
 * // Request body:
 * {
 *   "email": "newuser@example.com",
 *   "password": "password123"
 * }
 * // Response:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create new user
    const user = await User.create({ email, password });
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });
    
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router; 