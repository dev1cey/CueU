# Firebase Testing Guide

This guide will help you test that your new Firebase project is working correctly.

## Prerequisites

Before testing, make sure you've completed these steps:

1. ✅ **Deploy Firestore Rules** (if not done yet):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`cueu-f45c8`)
   - Navigate to **Firestore Database** → **Rules** tab
   - Copy the contents of `firestore.rules` (currently set to allow all for testing)
   - Paste into the Firebase Console
   - Click **"Publish"**

2. ✅ **Verify Firestore is enabled**:
   - In Firebase Console → Firestore Database
   - Make sure the database is created and active

## Step 1: Test Firebase Connection (Command Line)

Run the automated test script to verify basic Firebase connectivity:

```bash
npm run test:firebase
```

This will test:
- ✅ Firebase configuration
- ✅ Firestore read/write operations
- ✅ Firebase Auth connection
- ✅ Firebase Storage connection

**Expected Output:**
```
========================================
Firebase Connection Test
========================================

⚙️  Testing Firebase configuration...
  Project ID: cueu-f45c8
  Auth Domain: cueu-f45c8.firebaseapp.com
  ...
✅ Configuration looks correct

📊 Testing Firestore connection...
  Writing test document...
  ✅ Write successful
  Reading test document...
  ✅ Read successful
  ...
✅ Firestore connection test passed

🔐 Testing Firebase Auth connection...
  ✅ Firebase Auth connection test passed

💾 Testing Firebase Storage connection...
  ✅ Firebase Storage connection test passed

========================================
Test Summary
========================================
Configuration: ✅ PASS
Firestore: ✅ PASS
Auth: ✅ PASS
Storage: ✅ PASS
========================================

🎉 All tests passed! Firebase is connected and working correctly.
```

## Step 2: Test in the App

### 2.1 Start the App

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

### 2.2 Test Authentication

1. **Test Google Sign-In**:
   - On the auth screen, tap "Sign in with Google"
   - Complete the Google sign-in flow
   - Verify you're redirected to the main app
   - Check Firebase Console → Authentication to see your user

2. **Test Skip Login** (if you have test users):
   - Tap "Skip Login" button
   - This uses a test account (requires setup in Firebase Console)

### 2.3 Test Firestore Operations

After signing in, test these operations:

1. **Create User Profile**:
   - If you're a new user, you should see the profile setup screen
   - Fill out your profile
   - Verify data appears in Firebase Console → Firestore Database → `users` collection

2. **View Data**:
   - Navigate through the app (League, News, Settings)
   - Check that data loads correctly
   - Verify in Firebase Console that reads are happening

3. **Update Profile**:
   - Go to Settings or Edit Profile
   - Make a change
   - Verify the update appears in Firestore Console

## Step 3: Verify in Firebase Console

### 3.1 Check Firestore Data

1. Go to Firebase Console → Firestore Database → Data tab
2. Verify collections exist:
   - `users` - Should have your user document
   - `matches` - May be empty initially
   - `seasons` - May be empty initially
   - `news` - May be empty initially
   - `events` - May be empty initially
   - `notifications` - May be empty initially
   - `matchReports` - May be empty initially

### 3.2 Check Authentication

1. Go to Firebase Console → Authentication → Users tab
2. Verify your Google account appears in the list
3. Check that the email matches your Google account

### 3.3 Check Firestore Rules

1. Go to Firebase Console → Firestore Database → Rules tab
2. Verify the rules are deployed (should show the simple test rules)
3. Check the "Last published" timestamp

## Step 4: Test Common Scenarios

### Scenario 1: New User Sign-Up
1. Sign out of the app
2. Sign in with a different Google account (@uw.edu email)
3. Complete profile setup
4. Verify user document is created in Firestore

### Scenario 2: Existing User Sign-In
1. Sign out
2. Sign in again with the same account
3. Verify you're logged in and data loads

### Scenario 3: Data Reading
1. Navigate to League tab
2. Verify standings/rankings load (if data exists)
3. Navigate to News tab
4. Verify news articles load (if data exists)

## Troubleshooting

### Test Script Fails

**Error: "Permission denied"**
- Make sure Firestore rules are deployed
- Check that rules allow read/write (currently set to allow all for testing)

**Error: "Network error" or "Connection refused"**
- Check your internet connection
- Verify Firebase project is active
- Check that Firestore is enabled in Firebase Console

**Error: "Invalid API key"**
- Verify `firebase/config.ts` has correct configuration
- Check that API key is correct in Firebase Console

### App Authentication Fails

**Google Sign-In doesn't work:**
- Verify OAuth Client IDs are correct in `firebase/config.ts`
- Check that Google Sign-In is enabled in Firebase Console
- Verify OAuth consent screen is configured in Google Cloud Console
- Check that redirect URIs are correct

**"Please use a valid @uw.edu email address" error:**
- The app requires @uw.edu emails
- Use a valid UW email for testing

### Firestore Operations Fail

**"Missing or insufficient permissions" error:**
- Deploy Firestore rules (currently set to allow all for testing)
- Check Firebase Console → Firestore Database → Rules

**Data doesn't appear in Firestore:**
- Check that you're looking at the correct project in Firebase Console
- Verify the collection name matches what the app uses
- Check browser console for errors

## Next Steps

Once all tests pass:

1. ✅ **Restore Production Rules** (when ready):
   - Copy contents from `firestore.rules.production.backup`
   - Replace `firestore.rules` with production rules
   - Deploy to Firebase Console

2. ✅ **Deploy Firestore Indexes**:
   - Go to Firebase Console → Firestore Database → Indexes
   - Create indexes from `firestore.indexes.json`
   - Or use Firebase CLI: `firebase deploy --only firestore:indexes`

3. ✅ **Add Test Data** (optional):
   - Use scripts in `firebase/scripts/` to add test data
   - Or manually add data through Firebase Console

4. ✅ **Test Production Rules**:
   - After deploying production rules, test that:
     - Users can read/write their own data
     - Users cannot create matches, news, etc.
     - All operations require authentication

## Quick Test Checklist

- [ ] Run `npm run test:firebase` - All tests pass
- [ ] App starts without errors (`npm start`)
- [ ] Google Sign-In works
- [ ] User profile can be created/updated
- [ ] Data appears in Firestore Console
- [ ] Authentication shows in Firebase Console
- [ ] No console errors in app
- [ ] Firestore rules are deployed

If all checkboxes are checked, your Firebase setup is working correctly! 🎉

