const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const [vendors] = await pool.execute(`
      SELECT v.*,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as reviews_count
      FROM vendors v
      LEFT JOIN reviews r ON v.id = r.vendor_id
      WHERE v.is_active = true
      GROUP BY v.id
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
        rating: parseFloat(vendor.rating), // Keep as number
        reviews_count: parseInt(vendor.reviews_count)
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
      SELECT v.*,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as reviews_count
      FROM vendors v
      LEFT JOIN reviews r ON v.id = r.vendor_id
      WHERE v.id = ? AND v.is_active = true
      GROUP BY v.id
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
      rating: parseFloat(vendors[0].rating), // Keep as number
      reviews_count: parseInt(vendors[0].reviews_count)
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