import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace these values with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB15z05100Mb6YBifBFMpd58cOVGQyWzww",
  authDomain: "cueu-aff09.firebaseapp.com",
  databaseURL: "https://cueu-aff09-default-rtdb.firebaseio.com",
  projectId: "cueu-aff09",
  storageBucket: "cueu-aff09.firebasestorage.app",
  messagingSenderId: "361114924548",
  appId: "1:361114924548:web:93b61872e5747d967c6751",
  measurementId: "G-2DHLSJL6D2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

// Google OAuth Client IDs for mobile platforms
// Web OAuth Client ID (works with expo-auth-session and Expo's auth proxy)
export const GOOGLE_OAUTH_WEB_CLIENT_ID = '361114924548-neh5h07q3kk2o46758msgg5dic7qr919.apps.googleusercontent.com';
// iOS OAuth Client ID (for native implementation if needed in the future)
export const GOOGLE_OAUTH_IOS_CLIENT_ID = '361114924548-fmii3vq7m3jthnkea85ta6f55sfbuh6h.apps.googleusercontent.com';
// If you need Android support, create an Android OAuth Client ID in Google Cloud Console and add it here:
// export const GOOGLE_OAUTH_ANDROID_CLIENT_ID = 'YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com';
