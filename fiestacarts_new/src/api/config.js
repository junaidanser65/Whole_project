const API_BASE_URL = 'http://192.168.38.240:5000/api';

export const API_URL = API_BASE_URL;

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  LOGOUT: `${API_BASE_URL}/logout`,
  
  // Profile endpoints
  PROFILE: `${API_BASE_URL}/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/profile/update`,
  UPLOAD_PROFILE_IMAGE: `${API_BASE_URL}/profile/upload-image`,
  
  // Vendor endpoints
  VENDORS: `${API_BASE_URL}/vendors`,
  VENDOR_DETAILS: (id) => `${API_BASE_URL}/vendors/${id}`,
  VENDOR_REVIEWS: (id) => `${API_BASE_URL}/vendors/${id}/reviews`,
  ADD_REVIEW: (id) => `${API_BASE_URL}/vendors/${id}/reviews`,
  UPDATE_REVIEW: (vendorId, reviewId) => `${API_BASE_URL}/vendors/${vendorId}/reviews/${reviewId}`,
  DELETE_REVIEW: (vendorId, reviewId) => `${API_BASE_URL}/vendors/${vendorId}/reviews/${reviewId}`,
  
  // Booking endpoints
  BOOKINGS: `${API_BASE_URL}/bookings`,
  CREATE_BOOKING: `${API_BASE_URL}/bookings`,
  BOOKING_DETAILS: (id) => `${API_BASE_URL}/bookings/${id}`,
  
  // Payment endpoints
  PAYMENTS: `${API_BASE_URL}/payments`,
  CREATE_PAYMENT: `${API_BASE_URL}/payments`,
  PAYMENT_DETAILS: (id) => `${API_BASE_URL}/payments/${id}`,
};

export default API_BASE_URL; 