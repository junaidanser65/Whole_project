const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, verifyVendor } = require('../middleware/auth');

// Public route to get menu items for a vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const vendorId = req.params.vendorId;
    
    // Get all menu items for this vendor
    const [menuItems] = await pool.execute(
      'SELECT id, name, description, price, image, category, is_available FROM menus WHERE vendor_id = ?',
      [vendorId]
    );
    
    res.json({
      success: true,
      menu_items: menuItems || []
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all menu items for a vendor
router.get('/menu', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get all menu items for this vendor
    const [menuItems] = await pool.execute(
      'SELECT id, name, description, price, image, category, is_available FROM menus WHERE vendor_id = ?',
      [vendorId]
    );
    
    res.json({
      success: true,
      menu_items: menuItems || []
    });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific menu item
router.get('/menu/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const menuItemId = req.params.id;
    
    // Get the specific menu item
    const [menuItems] = await pool.execute(
      'SELECT id, name, description, price, image, category, is_available FROM menus WHERE id = ? AND vendor_id = ?',
      [menuItemId, vendorId]
    );
    
    if (menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or not authorized'
      });
    }
    
    res.json({
      success: true,
      menu_item: menuItems[0]
    });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a new menu item
router.post('/menu', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, description, price, image, category, is_available } = req.body;
    
    // Validate input
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    
    // Insert new menu item
    const [result] = await pool.execute(
      'INSERT INTO menus (vendor_id, name, description, price, image, category, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [vendorId, name, description || null, price, image || null, category || null, is_available !== undefined ? is_available : true]
    );
    
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      menu_item: {
        id: result.insertId,
        vendor_id: vendorId,
        name,
        description,
        price,
        image,
        category,
        is_available: is_available !== undefined ? is_available : true
      }
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a menu item
router.put('/menu/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const menuItemId = req.params.id;
    const { name, description, price, image, category, is_available } = req.body;
    
    // Validate input
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    
    // Check if menu item exists and belongs to this vendor
    const [menuItems] = await pool.execute(
      'SELECT id FROM menus WHERE id = ? AND vendor_id = ?',
      [menuItemId, vendorId]
    );
    
    if (menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or not authorized'
      });
    }
    
    // Update menu item
    await pool.execute(
      'UPDATE menus SET name = ?, description = ?, price = ?, image = ?, category = ?, is_available = ? WHERE id = ?',
      [name, description || null, price, image || null, category || null, is_available !== undefined ? is_available : true, menuItemId]
    );
    
    res.json({
      success: true,
      message: 'Menu item updated successfully'
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a menu item
router.delete('/menu/:id', verifyToken, verifyVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const menuItemId = req.params.id;
    
    // Check if menu item exists and belongs to this vendor
    const [menuItems] = await pool.execute(
      'SELECT id FROM menus WHERE id = ? AND vendor_id = ?',
      [menuItemId, vendorId]
    );
    
    if (menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or not authorized'
      });
    }
    
    // Delete menu item
    await pool.execute(
      'DELETE FROM menus WHERE id = ?',
      [menuItemId]
    );
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;