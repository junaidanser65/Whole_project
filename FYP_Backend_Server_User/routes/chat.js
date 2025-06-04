const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const WebSocket = require('ws');

// Get all conversations for a user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [conversations] = await pool.execute(`
      SELECT 
        c.id,
        c.last_message_at,
        v.name as vendor_name,
        v.business_name,
        v.profile_image as vendor_image,
        (
          SELECT message 
          FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE conversation_id = c.id 
          AND sender_type = 'vendor' 
          AND is_read = false
        ) as unread_count
      FROM conversations c
      JOIN vendors v ON c.vendor_id = v.id
      WHERE c.user_id = ?
      ORDER BY c.last_message_at DESC
    `, [userId]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get all conversations for a vendor
router.get('/vendor/conversations', verifyToken, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const [conversations] = await pool.execute(`
      SELECT 
        c.id,
        c.last_message_at,
        u.name as user_name,
        u.avatar_url as user_image,
        (
          SELECT message 
          FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE conversation_id = c.id 
          AND sender_type = 'user' 
          AND is_read = false
        ) as unread_count
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      WHERE c.vendor_id = ?
      ORDER BY c.last_message_at DESC
    `, [vendorId]);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching vendor conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user has access to this conversation
    const [conversation] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ? AND (user_id = ? OR vendor_id = ?)',
      [conversationId, userId, userId]
    );

    if (conversation.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Get messages
    const [messages] = await pool.execute(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `, [conversationId]);

    // Mark unread messages as read
    await pool.execute(`
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = ? 
      AND sender_type != ? 
      AND is_read = false
    `, [conversationId, req.user.role]);

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Create a new conversation or get existing one
router.post('/conversations', verifyToken, async (req, res) => {
  try {
    const { vendorId } = req.body;
    const userId = req.user.id;

    // Check if conversation already exists
    const [existing] = await pool.execute(
      'SELECT * FROM conversations WHERE user_id = ? AND vendor_id = ?',
      [userId, vendorId]
    );

    if (existing.length > 0) {
      return res.json({
        success: true,
        conversation: existing[0]
      });
    }

    // Create new conversation
    const [result] = await pool.execute(
      'INSERT INTO conversations (user_id, vendor_id) VALUES (?, ?)',
      [userId, vendorId]
    );

    const [conversation] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ?',
      [result.insertId]
    );

    res.json({
      success: true,
      conversation: conversation[0]
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

router.post('/conversations_vendor', verifyToken, async (req, res) => {
    try {
      const { userId } = req.body;
      const vendorId = req.user.id; // Get vendor ID from the auth token
  
      if (!userId || !vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Both user ID and vendor ID are required'
        });
      }
  
      // Check if conversation already exists
      const [existing] = await pool.execute(
        'SELECT * FROM conversations WHERE user_id = ? AND vendor_id = ?',
        [userId, vendorId]
      );
  
      if (existing.length > 0) {
        return res.json({
          success: true,
          conversation: existing[0]
        });
      }
  
      // Create new conversation
      const [result] = await pool.execute(
        'INSERT INTO conversations (user_id, vendor_id) VALUES (?, ?)',
        [userId, vendorId]
      );
  
      const [conversation] = await pool.execute(
        'SELECT * FROM conversations WHERE id = ?',
        [result.insertId]
      );
  
      res.json({
        success: true,
        conversation: conversation[0]
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation'
      });
    }
  });

// Send a message
router.post('/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const userId = req.user.id;
    const senderType = req.user.role;

    // Verify user has access to this conversation
    const [conversation] = await pool.execute(
      'SELECT * FROM conversations WHERE id = ? AND (user_id = ? OR vendor_id = ?)',
      [conversationId, userId, userId]
    );

    if (conversation.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }

    // Insert message
    const [result] = await pool.execute(
      'INSERT INTO messages (conversation_id, sender_id, sender_type, message) VALUES (?, ?, ?, ?)',
      [conversationId, userId, senderType, message]
    );

    // Update conversation last_message_at
    await pool.execute(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );

    // Get the inserted message
    const [newMessage] = await pool.execute(
      'SELECT * FROM messages WHERE id = ?',
      [result.insertId]
    );

    // Broadcast message to WebSocket clients
    const wss = require('../server').wss;
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            conversationId,
            message: newMessage[0]
          }));
        }
      });
    }

    res.json({
      success: true,
      message: newMessage[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

module.exports = router; 