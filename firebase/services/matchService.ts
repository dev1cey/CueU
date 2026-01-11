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
import { Match, MatchStatus } from '../types';
import { updateUserStats, updateUserSeasonPoints, getUserById } from './userService';
import { getRacksNeeded, calculateMatchPoints } from '../utils/handicapUtils';
import { notifyMatchScheduled } from './notificationService';
import { getSeasonById } from './seasonService';

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
    const newMatch: any = {
      ...matchData,
      status: 'planned' as MatchStatus,
      createdAt: now,
      updatedAt: now,
    };
    
    // Only add scheduledDate if it's provided
    if (matchData.scheduledDate) {
      newMatch.scheduledDate = Timestamp.fromDate(matchData.scheduledDate);
    }

    const docRef = await addDoc(matchesRef, newMatch);
    
    // Notify both players about the new match
    try {
      await notifyMatchScheduled(
        matchData.player1Id,
        matchData.player2Id,
        docRef.id,
        matchData.player1Name,
        matchData.player2Name
      );
    } catch (notificationError) {
      // Don't fail match creation if notification fails
      console.error('Error sending match notification:', notificationError);
    }
    
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

// Complete a match and update player stats with APA handicap system
export const completeMatch = async (
  matchId: string,
  winnerId: string,
  score: { player1: number; player2: number }
): Promise<void> => {
  try {
    const match = await getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    // Get player data to determine skill levels
    const player1 = await getUserById(match.player1Id);
    const player2 = await getUserById(match.player2Id);
    
    if (!player1 || !player2) {
      throw new Error('One or both players not found');
    }

    const player1SkillLevel = player1.skillLevelNum;
    const player2SkillLevel = player2.skillLevelNum;

    // Validate skill levels are in APA range (2-7)
    if (player1SkillLevel < 2 || player1SkillLevel > 7 ||
        player2SkillLevel < 2 || player2SkillLevel > 7) {
      throw new Error(`Invalid skill levels: P1=${player1SkillLevel}, P2=${player2SkillLevel}. Must be between 2-7.`);
    }

    // Calculate racks needed based on handicap
    const racksNeeded = getRacksNeeded(player1SkillLevel, player2SkillLevel);

    // Determine winners
    const player1Won = winnerId === match.player1Id;
    const player2Won = winnerId === match.player2Id;

    // Calculate points earned
    const player1Points = calculateMatchPoints(
      player1Won,
      score.player1,
      racksNeeded.player1
    );

    const player2Points = calculateMatchPoints(
      player2Won,
      score.player2,
      racksNeeded.player2
    );

    // Update match with handicap data
    await updateMatch(matchId, {
      winnerId,
      score,
      status: 'completed',
      completedDate: Timestamp.now(),
      player1SkillLevel,
      player2SkillLevel,
      player1RacksNeeded: racksNeeded.player1,
      player2RacksNeeded: racksNeeded.player2,
      player1Points: Math.round(player1Points * 100) / 100, // Round to 2 decimals
      player2Points: Math.round(player2Points * 100) / 100,
    });

    // Get season to access playerIds for ranking calculation
    const season = await getSeasonById(match.seasonId);
    const seasonPlayerIds = season?.playerIds || [];

    // Update player stats (wins/losses)
    await updateUserStats(match.player1Id, player1Won);
    await updateUserStats(match.player2Id, player2Won);

    // Update season points (with ranking change detection)
    await updateUserSeasonPoints(match.player1Id, match.seasonId, player1Points, seasonPlayerIds);
    await updateUserSeasonPoints(match.player2Id, match.seasonId, player2Points, seasonPlayerIds);
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

// Accept a bye match (player gets full points, no opponent)
export const acceptByeMatch = async (matchId: string): Promise<void> => {
  try {
    const match = await getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    // Verify this is a bye match (player1Id === player2Id)
    if (match.player1Id !== match.player2Id) {
      throw new Error('This is not a bye match');
    }

    // Verify match status is 'bye'
    if (match.status !== 'bye') {
      throw new Error('Match is not a bye match');
    }

    const playerId = match.player1Id; // Both are the same for bye matches
    const BYE_POINTS = 10; // Full points for bye matches

    // Get player data to determine skill level at match time
    const player = await getUserById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const playerSkillLevel = player.skillLevelNum;

    // Update match as completed with bye status
    await updateMatch(matchId, {
      status: 'completed',
      winnerId: playerId,
      score: { player1: 0, player2: 0 }, // No actual score for bye
      completedDate: Timestamp.now(),
      player1SkillLevel: playerSkillLevel,
      player2SkillLevel: playerSkillLevel,
      player1RacksNeeded: 0, // Not applicable for bye
      player2RacksNeeded: 0, // Not applicable for bye
      player1Points: BYE_POINTS,
      player2Points: 0, // No opponent
    });

    // Get season to access playerIds for ranking calculation
    const season = await getSeasonById(match.seasonId);
    const seasonPlayerIds = season?.playerIds || [];

    // Update season points (no wins/losses update for bye matches)
    await updateUserSeasonPoints(playerId, match.seasonId, BYE_POINTS, seasonPlayerIds);
  } catch (error) {
    console.error('Error accepting bye match:', error);
    throw error;
  }
};

// Forfeit a match (report opponent forfeit)
// The forfeiting user gets -1 score, the other user gets full score and points
export const forfeitMatch = async (
  matchId: string,
  forfeitingUserId: string
): Promise<void> => {
  try {
    const match = await getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    // Verify match is in planned status
    if (match.status !== 'planned') {
      throw new Error('Only planned matches can be forfeited');
    }

    // Verify the user is part of this match
    if (match.player1Id !== forfeitingUserId && match.player2Id !== forfeitingUserId) {
      throw new Error('You are not part of this match');
    }

    // Get player data to determine skill levels
    const player1 = await getUserById(match.player1Id);
    const player2 = await getUserById(match.player2Id);
    
    if (!player1 || !player2) {
      throw new Error('One or both players not found');
    }

    const player1SkillLevel = player1.skillLevelNum;
    const player2SkillLevel = player2.skillLevelNum;

    // Validate skill levels are in APA range (2-7)
    if (player1SkillLevel < 2 || player1SkillLevel > 7 ||
        player2SkillLevel < 2 || player2SkillLevel > 7) {
      throw new Error(`Invalid skill levels: P1=${player1SkillLevel}, P2=${player2SkillLevel}. Must be between 2-7.`);
    }

    // Calculate racks needed based on handicap
    const racksNeeded = getRacksNeeded(player1SkillLevel, player2SkillLevel);

    // Determine who is forfeiting and who wins
    const isPlayer1Forfeiting = forfeitingUserId === match.player1Id;
    const winnerId = isPlayer1Forfeiting ? match.player2Id : match.player1Id;
    
    // Set scores: forfeiting user gets -1, winner gets their target racks
    const score = {
      player1: isPlayer1Forfeiting ? -1 : racksNeeded.player1,
      player2: isPlayer1Forfeiting ? racksNeeded.player2 : -1,
    };

    // Winner gets full points (10), forfeiting user gets 0
    const player1Points = isPlayer1Forfeiting ? 0 : 10;
    const player2Points = isPlayer1Forfeiting ? 10 : 0;

    // Update match with forfeit data
    await updateMatch(matchId, {
      winnerId,
      score,
      status: 'completed',
      completedDate: Timestamp.now(),
      player1SkillLevel,
      player2SkillLevel,
      player1RacksNeeded: racksNeeded.player1,
      player2RacksNeeded: racksNeeded.player2,
      player1Points: Math.round(player1Points * 100) / 100,
      player2Points: Math.round(player2Points * 100) / 100,
    });

    // Get season to access playerIds for ranking calculation
    const season = await getSeasonById(match.seasonId);
    const seasonPlayerIds = season?.playerIds || [];

    // Update player stats (wins/losses)
    const player1Won = winnerId === match.player1Id;
    await updateUserStats(match.player1Id, player1Won);
    await updateUserStats(match.player2Id, !player1Won);

    // Update season points (with ranking change detection)
    await updateUserSeasonPoints(match.player1Id, match.seasonId, player1Points, seasonPlayerIds);
    await updateUserSeasonPoints(match.player2Id, match.seasonId, player2Points, seasonPlayerIds);
  } catch (error) {
    console.error('Error forfeiting match:', error);
    throw error;
  }
};

// Get upcoming matches (includes both 'planned' and 'bye' status)
export const getUpcomingMatches = async (userId?: string): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, MATCHES_COLLECTION);
    let q;
    
    if (userId) {
      // Get upcoming matches for specific user (both planned and bye)
      const q1 = query(
        matchesRef,
        where('player1Id', '==', userId),
        where('status', 'in', ['planned', 'bye'])
      );
      const q2 = query(
        matchesRef,
        where('player2Id', '==', userId),
        where('status', 'in', ['planned', 'bye'])
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);
      
      const matchesMap = new Map<string, any>();
      snapshot1.forEach(doc => {
        matchesMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      snapshot2.forEach(doc => {
        matchesMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const matches = Array.from(matchesMap.values());
      return matches.sort((a, b) => {
        if (!a.scheduledDate || !b.scheduledDate) return 0;
        return a.scheduledDate.toMillis() - b.scheduledDate.toMillis();
      });
    } else {
      // Get all upcoming matches
      q = query(
        matchesRef,
        where('status', 'in', ['planned', 'bye']),
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

