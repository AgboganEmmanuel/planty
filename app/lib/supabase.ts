// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = Constants.expoConfig?.extra?.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Generate a consistent device identifier
const getDeviceId = () => {
  return Device.deviceName || 
         Device.modelName || 
         Constants.installationId || 
         'unknown_device';
};

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Credentials', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'Present' : 'Missing'
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
    },
  });

export const deviceId = getDeviceId();