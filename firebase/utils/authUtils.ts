import { auth } from '../config';
import { getIdTokenResult } from 'firebase/auth';

/**
 * Check if the current user is an admin by checking their Firebase Auth token claims.
 * This is the ONLY source of truth for admin status - never check Firestore or email.
 * 
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    // Force refresh token to get latest claims
    const tokenResult = await user.getIdTokenResult(true);
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
};

/**
 * Get the current user's admin status without forcing a token refresh.
 * Use this for UI checks where you don't need the absolute latest status.
 * 
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export const isAdminCached = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const tokenResult = await user.getIdTokenResult(false);
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin status (cached):', error);
    return false;
  }
};

/**
 * Check if a user is signed in
 * @returns boolean - true if user is signed in
 */
export const isSignedIn = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Get the current user's UID
 * @returns string | null - user UID or null if not signed in
 */
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

