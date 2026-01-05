# Fix Google OAuth "Error 400: invalid_request"

## Problem

You're getting **"Access blocked: Authorization Error"** with **"Error 400: invalid_request"** because the redirect URI that expo-auth-session is using is not whitelisted in your Google Cloud Console OAuth client.

## Root Cause

When you created the iOS OAuth Client ID in Google Cloud Console, you didn't add the **Redirect URI** that expo-auth-session uses. Google requires all redirect URIs to be explicitly whitelisted for security.

## Solution: Add Redirect URI to Google Cloud Console

### Step 1: Find Your Redirect URI

The redirect URI for your app is:
```
cueu://redirect
```

This is based on:
- **Scheme**: `cueu` (from your `app.json`)
- **Path**: `redirect` (standard expo-auth-session path)

You can also check the Metro bundler console logs after I updated the code - it will print the exact redirect URI.

### Step 2: Update Google Cloud Console OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **cueu-aff09**
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your **iOS OAuth Client ID** (the one ending in `-fmii3vq7m3jthnkea85ta6f55sfbuh6h.apps.googleusercontent.com`)
5. Click **Edit** (pencil icon)
6. Scroll down to **Redirect URIs**
7. Click **+ ADD URI**
8. Add: `cueu://redirect`
9. Click **SAVE**

### Step 3: Test Again

After saving:
1. Wait 1-2 minutes for changes to propagate
2. Kill and restart your Expo app
3. Try Google Sign-In again
4. It should now work!

## Alternative: Use Expo Go Scheme (For Development Only)

If you're testing with Expo Go instead of a development build, you need a different redirect URI format:

```
exp://10.0.0.144:8081/--/redirect
```

Where `10.0.0.144` is your development machine's IP address.

**Note**: This only works with Expo Go for quick testing. For production or development builds, use `cueu://redirect`.

## Verify Your Configuration

After adding the redirect URI, your iOS OAuth Client should have:
- **Application type**: iOS
- **Name**: CueU iOS (or whatever you named it)
- **Bundle ID**: `com.cueu.app`
- **Redirect URIs**: `cueu://redirect`

## Common Issues

### "The redirect URI in the request does not match"
- Make sure you added the **exact** redirect URI: `cueu://redirect`
- No typos, no extra slashes, no spaces

### "This app is not verified"
- This is expected for development. Click "Advanced" → "Go to CueU (unsafe)"
- For production, you'll need to submit your app for Google verification

### Still getting Error 400
- Wait 2-3 minutes after saving changes in Google Cloud Console
- Clear browser cache or try in private/incognito mode
- Make sure you're editing the iOS OAuth Client (not Web or Android)

## What I Changed in the Code

I updated `app/index.tsx` to:
1. Import `makeRedirectUri` from expo-auth-session
2. Explicitly generate and use the redirect URI
3. Log the redirect URI to console for debugging
4. Pass it to the OAuth configuration

This ensures consistent redirect URIs and helps with debugging.

## Next Steps

1. Add `cueu://redirect` to your Google Cloud Console iOS OAuth Client
2. Save and wait 1-2 minutes
3. Restart your app
4. Try Google Sign-In again
5. You should successfully authenticate and be redirected back to your app!

## For Production

When you build for production:
- The redirect URI will remain `cueu://redirect`
- Make sure it's in your Google Cloud Console OAuth client settings
- Consider submitting your app for Google verification to remove the "unverified app" warning

