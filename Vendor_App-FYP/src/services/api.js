import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Define the base URL for the API
// 192.168.18.8
// const API_URL = "http://localhost:5000/api";
// const API_URL = "http://192.168.18.8:5000/api";
const API_URL = "http://192.168.106.240:5000/api";//ushna /  hamza bhai ke mobile ka
// const API_URL = "http://192.168.72.42:5000/api";//mere mobile ka

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

// Helper to get auth headers with token
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// API client for authentication and user operations
export const apiClient = {
  // User authentication
  // login: async (email, password) => {
  //   const response = await fetch(`${API_URL}/login`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   const data = await handleResponse(response);

  //   // Store the token
  //   if (data.token) {
  //     await AsyncStorage.setItem("auth_token", data.token);
  //   }

  //   return data.user;
  // },

  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      
      // Use fetch instead of axios for more control
      const response = await fetch(`${API_URL}/vendor/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response status:', response.status);
      
      // Parse the response data
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in AsyncStorage
      if (data.token) {
        console.log('Storing token in AsyncStorage');
        await AsyncStorage.setItem("auth_token", data.token);
      } else {
        console.error('No token received from server');
        throw new Error('No authentication token received');
      }

      // Return full response
      return { 
        success: true, 
        token: data.token, 
        user: data.user 
      };
    } catch (error) {
      console.error('Login API error:', error);
      
      if (error.response) {
        console.error('Response error data:', error.response.data);
      }
      
      throw new Error(
        error.message || 
        'Login failed. Please try again.'
      );
    }
  },

  signup: async (userData) => {
    try {
      console.log("Sending signup data:", userData);

      const url = `${API_URL}/vendor/auth/signup`;
      console.log("Signup API URL:", url);

      const response = await axios.post(url, userData);
      console.log("Signup response:", response.data);

      const { token, user } = response.data;

      if (token) {
        await AsyncStorage.setItem("auth_token", token);
      }

      return user;

      // const response = await axios.post(
      //   "http://192.168.18.8:5000/api/signup",
      //   userData
      // );
      // console.log("Signup response:", response.data);
      // return response.data;
    } catch (error) {
      console.error("Full Axios Error:", JSON.stringify(error, null, 2));
      console.error(
        "Signup error:",
        error?.response?.data?.message || error.message
      );
      throw new Error(error?.response?.data?.message || "Signup failed");
    }
  },

  logout: async () => {
    // Remove the token from storage
    await AsyncStorage.removeItem("auth_token");
    return true;
  },

  // Get current user profile
  // getCurrentUser: async () => {
  //   const headers = await getAuthHeaders();
  //   const response = await fetch(`${API_URL}/profile`, {
  //     headers,
  //   });
  //   return handleResponse(response);
  // },

  // Get all vendor profiles (admin or public view)
  getAllProfiles: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/vendor/profile`, { headers });
    return handleResponse(response);
  },

  // Get vendor profile by ID
  // getProfileById: async (id) => {
  //   const headers = await getAuthHeaders();
  //   const response = await fetch(`${API_URL}/profile/${id}`, {
  //     headers,
  //   });
  //   const data = await handleResponse(response);

  //   // return full response: profile
  //   return { profile: data.profile };
  // },

  // In apiClient
  getProfileById: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/vendor/profile/${id}`, { headers });
    const data = await handleResponse(response);
    return { profile: data.profile };
  },

  // Update user profile
  updateProfile: async (userData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/vendor/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};
