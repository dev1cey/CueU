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
import { getUserById, getUserByEmail, createUser } from '../firebase/services';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Try to load the app user from our database
        const appUser = await getUserByEmail(user.email || '');
        if (appUser) {
          setCurrentUser(appUser);
          setCurrentUserId(appUser.id);
          await AsyncStorage.setItem(USER_STORAGE_KEY, appUser.id);
        }
      } else {
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
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      
      if (!user.email) {
        throw new Error('No email found in Google account');
      }

      // Check if email is from UW
      if (!user.email.endsWith('@uw.edu')) {
        await firebaseSignOut(auth);
        throw new Error('Please use a valid @uw.edu email address');
      }

      // Check if user exists in our database
      const existingUser = await getUserByEmail(user.email);
      
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
    return await getUserByEmail(email);
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

