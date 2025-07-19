const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { verifyAdmin } = require('../../middleware/adminAuth');

// Get all vendors (for admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const [vendors] = await pool.execute(`
      SELECT 
        id, name, email, business_name, phone_number, 
        address, profile_image, is_active, is_verified,
        created_at, updated_at
      FROM vendors
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      vendors
    });
    
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendors',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get vendor by ID (for admin)
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const vendorId = req.params.id;
    
    const [vendors] = await pool.execute(
      `SELECT 
        id, name, email, business_name, phone_number, 
        address, profile_image, is_active, is_verified,
        created_at, updated_at
       FROM vendors 
       WHERE id = ?`,
      [vendorId]
    );
    
    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      vendor: vendors[0]
    });
    
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update vendor verification status
router.patch('/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const vendorId = req.params.id;
    const { is_verified } = req.body;
    
    // Validate input
    if (typeof is_verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_verified must be a boolean value'
      });
    }
    
    // Update vendor verification status
    const [result] = await pool.execute(
      'UPDATE vendors SET is_verified = ? WHERE id = ?',
      [is_verified, vendorId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Get updated vendor data
    const [vendors] = await pool.execute(
      'SELECT id, name, email, business_name, is_verified FROM vendors WHERE id = ?',
      [vendorId]
    );
    
    res.json({
      success: true,
      message: `Vendor ${is_verified ? 'verified' : 'unverified'} successfully`,
      vendor: vendors[0]
    });
    
  } catch (error) {
    console.error('Update vendor verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor verification status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
