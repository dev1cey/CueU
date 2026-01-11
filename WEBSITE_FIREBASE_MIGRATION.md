# Website Firebase Migration Guide

This document contains all the information needed to update your website to use the new Firebase project (`cueu-f45c8`).

## New Firebase Configuration

### Firebase Project Details
- **Project ID**: `cueu-f45c8`
- **Project Name**: CueU (new project)

### Firebase Web App Configuration

```javascript
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
```

### Google OAuth Client IDs

**Web Client ID** (for website):
```
986847597138-k12cs21bnavpt1523od3q4llvo4aaded.apps.googleusercontent.com
```

**iOS Client ID** (if needed):
```
986847597138-68pu4d4eqk96imlv8tmk20udqtosntr0.apps.googleusercontent.com
```

## Migration Notes

> **Note**: This project has been migrated from the old Firebase project. If you need to reference old configuration values for migration purposes, they are available in the migration scripts located in `firebase/scripts/`.

## Files to Update in Website

### 1. Firebase Configuration File

**Location**: Usually `src/firebase/config.js`, `src/config/firebase.js`, `firebase.js`, or similar

**What to change**:
- Replace the entire `firebaseConfig` object with the new configuration above
- Update any OAuth Client IDs if they're hardcoded

**Example**:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAJDyt_24Mz87uByZVxkHUOYdnxLGSaOJ0",
  authDomain: "cueu-f45c8.firebaseapp.com",
  projectId: "cueu-f45c8",
  storageBucket: "cueu-f45c8.firebasestorage.app",
  messagingSenderId: "986847597138",
  appId: "1:986847597138:web:47be161543ae57ef38858b",
  measurementId: "G-D1BK1C339S"
};
```

### 2. Environment Variables (if used)

If your website uses environment variables (`.env`, `.env.local`, etc.), update:

```bash
VITE_FIREBASE_API_KEY=AIzaSyAJDyt_24Mz87uByZVxkHUOYdnxLGSaOJ0
VITE_FIREBASE_AUTH_DOMAIN=cueu-f45c8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cueu-f45c8
VITE_FIREBASE_STORAGE_BUCKET=cueu-f45c8.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=986847597138
VITE_FIREBASE_APP_ID=1:986847597138:web:47be161543ae57ef38858b
VITE_GOOGLE_OAUTH_CLIENT_ID=986847597138-k12cs21bnavpt1523od3q4llvo4aaded.apps.googleusercontent.com
```

### 3. Google OAuth Configuration

**Location**: Wherever Google Sign-In is configured (could be in auth setup, OAuth config, etc.)

**What to change**:
- Update Web Client ID to: `986847597138-k12cs21bnavpt1523od3q4llvo4aaded.apps.googleusercontent.com`

### 4. Firestore Security Rules

**Location**: `firestore.rules` or deployed via Firebase Console

**Current rules** (testing - allow all):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Production rules**: See `firestore.rules.production.backup` in the mobile app project

### 5. Firestore Indexes

**Location**: `firestore.indexes.json` or Firebase Console

The indexes are the same as before. See `firestore.indexes.json` in the mobile app project.

## Step-by-Step Migration Instructions

### Step 1: Backup Current Configuration

1. Make a backup of your current Firebase config file
2. Note down any custom configurations or settings

### Step 2: Update Firebase Configuration

1. Open your Firebase configuration file
2. Replace the `firebaseConfig` object with the new configuration provided above
3. Update any OAuth Client IDs
4. Update environment variables if used

### Step 3: Update OAuth Settings

1. Find where Google OAuth is configured
2. Update the Web Client ID to: `986847597138-k12cs21bnavpt1523od3q4llvo4aaded.apps.googleusercontent.com`
3. Verify redirect URIs are correct in Google Cloud Console

### Step 4: Deploy Firestore Rules (if managing via code)

If your website manages Firestore rules via code:

1. Copy the rules from the mobile app's `firestore.rules` file
2. Deploy using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules --project cueu-f45c8
   ```

### Step 5: Deploy Firestore Indexes (if managing via code)

If your website manages indexes via code:

1. Copy the indexes from the mobile app's `firestore.indexes.json` file
2. Deploy using Firebase CLI:
   ```bash
   firebase deploy --only firestore:indexes --project cueu-f45c8
   ```

### Step 6: Test the Website

1. **Test Authentication**:
   - Try signing in with Google
   - Verify authentication works
   - Check Firebase Console → Authentication to see users

2. **Test Firestore Operations**:
   - Test reading data
   - Test writing data (if your website allows)
   - Verify data appears in Firebase Console

3. **Test Storage** (if used):
   - Upload a test file
   - Verify it appears in Firebase Console → Storage

## Common File Locations to Check

Based on common website structures, check these locations:

- `src/firebase/config.js`
- `src/config/firebase.js`
- `src/utils/firebase.js`
- `firebase.js` (root)
- `config/firebase.js`
- `.env` or `.env.local` (environment variables)
- `src/config/constants.js` (if config is in constants)
- `public/firebase-config.json` (if using JSON config)

## Quick Reference

Current Firebase project: `cueu-f45c8`

If you need to find and update any hardcoded references, search for the project ID `cueu-f45c8` to verify all references are correct.

## Verification Checklist

After updating:

- [ ] Firebase configuration file updated
- [ ] Environment variables updated (if used)
- [ ] Google OAuth Client ID updated
- [ ] Website builds without errors
- [ ] Google Sign-In works
- [ ] Firestore read operations work
- [ ] Firestore write operations work (if applicable)
- [ ] Storage operations work (if applicable)
- [ ] No console errors related to Firebase
- [ ] Data appears correctly in Firebase Console

## Troubleshooting

### "Permission denied" errors
- Check that Firestore rules are deployed
- Verify rules allow the operations you're trying to perform

### "Invalid API key" errors
- Verify the API key is correct
- Check that the API key is not restricted in Google Cloud Console

### Google Sign-In not working
- Verify OAuth Client ID is correct
- Check redirect URIs in Google Cloud Console
- Ensure OAuth consent screen is configured

### Data not appearing
- Check that you're looking at the correct Firebase project in Console
- Verify collection names match
- Check Firestore rules allow reads

## Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all configuration values are correct
3. Check Firebase Console for any errors or warnings
4. Ensure Firestore rules are deployed correctly

## Summary

**Current Configuration:**
- Project ID: `cueu-f45c8`
- All Firebase configuration values are set
- OAuth Client IDs are configured
- Firestore rules and indexes should be deployed to the project

**Files to Update:**
1. Firebase configuration file
2. Environment variables (if used)
3. OAuth Client ID configuration
4. Firestore rules (if managing via code)
5. Firestore indexes (if managing via code)

