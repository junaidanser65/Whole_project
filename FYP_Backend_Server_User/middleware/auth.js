const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key');
    
    // If token has role, use it directly
    if (decoded.role) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    }
    
    // Fallback: Check if vendor exists
    const [vendors] = await pool.execute(
      'SELECT id, email FROM vendors WHERE id = ?',
      [decoded.id]
    );
    
    if (vendors.length > 0) {
      req.user = { id: vendors[0].id, email: vendors[0].email, role: 'vendor' };
      return next();
    }
    
    // No vendor found with this ID
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Vendor not found'
    });
    
  } catch (error) {
    console.error('Auth middleware error:', error);
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