import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function to set/remove admin role for a user
 * 
 * This function can only be called by existing admins.
 * It prevents self-lockout (admins cannot remove their own admin role).
 * 
 * @param data.uid - Firebase Auth UID of the user to promote/demote
 * @param data.makeAdmin - boolean: true to grant admin, false to remove
 * 
 * @returns { success: boolean, message: string }
 */
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function"
    );
  }

  const callerUid = context.auth.uid;
  const targetUid = data.uid;
  const makeAdmin = data.makeAdmin === true;

  // Validate input
  if (!targetUid || typeof targetUid !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "uid is required and must be a string"
    );
  }

  if (typeof makeAdmin !== "boolean") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "makeAdmin is required and must be a boolean"
    );
  }

  // Verify caller is an admin
  const caller = await admin.auth().getUser(callerUid);
  const callerClaims = caller.customClaims || {};
  if (callerClaims.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can call this function"
    );
  }

  // Prevent self-lockout: admins cannot remove their own admin role
  if (callerUid === targetUid && !makeAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admins cannot remove their own admin role"
    );
  }

  try {
    // Get target user
    const targetUser = await admin.auth().getUser(targetUid);
    const currentClaims = targetUser.customClaims || {};

    // Update claims
    const newClaims = {
      ...currentClaims,
      admin: makeAdmin,
    };

    // If removing admin, explicitly set to false (or remove the claim)
    if (!makeAdmin) {
      delete newClaims.admin;
    }

    // Set the custom claims
    await admin.auth().setCustomUserClaims(targetUid, newClaims);

    // Optionally: Sync to /admins collection for UI display
    // This is NOT the source of truth, but useful for admin UI
    const adminsRef = admin.firestore().collection("admins").doc(targetUid);
    if (makeAdmin) {
      await adminsRef.set({
        uid: targetUid,
        email: targetUser.email || null,
        displayName: targetUser.displayName || null,
        grantedBy: callerUid,
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } else {
      await adminsRef.delete();
    }

    return {
      success: true,
      message: makeAdmin
        ? `Admin role granted to ${targetUser.email || targetUid}`
        : `Admin role removed from ${targetUser.email || targetUid}`,
    };
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      throw new functions.https.HttpsError(
        "not-found",
        `User with UID ${targetUid} not found`
      );
    }
    console.error("Error setting admin role:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while setting admin role"
    );
  }
});

/**
 * Cloud Function to list all admins (for admin UI)
 * 
 * This function can only be called by existing admins.
 * 
 * @returns Array of admin user objects
 */
export const listAdmins = functions.https.onCall(async (data, context) => {
  // Verify the caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function"
    );
  }

  // Verify caller is an admin
  const caller = await admin.auth().getUser(context.auth.uid);
  const callerClaims = caller.customClaims || {};
  if (callerClaims.admin !== true) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only admins can call this function"
    );
  }

  try {
    // Get all users with admin claim
    // Note: Firebase Admin SDK doesn't have a direct way to query by custom claims
    // So we'll use the /admins collection as a reference (but verify with actual claims)
    const adminsSnapshot = await admin.firestore().collection("admins").get();
    
    const admins = await Promise.all(
      adminsSnapshot.docs.map(async (doc) => {
        const adminData = doc.data();
        const user = await admin.auth().getUser(doc.id);
        const claims = user.customClaims || {};
        
        // Verify the user actually has admin claim
        if (claims.admin === true) {
          return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            ...adminData,
          };
        }
        return null;
      })
    );

    // Filter out nulls (users who lost admin claim but still in collection)
    return admins.filter((admin) => admin !== null);
  } catch (error) {
    console.error("Error listing admins:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while listing admins"
    );
  }
});

