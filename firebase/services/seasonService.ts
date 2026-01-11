import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { Season, SeasonStatus } from '../types';

const SEASONS_COLLECTION = 'seasons';

// Create a new season
export const createSeason = async (seasonData: {
  name: string;
  startDate: Date;
  endDate: Date;
}): Promise<string> => {
  try {
    const seasonsRef = collection(db, SEASONS_COLLECTION);
    const now = Timestamp.now();

    // Extended season data with updatedAt field
    const newSeason = {
      name: seasonData.name,
      startDate: Timestamp.fromDate(seasonData.startDate),
      endDate: Timestamp.fromDate(seasonData.endDate),
      status: 'upcoming' as SeasonStatus,
      totalMatches: 0,
      playerIds: [],
      inactivePlayerIds: [],
      pendingPlayerIds: [],
      createdAt: now,
      updatedAt: now, // Extra field
    };

    const docRef = await addDoc(seasonsRef, newSeason);
    return docRef.id;
  } catch (error) {
    console.error('Error creating season:', error);
    throw error;
  }
};

// Get season by ID
export const getSeasonById = async (seasonId: string): Promise<Season | null> => {
  try {
    const seasonRef = doc(db, SEASONS_COLLECTION, seasonId);
    const seasonSnap = await getDoc(seasonRef);

    if (seasonSnap.exists()) {
      return { id: seasonSnap.id, ...seasonSnap.data() } as Season;
    }
    return null;
  } catch (error) {
    console.error('Error getting season:', error);
    throw error;
  }
};

// Update season
export const updateSeason = async (
  seasonId: string,
  updates: Partial<Omit<Season, 'id' | 'createdAt'>> & {
    updatedAt?: Timestamp;
  }
): Promise<void> => {
  try {
    const seasonRef = doc(db, SEASONS_COLLECTION, seasonId);
    await updateDoc(seasonRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating season:', error);
    throw error;
  }
};

// Get active season
export const getActiveSeason = async (): Promise<Season | null> => {
  try {
    const seasonsRef = collection(db, SEASONS_COLLECTION);
    const q = query(
      seasonsRef,
      where('status', '==', 'active'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Season;
  } catch (error) {
    console.error('Error getting active season:', error);
    throw error;
  }
};

// Get all seasons
export const getAllSeasons = async (): Promise<Season[]> => {
  try {
    const seasonsRef = collection(db, SEASONS_COLLECTION);
    const q = query(seasonsRef, orderBy('startDate', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Season));
  } catch (error) {
    console.error('Error getting all seasons:', error);
    throw error;
  }
};

// Increment season stats
export const incrementSeasonStats = async (
  seasonId: string,
  field: 'totalMatches',
  incrementBy: number = 1
): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    await updateSeason(seasonId, {
      [field]: season[field] + incrementBy,
    });
  } catch (error) {
    console.error('Error incrementing season stats:', error);
    throw error;
  }
};

// Update season status based on current date
// Weeks are now calculated dynamically, so this function just updates status
export const updateSeasonStatus = async (seasonId: string): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    const now = Timestamp.now();
    const updates: Partial<Season> = {};

    // Update status based on dates
    if (now < season.startDate) {
      updates.status = 'upcoming';
    } else if (now > season.endDate) {
      updates.status = 'completed';
    } else {
      updates.status = 'active';
    }

    await updateSeason(seasonId, updates);
  } catch (error) {
    console.error('Error updating season status:', error);
    throw error;
  }
};

// Register user for season (adds to pending list)
export const registerForSeason = async (
  seasonId: string,
  userId: string
): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    // Check if user is already enrolled or pending
    if (season.playerIds.includes(userId)) {
      throw new Error('User is already enrolled in this season');
    }
    if (season.pendingPlayerIds.includes(userId)) {
      throw new Error('User already has a pending registration');
    }

    // Add user to pending list
    const updatedPendingPlayerIds = [...season.pendingPlayerIds, userId];
    await updateSeason(seasonId, {
      pendingPlayerIds: updatedPendingPlayerIds,
    });
  } catch (error) {
    console.error('Error registering for season:', error);
    throw error;
  }
};

// Withdraw user from season (adds to inactivePlayerIds but keeps in playerIds to preserve points)
export const withdrawFromSeason = async (
  seasonId: string,
  userId: string
): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    // Check if user is enrolled
    if (!season.playerIds.includes(userId)) {
      throw new Error('User is not enrolled in this season');
    }

    // Check if user is already inactive
    if (season.inactivePlayerIds.includes(userId)) {
      throw new Error('User is already inactive in this season');
    }

    // Add to inactivePlayerIds but keep in playerIds to preserve their points
    const updatedInactivePlayerIds = [...season.inactivePlayerIds, userId];
    
    await updateSeason(seasonId, {
      inactivePlayerIds: updatedInactivePlayerIds,
    });
  } catch (error) {
    console.error('Error withdrawing from season:', error);
    throw error;
  }
};

// Re-enter user into season (removes from inactivePlayerIds, user already in playerIds)
export const reenterSeason = async (
  seasonId: string,
  userId: string
): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    // Check if user is inactive
    if (!season.inactivePlayerIds.includes(userId)) {
      throw new Error('User is not inactive in this season');
    }

    // Check if user is enrolled (they should be, since we keep them in playerIds)
    if (!season.playerIds.includes(userId)) {
      throw new Error('User is not enrolled in this season');
    }

    // Remove from inactivePlayerIds only (user stays in playerIds)
    const updatedInactivePlayerIds = season.inactivePlayerIds.filter(id => id !== userId);
    
    await updateSeason(seasonId, {
      inactivePlayerIds: updatedInactivePlayerIds,
    });
  } catch (error) {
    console.error('Error re-entering season:', error);
    throw error;
  }
};

