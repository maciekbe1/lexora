import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

// Complete WebBrowser auth session for proper OAuth handling
WebBrowser.maybeCompleteAuthSession();

/**
 * Handle OAuth callback URL by extracting tokens and setting session
 */
async function handleOAuthCallback(url: string) {
  try {
    console.log('🔄 Processing OAuth callback URL...');
    
    // Parse URL - tokeny są w fragment (po #), nie w query params
    const parsedUrl = new URL(url);
    const fragment = parsedUrl.hash.slice(1); // Usuń # z początku
    const params = new URLSearchParams(fragment);
    
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    
    console.log('🔍 Fragment:', fragment);
    console.log('🔑 Access token:', access_token ? 'found' : 'missing');
    console.log('🔑 Refresh token:', refresh_token ? 'found' : 'missing');
    
    if (access_token && refresh_token) {
      console.log('🔑 Found tokens, setting session...');
      
      // Set session with tokens
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      
      if (error) {
        console.error('❌ Error setting session:', error);
        throw error;
      }
      
      console.log('✅ Session set successfully:', !!data.user, data.user?.email);
    } else {
      console.log('⚠️ No tokens found in callback URL fragment');
    }
  } catch (error) {
    console.error('❌ Error handling OAuth callback:', error);
    throw error;
  }
}

interface OAuthResult {
  success: boolean;
  error?: string;
}

// Create redirect URI for OAuth
const getRedirectUri = () => {
  return makeRedirectUri({
    scheme: 'lexora',
    path: 'auth/callback',
    preferLocalhost: true, // Use localhost for development
  });
};

/**
 * Sign in with Google using Supabase social login
 * No complex setup needed - just enable in Supabase Dashboard
 */
export async function signInWithGoogle(): Promise<OAuthResult> {
  try {
    console.log('🔐 Starting Google OAuth with Supabase...');
    
    const redirectUri = getRedirectUri();
    console.log('📍 Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('❌ Google OAuth error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    if (!data.url) {
      return { 
        success: false, 
        error: 'No OAuth URL received from Supabase' 
      };
    }

    console.log('🌐 Opening OAuth browser...');

    // Open OAuth URL in WebBrowser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
      {
        showInRecents: true,
        preferEphemeralSession: false, // Allow persistent login
      }
    );

    console.log('📱 OAuth result:', result.type);

    if (result.type === 'success') {
      console.log('✅ Google OAuth successful');
      console.log('🔗 OAuth URL:', result.url);
      
      // Po udanym OAuth, przetwórz URL callback
      if (result.url) {
        await handleOAuthCallback(result.url);
      }
      
      return { success: true };
    } else if (result.type === 'cancel') {
      return { 
        success: false, 
        error: 'Login was cancelled' 
      };
    } else {
      return { 
        success: false, 
        error: 'OAuth failed or was interrupted' 
      };
    }
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown OAuth error' 
    };
  }
}

/**
 * Sign in with Apple using Supabase social login  
 * iOS only - requires Apple Developer account for production
 */
export async function signInWithApple(): Promise<OAuthResult> {
  if (Platform.OS !== 'ios') {
    return { 
      success: false, 
      error: 'Apple Sign In is only available on iOS devices' 
    };
  }

  try {
    console.log('🍎 Starting Apple OAuth with Supabase...');
    
    const redirectUri = getRedirectUri();
    console.log('📍 Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          response_mode: 'form_post',
        },
      },
    });

    if (error) {
      console.error('❌ Apple OAuth error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    if (!data.url) {
      return { 
        success: false, 
        error: 'No OAuth URL received from Supabase' 
      };
    }

    console.log('🌐 Opening Apple OAuth browser...');

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri,
      {
        showInRecents: true,
        preferEphemeralSession: false,
      }
    );

    console.log('📱 Apple OAuth result:', result.type);

    if (result.type === 'success') {
      console.log('✅ Apple OAuth successful');
      console.log('🔗 Apple OAuth URL:', result.url);
      
      // Po udanym OAuth, przetwórz URL callback
      if (result.url) {
        await handleOAuthCallback(result.url);
      }
      
      return { success: true };
    } else if (result.type === 'cancel') {
      return { 
        success: false, 
        error: 'Apple login was cancelled' 
      };
    } else {
      return { 
        success: false, 
        error: 'Apple OAuth failed or was interrupted' 
      };
    }
  } catch (error) {
    console.error('❌ Apple OAuth error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown Apple OAuth error' 
    };
  }
}

/**
 * Check OAuth configuration
 * With Supabase social login, minimal configuration needed
 */
export function checkOAuthConfiguration(): {
  configured: boolean;
  providers: {
    google: boolean;
    apple: boolean;
  };
  notes: string[];
} {
  const notes: string[] = [];
  
  // For Supabase social login, we just need providers enabled in dashboard
  notes.push('✅ Using Supabase native social login');
  notes.push('📱 Google: Works on all platforms');
  
  if (Platform.OS === 'ios') {
    notes.push('🍎 Apple: Available on iOS');
  } else {
    notes.push('🍎 Apple: iOS only (current: ' + Platform.OS + ')');
  }
  
  notes.push('🔧 Setup: Enable providers in Supabase Dashboard');
  notes.push('📖 Guide: Authentication → Social Auth → Google/Apple');

  return {
    configured: true, // Always true for Supabase social login
    providers: {
      google: true,
      apple: Platform.OS === 'ios',
    },
    notes,
  };
}