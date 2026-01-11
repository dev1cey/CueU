# Enable Email/Password Authentication in Firebase

The error `auth/operation-not-allowed` means Email/Password authentication is not enabled in your Firebase project.

## Quick Fix

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`cueu-f45c8`)
3. Navigate to **Authentication** → **Sign-in method** tab
4. Click on **"Email/Password"** provider
5. Toggle **"Enable"** to ON
6. Click **"Save"**

That's it! The test login should now work.

## Alternative: Use Anonymous Authentication

If you prefer not to use Email/Password, you can enable Anonymous Authentication instead:

1. Go to Firebase Console → Authentication → Sign-in method
2. Click on **"Anonymous"** provider
3. Toggle **"Enable"** to ON
4. Click **"Save"**

Then update the code to use `signInAnonymously` instead of `signInWithEmailAndPassword`.

## After Enabling

Once Email/Password is enabled:
1. You can create test users in Firebase Console → Authentication → Users → Add user
2. The "Skip Login" button in the app will work
3. Test users can sign in with email/password

