// Authentication service using Node.js backend API
import { apiClient } from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const user = await apiClient.login(email, password);
      return user;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (userData) => {
    try {
      const user = await apiClient.signup(userData);
      return user;
    } catch (error) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  logout: async () => {
    try {
      await apiClient.logout();
      return true;
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }
};
