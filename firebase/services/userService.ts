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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config';
import { User, SkillLevel } from '../types';
import { notifyRankingChanged } from './notificationService';

const USERS_COLLECTION = 'users';

// Create a new user
export const createUser = async (
  userId: string,
  userData: {
    email: string;
    name: string;
    phone?: string;
    wechat?: string;
    department?: string;
    skillLevel: SkillLevel;
    bio?: string;
    profileImageUrl?: string;
  }
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const now = Timestamp.now();
    
    // Map skill level to APA number (2-7 range)
    const skillLevelMap: Record<SkillLevel, number> = {
      'beginner': 2,
      'intermediate': 3,
      'advanced': 5,
      'expert': 7,
    };
    
    const newUser: Omit<User, 'id'> = {
      ...userData,
      phone: userData.phone ? Number(userData.phone) : undefined,
      bio: userData.bio || '',
      skillLevelNum: skillLevelMap[userData.skillLevel],
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      matchHistory: [],
      seasonPoints: {}, // Initialize season points
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

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `profile-images/${userId}`);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
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

// Get top players by player IDs (for season-specific rankings)
// Now sorts by season points instead of win rate
export const getTopPlayersByIds = async (
  playerIds: string[], 
  limitCount?: number,
  seasonId?: string
): Promise<User[]> => {
  try {
    if (playerIds.length === 0) return [];
    
    // Fetch all specified players
    const playerPromises = playerIds.map(id => getUserById(id));
    const players = await Promise.all(playerPromises);
    
    // Filter out null values but INCLUDE users without matches
    const validPlayers = players
      .filter((player): player is User => player !== null)
      .map(user => {
        // Get season points for the specified season (or 0 if not available)
        const seasonPoints = seasonId 
          ? (user.seasonPoints?.[seasonId] || 0)
          : 0;
        return { user, seasonPoints };
      })
      .sort((a, b) => {
        // Sort by season points (descending)
        return b.seasonPoints - a.seasonPoints;
      });
    
    // Apply limit if specified
    const rankedPlayers = limitCount 
      ? validPlayers.slice(0, limitCount)
      : validPlayers;
    
    return rankedPlayers.map(item => item.user);
  } catch (error) {
    console.error('Error getting top players by IDs:', error);
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

// Helper function to calculate user's rank in a season
const calculateUserRank = async (
  userId: string,
  seasonId: string,
  playerIds: string[]
): Promise<number> => {
  try {
    if (playerIds.length === 0) return 1;
    
    // Fetch all players in the season
    const playerPromises = playerIds.map(id => getUserById(id));
    const players = await Promise.all(playerPromises);
    
    // Filter and sort by season points
    const validPlayers = players
      .filter((player): player is User => player !== null)
      .map(user => {
        const seasonPoints = user.seasonPoints?.[seasonId] || 0;
        return { user, seasonPoints };
      })
      .sort((a, b) => b.seasonPoints - a.seasonPoints);
    
    // Find user's rank (1-indexed)
    const userIndex = validPlayers.findIndex(p => p.user.id === userId);
    return userIndex !== -1 ? userIndex + 1 : playerIds.length + 1;
  } catch (error) {
    console.error('Error calculating user rank:', error);
    return 0;
  }
};

// Update user season points
export const updateUserSeasonPoints = async (
  userId: string,
  seasonId: string,
  pointsToAdd: number,
  seasonPlayerIds?: string[] // Optional: provide to enable ranking change detection
): Promise<void> => {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    const currentSeasonPoints = user.seasonPoints || {};
    const currentPoints = currentSeasonPoints[seasonId] || 0;
    const newPoints = currentPoints + pointsToAdd;

    // Calculate old rank if seasonPlayerIds provided
    let oldRank: number | undefined;
    if (seasonPlayerIds && seasonPlayerIds.length > 0) {
      oldRank = await calculateUserRank(userId, seasonId, seasonPlayerIds);
    }

    await updateUserProfile(userId, {
      seasonPoints: {
        ...currentSeasonPoints,
        [seasonId]: newPoints,
      },
    });

    // Calculate new rank and notify if changed
    if (seasonPlayerIds && seasonPlayerIds.length > 0 && oldRank) {
      const newRank = await calculateUserRank(userId, seasonId, seasonPlayerIds);
      if (oldRank !== newRank) {
        try {
          await notifyRankingChanged(userId, seasonId, oldRank, newRank);
        } catch (notificationError) {
          // Don't fail point update if notification fails
          console.error('Error notifying about ranking change:', notificationError);
        }
      }
    }
  } catch (error) {
    console.error('Error updating user season points:', error);
    throw error;
  }
};

