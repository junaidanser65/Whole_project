// API Configuration
export const API_URL = 'http://192.168.38.240:5000/api';

// WebSocket Configuration
export const WS_URL = 'ws://192.168.38.240:5000/ws';

// Map Configuration
export const DEFAULT_MAP_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Location Configuration
export const DEFAULT_RADIUS_KM = 10;
export const MAX_RADIUS_KM = 50;

// Other configuration constants can be added here
export const MAP_CONFIG = {
  initialRegion: {
    latitude: 24.7136,
    longitude: 46.6753,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  defaultRadius: 10, // in kilometers
};

export const LOCATION_CONFIG = {
  updateInterval: 5000, // 5 seconds
  accuracy: 6, // in meters
}; 