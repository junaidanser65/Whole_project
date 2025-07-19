const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify admin token and check admin role
const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key'
    );
    
    // Check if the token has admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized as admin.'
      });
    }
    
    // Check if admin exists in database
    const [admins] = await pool.execute(
      'SELECT id, email FROM admins WHERE id = ?',
      [decoded.id]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }
    
    // Add admin to request object
    req.admin = admins[0];
    next();
    
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error authenticating admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { verifyAdmin };
