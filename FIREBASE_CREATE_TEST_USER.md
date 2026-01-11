# Create Test User for Skip Login

The "Skip Login" feature requires a Firebase Authentication user to be created in your Firebase project.

## Quick Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`cueu-f45c8`)
3. Navigate to **Authentication** → **Users** tab
4. Click **"Add user"** button
5. Enter:
   - **Email**: `test@uw.edu`
   - **Password**: `test123456`
6. Click **"Add user"**

That's it! The "Skip Login" button should now work.

## Verify Email/Password is Enabled

Before creating the user, make sure Email/Password authentication is enabled:

1. Go to **Authentication** → **Sign-in method** tab
2. Click on **"Email/Password"**
3. Make sure it's **Enabled**
4. If not, toggle it ON and click **"Save"**

## Alternative: Use Anonymous Authentication

If you prefer not to create a specific test user, you can enable Anonymous Authentication:

1. Go to **Authentication** → **Sign-in method**
2. Click on **"Anonymous"**
3. Toggle **"Enable"** to ON
4. Click **"Save"**

Then the code would need to be updated to use `signInAnonymously()` instead of `signInWithEmailAndPassword()`.

## After Setup

Once the test user is created:
- The "Skip Login (Testing)" button will work
- The app will authenticate with Firebase
- Then it will load the test user from Firestore (ID: `UUtPL20HxNTYVlSJhs1e`)

