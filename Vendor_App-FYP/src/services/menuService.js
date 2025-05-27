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
      console.log('Token being sent with request:', token);
      
      if (token) {
        // Ensure proper format with Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization header set:', config.headers.Authorization);
      } else {
        console.log('No auth token found in storage');
      }
      
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Menu Management Services
export const createMenu = async (menuData) => {
  try {
    const response = await api.post('/vendor/menu/menu', menuData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const getAllMenus = async (vendorId = null) => {
  try {
    const url = vendorId ? `/vendor/menu/menu?vendor_id=${vendorId}` : '/vendor/menu/menu';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const getMenuById = async (id) => {
  try {
    const response = await api.get(`/vendor/menu/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const updateMenu = async (id, menuData) => {
  try {
    const response = await api.put(`/vendor/menu/menu/${id}`, menuData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};

export const deleteMenu = async (id) => {
  try {
    const response = await api.delete(`/vendor/menu/menu/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: error.message };
  }
};