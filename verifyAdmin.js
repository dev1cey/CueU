/**
 * Script to verify admin claim for the current user
 * 
 * This script checks if a user has the admin claim in their Firebase Auth token.
 * 
 * Usage:
 *   1. Set the UID variable below to the Firebase Auth UID of the user
 *   2. Run: node verifyAdmin.js
 */

const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'cueu-f45c8',
});

// ============================================
// CONFIGURATION: Set the user's Firebase Auth UID here
// ============================================
const uid = "ZtwQoy6E6pRiyZWAsObBHZALyts2"; // Replace with actual UID

// ============================================
// Verify admin claim
// ============================================
async function verifyAdminClaim() {
  try {
    const user = await admin.auth().getUser(uid);
    const claims = user.customClaims || {};
    
    console.log(`\n📋 User Info:`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email || 'N/A'}`);
    console.log(`   Display Name: ${user.displayName || 'N/A'}`);
    console.log(`\n🔐 Custom Claims:`);
    console.log(`   Admin: ${claims.admin === true ? '✅ YES' : '❌ NO'}`);
    console.log(`   All claims:`, claims);
    
    if (claims.admin === true) {
      console.log(`\n✅ User has admin role!`);
      console.log(`\n📝 Note: User must refresh their token in the app to see this change.`);
      console.log(`   In app: await auth.currentUser?.getIdToken(true)`);
    } else {
      console.log(`\n❌ User does NOT have admin role.`);
      console.log(`   Run makeAdmin.js to grant admin role.`);
    }
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with UID "${uid}" not found in Firebase Auth`);
    } else {
      console.error(`\n❌ Error:`, error);
    }
    process.exit(1);
  }
}

// Run the function
verifyAdminClaim()
  .then(() => {
    console.log(`\n✨ Done!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`\n❌ Fatal error:`, error);
    process.exit(1);
  });

