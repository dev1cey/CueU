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
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import { Match } from '../types';
import { updateUserStats } from './userService';

// Local type for match status (not in Firebase schema)
type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

const MATCHES_COLLECTION = 'matches';

// Create a new match
export const createMatch = async (matchData: {
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  seasonId: string;
  weekNumber: number;
  scheduledDate?: Date;
}): Promise<string> => {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const now = Timestamp.now();

    // Extended match data with extra fields not in the base Match type
    const newMatch = {
      ...matchData,
      scheduledDate: matchData.scheduledDate
        ? Timestamp.fromDate(matchData.scheduledDate)
        : undefined,
      status: 'scheduled' as MatchStatus,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(matchesRef, newMatch);
    return docRef.id;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// Get match by ID
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    const matchSnap = await getDoc(matchRef);

    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() } as Match;
    }
    return null;
  } catch (error) {
    console.error('Error getting match:', error);
    throw error;
  }
};

// Update match
export const updateMatch = async (
  matchId: string,
  updates: Partial<Omit<Match, 'id' | 'createdAt'>> & { 
    status?: MatchStatus;
    scheduledDate?: Timestamp;
    completedDate?: Timestamp;
  }
): Promise<void> => {
  try {
    const matchRef = doc(db, MATCHES_COLLECTION, matchId);
    await updateDoc(matchRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating match:', error);
    throw error;
  }
};

// Complete a match and update player stats
export const completeMatch = async (
  matchId: string,
  winnerId: string,
  score: { player1: number; player2: number }
): Promise<void> => {
  try {
    const match = await getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    // Update match
    await updateMatch(matchId, {
      winnerId,
      score,
      status: 'completed',
      completedDate: Timestamp.now(),
    });

    // Update player stats
    await updateUserStats(match.player1Id, winnerId === match.player1Id);
    await updateUserStats(match.player2Id, winnerId === match.player2Id);
  } catch (error) {
    console.error('Error completing match:', error);
    throw error;
  }
};

// Get matches for a specific user
export const getMatchesForUser = async (userId: string): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    
    // Query for matches where user is player 1
    const q1 = query(matchesRef, where('player1Id', '==', userId));
    const snapshot1 = await getDocs(q1);
    
    // Query for matches where user is player 2
    const q2 = query(matchesRef, where('player2Id', '==', userId));
    const snapshot2 = await getDocs(q2);
    
    const matches: Match[] = [];
    snapshot1.forEach(doc => {
      matches.push({ id: doc.id, ...doc.data() } as Match);
    });
    snapshot2.forEach(doc => {
      matches.push({ id: doc.id, ...doc.data() } as Match);
    });
    
    return matches.sort((a, b) => 
      b.createdAt.toMillis() - a.createdAt.toMillis()
    );
  } catch (error) {
    console.error('Error getting user matches:', error);
    throw error;
  }
};

// Get matches by season
export const getMatchesBySeason = async (seasonId: string): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    const q = query(
      matchesRef,
      where('seasonId', '==', seasonId),
      orderBy('weekNumber', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Match));
  } catch (error) {
    console.error('Error getting season matches:', error);
    throw error;
  }
};

// Get upcoming matches
export const getUpcomingMatches = async (userId?: string): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    let q;
    
    if (userId) {
      // Get upcoming matches for specific user
      const q1 = query(
        matchesRef,
        where('player1Id', '==', userId),
        where('status', 'in', ['scheduled', 'in_progress'])
      );
      const q2 = query(
        matchesRef,
        where('player2Id', '==', userId),
        where('status', 'in', ['scheduled', 'in_progress'])
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      const matches: any[] = [];
      snapshot1.forEach(doc => {
        matches.push({ id: doc.id, ...doc.data() });
      });
      snapshot2.forEach(doc => {
        matches.push({ id: doc.id, ...doc.data() });
      });
      
      return matches.sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return a.scheduledDate.toMillis() - b.scheduledDate.toMillis();
      });
    } else {
      // Get all upcoming matches
      q = query(
        matchesRef,
        where('status', 'in', ['scheduled', 'in_progress']),
        orderBy('scheduledDate', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];
    }
  } catch (error) {
    console.error('Error getting upcoming matches:', error);
    throw error;
  }
};

