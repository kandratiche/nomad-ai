import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const EXPO_PUBLIC_SUPABASE_URL="https://nznswtsayytpdbijjqhj.supabase.co"

const EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bnN3dHNheXl0cGRiaWpqcWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzkyODksImV4cCI6MjA4NTg1NTI4OX0.kSc7hLNkaH6n6wGP0Hrxj76467airWjh-m9qCPNZ1GU"

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing Supabase environment variables (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY). ' +
    'Auth features will not work. Create a .env file in the project root with your Supabase credentials.'
  );
}

const supabase = createClient(
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...(Platform.OS === 'web' ? {
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => await fn(),
      } : {}),
    },
  }
);

export default supabase;