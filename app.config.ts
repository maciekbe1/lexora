import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Lexora',
  slug: 'lexora',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.lexora.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.lexora.app',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-sqlite',
    'expo-secure-store',
    'expo-router',
    'expo-web-browser',
  ],
  experiments: {
    typedRoutes: true,
  },
  scheme: 'lexora',
  extra: {
    eas: {
      projectId: 'f4fb4b49-5719-4337-9e81-24683c64530e',
    },
    // Supabase configuration
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    // OAuth configuration
    OAUTH_REDIRECT_URL: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URL || 'lexora://auth',
  },
});