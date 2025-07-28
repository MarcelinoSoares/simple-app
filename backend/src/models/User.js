/**
 * @fileoverview User model schema and methods for authentication
 * @module models/User
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User schema definition
 * @typedef {Object} UserSchema
 * @property {string} email - User's email address (required, unique, lowercase)
 * @property {string} password - User's hashed password (required)
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
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

/**
 * Pre-save middleware to hash password before saving
 * @param {Function} next - Express next function
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare password with hashed password
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * User model
 * @class User
 * @extends mongoose.Model
 * @description Mongoose model for user authentication and management
 * @example
 * // Create a new user (password will be automatically hashed)
 * const user = new User({
 *   email: 'user@example.com',
 *   password: 'plainTextPassword'
 * });
 * await user.save();
 * 
 * // Find user by email
 * const user = await User.findOne({ email: 'user@example.com' });
 * 
 * // Compare password
 * const isMatch = await user.comparePassword('plainTextPassword');
 */
module.exports = mongoose.model("User", userSchema); 