import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://jskfweobottoxhltblzd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impza2Z3ZW9ib3R0b3hobHRibHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDM3ODEsImV4cCI6MjA1NTExOTc4MX0.onqjmJqHd4sHWdusNCIj4d2LnV737yCeryHB-MPyyi0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 