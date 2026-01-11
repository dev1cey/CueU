import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAJDyt_24Mz87uByZVxkHUOYdnxLGSaOJ0",
  authDomain: "cueu-f45c8.firebaseapp.com",
  databaseURL: "https://cueu-f45c8-default-rtdb.firebaseio.com",
  projectId: "cueu-f45c8",
  storageBucket: "cueu-f45c8.firebasestorage.app",
  messagingSenderId: "986847597138",
  appId: "1:986847597138:web:47be161543ae57ef38858b",
  measurementId: "G-D1BK1C339S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const storage = getStorage(app);

export default app;

// Google OAuth Client IDs for mobile platforms
// Web OAuth Client ID (works with expo-auth-session and Expo's auth proxy)
export const GOOGLE_OAUTH_WEB_CLIENT_ID = '986847597138-k12cs21bnavpt1523od3q4llvo4aaded.apps.googleusercontent.com';
// iOS OAuth Client ID (for native implementation if needed in the future)
export const GOOGLE_OAUTH_IOS_CLIENT_ID = '986847597138-68pu4d4eqk96imlv8tmk20udqtosntr0.apps.googleusercontent.com';
// If you need Android support, create an Android OAuth Client ID in Google Cloud Console and add it here:
// export const GOOGLE_OAUTH_ANDROID_CLIENT_ID = 'YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com';
