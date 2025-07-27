/**
 * @fileoverview User model schema and methods for authentication
 * @module models/User
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const mongoose = require("mongoose");

/**
 * User schema definition
 * @typedef {Object} UserSchema
 * @property {string} email - User's email address (required, unique, lowercase)
 * @property {string} password - User's password (required)
 * @property {Date} createdAt - Timestamp when user was created
 * @property {Date} updatedAt - Timestamp when user was last updated
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  } // in production, never save plain text
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

/**
 * User model
 * @class User
 * @extends mongoose.Model
 * @description Mongoose model for user authentication and management
 * @example
 * // Create a new user
 * const user = new User({
 *   email: 'user@example.com',
 *   password: 'hashedPassword'
 * });
 * await user.save();
 * 
 * // Find user by email
 * const user = await User.findOne({ email: 'user@example.com' });
 */
module.exports = mongoose.model("User", userSchema); 