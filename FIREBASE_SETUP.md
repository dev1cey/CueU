# Firebase Setup Guide

This guide will help you connect your CueU app to Firebase.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## Step 2: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "CueU App")
5. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration values.

**Important:** Make sure to add `.env` to your `.gitignore` file to keep your credentials secure!

## Step 4: Enable Firebase Services

### Authentication
1. Go to **Authentication** in Firebase Console
2. Click **Get started**
3. Enable **Email/Password** sign-in method (or other methods you need)

### Realtime Database
1. Go to **Realtime Database** in Firebase Console
2. Click **Create database**
3. Choose a location for your database
4. Choose **Start in test mode** (for development) or set up security rules
5. **Important**: Note your database URL (e.g., `https://your-project-default-rtdb.firebaseio.com/`)

### Firestore Database
1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in test mode** (for development) or set up security rules
4. Select a location for your database

### Storage (Optional)
1. Go to **Storage** in Firebase Console
2. Click **Get started**
3. Follow the setup wizard

## Step 5: Restart Your Development Server

After setting up your `.env` file, restart your Expo development server:

```bash
npm start
```

## Usage Examples

### Authentication

```typescript
import { signUp, signIn, logout, getCurrentUser } from '../lib/firebase';

// Sign up a new user
await signUp('user@example.com', 'password123', 'John Doe');

// Sign in
await signIn('user@example.com', 'password123');

// Get current user
const user = getCurrentUser();

// Sign out
await logout();
```

### Firestore

```typescript
import { createDocument, getDocument, updateDocument, deleteDocument } from '../lib/firebase';

// Create a document
const docId = await createDocument('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Get a document
const user = await getDocument('users', docId);

// Update a document
await updateDocument('users', docId, { name: 'Jane Doe' });

// Delete a document
await deleteDocument('users', docId);
```

### Realtime Database (Live Matches)

```typescript
import {
  createMatch,
  authenticatePlayerToMatch,
  updateMatchRack,
  setMatchWinner,
  confirmMatchResult,
  subscribeToMatch,
} from '../lib/realtimeDb';

// Create a new match
await createMatch('match-123', 'player1-id', 'Player 1', 'player2-id', 'Player 2');

// Authenticate players (both must authenticate)
await authenticatePlayerToMatch('match-123', 'player1-id');
await authenticatePlayerToMatch('match-123', 'player2-id');
// Match status automatically changes to 'active' when both authenticate

// Update rack scores in real-time
await updateMatchRack('match-123', 1, 5, 3, 'player1-id');

// Set winner when match ends
await setMatchWinner('match-123', 'player1-id');
// Match status changes to 'pending_confirmation'

// Both players confirm the result
await confirmMatchResult('match-123', 'player1-id');
await confirmMatchResult('match-123', 'player2-id');
// Match status changes to 'completed' and syncs to Firestore

// Subscribe to real-time match updates
const unsubscribe = subscribeToMatch('match-123', (match) => {
  console.log('Match updated:', match);
  // Update UI with latest match state
});
```

### Match Sync (Realtime DB → Firestore)

```typescript
import { watchMatchForSync } from '../lib/matchSync';

// Automatically watch a match and sync to Firestore when completed
const unsubscribe = watchMatchForSync('match-123', (completedMatch) => {
  console.log('Match synced to Firestore:', completedMatch);
  // Match is now in Firestore for standings
});
```

### Storage

```typescript
import { uploadFile } from '../lib/firebase';

// Upload a file (e.g., from an image picker)
const file = // your file/blob
const downloadURL = await uploadFile('images/user-profile.jpg', file);
```

## Architecture: Realtime Database + Firestore

This app uses **both** Firebase Realtime Database and Firestore for different purposes:

### Realtime Database (Live Matches)
- **Purpose**: Real-time match updates, scores, and rack tracking
- **Why**: Provides instant synchronization between players during active matches
- **Location**: `lib/realtimeDb.ts`
- **Use Cases**:
  - Live match state (scores, racks, status)
  - Player authentication to matches
  - Real-time score updates visible to all competitors
  - Match confirmation workflow

### Firestore (Standings & History)
- **Purpose**: Persistent data storage for standings, match history, and user profiles
- **Why**: Better for querying, sorting, and displaying historical data
- **Location**: `lib/firebase.ts`
- **Use Cases**:
  - Player standings and statistics
  - Match history and results
  - User profiles
  - League information

### Match Workflow
1. **Create Match** → Realtime Database (`matches/{matchId}`)
2. **Both Players Authenticate** → Realtime Database (match becomes active)
3. **Update Scores/Racks** → Realtime Database (real-time updates)
4. **Set Winner & Confirm** → Realtime Database (both players confirm)
5. **Match Completed** → Automatically synced to Firestore (`matchResults`, `standings`)

See `lib/matchSync.ts` for the sync logic and `lib/matchExample.tsx` for usage examples.

## Files Created

- `config/firebase.ts` - Firebase initialization and configuration
- `lib/firebase.ts` - Utility functions for Firestore operations
- `lib/realtimeDb.ts` - Utility functions for Realtime Database (live matches)
- `lib/matchSync.ts` - Sync completed matches from Realtime DB to Firestore
- `lib/matchExample.tsx` - Example usage of live match functionality

## Security Rules

Make sure to set up proper security rules in Firebase Console for:
- **Realtime Database**: Go to Realtime Database > Rules
- **Firestore**: Go to Firestore Database > Rules
- **Storage**: Go to Storage > Rules

### Example Realtime Database Rules (Development)

```json
{
  "rules": {
    "matches": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "auth != null && (
          data.child('player1Id').val() === auth.uid ||
          data.child('player2Id').val() === auth.uid
        )"
      }
    }
  }
}
```

### Example Firestore Rules (Development)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /standings/{playerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == playerId;
    }
    match /matchResults/{matchId} {
      allow read: if request.auth != null;
      allow write: if false; // Only written by sync function
    }
  }
}
```

For development, you can use test mode, but for production, implement proper security rules based on your app's requirements.

