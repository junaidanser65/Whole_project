const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/database');

// Middleware for input validation
const validateSignupInput = (req, res, next) => {
  const { name, email, password, phone_number } = req.body;
  
  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({
      success: false,
      message: 'Vendor Name, Email, Password and Contact Number are required'
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
  
  // Phone number validation (simplified to allow most common formats)
  const phoneRegex = /^[0-9\+\-\s\(\)]{8,20}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number (8-20 digits, may include + - ( ) or spaces)'
    });
  }
  
  next();
};

// Signup route
router.post('/signup', validateSignupInput, async (req, res) => {
  let connection;
  try {
    const { name, email, password, phone_number } = req.body;
    
    // Get a connection from the pool
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM vendors WHERE email = ?",
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insert new user
    const [result] = await connection.execute(
      "INSERT INTO vendors (name, email, password, phone_number) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number || null]
    );
    
    // Get the newly created user
    const [users] = await connection.execute(
      "SELECT id, name, email, phone_number FROM vendors WHERE id = ?",
      [result.insertId]
    );
    
    if (users.length === 0) {
      await connection.rollback();
      throw new Error('Failed to retrieve created user');
    }
    
    const user = users[0];
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: user.email,
        role: 'vendor'  // Add role to token
      },
      process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone_number: user.phone_number || phone_number
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    if (connection) await connection.rollback();
    
    // If it's a validation error, return the specific message
    if (error.message.includes('valid phone number')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
});

// Login route
router.post('/login', async (req, res) => {
  console.log('Login request received:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    console.log('Looking up user in database...');
    
    // Check if user exists
    const [users] = await pool.execute(
      "SELECT * FROM vendors WHERE email = ?",
      [email]
    );
    
    if (users.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    console.log('User found, verifying password...');
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('Password verified, generating token...');
    
    // Use a consistent JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'fiesta_vendor_app_secret_key';
    console.log('Using JWT secret:', JWT_SECRET);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'vendor'  // Add role to token
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    console.log('Login successful for user:', user.email);
    console.log('Generated token:', token);
    
    // Send the response with token and user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number || null
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      ...(error.response && { response: error.response.data })
    });
    
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;