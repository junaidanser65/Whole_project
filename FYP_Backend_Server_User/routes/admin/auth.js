const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/database');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if admin exists
    const [admins] = await pool.execute(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const admin = admins[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: 'admin'  // Add role to token
      },
      process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Return token and admin info (excluding password)
    const { password: _, ...adminData } = admin;
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminData
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
