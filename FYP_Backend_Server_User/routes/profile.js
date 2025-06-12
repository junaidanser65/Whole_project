const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Get vendor profile
// router.get('/profile', verifyToken, verifyVendor, async (req, res) => {
//   try {
//     const vendorId = req.user.id;
    
//     // Get vendor profile information
//     const [vendors] = await pool.execute(
//       'SELECT id, name, email, business_name, phone_number, address, profile_image FROM vendors WHERE id = ?',
//       [vendorId]
//     );
    
//     if (vendors.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Vendor profile not found'
//       });
//     }
    
//     // Get vendor locations
//     const [locations] = await pool.execute(
//       'SELECT id, address, latitude, longitude FROM vendor_locations WHERE vendor_id = ?',
//       [vendorId]
//     );
    
//     res.json({
//       success: true,
//       profile: {
//         ...vendors[0],
//         locations: locations || []
//       }
//     });
//   } catch (error) {
//     console.error('Get profile error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error retrieving vendor profile',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });


// Get vendor profile by ID (public or admin usage)
router.get('/profile/:id', async (req, res) => {
  // router.get("/profile/me", verifyToken, verifyVendor, async (req, res) => {
    try {
      const vendorId = req.params.id;

      // Get vendor profile information
      const [vendors] = await pool.execute(
        "SELECT id, name, email, business_name, phone_number, address, profile_image FROM vendors WHERE id = ?",
        [vendorId]
      );

      if (vendors.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vendor profile not found",
        });
      }

      // Get vendor locations
      const [locations] = await pool.execute(
        "SELECT id, address, latitude, longitude FROM vendor_locations WHERE vendor_id = ?",
        [vendorId]
      );

      res.json({
        success: true,
        profile: {
          ...vendors[0],
          locations: locations || [],
        },
      });
    } catch (error) {
      console.error("Get profile by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving vendor profile by ID",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });


// Update vendor profile
router.put('/profile', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, business_name, phone_number, address, profile_image } = req.body;
    
    // Update vendor profile
    await pool.execute(
      'UPDATE vendors SET name = ?, business_name = ?, phone_number = ?, address = ?, profile_image = ? WHERE id = ?',
      [name, business_name, phone_number, address, profile_image, vendorId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add vendor location
router.post('/locations', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { address, latitude, longitude } = req.body;
    
    // Validate input
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Insert new location
    const [result] = await pool.execute(
      'INSERT INTO vendor_locations (vendor_id, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [vendorId, address, latitude || null, longitude || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Location added successfully',
      location: {
        id: result.insertId,
        vendor_id: vendorId,
        address,
        latitude,
        longitude
      }
    });
  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update vendor location
router.put('/locations/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const locationId = req.params.id;
    const { address, latitude, longitude } = req.body;
    
    // Validate input
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Check if location exists and belongs to this vendor
    const [locations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE id = ? AND vendor_id = ?',
      [locationId, vendorId]
    );
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not authorized'
      });
    }
    
    // Update location
    await pool.execute(
      'UPDATE vendor_locations SET address = ?, latitude = ?, longitude = ? WHERE id = ?',
      [address, latitude || null, longitude || null, locationId]
    );
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete vendor location
router.delete('/locations/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const locationId = req.params.id;
    
    // Check if location exists and belongs to this vendor
    const [locations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE id = ? AND vendor_id = ?',
      [locationId, vendorId]
    );
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found or not authorized'
      });
    }
    
    // Delete location
    await pool.execute(
      'DELETE FROM vendor_locations WHERE id = ?',
      [locationId]
    );
    
    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update vendor location in real-time
router.post('/location/update', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { latitude, longitude } = req.body;
    
    // Validate input
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Check if vendor has an existing location
    const [existingLocations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE vendor_id = ?',
      [vendorId]
    );
    
    let locationId;
    if (existingLocations.length > 0) {
      // Update existing location
      locationId = existingLocations[0].id;
      await pool.execute(
        'UPDATE vendor_locations SET latitude = ?, longitude = ?, updated_at = NOW() WHERE id = ?',
        [latitude, longitude, locationId]
      );
    } else {
      // Create new location if none exists
      const [result] = await pool.execute(
        'INSERT INTO vendor_locations (vendor_id, latitude, longitude) VALUES (?, ?, ?)',
        [vendorId, latitude, longitude]
      );
      locationId = result.insertId;
    }
    
    // Get the updated location data
    const [updatedLocation] = await pool.execute(
      'SELECT * FROM vendor_locations WHERE id = ?',
      [locationId]
    );
    
    // Broadcast location update to all connected clients
    const locationUpdate = {
      type: 'location_update',
      vendorId: String(vendorId), // Convert to string for consistency
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      timestamp: new Date().toISOString()
    };
    
    // Get WebSocket server instance
    const { wss } = require('../server');
    
    // Broadcast to all connected clients
    let broadcastCount = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(locationUpdate));
        broadcastCount++;
      }
    });
    
    console.log(`[Location Update] Broadcasted to ${broadcastCount} clients`);
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      location: updatedLocation[0],
      broadcastCount
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test route to simulate location updates
router.post('/test/location-update', async (req, res) => {
  try {
    const { vendorId, latitude, longitude } = req.body;
    
    // Validate input
    if (!vendorId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID, latitude, and longitude are required'
      });
    }

    // Create location update message
    const locationUpdate = {
      type: 'location_update',
      vendorId: String(vendorId),
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      timestamp: new Date().toISOString()
    };

    // Get WebSocket server instance
    const { wss } = require('../server');
    
    // Broadcast to all connected clients
    let broadcastCount = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(locationUpdate));
        broadcastCount++;
      }
    });

    console.log(`[Test Location Update] Broadcasted to ${broadcastCount} clients:`, locationUpdate);
    
    res.json({
      success: true,
      message: 'Test location update broadcasted',
      broadcastCount,
      update: locationUpdate
    });
  } catch (error) {
    console.error('Test location update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error broadcasting test location update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/update', verifyToken, async (req, res) => {
  try {
    // Check if user has the correct role
    if (req.user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User privileges required'
      });
    }

    const userId = req.user.id;
    const { name, phone_number, address, avatar_url } = req.body;
    
    console.log('Updating user profile:', {
      userId,
      userRole: req.user.role,
      name,
      phone_number,
      address,
      avatar_url
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // First check if user exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user profile
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, phone_number = ?, address = ?, avatar_url = ? WHERE id = ?',
      [name.trim(), phone_number || null, address || null, avatar_url || null, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update user profile'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      userRole: req.user?.role,
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user profile information
    const [users] = await pool.execute(
      'SELECT id, name, email, phone_number, address, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      profile: users[0]
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;