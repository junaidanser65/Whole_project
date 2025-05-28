const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware ===');
    console.log('Request headers:', req.headers);
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }
    
    console.log('Token found, attempting to verify');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key');
    console.log('Token decoded:', {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    });
    
    // If token has role, use it directly
    if (decoded.role) {
      console.log('Using role from token:', decoded.role);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    }
    
    console.log('No role in token, checking user tables');
    
    // If no role in token, check both tables
    // Check if user exists first
    const [users] = await pool.execute(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.id]
    );
    
    console.log('User table query result:', {
      found: users.length > 0,
      user: users[0] || null
    });
    
    if (users.length > 0) {
      console.log('User found in users table, setting role to user');
      req.user = { id: users[0].id, email: users[0].email, role: 'user' };
      return next();
    }
    
    // Then check if vendor exists
    const [vendors] = await pool.execute(
      'SELECT id, email FROM vendors WHERE id = ?',
      [decoded.id]
    );
    
    console.log('Vendor table query result:', {
      found: vendors.length > 0,
      vendor: vendors[0] || null
    });
    
    if (vendors.length > 0) {
      console.log('User found in vendors table, setting role to vendor');
      req.user = { id: vendors[0].id, email: vendors[0].email, role: 'vendor' };
      return next();
    }
    
    // No user or vendor found with this ID
    console.log('No user or vendor found with ID:', decoded.id);
    return res.status(401).json({
      success: false,
      message: 'Invalid token. User not found'
    });
    
  } catch (error) {
    console.error('Auth middleware error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware to verify vendor role
const verifyVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. Vendor privileges required'
  });
};

module.exports = { verifyToken, verifyVendor };