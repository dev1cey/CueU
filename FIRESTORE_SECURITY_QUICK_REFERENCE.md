# Firestore Security - Quick Reference

## ✅ What's Done

- [x] Firestore rules updated with custom claims-based admin system
- [x] Admin utility functions created (`firebase/utils/authUtils.ts`)
- [x] AuthContext updated to use `auth.uid` for user lookups
- [x] `makeAdmin.js` script improved with better instructions
- [x] Cloud Functions created for admin management
- [x] Comprehensive setup guide created

## 🚀 Quick Start

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Grant First Admin
```bash
# Edit makeAdmin.js, set the UID
node makeAdmin.js
```

### 3. User Must Refresh Token
```typescript
await auth.currentUser?.getIdToken(true);
```

### 4. Verify Admin Status
```typescript
import { isAdmin } from './firebase/utils/authUtils';
const admin = await isAdmin();
```

## 📝 Key Points

### Admin Status
- **Source of Truth**: `request.auth.token.admin === true` (Firebase Auth custom claims)
- **NOT**: Email checks, Firestore `/admins` collection, or any client-side logic
- **Check in code**: Use `isAdmin()` from `firebase/utils/authUtils.ts`

### User Documents
- **Document ID MUST be**: `auth.uid` (Firebase Auth UID)
- **NOT**: Email, random IDs, or any other identifier
- **Lookup**: Use `getUserById(auth.currentUser.uid)`

### Firestore Rules
- All operations require authentication
- Users can manage their own profile (`/users/{uid}` where `uid == auth.uid`)
- Admins can manage everything (checked via `request.auth.token.admin == true`)

## 🔧 Common Tasks

### Grant Admin Role
```bash
# Option 1: Using makeAdmin.js script
node makeAdmin.js

# Option 2: Using Cloud Function (after deployment)
import { getFunctions, httpsCallable } from 'firebase/functions';
const setAdminRole = httpsCallable(getFunctions(), 'setAdminRole');
await setAdminRole({ uid: 'user-uid', makeAdmin: true });
```

### Check Admin Status in Code
```typescript
import { isAdmin, isAdminCached } from './firebase/utils/authUtils';

// Force refresh (use when you need latest status)
const admin = await isAdmin();

// Use cached (faster, for UI checks)
const adminCached = await isAdminCached();
```

### Gate Admin UI
```typescript
const [isUserAdmin, setIsUserAdmin] = useState(false);

useEffect(() => {
  isAdmin().then(setIsUserAdmin);
}, []);

if (!isUserAdmin) return <AccessDenied />;
```

## ⚠️ Important Reminders

1. **Token Refresh**: After granting admin claim, user MUST refresh token
2. **Document IDs**: User documents MUST use `auth.uid` as ID
3. **Never Trust Client**: Always verify in Firestore rules
4. **No Email Checks**: Don't check emails for admin status
5. **Self-Lockout Prevention**: Admins cannot remove their own admin role

## 🐛 Troubleshooting

### "permission-denied" errors
- Check if user has admin claim: `await isAdmin()`
- Force token refresh: `await auth.currentUser?.getIdToken(true)`
- Verify rules are deployed: `firebase deploy --only firestore:rules`

### Admin claim not showing
- Verify in Firebase Console → Authentication → Users → [User] → Custom claims
- Force token refresh
- Check token: `await auth.currentUser.getIdTokenResult(true)`

### User document not found
- Verify document ID matches `auth.uid`
- Check if user completed profile setup
- User document should be at `/users/{auth.uid}`

## 📚 Full Documentation

See `FIRESTORE_SECURITY_SETUP.md` for complete setup guide.

