import { WS_URL } from '../constants/config';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.forceClose = false;
    this.connect();
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    console.log('[WebSocket] Attempting to connect to:', WS_URL);
    
    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('[WebSocket] Connection established');
        this.reconnectAttempts = 0;
        this.forceClose = false;

        // Send initial ping to verify connection
        this.send({ type: 'ping' });
        
        // Register as a customer client
        this.send({
          type: 'register',
          vendorId: 'customer'
        });
      };

      this.ws.onmessage = (event) => {
        console.log('[WebSocket] Raw message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Parsed message:', data);
          
          // Handle different message types
          switch (data.type) {
            case 'connection_established':
              console.log('[WebSocket] Connection confirmed by server');
              break;
              
            case 'register_confirmation':
              console.log('[WebSocket] Registration confirmed:', data);
              break;
              
            case 'location_update':
              console.log('[WebSocket] Location update received:', data);
              this.notifySubscribers('location_update', data);
              break;
              
            case 'pong':
              console.log('[WebSocket] Received pong response');
              break;
              
            case 'error':
              console.error('[WebSocket] Server error:', data.message);
              break;
              
            default:
              console.log('[WebSocket] Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('[WebSocket] Message parsing error:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        if (!this.forceClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          this.reconnectTimeout = setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        // Log additional connection details
        console.log('[WebSocket] Connection details:', {
          url: WS_URL,
          readyState: this.ws ? this.ws.readyState : 'no connection',
          protocol: this.ws ? this.ws.protocol : 'no protocol'
        });
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (!this.forceClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.reconnectTimeout = setTimeout(() => this.connect(), delay);
    }
  }

  disconnect() {
    console.log('[WebSocket] Disconnecting...');
    this.forceClose = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket] Not connected, attempting to reconnect...');
      this.connect();
      setTimeout(() => this.send(data), 1000);
      return;
    }

    try {
      const message = JSON.stringify(data);
      console.log('[WebSocket] Sending data:', data);
      this.ws.send(message);
      console.log('[WebSocket] Data sent successfully');
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
    }
  }

  subscribe(event, callback) {
    console.log(`[WebSocket] Subscribing to event: ${event}`);
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
    console.log(`[WebSocket] Current subscribers for ${event}:`, this.subscribers.get(event).size);
    
    return () => {
      console.log(`[WebSocket] Unsubscribing from event: ${event}`);
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  notifySubscribers(event, data) {
    console.log(`[WebSocket] Notifying subscribers for ${event}:`, data);
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      console.log(`[WebSocket] Found ${callbacks.size} subscribers for ${event}`);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${event} subscriber:`, error);
        }
      });
    } else {
      console.log(`[WebSocket] No subscribers found for ${event}`);
    }
  }
}

export const websocketService = new WebSocketService(); 