import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

// Function to create Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Create client instance
let supabaseInstance = null;
try {
  supabaseInstance = createSupabaseClient();
} catch (error) {
  console.error('Failed to create Supabase client:', error.message);
}

export const supabase = supabaseInstance;
export const isSupabaseConfigured = Boolean(supabaseInstance);