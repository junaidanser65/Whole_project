// src/contexts/ProfileContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "../services/api";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth(); // 👈 Get user from AuthContext

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);

 const fetchProfileById = async (id) => {
   setLoadingProfile(true);
   try {
     const { profile } = await apiClient.getProfileById(id); // ✅ destructure properly
     setProfile(profile); // ✅ setProfile to actual profile object
     setErrorProfile(null);
   } catch (error) {
     setErrorProfile(error.message);
     setProfile(null);
   } finally {
     setLoadingProfile(false);
   }
 };


  // ⏳ Auto-fetch profile if user is available
  useEffect(() => {
    if (user?._id) {
      fetchProfileById(user._id);
    }
  }, [user]);

  return (
    <ProfileContext.Provider
      value={{ profile, loadingProfile, errorProfile, fetchProfileById }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
