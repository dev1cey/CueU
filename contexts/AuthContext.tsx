import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../firebase/types';
import { getUserById } from '../firebase/services';

const USER_STORAGE_KEY = '@cueu_current_user_id';

interface AuthContextType {
  currentUser: User | null;
  currentUserId: string | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUserId) {
        const user = await getUserById(storedUserId);
        if (user) {
          setCurrentUser(user);
          setCurrentUserId(storedUserId);
        } else {
          // User not found, clear storage
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
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
      setCurrentUser(null);
      setCurrentUserId(null);
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
        loading,
        login,
        logout,
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

