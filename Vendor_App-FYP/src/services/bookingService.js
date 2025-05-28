import axios from 'axios';
import { API_URL } from './url';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set up axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getVendorBookings = async (vendorId) => {
  try {
    const response = await api.get(`/bookings/vendor-bookings`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
}; 