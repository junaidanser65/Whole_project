const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware for input validation
const validateSignupInput = (req, res, next) => {
  const { name, email, password, phone_number } = req.body;
  
  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({
      success: false,
      message: 'Name, Email, Password and Phone Number are required'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  // Password validation (at least 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }
  
  // Phone number validation for Pakistani numbers
  const phoneRegex = /^0[0-9]{10}$/;  // Must start with 0 and have 11 digits total
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid Pakistani phone number (e.g., 03001234567)'
    });
  }
  
  next();
};

// Signup route
router.post('/signup', validateSignupInput, async (req, res) => {
  try {
    const { name, email, password, phone_number } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, phone_number) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email,
        role: 'user'  // Add role to token
      },
      process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone_number
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route
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
    
    // Check if user exists
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token with role
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'user'  // Add role to token
      },
      process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    // Since we're using JWT tokens, we don't need to do anything on the server side
    // The client will handle removing the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;