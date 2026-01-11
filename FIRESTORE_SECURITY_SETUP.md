# Firestore Security Rules Setup - Complete Guide

This guide walks you through the complete setup of the new Firestore security rules that use Firebase Auth custom claims for admin management.

## Overview

The new security rules:
- ✅ Require authentication for all operations
- ✅ Use Firebase Auth custom claims (`request.auth.token.admin`) as the ONLY source of truth for admin status
- ✅ Allow users to manage their own profiles
- ✅ Restrict admin operations to users with admin claims
- ✅ Are simple, readable, and maintainable

## Part A: Authentication & Identity ✅

### A1. Verify Firebase Auth is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cueu-f45c8`
3. Navigate to **Authentication** → **Sign-in method**
4. Ensure **Google** sign-in is enabled
5. (Optional) Enable **Email/Password** if needed

✅ **Status**: Firebase Auth is already configured in your project.

### A2. Confirm User Document IDs

**CRITICAL**: User documents MUST use `auth.uid` as the document ID.

✅ **Current Status**: Your code already does this correctly!
- `app/profile-setup.tsx` line 77: `await createUser(firebaseUser.uid, {...})`
- `firebase/services/userService.ts` line 37: `doc(db, USERS_COLLECTION, userId)`

**If you have existing users with non-UID document IDs**, you need to migrate them:
1. Export existing users
2. Create new documents with `auth.uid` as ID
3. Delete old documents

## Part B: Admin Role Setup 🔧

### B1. Choose Your Root Admin

Pick yourself or a trusted user. This will be the first admin who can then promote others.

### B2. Grant Admin Claim (One-Time Setup)

**Option 1: Using the makeAdmin.js script (Recommended)**

1. Get the user's Firebase Auth UID:
   - From Firebase Console → Authentication → Users
   - Or from your app: `auth.currentUser.uid`

2. Edit `makeAdmin.js` and set the `uid` variable:
   ```javascript
   const uid = "YOUR_USER_UID_HERE";
   ```

3. Run the script:
   ```bash
   node makeAdmin.js
   ```

**Option 2: Using Firebase Console (Not Recommended)**

Firebase Console doesn't support custom claims directly. Use the script or Cloud Function.

### B3. Force Token Refresh

After granting admin claim, the user MUST refresh their token:

**In your app:**
```typescript
// Force token refresh
await auth.currentUser?.getIdToken(true);

// Or have user log out and log back in
```

**In website/admin panel:**
```javascript
// Force token refresh
await auth.currentUser.getIdToken(true);
```

### B4. Verify Admin Claim

**In your app:**
```typescript
import { isAdmin } from './firebase/utils/authUtils';

const adminStatus = await isAdmin();
console.log('Is admin:', adminStatus); // true if admin
```

**In website/admin panel:**
```javascript
const token = await auth.currentUser.getIdTokenResult(true);
console.log('Admin claim:', token.claims.admin); // true if admin
```

## Part C: Cloud Functions for Admin Management 🚀

### C1. Set Up Cloud Functions

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Functions** (if not already done):
   ```bash
   cd functions
   npm install
   ```

4. **Deploy Functions**:
   ```bash
   npm run deploy
   # Or: firebase deploy --only functions
   ```

### C2. Use the Admin Management Functions

**Grant/Remove Admin Role:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const setAdminRole = httpsCallable(functions, 'setAdminRole');

// Grant admin
await setAdminRole({ 
  uid: 'target-user-uid', 
  makeAdmin: true 
});

// Remove admin
await setAdminRole({ 
  uid: 'target-user-uid', 
  makeAdmin: false 
});
```

**List All Admins:**
```typescript
const listAdmins = httpsCallable(functions, 'listAdmins');
const result = await listAdmins();
console.log('Admins:', result.data);
```

### C3. Safety Features

✅ **Self-lockout prevention**: Admins cannot remove their own admin role
✅ **Permission checks**: Only admins can call these functions
✅ **Input validation**: All parameters are validated

## Part D: Client-Side Changes ✅

### D1. Admin Status Checking

**✅ Created**: `firebase/utils/authUtils.ts`

Use this utility to check admin status:
```typescript
import { isAdmin, isAdminCached } from '../firebase/utils/authUtils';

// Force refresh (use when you need latest status)
const adminStatus = await isAdmin();

// Use cached token (faster, for UI checks)
const adminStatusCached = await isAdminCached();
```

### D2. Updated AuthContext

**✅ Updated**: `contexts/AuthContext.tsx`

- Now uses `auth.uid` for user lookups instead of email
- User documents are looked up by `auth.uid` (matching Firestore rules)

### D3. Remove Email-Based Admin Checks

**⚠️ Action Required**: Search your codebase for any email-based admin checks:

```bash
# Search for patterns like:
grep -r "admin" --include="*.ts" --include="*.tsx" .
grep -r "@uw.edu" --include="*.ts" --include="*.tsx" .
grep -r "isAdmin" --include="*.ts" --include="*.tsx" .
```

**Replace with**:
```typescript
import { isAdmin } from '../firebase/utils/authUtils';
const userIsAdmin = await isAdmin();
```

### D4. Gate Admin UI by Claims

**Example**:
```typescript
import { isAdmin } from '../firebase/utils/authUtils';

function AdminPanel() {
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const admin = await isAdmin();
    setIsUserAdmin(admin);
    setLoading(false);
  };

  if (loading) return <Loading />;
  if (!isUserAdmin) return <AccessDenied />;

  return <AdminContent />;
}
```

### D5. Handle Permission Errors

**Expected errors**:
- `permission-denied`: User doesn't have permission
- `unauthenticated`: User is not signed in

**Example error handling**:
```typescript
try {
  await someAdminOperation();
} catch (error: any) {
  if (error.code === 'permission-denied') {
    Alert.alert('Access Denied', 'You do not have permission to perform this action.');
  } else if (error.code === 'unauthenticated') {
    Alert.alert('Not Signed In', 'Please sign in to continue.');
  } else {
    Alert.alert('Error', error.message);
  }
}
```

## Part E: Firestore Rules Deployment 📋

### E1. Deploy Rules

**Option 1: Using Firebase CLI**
```bash
firebase deploy --only firestore:rules
```

**Option 2: Using Firebase Console**
1. Go to Firestore Database → Rules
2. Copy the rules from `firestore.rules`
3. Paste and click "Publish"

### E2. Test Rules (Recommended)

**Using Firestore Emulator**:
```bash
# Start emulator
firebase emulators:start --only firestore

# Run tests (you'll need to create test scripts)
```

**Manual Testing Checklist**:
- [ ] Logged out user cannot read/write anything
- [ ] Normal user can read all collections
- [ ] Normal user can create/update their own user document
- [ ] Normal user CANNOT create/update matches, seasons, news, events
- [ ] Admin user can read/write everything
- [ ] Admin user can manage other users

## Part F: Verification Checklist ✅

Before going to production, verify:

- [ ] ✅ Firestore rules deployed
- [ ] ✅ At least one root admin has been granted admin claim
- [ ] ✅ Root admin has refreshed token and verified admin status
- [ ] ✅ Cloud Functions deployed (if using)
- [ ] ✅ Client code uses `auth.uid` for user lookups
- [ ] ✅ Client code uses `isAdmin()` utility (not email checks)
- [ ] ✅ Admin UI is gated by token claims
- [ ] ✅ Permission errors are handled gracefully
- [ ] ✅ Tested with Firestore Emulator (recommended)

## Part G: Troubleshooting 🔧

### Issue: "permission-denied" errors

**Possible causes**:
1. User doesn't have admin claim → Grant admin claim and refresh token
2. Token not refreshed → Call `getIdToken(true)` or log out/in
3. Rules not deployed → Deploy rules: `firebase deploy --only firestore:rules`

### Issue: Admin claim not showing up

**Solution**:
1. Verify claim was set: Check Firebase Console → Authentication → Users → [User] → Custom claims
2. Force token refresh: `await auth.currentUser.getIdToken(true)`
3. Check token: `await auth.currentUser.getIdTokenResult(true)` and log `token.claims`

### Issue: User document not found

**Possible causes**:
1. User document ID doesn't match `auth.uid` → Migrate user data
2. User hasn't completed profile setup → User needs to create profile

## Part H: Next Steps 🎯

### Optional Improvements (Later)

1. **Add audit logs**: Track admin promotions, match changes, etc.
2. **Add more roles**: `{ admin: true, captain: true, moderator: true }`
3. **Lock down more collections**: Add rules for payments, rankings, etc.
4. **Add rate limiting**: Prevent abuse of admin functions

### Migration from Old System

If you're migrating from an old admin system:
1. Export all admin emails/UIDs
2. Grant admin claims to those users
3. Remove old admin checking logic
4. Test thoroughly

## Summary

✅ **Rules**: Updated and deployed
✅ **Admin Utility**: Created `firebase/utils/authUtils.ts`
✅ **AuthContext**: Updated to use `auth.uid`
✅ **makeAdmin Script**: Improved with better instructions
✅ **Cloud Functions**: Created for admin management
✅ **Documentation**: This guide

**You're ready to go!** 🎉

Just remember:
- Admin = custom claim (`request.auth.token.admin === true`)
- Never trust client-side checks alone
- Always verify in Firestore rules
- Force token refresh after granting admin claim

