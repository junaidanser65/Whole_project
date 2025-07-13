import { API_URL } from '../constants/config';
import { getAuthToken } from './AuthService';
import { websocketService } from './websocketService';
import * as Location from 'expo-location';

class LocationService {
  constructor() {
    this.watchId = null;
  }

  async startLocationUpdates(vendorId) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      // Start watching location
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10
        },
        (location) => this.handleLocationUpdate(location, vendorId)
      );

      console.log('Started location updates');
    } catch (error) {
      console.error('Error starting location updates:', error);
    }
  }

  stopLocationUpdates() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      console.log('Stopped location updates');
    }
  }

  async handleLocationUpdate(location, vendorId) {
    try {
      const token = await getAuthToken();
      if (!token) {
        console.warn('No auth token available for location update');
        return;
      }

      console.log('Sending location update:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        vendorId
      });

      // Update through REST API
      const response = await fetch(`${API_URL}/profile/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString()
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update location through REST API');
      }

      console.log('Location update response:', responseData);

      // Also send through WebSocket
      websocketService.send({
        type: 'location_update',
        vendorId: vendorId,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        timestamp: new Date().toISOString()
      });

      console.log('Location updated successfully through both channels');
    } catch (error) {
      console.error('Error updating location:', error);
      // Implement retry logic
      setTimeout(() => {
        console.log('Retrying location update...');
        this.handleLocationUpdate(location, vendorId);
      }, 5000); // Retry after 5 seconds
    }
  }
}

export const locationService = new LocationService(); 