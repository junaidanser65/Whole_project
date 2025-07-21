const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const { verifyAdmin } = require('../../middleware/adminAuth');

// GET recent activity for admin dashboard
router.get('/', verifyAdmin, async (req, res) => {
  try {
    // Get recent users
    const [recentUsers] = await pool.execute(`
      SELECT id, name, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Get recent vendors
    const [recentVendors] = await pool.execute(`
      SELECT id, name, email, business_name, is_verified, created_at
      FROM vendors
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Get recent bookings
    const [recentBookings] = await pool.execute(`
      SELECT b.id, b.booking_date, b.booking_time, b.status, b.created_at, u.name as user_name, v.business_name as vendor_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN vendors v ON b.vendor_id = v.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get recent reviews
    const [recentReviews] = await pool.execute(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, v.business_name as vendor_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN vendors v ON r.vendor_id = v.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    // Get recent transactions (completed bookings)
    const [recentTransactions] = await pool.execute(`
      SELECT b.id, b.total_amount, b.booking_date, b.booking_time, b.created_at, u.name as user_name, v.business_name as vendor_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN vendors v ON b.vendor_id = v.id
      WHERE b.status = 'completed'
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    // Get monthly revenue (all completed bookings this month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const [monthlyRevenueResult] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as monthlyRevenue
       FROM bookings
       WHERE status = 'completed'
         AND booking_date BETWEEN ? AND ?`,
      [firstDay.toISOString().slice(0, 10), lastDay.toISOString().slice(0, 10)]
    );
    const monthlyRevenue = parseFloat(monthlyRevenueResult[0].monthlyRevenue) || 0;

    res.json({
      success: true,
      recentUsers,
      recentVendors,
      recentBookings,
      recentReviews,
      recentTransactions,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 