import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual values from Supabase dashboard
const supabaseUrl = 'https://vjnzyqaqmfnzujjnwaky.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbnp5cWFxbWZuenVqam53YWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDc4NTksImV4cCI6MjA3MzA4Mzg1OX0.e5NYAfcKjXwVxVI9lm_9BEP3v7CeDMWokKS6SIq6Jng';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});