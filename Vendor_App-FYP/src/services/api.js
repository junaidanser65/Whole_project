import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Define the base URL for the API
// 192.168.18.8
const API_URL = "http://192.168.0.156:5000/api";
// export const API_URL = "https://fypbackend-production-f754.up.railway.app/api";//ushna /  hamza bhai ke mobile ka

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
  getProfileById: async (id) => {
    try {
      const headers = await getAuthHeaders();
      console.log('Fetching profile for ID:', id);
      console.log('Using headers:', headers);
      console.log('API URL:', `${API_URL}/vendor/profile/profile/${id}`);
      
      const response = await fetch(`${API_URL}/vendor/profile/profile/${id}`, { 
        headers,
        method: 'GET'
      });
      
      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile fetch error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log('Profile response data:', data);
      
      if (!data.success) {
        console.error('Profile fetch unsuccessful:', data);
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      if (!data.profile) {
        console.error('No profile data in response:', data);
        throw new Error('No profile data received');
      }
      
      console.log('Successfully parsed profile data:', data.profile);
      return { profile: data.profile };
    } catch (error) {
      console.error('Get profile by ID error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/vendor/profile/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

export const updateProfile = async (profileData) => {
  try {    const token = await AsyncStorage.getItem("auth_token");

    // Ensure all required fields are present and not undefined
    if (!profileData.name || !profileData.business_name || !profileData.phone_number) {
      return {
        success: false,
        error: 'Missing required fields'
      };
    }

    const requestData = {
      name: profileData.name.trim(),
      business_name: profileData.business_name.trim(),
      phone_number: profileData.phone_number.trim(),
      address: profileData.address?.trim() || '',
      profile_image: profileData.profile_image || null
    };

    console.log('Sending profile update request:', requestData);
    
    const response = await axios({
      method: 'PUT',
      url: `${API_URL}/vendor/profile/profile`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: requestData
    });

    console.log('Profile update response:', response.data);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      error: 'Failed to update profile'
    };
  } catch (error) {
    console.error('Profile update error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile'
    };
  }
};

// Chat related API functions
export const getVendorConversations = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/vendor/chat/vendor/conversations`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching vendor conversations:', error);
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/vendor/chat/messages/${conversationId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (conversationId, message) => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'POST',
      url: `${API_URL}/vendor/chat/messages`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        conversationId,
        message
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get total balance for vendor
export const getTotalBalance = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/total-balance`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching total balance:', error);
    throw error;
  }
};

// Get today's revenue for vendor
export const getTodayRevenue = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/today-revenue`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s revenue:', error);
    throw error;
  }
};

// Get new bookings count for vendor
export const getNewBookings = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/new-bookings`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching new bookings count:', error);
    throw error;
  }
};

// Get total customers for vendor
export const getTotalCustomers = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/total-customers`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching total customers:', error);
    throw error;
  }
};

// Get average rating for vendor
export const getAverageRating = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/average-rating`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching average rating:', error);
    throw error;
  }
};

// Get weekly revenue data for vendor
export const getWeeklyRevenue = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/weekly-revenue`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching weekly revenue:', error);
    throw error;
  }
};

// Get monthly revenue data for vendor
export const getMonthlyRevenue = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/monthly-revenue`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    throw error;
  }
};

// Get recent activities for vendor
export const getRecentActivities = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/recent-activities`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// Get all reviews for vendor
export const getVendorReviews = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/reviews`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    throw error;
  }
};

// Get all recent activities for vendor
export const getAllRecentActivities = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/all-recent-activities`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching all recent activities:', error);
    throw error;
  }
};

// Get all customers for vendor
export const getVendorCustomers = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/customers`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching vendor customers:', error);
    throw error;
  }
};

// Get total bookings for vendor
export const getTotalBookings = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    const response = await axios({
      method: 'GET',
      url: `${API_URL}/bookings/vendor/total-bookings`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching total bookings:', error);
    throw error;
  }
};