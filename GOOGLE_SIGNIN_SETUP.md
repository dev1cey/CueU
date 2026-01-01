# Google Sign-In Setup Guide

## Prerequisites

The following packages have been installed:
- `expo-auth-session`
- `expo-web-browser`
- `expo-crypto`

## Step 1: Set up Google Cloud Console

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 1.2 Enable Google+ API

1. In the sidebar, go to **APIs & Services** > **Library**
2. Search for **Google+ API**
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **CueU**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`
   - Add test users: Your @uw.edu email

## Step 2: Create OAuth Clients for Each Platform

You'll need to create 3 OAuth clients:

### 2.1 Web Client (Required for Expo)

1. Application type: **Web application**
2. Name: **CueU Web**
3. Authorized redirect URIs:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/cueu
   ```
4. Click **Create**
5. **Save the Client ID** - you'll need this as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

### 2.2 iOS Client

1. Application type: **iOS**
2. Name: **CueU iOS**
3. Bundle ID: `com.cueu.app` (from your `app.json`)
4. Click **Create**
5. **Save the Client ID** - you'll need this as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

### 2.3 Android Client

1. Application type: **Android**
2. Name: **CueU Android**
3. Package name: `com.cueu.app` (from your `app.json`)
4. Get your SHA-1 certificate fingerprint:
   ```bash
   # For Expo development builds
   keytool -keystore ~/.android/debug.keystore -list -v
   # Password: android
   ```
5. Enter the SHA-1 fingerprint
6. Click **Create**
7. **Save the Client ID** - you'll need this as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Step 3: Configure Environment Variables

Add these to your `.env` file in the project root:

```env
# Google Sign-In Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Optional: For Expo Go
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

**Important:** Make sure `.env` is in your `.gitignore`!

## Step 4: Update app.json

Add the Google sign-in scheme to your `app.json`:

```json
{
  "expo": {
    "scheme": "cueu",
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Step 5: Testing

### 5.1 In Expo Go

```bash
npm start
```

The Google Sign-In will open in a browser and redirect back to your app.

### 5.2 On iOS Simulator/Device

```bash
npm run ios
```

### 5.3 On Android Emulator/Device

```bash
npm run android
```

## How It Works

1. User taps "Sign in with Google"
2. Opens browser with Google OAuth page
3. User selects their @uw.edu account
4. App validates the email ends with @uw.edu
5. If valid, user proceeds to profile setup
6. If invalid, shows error message

## Review Mode Access

For App Store reviewers or testing without a UW email:

1. Tap "Review Mode Access" at the bottom
2. Enter the review code: `CUEU2025`
3. Access the app directly

## Troubleshooting

### "Invalid Client" Error
- Check that all client IDs are correct in `.env`
- Verify redirect URI in Google Console matches your Expo URL
- Make sure the OAuth consent screen is configured

### Email Validation Fails
- Ensure the user is signing in with an @uw.edu account
- Check the email validation logic in `app/index.tsx`

### SHA-1 Certificate Error (Android)
- Get the correct SHA-1 from your keystore
- Make sure it's added to the Android OAuth client in Google Console

### Expo Go Not Working
- Expo Go has limitations with Google Sign-In
- Use development builds for better testing:
  ```bash
  npx expo run:ios
  npx expo run:android
  ```

## Production Checklist

Before going live:

- [ ] Configure OAuth consent screen for production
- [ ] Add all authorized domains
- [ ] Remove test user restrictions
- [ ] Add privacy policy URL
- [ ] Add terms of service URL
- [ ] Submit for OAuth verification if needed
- [ ] Test on real devices (iOS and Android)
- [ ] Verify email validation works correctly
- [ ] Test with multiple @uw.edu accounts

## UW Email Restriction

The app currently restricts sign-ins to **@uw.edu** email addresses only. This validation happens in the `handleGoogleSignIn` function:

```typescript
if (!userInfo.email.endsWith('@uw.edu')) {
  Alert.alert('Invalid Email', 'Only @uw.edu email addresses are allowed.');
  return;
}
```

## Integration with Firebase

After successful Google Sign-In, you can integrate with Firebase Authentication:

```typescript
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// In handleGoogleSignIn after getting the token:
const credential = GoogleAuthProvider.credential(authentication?.idToken);
await signInWithCredential(auth, credential);
```

## Resources

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)


