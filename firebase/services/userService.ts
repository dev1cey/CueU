import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { User, SkillLevel } from '../types';

const USERS_COLLECTION = 'users';

// Create a new user
export const createUser = async (
  userId: string,
  userData: {
    email: string;
    name: string;
    department: string;
    skillLevel: SkillLevel;
    bio: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const now = Timestamp.now();
    
    const newUser: Omit<User, 'id'> = {
      ...userData,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      matchHistory: [],
      createdAt: now,
    };

    await setDoc(userRef, newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(usersRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Get top players by win rate
export const getTopPlayers = async (limitCount: number = 10): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    // Simplified query - just get all users
    // We'll sort client-side to avoid needing a composite index
    const querySnapshot = await getDocs(usersRef);
    
    const allUsers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
    
    // Filter users with matches played and calculate win rate for sorting
    const playersWithMatches = allUsers
      .filter(user => user.matchesPlayed > 0)
      .map(user => {
        // Calculate win rate (always compute it, don't rely on stored value)
        const calculatedWinRate = (user.wins / user.matchesPlayed) * 100;
        return { user, winRate: calculatedWinRate };
      })
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, limitCount)
      .map(item => item.user);
    
    return playersWithMatches;
  } catch (error) {
    console.error('Error getting top players:', error);
    throw error;
  }
};

// Update user stats after a match
export const updateUserStats = async (
  userId: string,
  wonMatch: boolean
): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    const newWins = wonMatch ? user.wins + 1 : user.wins;
    const newLosses = wonMatch ? user.losses : user.losses + 1;
    const newMatchesPlayed = user.matchesPlayed + 1;

    await updateUserProfile(userId, {
      wins: newWins,
      losses: newLosses,
      matchesPlayed: newMatchesPlayed,
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

