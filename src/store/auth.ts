import { signInWithApple, signInWithGoogle } from '@/shared/services/supabase-oauth';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import { useAppStore } from './app';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  session: null,
  loading: true,
  error: null,

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  // Sign up with email/password
  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      // For email confirmation flow, user will be null initially
      set({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  // Sign in with OAuth (Google/Apple)
  signInWithOAuth: async (provider: 'google' | 'apple') => {
    set({ loading: true, error: null });
    
    try {
      let result;
      
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else if (provider === 'apple') {
        result = await signInWithApple();
      } else {
        throw new Error('Unsupported OAuth provider');
      }

      if (!result.success) {
        set({ error: result.error || 'OAuth failed', loading: false });
        return;
      }

      // OAuth success - auth state will be updated by the listener
      console.log('✅ OAuth completed successfully');
      set({ loading: false });
    } catch (error) {
      console.error('OAuth error in store:', error);
      set({
        error: error instanceof Error ? error.message : 'OAuth failed',
        loading: false,
      });
    }
  },

  // Sign out
  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      // Reset app initialization on logout
      try { useAppStore.getState().resetInit(); } catch { /* empty */ }

      set({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  // Initialize auth state and set up listeners
  initialize: async () => {
    set({ loading: true });

    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ error: error.message, loading: false });
        return;
      }

      set({
        user: session?.user ?? null,
        session,
        loading: false,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        set({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false,
      });
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
}));
