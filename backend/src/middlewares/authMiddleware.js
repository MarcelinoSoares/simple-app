/**
 * @fileoverview JWT authentication middleware for protecting routes
 * @module middlewares/authMiddleware
 * @author Simple App Team
 * @version 1.0.0
 * @since 1.0.0
 */

const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * @function authMiddleware
 * @description Middleware that validates JWT tokens and adds user information to request object
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header with Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void} Calls next() if authentication succeeds
 * @throws {Object} 401 - Unauthorized (missing/invalid token, expired token, etc.)
 * @example
 * // Apply middleware to routes
 * app.use('/api/protected', authMiddleware);
 * 
 * // Or apply to specific routes
 * router.get('/tasks', authMiddleware, (req, res) => {
 *   // req.user contains decoded token information
 *   const userId = req.user.id;
 * });
 * 
 * // Expected Authorization header:
 * // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Extract token from Authorization header
  const token = authHeader.split(" ")[1];
  
  // Check if token is empty or just whitespace
  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    
    // Validate that the token contains the required user id
    if (!decoded.id || decoded.id.toString().trim() === "") {
      return res.status(401).json({ message: "Invalid token: missing user id" });
    }
    
    // Add decoded user information to request object
    req.user = decoded;
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware; 