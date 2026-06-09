import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * CareerLens Mobile — Expo App Configuration
 *
 * Reads Firebase / Google credentials from environment variables so the same
 * backend infrastructure used by the web app is reused here. Set these in
 * `.env` (see `.env.example`) or via EAS secrets for CI builds.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'CareerLens',
  slug: 'careerlens-mobile',
  scheme: 'careerlens',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#050816',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.careerlens.mobile',
    buildNumber: '1',
    infoPlist: {
      NSFaceIDUsageDescription:
        'CareerLens uses Face ID to securely unlock your career data.',
      NSLocationWhenInUseUsageDescription:
        'CareerLens uses your location to find libraries and opportunities near you.',
      NSMicrophoneUsageDescription:
        'CareerLens uses your microphone for voice interviews and AI Copilot voice input.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.careerlens.mobile',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#050816',
    },
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'POST_NOTIFICATIONS',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-local-authentication',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#00E5FF',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#050816',
        image: './assets/images/splash.png',
        resizeMode: 'contain',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    gemini: {
      apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      model: process.env.EXPO_PUBLIC_GEMINI_MODEL ?? 'gemini-1.5-flash',
    },
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://careerlens.app/api',
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
