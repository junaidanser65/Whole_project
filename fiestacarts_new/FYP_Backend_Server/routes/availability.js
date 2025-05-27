const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Set vendor availability for a date
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, available_slots, is_available } = req.body;
    const vendor_id = req.user.id;

    if (!date || !Array.isArray(available_slots)) {
      return res.status(400).json({
        success: false,
        message: 'Date and available slots are required'
      });
    }

    // Check if availability already exists for this date
    const [existing] = await pool.execute(
      'SELECT * FROM vendor_availability WHERE vendor_id = ? AND date = ?',
      [vendor_id, date]
    );

    if (existing.length > 0) {
      // Update existing availability
      await pool.execute(
        'UPDATE vendor_availability SET available_slots = ?, is_available = ? WHERE vendor_id = ? AND date = ?',
        [JSON.stringify(available_slots), is_available, vendor_id, date]
      );
    } else {
      // Create new availability
      await pool.execute(
        'INSERT INTO vendor_availability (vendor_id, date, available_slots, is_available) VALUES (?, ?, ?, ?)',
        [vendor_id, date, JSON.stringify(available_slots), is_available]
      );
    }

    res.json({
      success: true,
      message: 'Availability updated successfully'
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get vendor availability for a date range
router.get('/', verifyToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const vendor_id = req.user.id;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const [availability] = await pool.execute(
      'SELECT * FROM vendor_availability WHERE vendor_id = ? AND date BETWEEN ? AND ?',
      [vendor_id, start_date, end_date]
    );

    // Parse available slots for each date
    const formattedAvailability = availability.map(record => ({
      ...record,
      available_slots: JSON.parse(record.available_slots || '[]')
    }));

    res.json({
      success: true,
      availability: formattedAvailability
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get public vendor availability for a date
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const [availability] = await pool.execute(
      'SELECT * FROM vendor_availability WHERE vendor_id = ? AND date = ?',
      [vendorId, date]
    );

    if (availability.length === 0) {
      return res.json({
        success: true,
        availability: {
          date,
          is_available: false,
          available_slots: []
        }
      });
    }

    res.json({
      success: true,
      availability: {
        ...availability[0],
        available_slots: JSON.parse(availability[0].available_slots || '[]')
      }
    });
  } catch (error) {
    console.error('Get public availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 