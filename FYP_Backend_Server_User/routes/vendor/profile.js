const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { verifyToken, verifyVendor } = require('../../middleware/auth');

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

// Get vendor locations
router.get('/locations', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log('[Get Locations] Getting locations for vendor ID:', vendorId);
    
    // Get vendor locations
    const [locations] = await pool.execute(
      'SELECT id, address, latitude, longitude FROM vendor_locations WHERE vendor_id = ?',
      [vendorId]
    );
    
    console.log(`[Get Locations] Found ${locations.length} locations for vendor`);
    
    res.json({
      success: true,
      locations: locations || []
    });
  } catch (error) {
    console.error('[Get Locations] Error:', error);
    console.error('[Get Locations] Error details:', {
      message: error.message,
      stack: error.stack,
      vendorId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Error retrieving vendor locations',
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
    console.log('[Delete Location] Starting deletion for vendor ID:', vendorId);
    
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
    const { wss } = require('../../server');
    
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

// Delete all vendor locations
router.delete('/locations', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log(`[Delete Locations] Starting deletion for vendor ID: ${vendorId}`);
    
    // Check existing locations
    const [existingLocations] = await pool.execute(
      'SELECT id FROM vendor_locations WHERE vendor_id = ?',
      [vendorId]
    );
    console.log(`[Delete Locations] Found ${existingLocations.length} existing locations for vendor`);
    
    // Delete all locations for this vendor
    console.log('[Delete Locations] Executing delete query...');
    const [deleteResult] = await pool.execute(
      'DELETE FROM vendor_locations WHERE vendor_id = ?',
      [vendorId]
    );
    console.log(`[Delete Locations] Deleted ${deleteResult.affectedRows} locations`);
    
    // Get WebSocket server instance
    const { wss } = require('../../server');
    console.log(`[Delete Locations] WebSocket server found, current clients: ${wss.clients.size}`);
    
    // Broadcast location removal to all connected clients
    const locationRemoval = {
      type: 'location_removed',
      vendorId: String(vendorId),
      timestamp: new Date().toISOString()
    };
    console.log('[Delete Locations] Prepared location removal broadcast:', locationRemoval);
    
    // Broadcast to all connected clients
    let broadcastCount = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(locationRemoval));
        broadcastCount++;
      }
    });
    
    console.log(`[Delete Locations] Broadcasted to ${broadcastCount} clients`);
    
    res.json({
      success: true,
      message: 'All vendor locations deleted successfully',
      broadcastCount,
      deletedCount: deleteResult.affectedRows
    });
  } catch (error) {
    console.error('[Delete Locations] Error:', error);
    console.error('[Delete Locations] Error details:', {
      message: error.message,
      stack: error.stack,
      vendorId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor locations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;