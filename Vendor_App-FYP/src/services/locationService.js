import * as Location from 'expo-location';
import { API_URL } from './url';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { websocketService } from './websocketService';

class LocationService {
  constructor() {
    console.log('[LocationService] Initializing location service...');
    this.watchId = null;
    this.isTracking = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    console.log('[LocationService] Initialization complete with state:', {
      watchId: this.watchId,
      isTracking: this.isTracking,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries
    });
  }

  async startLocationUpdates(vendorId) {
    try {
      console.log('[LocationService] Starting location updates for vendor:', vendorId);
      console.log('[LocationService] Current tracking state:', {
        isTracking: this.isTracking,
        watchId: this.watchId,
        retryCount: this.retryCount
      });
      
      // Check if already tracking
      if (this.isTracking) {
        console.log('[LocationService] Already tracking location, stopping previous tracking');
        await this.stopLocationUpdates();
      }

      // Request permissions
      console.log('[LocationService] Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('[LocationService] Permission status:', status);
      
      if (status !== 'granted') {
        console.warn('[LocationService] Location permission not granted');
        return false;
      }

      // Get initial location
      console.log('[LocationService] Getting initial location...');
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      console.log('[LocationService] Initial location:', {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        accuracy: initialLocation.coords.accuracy,
        timestamp: new Date(initialLocation.timestamp).toISOString()
      });

      // Start watching location
      console.log('[LocationService] Starting location watch...');
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10 // Update if moved 10 meters
        },
        (location) => this.handleLocationUpdate(location, vendorId)
      );
      console.log('[LocationService] Watch ID assigned:', this.watchId);

      this.isTracking = true;
      console.log('[LocationService] Location tracking started successfully');
      return true;
    } catch (error) {
      console.error('[LocationService] Error starting location updates:', error);
      console.error('[LocationService] Error details:', {
        message: error.message,
        stack: error.stack,
        vendorId
      });
      return false;
    }
  }

  async stopLocationUpdates() {
    try {
      console.log('[LocationService] Stopping location updates...');
      console.log('[LocationService] Current state:', {
        watchId: this.watchId,
        isTracking: this.isTracking,
        retryCount: this.retryCount
      });

      if (this.watchId) {
        console.log('[LocationService] Removing location watch...');
        await this.watchId.remove();
        this.watchId = null;
        this.isTracking = false;
        this.retryCount = 0;
        console.log('[LocationService] Location watch removed successfully');

        // Get auth token
        console.log('[LocationService] Getting auth token for location deletion...');
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          console.warn('[LocationService] No auth token available for location deletion');
          return;
        }
        console.log('[LocationService] Auth token retrieved successfully');

        // Get vendor ID from token
        console.log('[LocationService] Getting vendor ID from token...');
        try {
          // Decode the JWT token to get the vendor ID
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          const payload = JSON.parse(atob(tokenParts[1]));
          const vendorId = payload.id;
          
          if (!vendorId) {
            console.warn('[LocationService] No vendor ID found in token');
            return;
          }
          console.log('[LocationService] Vendor ID retrieved from token:', vendorId);

          // First get the location ID
          console.log('[LocationService] Getting location ID...');
          const getLocationResponse = await fetch(`${API_URL}/vendor/profile/locations`, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!getLocationResponse.ok) {
            console.error('[LocationService] Failed to get vendor location:', {
              status: getLocationResponse.status,
              response: await getLocationResponse.text()
            });
            return;
          }

          const locationData = await getLocationResponse.json();
          if (!locationData.locations || locationData.locations.length === 0) {
            console.log('[LocationService] No locations found to delete');
            return;
          }

          const locationId = locationData.locations[0].id;
          console.log('[LocationService] Found location ID:', locationId);

          // Delete vendor's location using the specific location ID
          console.log('[LocationService] Deleting vendor location...');
          const response = await fetch(`${API_URL}/vendor/profile/locations/${locationId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('[LocationService] Delete location response status:', response.status);
          const responseText = await response.text();
          console.log('[LocationService] Delete location response:', responseText);

          if (!response.ok) {
            console.error('[LocationService] Failed to delete vendor location:', {
              status: response.status,
              response: responseText
            });
            return;
          }

          // Broadcast location removal through WebSocket
          console.log('[LocationService] Broadcasting location removal through WebSocket...');
          websocketService.send({
            type: 'location_removed',
            vendorId: vendorId,
            timestamp: new Date().toISOString()
          });

          console.log('[LocationService] Location updates stopped and location deleted successfully');
        } catch (tokenError) {
          console.error('[LocationService] Error decoding token:', tokenError);
          console.error('[LocationService] Token error details:', {
            message: tokenError.message,
            stack: tokenError.stack
          });
        }
      } else {
        console.log('[LocationService] No active location tracking to stop');
      }
    } catch (error) {
      console.error('[LocationService] Error stopping location updates:', error);
      console.error('[LocationService] Error details:', {
        message: error.message,
        stack: error.stack,
        currentState: {
          watchId: this.watchId,
          isTracking: this.isTracking,
          retryCount: this.retryCount
        }
      });
    }
  }

  async handleLocationUpdate(location, vendorId) {
    try {
      console.log('[LocationService] Processing location update:', {
        vendorId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        timestamp: new Date(location.timestamp).toISOString()
      });

      // Validate location data
      if (!location.coords || typeof location.coords.latitude !== 'number' || typeof location.coords.longitude !== 'number') {
        console.error('[LocationService] Invalid location data received:', location);
        throw new Error('Invalid location data received');
      }

      // Get auth token
      console.log('[LocationService] Getting auth token...');
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error('[LocationService] No auth token available for location update');
        throw new Error('No auth token available for location update');
      }
      console.log('[LocationService] Auth token retrieved successfully');

      // Prepare location data
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString()
      };
      console.log('[LocationService] Prepared location data:', locationData);

      // Update through REST API
      console.log('[LocationService] Sending location update to REST API...');
      const response = await fetch(`${API_URL}/vendor/profile/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: 'Current Location', // Required by the backend
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        })
      });

      // Log response details
      console.log('[LocationService] REST API Response status:', response.status);
      console.log('[LocationService] REST API Response headers:', response.headers);

      // Get response text first
      const responseText = await response.text();
      console.log('[LocationService] REST API Response text:', responseText);

      // Try to parse JSON only if it's valid JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('[LocationService] REST API Response data:', responseData);
      } catch (parseError) {
        console.error('[LocationService] Error parsing REST API response:', parseError);
        console.error('[LocationService] Raw response text:', responseText);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        console.error('[LocationService] REST API request failed:', {
          status: response.status,
          data: responseData
        });
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      // Send through WebSocket
      console.log('[LocationService] Sending location update through WebSocket...');
      websocketService.send({
        type: 'location_update',
        vendorId: vendorId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        timestamp: new Date().toISOString()
      });

      // Reset retry count on success
      this.retryCount = 0;
      console.log('[LocationService] Location updated successfully through both channels');
    } catch (error) {
      console.error('[LocationService] Error updating location:', error);
      console.error('[LocationService] Error details:', {
        message: error.message,
        stack: error.stack,
        vendorId,
        retryCount: this.retryCount,
        currentState: {
          watchId: this.watchId,
          isTracking: this.isTracking
        }
      });
      
      // Implement retry logic with exponential backoff
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const retryDelay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        console.log(`[LocationService] Retrying location update (${this.retryCount}/${this.maxRetries}) in ${retryDelay}ms...`);
        
        setTimeout(() => {
          console.log('[LocationService] Retrying location update...');
          this.handleLocationUpdate(location, vendorId);
        }, retryDelay);
      } else {
        console.error('[LocationService] Max retry attempts reached. Stopping location updates.');
        this.stopLocationUpdates();
      }
    }
  }
}

export const locationService = new LocationService(); 