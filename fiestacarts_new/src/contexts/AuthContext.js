import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, signup as apiSignup, logout as apiLogout } from '../api/apiService';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

const AuthContext = createContext();

// Mock user data for development
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored token on app start
    checkStoredToken();
  }, []);

  const checkStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        // Verify token with backend
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking stored token:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiLogin(email, password);
      
      // Store token and user data
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await apiSignup(userData);
      
      // Store token and user data
      await AsyncStorage.setItem('userToken', response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        await apiLogout(token);
      }
      
      // Clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local data even if server logout fails
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 