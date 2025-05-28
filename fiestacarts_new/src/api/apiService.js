import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', config.url);
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No auth token found in storage');
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', {
      baseURL: error.config?.baseURL,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      status: error.response?.status,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      message: error.message
    });

    if (error.message === 'Network Error') {
      console.error('Network error - Please check if the server is running at', error.config?.baseURL);
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (email, password) => {
  try {
    const response = await api.post('/user/auth/login', { email, password });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    // Transform the data to match the backend's expected format
    const signupData = {
      name: `${userData.firstName} ${userData.lastName}`.trim(), // Combine first and last name
      email: userData.email,
      password: userData.password,
      phone_number: userData.phoneNumber
    };

    console.log('Sending signup data:', signupData);
    const response = await api.post('/user/auth/signup', signupData);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/user/auth/logout');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// User endpoints
export const updateProfile = async (userData) => {
  return api.put('/users/profile', userData);
};

export const updatePassword = async (currentPassword, newPassword) => {
  return api.put('/users/password', { currentPassword, newPassword });
};

// Vendor endpoints
export const getVendors = async (params = {}) => {
  return api.get('/vendors', { params });
};

export const getVendorById = async (id) => {
  return api.get(`/vendors/${id}`);
};

export const createVendor = async (vendorData) => {
  return api.post('/vendors', vendorData);
};

export const updateVendor = async (id, vendorData) => {
  return api.put(`/vendors/${id}`, vendorData);
};

export const deleteVendor = async (id) => {
  return api.delete(`/vendors/${id}`);
};

// Product endpoints
export const getProducts = async (params = {}) => {
  return api.get('/products', { params });
};

export const getProductById = async (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = async (productData) => {
  return api.post('/products', productData);
};

export const updateProduct = async (id, productData) => {
  return api.put(`/products/${id}`, productData);
};

export const deleteProduct = async (id) => {
  return api.delete(`/products/${id}`);
};

// Order endpoints
export const getOrders = async (params = {}) => {
  return api.get('/orders', { params });
};

export const getOrderById = async (id) => {
  return api.get(`/orders/${id}`);
};

export const createOrder = async (orderData) => {
  return api.post('/orders', orderData);
};

export const updateOrderStatus = async (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

// Cart endpoints
export const getCart = async () => {
  return api.get('/cart');
};

export const addToCart = async (productId, quantity) => {
  return api.post('/cart/items', { productId, quantity });
};

export const updateCartItem = async (itemId, quantity) => {
  return api.put(`/cart/items/${itemId}`, { quantity });
};

export const removeFromCart = async (itemId) => {
  return api.delete(`/cart/items/${itemId}`);
};

export const clearCart = async () => {
  return api.delete('/cart');
};

// Get menu items for a vendor
export const getVendorMenu = async (vendorId) => {
  try {
    const response = await api.get(`/user/menu/vendor/${vendorId}`);
    return response.menu_items || [];
  } catch (error) {
    console.error('Error fetching vendor menu:', error);
    throw error;
  }
};

// Booking related functions
export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
    const response = await api.post('/bookings', bookingData);
    console.log('Booking created successfully:', response);
    return response;
  } catch (error) {
    console.error('Create booking error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      data: error.config?.data
    });
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    console.log('Cancelling booking:', bookingId);
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    console.log('Booking cancelled successfully:', response);
    return response;
  } catch (error) {
    console.error('Cancel booking error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    console.log('Fetching user bookings from:', `${API_URL}/bookings/my-bookings`);
    const response = await api.get('/bookings/my-bookings');
    console.log('User bookings response:', response);
    
    // The response is already transformed by the interceptor
    // response is now the data object directly
    if (!response?.success) {
      console.error('Invalid response format:', response);
      throw new Error('Invalid response from server');
    }

    // Process and format the bookings
    const processedBookings = response.bookings.map(booking => ({
      ...booking,
      booking_date: booking.booking_date,
      booking_time: booking.booking_time,
      total_amount: parseFloat(booking.total_amount || 0),
      items: booking.items || [],
      status: booking.status || 'pending',
      vendor_name: booking.vendor_name || '',
      business_name: booking.business_name || ''
    }));

    return {
      bookings: processedBookings,
      success: true
    };
  } catch (error) {
    console.error('Get user bookings error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

export const getVendorBookings = async () => {
  try {
    const response = await api.get('/bookings/vendor-bookings');
    return response.data;
  } catch (error) {
    console.error('Get vendor bookings error:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    console.log('Updating booking status:', { bookingId, statusData });
    // Using PATCH method with the correct endpoint as defined in the backend
    const response = await api.patch(`/bookings/${bookingId}/status`, {
      status: statusData.status
    });
    console.log('Booking status updated successfully:', response);
    return response;
  } catch (error) {
    console.error('Error updating booking status:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      data: error.config?.data
    });
    throw error;
  }
};

// Availability related functions
export const setVendorAvailability = async (availabilityData) => {
  try {
    const response = await api.post('/availability', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Set vendor availability error:', error);
    throw error;
  }
};

export const getVendorAvailability = async (startDate, endDate) => {
  try {
    const response = await api.get('/availability', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Get vendor availability error:', error);
    throw error;
  }
};

export const getPublicVendorAvailability = async (vendorId, date) => {
  try {
    console.log(`Fetching availability for vendor ${vendorId} on date ${date}`);
    console.log('API URL:', `${API_URL}/availability/vendor/${vendorId}`);
    
    const response = await api.get(`/availability/vendor/${vendorId}`, {
      params: { date }
    });
    
    console.log('Raw API response:', response);
    
    // The response is already transformed by the interceptor
    // response is now the data object directly
    if (!response?.success) {
      console.error('Invalid response format:', response);
      throw new Error('Invalid response from server');
    }

    // Ensure available_slots is always an array
    const availability = {
      ...response.availability,
      available_slots: Array.isArray(response.availability?.available_slots) 
        ? response.availability.available_slots 
        : []
    };

    console.log('Processed availability:', availability);

    return {
      data: {
        availability
      }
    };
  } catch (error) {
    console.error('Get public vendor availability error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      data: error.config?.data
    });
    throw error;
  }
};

export const confirmBooking = async (bookingId) => {
  try {
    console.log('Confirming booking:', bookingId);
    const response = await api.post(`/bookings/${bookingId}/confirm`);
    console.log('Booking confirmed successfully:', response);
    return response;
  } catch (error) {
    console.error('Confirm booking error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    throw error;
  }
};

export const submitReview = async (bookingId, reviewData) => {
  try {
    const response = await api.post('/reviews', {
      booking_id: bookingId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });
    return response;
  } catch (error) {
    console.error('Submit review error:', error);
    throw error.response?.data || error;
  }
};

export const getVendorReviews = async (vendorId) => {
  try {
    const response = await api.get(`/reviews/vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const checkBookingReview = async (bookingId) => {
  try {
    const response = await api.get(`/reviews/booking/${bookingId}`);
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api; 