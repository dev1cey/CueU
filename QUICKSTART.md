# Quick Start Guide - Google Authentication

## What Changed?

Your CueU app now uses **Google OAuth** for authentication with UW email validation.

## How to Test

### 1. Start the Development Server

```bash
npm start
```

### 2. Test on Web (Easiest)

Press `w` in the terminal to open in web browser.

**Sign-In Flow:**
1. Click "Sign in with Google"
2. Google popup will appear
3. Select your UW Google account (@uw.edu)
4. If new user: Fill out profile form
5. Done! You're in the app

### 3. Test on iOS/Android

For mobile, additional OAuth setup is required. See `GOOGLE_OAUTH_SETUP.md`.

For now, use the "Skip Login (Testing Only)" button on mobile.

## Required Firebase Setup

### Before First Use:

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Enable Google Sign-In:**
   - Navigate to: **Authentication** → **Sign-in method**
   - Click on **Google**
   - Toggle it to **Enabled**
   - Add your email as support email
   - Click **Save**

3. **Add Authorized Domain:**
   - In Authentication settings
   - Go to **Authorized domains** tab
   - Ensure `localhost` is in the list (should be by default)

That's it! Your app is ready to use Google sign-in on web.

## User Flow

### New Users:
```
Landing Page → Google Sign-In → Profile Setup → Main App
```

### Existing Users:
```
Landing Page → Google Sign-In → Main App
```

## Profile Fields

**Required:**
- Name
- Email (auto-filled from Google)
- Skill Level

**Optional:**
- Profile Picture
- Phone Number
- WeChat ID
- Department
- Bio

## Important Notes

1. **Only UW Emails:** Users must sign in with `@uw.edu` email addresses
2. **Loading Screen:** Shows while creating profile in Firebase
3. **Test Account:** "Skip Login" button still works for testing
4. **Web Only:** Full Google OAuth currently works best on web platform

## Troubleshooting

### "Sign In Error: Failed to sign in"
- Make sure Google sign-in is enabled in Firebase Console
- Check browser console for detailed error messages

### "Please use a valid @uw.edu email address"
- This is expected! Only UW email addresses are allowed
- Try signing in with your UW Google account

### Profile Creation Fails
- Check Firebase Firestore permissions
- Verify Firebase config in `firebase/config.ts`

### Stuck on Loading Screen
- Refresh the page
- Check browser console for errors
- Verify Firebase connection

## Next Steps

1. ✅ Test sign-in on web
2. ✅ Create a test profile
3. ✅ Verify you can access the main app
4. 📋 For mobile: Follow `GOOGLE_OAUTH_SETUP.md`
5. 📋 Before production: Remove "Skip Login" button

## Quick Commands

```bash
# Start development server
npm start

# Run on web
npm run web

# Run on iOS (requires setup)
npm run ios

# Run on Android (requires setup)
npm run android
```

## Questions?

- **Setup Issues:** See `GOOGLE_OAUTH_SETUP.md`
- **All Changes:** See `AUTHENTICATION_CHANGES.md`
- **Firebase Console:** https://console.firebase.google.com/
- **Google Cloud Console:** https://console.cloud.google.com/

