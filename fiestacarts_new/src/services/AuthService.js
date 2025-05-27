import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';

export const AuthService = {
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'vendorapp://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Google sign-in failed: ' + error.message);
    }
  },

  async signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'vendorapp://auth/callback',
          scopes: 'email,public_profile',
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Facebook sign-in failed: ' + error.message);
    }
  },

  async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'vendorapp://auth/callback',
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error('Apple sign-in failed: ' + error.message);
    }
  }
}; 