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

// Format time to HH:MM:SS format
const formatTime = (date) => {
  return date.toTimeString().split(' ')[0];
};

// Format date to YYYY-MM-DD format
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Timing Management Services
export const saveVendorTiming = async (timingData) => {
  try {
    const response = await api.post('/availability/', timingData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const getVendorTimings = async (vendorId) => {
  try {
    const response = await api.get(`/vendor/timing/${vendorId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const formatTimingData = (selectedDate, timeSlots) => {
  return {
    date: formatDate(selectedDate),
    available_slots: timeSlots.map(slot => formatTime(slot.time)),
    is_available: 1
  };
}; 