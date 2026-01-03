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
  totalWeeks: number;
}): Promise<string> => {
  try {
    const seasonsRef = collection(db, SEASONS_COLLECTION);
    const now = Timestamp.now();

    const newSeason: Omit<Season, 'id'> = {
      ...seasonData,
      startDate: Timestamp.fromDate(seasonData.startDate),
      endDate: Timestamp.fromDate(seasonData.endDate),
      status: 'upcoming',
      currentWeek: 0,
      totalPlayers: 0,
      totalMatches: 0,
      createdAt: now,
      updatedAt: now,
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
  updates: Partial<Omit<Season, 'id' | 'createdAt'>>
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
  field: 'totalPlayers' | 'totalMatches',
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

// Advance season week
export const advanceSeasonWeek = async (seasonId: string): Promise<void> => {
  try {
    const season = await getSeasonById(seasonId);
    if (!season) throw new Error('Season not found');

    const newWeek = season.currentWeek + 1;
    const updates: Partial<Season> = {
      currentWeek: newWeek,
    };

    // If we've reached the last week, mark season as completed
    if (newWeek >= season.totalWeeks) {
      updates.status = 'completed';
    }

    await updateSeason(seasonId, updates);
  } catch (error) {
    console.error('Error advancing season week:', error);
    throw error;
  }
};

