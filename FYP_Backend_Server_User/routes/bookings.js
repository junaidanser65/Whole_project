const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { vendor_id, booking_date, booking_time, menu_items, special_instructions, address } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!vendor_id || !booking_date || !booking_time || !menu_items || menu_items.length === 0 || !address) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, booking date, time, menu items, and address are required'
      });
    }

    // Check vendor availability
    const [availability] = await pool.execute(
      'SELECT * FROM vendor_availability WHERE vendor_id = ? AND date = ?',
      [vendor_id, booking_date]
    );

    if (availability.length === 0 || !availability[0].is_available) {
      return res.status(400).json({
        success: false,
        message: 'Vendor is not available on this date'
      });
    }

    // Check if the time slot is available
    const availableSlots = JSON.parse(availability[0].available_slots || '[]');
    if (!availableSlots.includes(booking_time)) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of menu_items) {
      const [menuItem] = await pool.execute(
        'SELECT price FROM menus WHERE id = ? AND vendor_id = ?',
        [item.menu_id, vendor_id]
      );

      if (menuItem.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid menu item ID: ${item.menu_id}`
        });
      }

      total_amount += menuItem[0].price * item.quantity;
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create booking
      const [bookingResult] = await connection.execute(
        'INSERT INTO bookings (user_id, vendor_id, booking_date, booking_time, total_amount, special_instructions, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, vendor_id, booking_date, booking_time, total_amount, special_instructions, address]
      );

      const booking_id = bookingResult.insertId;

      // Create booking items
      for (const item of menu_items) {
        const [menuItem] = await connection.execute(
          'SELECT price FROM menus WHERE id = ?',
          [item.menu_id]
        );

        await connection.execute(
          'INSERT INTO booking_items (booking_id, menu_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [booking_id, item.menu_id, item.quantity, menuItem[0].price]
        );
      }

      // Update vendor availability
      const updatedSlots = availableSlots.filter(slot => slot !== booking_time);
      await connection.execute(
        'UPDATE vendor_availability SET available_slots = ? WHERE vendor_id = ? AND date = ?',
        [JSON.stringify(updatedSlots), vendor_id, booking_date]
      );

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: {
          id: booking_id,
          user_id,
          vendor_id,
          booking_date,
          booking_time,
          total_amount,
          special_instructions,
          status: 'pending'
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as vendor_name, v.business_name, v.profile_image
      FROM bookings b
      JOIN vendors v ON b.vendor_id = v.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `, [user_id]);

    // Get booking items for each booking
    for (let booking of bookings) {
      const [items] = await pool.execute(`
        SELECT bi.*, m.name as menu_name, m.description
        FROM booking_items bi
        JOIN menus m ON bi.menu_id = m.id
        WHERE bi.booking_id = ?
      `, [booking.id]);
      booking.items = items;
    }

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get vendor's bookings
router.get('/vendor-bookings', verifyToken, async (req, res) => {
  try {
    const vendor_id = req.user.id;

    const [bookings] = await pool.execute(`
      SELECT b.*, u.name as user_name, u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.vendor_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `, [vendor_id]);

    // Get booking items for each booking
    for (let booking of bookings) {
      const [items] = await pool.execute(`
        SELECT bi.*, m.name as menu_name, m.description
        FROM booking_items bi
        JOIN menus m ON bi.menu_id = m.id
        WHERE bi.booking_id = ?
      `, [booking.id]);
      booking.items = items;
    }

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update booking status
router.patch('/:bookingId/status', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('=== Booking Status Update Request ===');
    console.log('Request details:', {
      bookingId,
      status,
      userId,
      userRole,
      headers: req.headers,
      body: req.body,
      user: req.user
    });

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      console.log('Invalid status provided:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // First get the booking to check ownership
    console.log('Fetching booking from database:', bookingId);
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    console.log('Database query result:', {
      found: bookings.length > 0,
      booking: bookings[0] || null,
      query: 'SELECT * FROM bookings WHERE id = ?',
      params: [bookingId]
    });

    if (bookings.length === 0) {
      console.log('Booking not found in database:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[0];
    console.log('Found booking details:', {
      id: booking.id,
      user_id: booking.user_id,
      vendor_id: booking.vendor_id,
      current_status: booking.status,
      requested_status: status
    });

    // Check if user has permission to update this booking
    const hasPermission = userRole === 'vendor' ? 
      booking.vendor_id === userId : 
      booking.user_id === userId;

    console.log('Permission check details:', {
      userRole,
      userId,
      bookingUserId: booking.user_id,
      bookingVendorId: booking.vendor_id,
      hasPermission,
      isVendor: userRole === 'vendor',
      isUser: userRole === 'user',
      matchesVendor: booking.vendor_id === userId,
      matchesUser: booking.user_id === userId
    });

    if (!hasPermission) {
      console.log('Permission denied:', {
        reason: userRole === 'vendor' ? 
          'User is vendor but booking belongs to different vendor' : 
          'User is not the owner of this booking',
        userRole,
        userId,
        bookingUserId: booking.user_id,
        bookingVendorId: booking.vendor_id
      });
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update booking status
    console.log('Updating booking status in database:', {
      bookingId,
      newStatus: status,
      currentStatus: booking.status
    });

    const [updateResult] = await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    console.log('Database update result:', {
      affectedRows: updateResult.affectedRows,
      changedRows: updateResult.changedRows,
      message: updateResult.message
    });

    console.log('Booking status updated successfully');

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Update booking status error:', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cancel booking
router.post('/:bookingId/cancel', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get booking details
      const [bookings] = await connection.execute(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
        [bookingId, user_id]
      );

      if (bookings.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      const booking = bookings[0];

      // Get current availability
      const [availability] = await connection.execute(
        'SELECT * FROM vendor_availability WHERE vendor_id = ? AND date = ?',
        [booking.vendor_id, booking.booking_date]
      );

      if (availability.length > 0) {
        // Add the time slot back to available slots
        const availableSlots = JSON.parse(availability[0].available_slots || '[]');
        availableSlots.push(booking.booking_time);
        
        // Sort the slots to maintain order
        availableSlots.sort();

        // Update vendor availability
        await connection.execute(
          'UPDATE vendor_availability SET available_slots = ? WHERE vendor_id = ? AND date = ?',
          [JSON.stringify(availableSlots), booking.vendor_id, booking.booking_date]
        );
      }

      // Delete booking items first (due to foreign key constraint)
      await connection.execute(
        'DELETE FROM booking_items WHERE booking_id = ?',
        [bookingId]
      );

      // Delete the booking
      await connection.execute(
        'DELETE FROM bookings WHERE id = ?',
        [bookingId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Booking cancelled and removed successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Confirm booking
router.post('/:bookingId/confirm', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const vendor_id = req.user.id;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if booking exists and belongs to the vendor
      const [bookings] = await connection.execute(
        'SELECT * FROM bookings WHERE id = ? AND vendor_id = ?',
        [bookingId, vendor_id]
      );

      if (bookings.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      const booking = bookings[0];

      // Check if booking is already confirmed or cancelled
      if (booking.status !== 'pending') {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Booking is already ${booking.status}`
        });
      }

      // Update booking status to confirmed
      await connection.execute(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['confirmed', bookingId]
      );

      await connection.commit();

      res.json({
        success: true,
        message: 'Booking confirmed successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get total balance for a vendor
router.get('/vendor/total-balance', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [result] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total_balance 
       FROM bookings 
       WHERE vendor_id = ? AND status = 'completed'`,
      [vendorId]
    );

    res.json({
      success: true,
      total_balance: result[0].total_balance
    });
  } catch (error) {
    console.error('Error getting total balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting total balance'
    });
  }
});

// Get today's revenue for a vendor
router.get('/vendor/today-revenue', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const [result] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as today_revenue 
       FROM bookings 
       WHERE vendor_id = ? 
       AND status = 'completed'
       AND DATE(booking_date) = ?`,
      [vendorId, today]
    );

    res.json({
      success: true,
      today_revenue: result[0].today_revenue
    });
  } catch (error) {
    console.error('Error getting today\'s revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting today\'s revenue'
    });
  }
});

// Get new bookings count for a vendor
router.get('/vendor/new-bookings', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const [result] = await pool.execute(
      `SELECT COUNT(*) as new_bookings 
       FROM bookings 
       WHERE vendor_id = ? 
       AND status = 'pending'
       AND DATE(created_at) = ?`,
      [vendorId, today]
    );

    res.json({
      success: true,
      new_bookings: result[0].new_bookings
    });
  } catch (error) {
    console.error('Error getting new bookings count:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting new bookings count'
    });
  }
});

// Get total customers for a vendor
router.get('/vendor/total-customers', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [result] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as total_customers 
       FROM bookings 
       WHERE vendor_id = ? 
       AND status = 'completed'`,
      [vendorId]
    );

    res.json({
      success: true,
      total_customers: result[0].total_customers
    });
  } catch (error) {
    console.error('Error getting total customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting total customers'
    });
  }
});

// Get average rating for a vendor
router.get('/vendor/average-rating', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [result] = await pool.execute(
      `SELECT COALESCE(AVG(rating), 0) as average_rating 
       FROM reviews 
       WHERE vendor_id = ?`,
      [vendorId]
    );

    res.json({
      success: true,
      average_rating: parseFloat(result[0].average_rating).toFixed(1)
    });
  } catch (error) {
    console.error('Error getting average rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting average rating'
    });
  }
});

// Get weekly revenue data for vendor
router.get('/vendor/weekly-revenue', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get the current date
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Calculate the start date (7 days ago)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // 6 days ago (to include today)
    startDate.setHours(0, 0, 0, 0);

    const [result] = await pool.execute(
      `SELECT 
        DATE(booking_date) as date,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM bookings 
       WHERE vendor_id = ? 
       AND status = 'completed'
       AND booking_date BETWEEN ? AND ?
       GROUP BY DATE(booking_date)
       ORDER BY date`,
      [vendorId, startDate, today]
    );

    // Create labels for the past 7 days
    const labels = [];
    const data = new Array(7).fill(0);
    
    // Generate labels for the past 7 days (oldest to newest)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    // Create a map of date indices
    const dateMap = {};
    labels.forEach((label, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const dateKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      dateMap[dateKey] = index;
    });

    // Fill in the revenue data
    result.forEach(row => {
      const dateIndex = dateMap[row.date.toISOString().split('T')[0]];
      if (dateIndex !== undefined) {
        data[dateIndex] = parseFloat(row.revenue);
      }
    });

    res.json({
      success: true,
      data: data,
      labels: labels
    });
  } catch (error) {
    console.error('Error getting weekly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting weekly revenue'
    });
  }
});

// Get monthly revenue data for vendor
router.get('/vendor/monthly-revenue', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get the current date
    const today = new Date();
    
    // Calculate the start date (6 months ago)
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 5); // 5 months ago (to include current month)
    startDate.setDate(1); // First day of the month
    startDate.setHours(0, 0, 0, 0);

    // Calculate the end date (end of current month)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const [result] = await pool.execute(
      `SELECT 
        DATE_FORMAT(booking_date, '%Y-%m') as month,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM bookings 
       WHERE vendor_id = ? 
       AND status = 'completed'
       AND booking_date BETWEEN ? AND ?
       GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
       ORDER BY month`,
      [vendorId, startDate, endDate]
    );

    // Create labels for the past 6 months
    const labels = [];
    const data = new Array(6).fill(0);
    
    // Generate labels in reverse chronological order (oldest to newest)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }

    // Create a map of month indices
    const monthMap = {};
    labels.forEach((label, index) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - (5 - index));
      const monthKey = date.toISOString().slice(0, 7); // Format: YYYY-MM
      monthMap[monthKey] = index;
    });

    // Fill in the revenue data
    result.forEach(row => {
      const monthIndex = monthMap[row.month];
      if (monthIndex !== undefined) {
        data[monthIndex] = parseFloat(row.revenue);
      }
    });

    res.json({
      success: true,
      data: data,
      labels: labels
    });
  } catch (error) {
    console.error('Error getting monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting monthly revenue'
    });
  }
});

// Get recent activities for vendor
router.get('/vendor/recent-activities', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get latest pending booking
    const [pendingBooking] = await pool.execute(`
      SELECT b.*, u.name as user_name, u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.vendor_id = ? 
      AND b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 1
    `, [vendorId]);

    // Get latest completed booking (payment)
    const [latestPayment] = await pool.execute(`
      SELECT b.*, u.name as user_name, u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.vendor_id = ? 
      AND b.status = 'completed'
      ORDER BY b.updated_at DESC
      LIMIT 1
    `, [vendorId]);

    // Get latest review
    const [latestReview] = await pool.execute(`
      SELECT r.*, u.name as user_name, b.booking_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = ?
      ORDER BY r.created_at DESC
      LIMIT 1
    `, [vendorId]);

    // Get latest chat message
    const [latestChat] = await pool.execute(`
      SELECT m.*, u.name as user_name, c.id as conversation_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE c.vendor_id = ?
      ORDER BY m.created_at DESC
      LIMIT 1
    `, [vendorId]);

    res.json({
      success: true,
      activities: {
        pendingBooking: pendingBooking[0] || null,
        latestPayment: latestPayment[0] || null,
        latestReview: latestReview[0] || null,
        latestChat: latestChat[0] || null
      }
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recent activities'
    });
  }
});

// Get all reviews for a vendor
router.get('/vendor/reviews', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name, b.booking_date, b.total_amount
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = ?
      ORDER BY r.created_at DESC
    `, [vendorId]);

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error getting vendor reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting vendor reviews'
    });
  }
});

// Get all recent activities for vendor
router.get('/vendor/all-recent-activities', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Get all pending bookings
    const [pendingBookings] = await pool.execute(`
      SELECT b.*, u.name as user_name, u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.vendor_id = ? 
      AND b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [vendorId]);

    // Get all completed bookings (payments)
    const [completedPayments] = await pool.execute(`
      SELECT b.*, u.name as user_name, u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.vendor_id = ? 
      AND b.status = 'completed'
      ORDER BY b.updated_at DESC
      LIMIT 10
    `, [vendorId]);

    // Get all reviews
    const [reviews] = await pool.execute(`
      SELECT r.*, u.name as user_name, b.booking_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [vendorId]);

    // Get all chat messages
    const [chatMessages] = await pool.execute(`
      SELECT m.*, u.name as user_name, c.id as conversation_id
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN users u ON c.user_id = u.id
      WHERE c.vendor_id = ?
      ORDER BY m.created_at DESC
      LIMIT 10
    `, [vendorId]);

    res.json({
      success: true,
      activities: {
        pendingBookings,
        completedPayments,
        reviews,
        chatMessages
      }
    });
  } catch (error) {
    console.error('Error getting all recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting recent activities'
    });
  }
});

// Get all customers for a vendor
router.get('/vendor/customers', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [customers] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone_number,
        u.avatar_url,
        COUNT(DISTINCT b.id) as total_orders,
        SUM(b.total_amount) as total_spent,
        MAX(b.booking_date) as last_order_date
      FROM users u
      JOIN bookings b ON u.id = b.user_id
      WHERE b.vendor_id = ?
      AND b.status = 'completed'
      GROUP BY u.id, u.name, u.email, u.phone_number, u.avatar_url
      ORDER BY total_orders DESC
    `, [vendorId]);

    res.json({
      success: true,
      customers: customers.map(customer => ({
        ...customer,
        total_spent: parseFloat(customer.total_spent) || 0,
        avatar_url: customer.avatar_url || `https://ui-avatars.com/api/?name=${customer.name[0]}&background=ff4500&color=fff`
      }))
    });
  } catch (error) {
    console.error('Error getting vendor customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting vendor customers'
    });
  }
});

// Get total bookings for a vendor
router.get('/vendor/total-bookings', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const [result] = await pool.execute(
      `SELECT COUNT(*) as total_bookings 
       FROM bookings 
       WHERE vendor_id = ?`,
      [vendorId]
    );

    res.json({
      success: true,
      total_bookings: result[0].total_bookings
    });
  } catch (error) {
    console.error('Error getting total bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting total bookings'
    });
  }
});

module.exports = router; 