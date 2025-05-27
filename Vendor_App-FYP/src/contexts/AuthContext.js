import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login function
  // const login = async (email, password) => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const user = await apiClient.login(email, password);
  //     console.log("User after login:", user); // 👈 Add this line
  //     setUser(user);
  //     return { success: true, user };
  //   } catch (err) {
  //     setError(err.message);
  //     return { success: false, error: err.message };
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.login(email, password);
      console.log("Login result:", result);
      
      if (result.success && result.user && result.token) {
        // Store user in state
        setUser(result.user);
        
        // Explicitly store token in AsyncStorage
        await AsyncStorage.setItem("auth_token", result.token);
        console.log("Token stored in AsyncStorage:", result.token);
        
        return { 
          success: true, 
          user: result.user, 
          token: result.token 
        };
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error in context:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  
  // Signup function
  const signup = async (name, phone_number, email, password) => {
    setLoading(true);
    setError(null);

    try {
      const user = await apiClient.signup({
        email,
        password,
        name,
        phone_number,
      });
      setUser(user);
      return { success: true, user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
