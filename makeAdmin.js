/**
 * Script to grant admin role to a user via Firebase Admin SDK
 * 
 * IMPORTANT: This script uses custom claims, which is the ONLY source of truth for admin status.
 * 
 * Usage:
 *   1. Set the UID variable below to the Firebase Auth UID of the user
 *   2. Run: node makeAdmin.js
 * 
 * After running:
 *   - The user must log out and log back in (or refresh their token)
 *   - The admin claim will be available in their Firebase Auth token
 *   - Firestore rules will check request.auth.token.admin == true
 * 
 * To verify:
 *   - User should call: await auth.currentUser.getIdTokenResult(true)
 *   - Check: tokenResult.claims.admin === true
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// This uses Application Default Credentials (ADC)
// Make sure you have set up your Firebase credentials:
//   - Run: gcloud auth application-default login
//   - Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'cueu-f45c8', // Explicitly set project ID
});

// ============================================
// CONFIGURATION: Set the user's Firebase Auth UID here
// ============================================
const uid = "ZtwQoy6E6pRiyZWAsObBHZALyts2"; // Replace with actual UID

// ============================================
// Grant admin role
// ============================================
async function grantAdminRole() {
  try {
    // Verify user exists
    const user = await admin.auth().getUser(uid);
    console.log(`\n📋 User Info:`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Display Name: ${user.displayName || 'N/A'}`);
    
    // Check current claims
    const currentClaims = user.customClaims || {};
    if (currentClaims.admin === true) {
      console.log(`\n⚠️  User already has admin role!`);
      console.log(`   Current claims:`, currentClaims);
      return;
    }
    
    // Set admin claim
    console.log(`\n🔧 Setting admin claim...`);
    await admin.auth().setCustomUserClaims(uid, { 
      ...currentClaims, // Preserve existing claims
      admin: true 
    });
    
    console.log(`\n✅ Admin claim set successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. User must log out and log back in`);
    console.log(`   2. OR user can refresh token: await auth.currentUser.getIdToken(true)`);
    console.log(`   3. Verify: await auth.currentUser.getIdTokenResult(true)`);
    console.log(`      Check: tokenResult.claims.admin === true`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with UID "${uid}" not found in Firebase Auth`);
      console.error(`   Make sure the user has signed in at least once.`);
    } else {
      console.error(`\n❌ Error setting admin claim:`, error);
    }
    process.exit(1);
  }
}

// Run the function
grantAdminRole()
  .then(() => {
    console.log(`\n✨ Done!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });
