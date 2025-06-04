require('dotenv').config();
const express = require('express');
const cors = require('cors');
// User routes
const userAuthRoutes = require('./routes/auth');
const userProfileRoutes = require('./routes/profile');
const userMenuRoutes = require('./routes/menu');
const chatRoutes = require('./routes/chat');
// Vendor routes
const vendorAuthRoutes = require('./routes/vendor/auth');
const vendorProfileRoutes = require('./routes/vendor/profile');
const vendorMenuRoutes = require('./routes/vendor/menu');
const vendorsRoutes = require('./routes/vendors');
const bookingRoutes = require('./routes/bookings');
const availabilityRoutes = require('./routes/availability');
const reviewRoutes = require('./routes/reviews');
const db = require('./config/database');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a specific route for the test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-location.html'));
});

// User Routes
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/menu', userMenuRoutes);
app.use('/api/user/chat', chatRoutes);

// Vendor Routes
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/vendor/profile', vendorProfileRoutes);
app.use('/api/vendor/menu', vendorMenuRoutes);
app.use('/api/vendor/chat', chatRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reviews', reviewRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Fiesta Carts Vendor App Backend API' });
});

// WebSocket server setup
const wss = new WebSocket.Server({ 
  server,
  path: '/ws', // Update path to match client
  verifyClient: (info, callback) => {
    console.log('[WebSocket] New connection attempt from:', info.origin);
    callback(true); // Accept all connections
  }
});

// Store connected clients
const clients = new Map();

// Helper function to broadcast to all clients
const broadcastToAll = (message) => {
  let count = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      count++;
    }
  });
  return count;
};

wss.on('connection', (ws, req) => {
  console.log('[WebSocket] New client connected from:', req.socket.remoteAddress);
  
  // Send initial connection success message
  ws.send(JSON.stringify({ type: 'connection_established' }));
  
  ws.on('message', (message) => {
    console.log('[WebSocket] Raw message received:', message.toString());
    try {
      const data = JSON.parse(message);
      console.log('[WebSocket] Parsed message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'register':
          // Register client with their vendor ID
          if (data.vendorId) {
            clients.set(data.vendorId, ws);
            console.log(`[WebSocket] Vendor ${data.vendorId} registered`);
            // Send confirmation
            ws.send(JSON.stringify({ 
              type: 'register_confirmation',
              vendorId: data.vendorId
            }));
          }
          break;
          
        case 'location_update':
          console.log('[WebSocket] Location update received:', data);
          if (!data.vendorId || !data.location) {
            console.error('[WebSocket] Invalid location update format:', data);
            ws.send(JSON.stringify({ 
              type: 'error',
              message: 'Invalid location update format'
            }));
            break;
          }

          // Broadcast location update to all connected clients
          const locationUpdate = {
            type: 'location_update',
            vendorId: data.vendorId,
            location: data.location,
            timestamp: Date.now()
          };
          
          const broadcastCount = broadcastToAll(locationUpdate);
          console.log(`[WebSocket] Location update broadcasted to ${broadcastCount} clients`);
          
          // Send confirmation to the sender
          ws.send(JSON.stringify({ 
            type: 'location_update_confirmation',
            vendorId: data.vendorId,
            broadcastCount
          }));
          break;

        case 'location_removed':
          console.log('[WebSocket] Location removal received:', data);
          if (!data.vendorId) {
            console.error('[WebSocket] Invalid location removal format:', data);
            ws.send(JSON.stringify({ 
              type: 'error',
              message: 'Invalid location removal format'
            }));
            break;
          }

          // Broadcast location removal to all connected clients
          const locationRemoval = {
            type: 'location_removed',
            vendorId: data.vendorId,
            timestamp: Date.now()
          };
          
          const removalBroadcastCount = broadcastToAll(locationRemoval);
          console.log(`[WebSocket] Location removal broadcasted to ${removalBroadcastCount} clients`);
          
          // Send confirmation to the sender
          ws.send(JSON.stringify({ 
            type: 'location_removal_confirmation',
            vendorId: data.vendorId,
            broadcastCount: removalBroadcastCount
          }));
          break;

        case 'ping':
          console.log('[WebSocket] Ping received, sending pong');
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
          
        default:
          console.log('[WebSocket] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[WebSocket] Message parsing error:', error);
      ws.send(JSON.stringify({ 
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', (code, reason) => {
    console.log('[WebSocket] Client disconnected:', { code, reason: reason.toString() });
    // Remove client from Map
    for (const [vendorId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(vendorId);
        console.log(`[WebSocket] Vendor ${vendorId} disconnected`);
        break;
      }
    }
  });

  ws.on('error', (error) => {
    console.error('[WebSocket] Client error:', error);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0",  () => {
  console.log(`Server running on port ${PORT}`);
});

// Export WebSocket server for use in other files
module.exports = { app, server, wss };
