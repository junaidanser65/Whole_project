const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const [vendors] = await pool.execute(`
      SELECT v.*
      FROM vendors v
      WHERE v.is_active = true
      ORDER BY v.created_at DESC
    `);

    // Get vendor locations
    const [locations] = await pool.execute('SELECT * FROM vendor_locations');
    
    // Combine vendor data with their locations
    const vendorsWithLocations = vendors.map(vendor => {
      const vendorLocations = locations.filter(loc => loc.vendor_id === vendor.id);
      return {
        ...vendor,
        locations: vendorLocations,
        rating: 0, // Default rating
        reviews_count: 0 // Default review count
      };
    });

    res.json({
      success: true,
      vendors: vendorsWithLocations
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

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const [vendors] = await pool.execute(`
      SELECT v.*
      FROM vendors v
      WHERE v.id = ? AND v.is_active = true
    `, [req.params.id]);

    if (vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor locations
    const [locations] = await pool.execute(
      'SELECT * FROM vendor_locations WHERE vendor_id = ?',
      [req.params.id]
    );

    const vendor = {
      ...vendors[0],
      locations,
      rating: 0, // Default rating
      reviews_count: 0 // Default review count
    };

    res.json({
      success: true,
      vendor
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

module.exports = router; 