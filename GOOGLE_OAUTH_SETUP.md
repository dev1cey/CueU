# Google OAuth Setup Guide

This document explains how to set up Google OAuth for the CueU app.

## Prerequisites

1. Firebase project with Authentication enabled
2. Google Cloud Console access

## Setup Steps

### 1. Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (cueu-aff09)
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your support email
6. Save the configuration

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Create OAuth 2.0 Client IDs for each platform:

#### For Web (Development/Testing)
- Application type: **Web application**
- Authorized JavaScript origins: 
  - `http://localhost:8081`
  - `http://localhost:19006`
- Authorized redirect URIs:
  - `http://localhost:8081/__/auth/handler`
  - `http://localhost:19006/__/auth/handler`

#### For iOS
- Application type: **iOS**
- Bundle ID: `com.yourusername.cueu` (from app.json)

#### For Android
- Application type: **Android**
- Package name: `com.yourusername.cueu` (from app.json)
- SHA-1 certificate fingerprint: (get from your keystore)

### 3. Update Firebase Config (if needed)

The `firebase/config.ts` file should already have the correct configuration. Verify it matches your Firebase project settings.

### 4. Domain Whitelisting

In Firebase Console > Authentication > Settings > Authorized domains:
- Add `localhost` for development
- Add your production domain when deploying

## Current Implementation

### Web Platform
The app uses Firebase's `signInWithPopup` for web platforms, which works out of the box once Firebase is configured.

### Mobile Platforms (iOS/Android)
For mobile platforms, you'll need to:

1. **Option 1: Use Expo's Google Sign-In (Recommended for Expo Go)**
   - Install: `npx expo install expo-auth-session expo-web-browser`
   - Configure OAuth flow using `expo-auth-session`
   - Requires updating `app/index.tsx` with proper OAuth flow

2. **Option 2: Use native Google Sign-In (Recommended for production)**
   - Use `@react-native-google-signin/google-signin` for bare React Native
   - Provides better user experience
   - Requires ejecting from Expo or using a custom development build

## Email Validation

The app automatically validates that users sign in with an `@uw.edu` email address. Users with other email domains will be rejected during sign-in.

## Testing

For development and testing, the app includes a "Skip Login" button that uses a test account. This bypass should be removed before production deployment.

## Security Notes

1. Never commit OAuth client secrets to version control
2. Use environment variables for sensitive configuration
3. Implement proper error handling for OAuth failures
4. Monitor Firebase Authentication usage for suspicious activity

## Troubleshooting

### "Sign In Error: Invalid credentials"
- Verify OAuth client IDs are correctly configured in Google Cloud Console
- Check that redirect URIs match exactly (including protocol and port)

### "Please use a valid @uw.edu email address"
- This is expected behavior for non-UW emails
- Users must sign in with their UW Google account

### Image Upload Not Working
- The profile image picker is currently a placeholder
- Install `expo-image-picker` to enable image selection
- Ensure Firebase Storage is properly configured with security rules

## Next Steps

1. Set up OAuth credentials in Google Cloud Console
2. Test Google sign-in on web platform
3. Configure mobile OAuth flow using expo-auth-session
4. Implement proper image picker functionality
5. Test the complete flow: sign-in → profile setup → app access

