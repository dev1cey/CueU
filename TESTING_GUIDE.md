# Testing Guide - Authentication Flow

This guide walks you through testing the complete authentication system.

## Prerequisites

1. Firebase Console access
2. Google sign-in enabled in Firebase (see QUICKSTART.md)
3. Development server running (`npm start`)

## Test Scenarios

### Scenario 1: New User Sign-Up (Complete Flow)

**Steps:**
1. Open app on web browser (`npm run web` or press 'w')
2. Click "Sign in with Google" button
3. Google popup appears
4. Sign in with a UW email (@uw.edu)
5. System detects it's a new user
6. Redirected to Profile Setup page

**Profile Setup:**
7. Fill in required fields:
   - Name: "Test User"
   - Email: (auto-filled, disabled)
   - Skill Level: Select "Intermediate"
8. Optionally fill:
   - Phone: "(206) 555-0123"
   - WeChat: "testuser123"
   - Department: "College of Engineering"
   - Bio: "Love playing pool!"
   - Profile Picture: (click but will show "not implemented" message)
9. Click "Complete Profile & Join League"
10. Loading screen appears with status:
    - "Creating your account..."
    - "Please wait"
11. Success alert appears
12. Redirected to main app (tabs)

**Verification:**
- Check Firebase Console → Firestore → users collection
- New document should exist with your user ID
- All fields should be populated correctly

**Expected Result:** ✅ New user created, logged in, and viewing main app

---

### Scenario 2: Existing User Sign-In

**Steps:**
1. Open app on web browser
2. Click "Sign in with Google"
3. Sign in with same UW email as Scenario 1
4. System recognizes existing user
5. Automatically logs in and redirects to main app (tabs)

**Expected Result:** ✅ Existing user logged in immediately, no profile setup

---

### Scenario 3: Non-UW Email Rejection

**Steps:**
1. Open app on web browser
2. Click "Sign in with Google"
3. Sign in with non-UW email (e.g., gmail.com)
4. System validates email
5. Error alert appears: "Please use a valid @uw.edu email address"
6. User is signed out of Firebase
7. Returned to landing page

**Expected Result:** ✅ Non-UW user rejected, cannot access app

---

### Scenario 4: Profile Validation

**Steps:**
1. Start new user sign-up (Scenario 1, steps 1-6)
2. On Profile Setup page, leave Name empty
3. Click "Complete Profile & Join League"
4. Error alert: "Please enter your name"
5. Fill Name: "Test User"
6. Leave Skill Level empty
7. Click submit button
8. Error alert: "Please select your skill level"
9. Select Skill Level: "Beginner"
10. Click submit button
11. Profile creation proceeds

**Expected Result:** ✅ Validation prevents incomplete profiles

---

### Scenario 5: Loading States

**Steps:**
1. Start new user sign-up
2. Fill all required fields
3. Click "Complete Profile & Join League"
4. Observe loading states:
   - Button shows activity indicator
   - Text changes to "Creating profile..."
   - Semi-transparent overlay appears
   - Modal shows spinner
   - Status text: "Creating your account..."
5. Wait for completion
6. Success and redirect

**Expected Result:** ✅ Clear visual feedback during async operations

---

### Scenario 6: Test Account (Development Only)

**Steps:**
1. Open app
2. Scroll down to "Skip Login (Testing Only)"
3. Click the button
4. Loading indicator appears
5. Logs in as test-user-1
6. Redirected to main app

**Expected Result:** ✅ Test login works for development

---

## Firebase Verification Checklist

After testing, verify in Firebase Console:

### Authentication
- [ ] Go to Authentication → Users
- [ ] Your Google account is listed
- [ ] Provider shows "google.com"
- [ ] User ID matches Firestore document

### Firestore
- [ ] Go to Firestore Database → users collection
- [ ] Document exists with your Firebase Auth user ID
- [ ] All fields are populated:
  - name ✅
  - email ✅
  - skillLevel ✅
  - skillLevelNum ✅
  - phone (if provided) ✅
  - wechat (if provided) ✅
  - department (if provided) ✅
  - bio (if provided) ✅
  - wins: 0 ✅
  - losses: 0 ✅
  - matchesPlayed: 0 ✅
  - matchHistory: [] ✅
  - createdAt: (timestamp) ✅

---

## Mobile Testing (Placeholder)

Currently, mobile platforms show a modal explaining Google sign-in but don't fully execute OAuth.

**For Mobile:**
1. Click "Sign in with Google"
2. Modal appears explaining the process
3. Click "Continue"
4. Alert shows: "Google Sign-In requires additional setup"
5. Use "Skip Login" button for testing

**To enable mobile:**
- See GOOGLE_OAUTH_SETUP.md for complete configuration
- Requires Google Cloud Console OAuth setup
- Need to implement expo-auth-session flow

---

## Common Issues & Solutions

### Issue: "Sign In Error: Failed to get Google credentials"
**Solution:**
- Ensure testing on web platform (not mobile simulator)
- Check Firebase Console → Authentication → Google is enabled
- Clear browser cache and try again

### Issue: Profile creation hangs on loading screen
**Solution:**
- Check browser console for errors
- Verify Firestore permissions allow writes
- Check network tab for failed requests
- Refresh page and try again

### Issue: "User not found" after sign-in
**Solution:**
- Profile creation may have failed
- Check Firestore for user document
- Sign out and try creating profile again
- Check browser console for specific error

### Issue: Can't click Google sign-in button
**Solution:**
- Check if button is in loading state
- Refresh page
- Try different browser
- Check browser console for JavaScript errors

---

## Performance Testing

### Timing Expectations:
- Google popup: < 1 second
- Email validation: Instant
- Profile creation: 1-3 seconds
- Redirect to app: < 1 second

### Network Requests:
Should see these Firebase calls:
1. `signInWithPopup` - Google OAuth
2. Firestore query for existing user
3. Firestore write for new user (if new)
4. Firestore read to load user data

---

## Security Testing

### Verify:
- [ ] Non-UW emails are rejected
- [ ] Firebase Auth token is created
- [ ] User data is written to correct Firestore path
- [ ] No sensitive data in browser console
- [ ] OAuth tokens not exposed in URL
- [ ] Profile data requires authentication

---

## Edge Cases

### What if user closes window during profile setup?
- Firebase Auth session persists
- User will be prompted to complete profile on next sign-in
- No partial profile created

### What if user signs in with different Google account?
- Each account gets separate profile
- Must use UW email
- Previous account data persists

### What if profile creation fails?
- Error message shown
- User can try again
- Firebase Auth session maintained
- No partial data written

---

## Cleanup for Production

Before deploying:
1. Remove "Skip Login (Testing Only)" button
2. Remove test user ID from code
3. Add proper error analytics
4. Implement proper image picker
5. Add rate limiting for sign-up
6. Review Firebase security rules
7. Test on actual mobile devices
8. Configure production OAuth URLs

---

## Success Criteria

All scenarios should pass:
- ✅ New users can sign up with UW email
- ✅ Profile setup validates required fields
- ✅ Loading states show appropriately
- ✅ User data saves to Firestore correctly
- ✅ Existing users can sign in
- ✅ Non-UW emails are rejected
- ✅ Navigation flow works correctly
- ✅ Test login works for development

