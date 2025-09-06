import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Get config from expo constants
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration in app.config.ts');
}

// Secure storage for session persistence (with chunking to avoid 2KB limit)
const CHUNK_SIZE = 1800; // conservative to account for encoding overhead
const chunkCountKey = (key: string) => `${key}__chunk_count`;
const chunkKey = (key: string, index: number) => `${key}__chunk_${index}`;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    const countStr = await SecureStore.getItemAsync(chunkCountKey(key));
    const count = countStr ? Number(countStr) : 0;
    if (count && Number.isFinite(count) && count > 0) {
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await SecureStore.getItemAsync(chunkKey(key, i));
        parts.push(part ?? '');
      }
      return parts.join('');
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    // Clean previous chunked values if any
    const prevCountStr = await SecureStore.getItemAsync(chunkCountKey(key));
    const prevCount = prevCountStr ? Number(prevCountStr) : 0;
    if (prevCount && Number.isFinite(prevCount) && prevCount > 0) {
      for (let i = 0; i < prevCount; i++) {
        await SecureStore.deleteItemAsync(chunkKey(key, i));
      }
      await SecureStore.deleteItemAsync(chunkCountKey(key));
    }

    if (value.length > CHUNK_SIZE) {
      // Remove base key to avoid ambiguity
      await SecureStore.deleteItemAsync(key);
      const parts: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        parts.push(value.slice(i, i + CHUNK_SIZE));
      }
      // Store parts
      await Promise.all(
        parts.map((part, idx) => SecureStore.setItemAsync(chunkKey(key, idx), part))
      );
      await SecureStore.setItemAsync(chunkCountKey(key), String(parts.length));
    } else {
      // Store as a single value
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    const countStr = await SecureStore.getItemAsync(chunkCountKey(key));
    const count = countStr ? Number(countStr) : 0;
    if (count && Number.isFinite(count) && count > 0) {
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(chunkKey(key, i));
      }
      await SecureStore.deleteItemAsync(chunkCountKey(key));
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Create Supabase client with secure storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Potrzebne dla OAuth callback
  },
});

// Types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
