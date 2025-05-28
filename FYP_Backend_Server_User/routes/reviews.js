const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Submit a review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!booking_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and rating (1-5) are required'
      });
    }

    // Check if booking exists and belongs to the user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = ?',
      [booking_id, user_id, 'completed']
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not eligible for review'
      });
    }

    const booking = bookings[0];

    // Check if review already exists for this booking
    const [existingReviews] = await pool.execute(
      'SELECT id FROM reviews WHERE booking_id = ?',
      [booking_id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    // Create review
    const [result] = await pool.execute(
      'INSERT INTO reviews (booking_id, user_id, vendor_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [booking_id, user_id, booking.vendor_id, rating, comment || null]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: result.insertId,
        booking_id,
        user_id,
        vendor_id: booking.vendor_id,
        rating,
        comment
      }
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get reviews for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.vendor_id = ?
      ORDER BY r.created_at DESC
    `, [vendorId]);

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if booking has been reviewed
router.get('/booking/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Check if booking exists and belongs to the user
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if review exists
    const [reviews] = await pool.execute(
      'SELECT * FROM reviews WHERE booking_id = ?',
      [bookingId]
    );

    res.json({
      success: true,
      hasReview: reviews.length > 0,
      review: reviews[0] || null
    });
  } catch (error) {
    console.error('Check review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 