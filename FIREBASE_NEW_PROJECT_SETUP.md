# Firebase New Project Setup Guide

This guide walks you through setting up a brand new Firebase project for the CueU app.

## Step 1: Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., `cueu-new` or `cueu-production`)
4. Click **Continue**
5. **Disable Google Analytics** (optional, but recommended for simplicity) or enable it if you want analytics
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Enable Required Firebase Services

### 2.1 Enable Firestore Database

1. In the Firebase Console, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add security rules next)
4. Select a **location** for your database (choose the closest region to your users)
5. Click **"Enable"**

### 2.2 Enable Authentication

1. Click on **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Google"** provider
5. Toggle **"Enable"**
6. Enter a **Project support email** (your email)
7. Click **"Save"**

### 2.3 Enable Cloud Storage (if needed)

1. Click on **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Start in **"Production mode"** (we'll add security rules if needed)
4. Choose the same location as your Firestore database
5. Click **"Done"**

## Step 3: Set Up Google OAuth for Mobile Apps

### 3.1 Configure OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project from the project dropdown at the top
3. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
4. Choose **"External"** user type (unless you have a Google Workspace)
5. Fill in the required information:
   - App name: `CueU`
   - User support email: Your email
   - Developer contact information: Your email
6. Click **"Save and Continue"**
7. On the **Scopes** page, click **"Save and Continue"** (no additional scopes needed)
8. On the **Test users** page, add test users if needed, then click **"Save and Continue"**
9. Review and click **"Back to Dashboard"**

### 3.2 Create OAuth 2.0 Client IDs

1. In Google Cloud Console, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first (see step 3.1)

#### Create Web Client ID (for Expo auth proxy)
1. Application type: **"Web application"**
2. Name: `CueU Web Client`
3. Authorized redirect URIs: Add these:
   - `https://auth.expo.io/@anonymous/cueu`
   - `exp://localhost:8081`
4. Click **"Create"**
5. **Copy the Client ID** - you'll need this for `GOOGLE_OAUTH_WEB_CLIENT_ID`

#### Create iOS Client ID
1. Application type: **"iOS"**
2. Name: `CueU iOS Client`
3. Bundle ID: `com.cueu.app` (must match your app.json bundleIdentifier)
4. Click **"Create"**
5. **Copy the Client ID** - you'll need this for `GOOGLE_OAUTH_IOS_CLIENT_ID`
6. **Note the Client ID format**: It will be something like `123456789-xxxxxxxxxxxxx.apps.googleusercontent.com`
   - The reverse format for `app.json` is: `com.googleusercontent.apps.123456789-xxxxxxxxxxxxx`

#### Create Android Client ID (optional, for future Android support)
1. Application type: **"Android"**
2. Name: `CueU Android Client`
3. Package name: `com.cueu.app` (must match your Android package)
4. SHA-1 certificate fingerprint: You'll need to get this from your Android keystore
5. Click **"Create"**
6. **Copy the Client ID** - save for future use

## Step 4: Get Firebase Configuration Values

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register app:
   - App nickname: `CueU Web`
   - Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the configuration object** - it will look like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx",
     measurementId: "G-XXXXX"
   };
   ```

## Step 5: Deploy Firestore Security Rules

1. In Firebase Console, go to **"Firestore Database"** → **"Rules"** tab
2. Copy the entire contents of `firestore.rules` from your project
3. Paste into the Firebase Console rules editor
4. Click **"Publish"**

## Step 6: Deploy Firestore Indexes

1. In Firebase Console, go to **"Firestore Database"** → **"Indexes"** tab
2. Click **"Add index"**
3. For each index in `firestore.indexes.json`:
   - Collection ID: `matches`
   - Fields: Add each field with its order (Ascending/Descending)
   - Query scope: `Collection`
   - Click **"Create"**

Alternatively, you can use Firebase CLI:
```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not already done)
firebase init firestore

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Step 7: Update Your Codebase

After completing the above steps, you'll need to update the following files with your new Firebase configuration:

### Files to Update:

1. **`firebase/config.ts`** - Main Firebase configuration
   - Update `firebaseConfig` object with new values
   - Update `GOOGLE_OAUTH_WEB_CLIENT_ID` with new Web Client ID
   - Update `GOOGLE_OAUTH_IOS_CLIENT_ID` with new iOS Client ID

2. **`app.json`** - Expo configuration
   - Update `ios.config.googleSignIn.reservedClientId` with reverse format of iOS Client ID

3. **`app/index.tsx`** - Auth screen
   - Update `redirectUri` with new iOS Client ID in reverse format

4. **Firebase Scripts** (all in `firebase/scripts/`):
   - `addCustomTestMatch.ts`
   - `addTestMatch.ts`
   - `listUsers.ts`
   - `updateTestUsersDiscord.ts`
   - Update `firebaseConfig` object in each file

5. **`FIRESTORE_RULES_GUIDE.md`** (optional)
   - Update project name reference if mentioned

## Step 8: Test the Setup

1. **Test Authentication**:
   - Run your app: `npm start`
   - Try signing in with Google
   - Verify authentication works

2. **Test Firestore**:
   - Try creating a user profile
   - Verify data appears in Firestore Console

3. **Test Security Rules**:
   - Try operations that should be allowed (read users, update own profile)
   - Try operations that should be denied (create matches, delete users)

## Step 9: Data Migration (if needed)

If you need to migrate data from your old Firebase project:

1. Export data from old project (Firestore → Settings → Export)
2. Import data to new project (Firestore → Settings → Import)
3. Or use the migration scripts in `firebase/scripts/` after updating them with new config

## Troubleshooting

### Google Sign-In not working
- Verify OAuth Client IDs are correct
- Check that Bundle ID matches in iOS Client ID configuration
- Ensure redirect URIs are correct for Web Client ID
- Check that OAuth consent screen is published (if using production)

### Firestore permission errors
- Verify security rules are deployed
- Check that user is authenticated
- Review Firestore rules in Console

### Index errors
- Check Firestore Console for missing index errors
- Create indexes as prompted
- Wait for indexes to build (can take a few minutes)

## Next Steps

After setup is complete:
1. Update all configuration files (see Step 7)
2. Test thoroughly
3. Update any environment variables or CI/CD configurations
4. Update documentation with new project details

