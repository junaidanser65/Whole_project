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

module.exports = router; 