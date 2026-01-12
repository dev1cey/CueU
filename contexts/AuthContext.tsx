import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { User } from '../firebase/types';
import { getUserById } from '../firebase/services';

const USER_STORAGE_KEY = '@cueu_current_user_id';

interface AuthContextType {
  currentUser: User | null;
  currentUserId: string | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean; email: string }>;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUserExists: (email: string) => Promise<User | null>;
  switchUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore user session on app startup
  useEffect(() => {
    const restoreUserSession = async () => {
      try {
        // First, check if we have a stored user ID
        const storedUserId = await AsyncStorage.getItem(USER_STORAGE_KEY);
        
        if (storedUserId) {
          // Try to restore the user from our database
          let appUser = await getUserById(storedUserId);
          
          // If not found and we have auth user with email, try email lookup and migrate
          if (!appUser && auth.currentUser?.email) {
            const { getUserByEmail, migrateUserToUid } = await import('../firebase/services');
            const emailUser = await getUserByEmail(auth.currentUser.email);
            if (emailUser && emailUser.id !== auth.currentUser.uid) {
              // Migrate to UID-based document ID
              appUser = await migrateUserToUid(emailUser.id, auth.currentUser.uid);
            } else if (emailUser) {
              appUser = emailUser;
            }
          }
          
          if (appUser) {
            setCurrentUser(appUser);
            setCurrentUserId(appUser.id);
            // Update stored ID if it changed (after migration)
            if (appUser.id !== storedUserId) {
              await AsyncStorage.setItem(USER_STORAGE_KEY, appUser.id);
            }
          } else {
            // User not found in database, clear storage
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error restoring user session:', error);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    };

    restoreUserSession();
  }, []);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:82',message:'onAuthStateChanged fired',data:{hasUser:!!user,email:user?.email,uid:user?.uid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setFirebaseUser(user);
      
      if (user) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:85',message:'User exists, about to fetch user data',data:{email:user.email,uid:user.uid,isUwEmail:user.email?.endsWith('@uw.edu')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // CRITICAL: Only fetch user data if email is valid @uw.edu
        // This prevents fetching for invalid users during the sign-in race condition
        if (!user.email || !user.email.endsWith('@uw.edu')) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:88',message:'Skipping user fetch - invalid email',data:{email:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          // Invalid email - clear state and don't fetch
          setCurrentUser(null);
          setCurrentUserId(null);
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          setLoading(false);
          return;
        }
        // User document ID MUST be the auth.uid (per Firestore rules)
        // Try to load the app user from our database using auth.uid
        let appUser = await getUserById(user.uid);
        
        // If not found, try email lookup and migrate
        if (!appUser && user.email) {
          const { getUserByEmail, migrateUserToUid } = await import('../firebase/services');
          const emailUser = await getUserByEmail(user.email);
          if (emailUser && emailUser.id !== user.uid) {
            // Migrate to UID-based document ID
            appUser = await migrateUserToUid(emailUser.id, user.uid);
          } else if (emailUser) {
            appUser = emailUser;
          }
        }
        
        if (appUser) {
          setCurrentUser(appUser);
          setCurrentUserId(appUser.id);
          await AsyncStorage.setItem(USER_STORAGE_KEY, appUser.id);
        } else {
          // Firebase user exists but app user doesn't - might be a new user
          // Keep Firebase auth but clear app user state
          setCurrentUser(null);
          setCurrentUserId(null);
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } else {
        // No Firebase user - clear everything
        setCurrentUser(null);
        setCurrentUserId(null);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (idToken: string): Promise<{ isNewUser: boolean; email: string }> => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:126',message:'signInWithGoogle called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:130',message:'About to call signInWithCredential',data:{hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:131',message:'signInWithCredential completed',data:{email:user.email,uid:user.uid,hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!user.email) {
        throw new Error('No email found in Google account');
      }

      // Check if email is from UW
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:138',message:'Checking email domain',data:{email:user.email,isUwEmail:user.email.endsWith('@uw.edu'),hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (!user.email.endsWith('@uw.edu')) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:139',message:'Invalid email, about to sign out',data:{email:user.email,hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        await firebaseSignOut(auth);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/1b6a20ab-a1d9-409f-8117-56c59c909504',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:139',message:'Signed out invalid user',data:{hasCurrentUser:!!auth.currentUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new Error('Please use a valid @uw.edu email address');
      }

      // CRITICAL: Check if a user document exists with this email but different UID
      // This prevents duplicate accounts when Firebase creates different UIDs on different devices
      const { getUserByEmail } = await import('../firebase/services');
      const emailUser = await getUserByEmail(user.email);

      // If a user exists with this email but different UID, migrate the data to the new UID
      // This handles the case where Firebase creates different UIDs on different devices/platforms
      // (e.g., different OAuth client IDs for iOS vs Web)
      // Since Firebase says isNewFirebaseUser: false, we trust that this is the same user
      let existingUser: User | null = null;
      if (emailUser && emailUser.id !== user.uid) {
        try {
          // Migrate user data from old UID to new UID
          const { migrateUserToUid } = await import('../firebase/services');
          existingUser = await migrateUserToUid(emailUser.id, user.uid);
        } catch (migrationError) {
          // If migration fails, sign out and show error
          await firebaseSignOut(auth);
          throw new Error(`Failed to migrate account data. Please contact support. Error: ${migrationError instanceof Error ? migrationError.message : String(migrationError)}`);
        }
      }

      // Check if user exists in our database using auth.uid
      // User document ID MUST be the auth.uid (per Firestore rules)
      if (!existingUser) {
        existingUser = await getUserById(user.uid);
      }
      
      // If user not found by UID, try email-based lookup (for legacy users)
      // This is a fallback for users created before migration to UID-based document IDs
      
      return {
        isNewUser: !existingUser,
        email: user.email
      };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (email: string): Promise<User | null> => {
    // Note: This function is kept for backward compatibility
    // But user lookups should use auth.uid directly via getUserById
    // This email-based lookup may fail if user document ID is not email-based
    // Consider deprecating this in favor of getUserById(auth.currentUser?.uid)
    const user = auth.currentUser;
    if (user) {
      let result = await getUserById(user.uid);
      
      // If not found by UID, try email-based lookup (for legacy users)
      if (!result && email) {
        const { getUserByEmail, migrateUserToUid } = await import('../firebase/services');
        result = await getUserByEmail(email);
        
        // If found by email but document ID is different, migrate it to UID-based document ID
        if (result && result.id !== user.uid) {
          try {
            result = await migrateUserToUid(result.id, user.uid);
          } catch (migrationError) {
            // If migration fails, treat as new user
            result = null;
          }
        }
      }
      
      return result;
    }
    return null;
  };

  const login = async (userId: string) => {
    try {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setCurrentUser(user);
        setCurrentUserId(userId);
        await AsyncStorage.setItem(USER_STORAGE_KEY, userId);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setCurrentUserId(null);
      setFirebaseUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const switchUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setCurrentUser(user);
        setCurrentUserId(userId);
        await AsyncStorage.setItem(USER_STORAGE_KEY, userId);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error switching user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentUserId,
        firebaseUser,
        loading,
        signInWithGoogle,
        login,
        logout,
        checkUserExists,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

