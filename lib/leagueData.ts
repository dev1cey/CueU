// League and player data functions
import { db } from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface Player {
  id: string;
  name: string;
  email?: string;
  skillLevel: number; // 1-7 APA style
  wins: number;
  losses: number;
  winRate: number;
  gamesPlayed: number;
  weeklyScores?: { [key: string]: number }; // { 'week1': 10, 'week2': 8, ... }
  createdAt?: any;
  updatedAt?: any;
}

export interface Match {
  id: string;
  week: number;
  player1Id: string;
  player1Name: string;
  player1SkillLevel: number;
  player1RaceTo: number; // How many racks player 1 needs to win
  player1Score: number;
  player2Id: string;
  player2Name: string;
  player2SkillLevel: number;
  player2RaceTo: number; // How many racks player 2 needs to win
  player2Score: number;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  id: string;
  email: string;
  name: string;
  skillLevel: number; // Will be set by admin, starts at 0
  department?: string;
  bio?: string;
  isPlayer: boolean; // Whether they've joined the league
  createdAt?: any;
  updatedAt?: any;
}

export interface LeagueStats {
  players: number;
  currentWeek: number;
  totalWeeks: number; // Always 7
  matches: number;
}

// ==================== APA HANDICAPPING SYSTEM ====================

// Official APA 8-Ball "Games Must Win" Chart
// Based on https://poolplayers.com/equalizer/
// Rule: The differential in games must equal the differential in skill levels
// Returns [player1RaceTo, player2RaceTo] based on skill levels
export const calculateAPARace = (skill1: number, skill2: number): [number, number] => {
  // Official APA 8-Ball race chart (skill levels 2-7)
  // New players start at SL3
  const raceChart: { [key: string]: [number, number] } = {
    // Format: "skill1-skill2": [player1RaceTo, player2RaceTo]
    "2-2": [2, 2], "2-3": [2, 3], "2-4": [2, 4], "2-5": [2, 5], "2-6": [2, 6], "2-7": [2, 7],
    "3-2": [3, 2], "3-3": [2, 2], "3-4": [2, 3], "3-5": [2, 4], "3-6": [2, 5], "3-7": [2, 6],
    "4-2": [4, 2], "4-3": [3, 2], "4-4": [3, 3], "4-5": [3, 4], "4-6": [3, 5], "4-7": [3, 6],
    "5-2": [5, 2], "5-3": [4, 2], "5-4": [4, 3], "5-5": [4, 4], "5-6": [4, 5], "5-7": [4, 6],
    "6-2": [6, 2], "6-3": [5, 2], "6-4": [5, 3], "6-5": [5, 4], "6-6": [5, 5], "6-7": [5, 6],
    "7-2": [7, 2], "7-3": [6, 2], "7-4": [6, 3], "7-5": [6, 4], "7-6": [6, 5], "7-7": [6, 6],
  };
  
  // Clamp skill levels to valid range (2-7)
  // New players default to 3, but we'll handle 1 as 2 for flexibility
  const adjustedSkill1 = Math.max(2, Math.min(7, skill1));
  const adjustedSkill2 = Math.max(2, Math.min(7, skill2));
  
  const key = `${adjustedSkill1}-${adjustedSkill2}`;
  return raceChart[key] || [5, 5]; // Default to race-to-5 if not found
};

// ==================== USER MANAGEMENT ====================

// Create or update user profile
export const createOrUpdateUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, userId?: string) => {
  try {
    const uid = userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userRef = doc(db, 'users', uid);
    
    const existingUser = await getDoc(userRef);
    
    if (existingUser.exists()) {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        updatedAt: Timestamp.now(),
      });
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        skillLevel: 0, // Default, will be set by admin
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    
    return uid;
  } catch (error: any) {
    console.error('Error creating/updating user:', error);
    throw new Error(error.message);
  }
};

// Get user by ID
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user:', error);
    throw new Error(error.message);
  }
};

// Get all users (for admin)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    
    return users;
  } catch (error: any) {
    console.error('Error getting users:', error);
    throw new Error(error.message);
  }
};

// Get users who have joined the league
export const getLeaguePlayers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isPlayer', '==', true));
    const querySnapshot = await getDocs(q);
    
    const players: User[] = [];
    querySnapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() } as User);
    });
    
    return players;
  } catch (error: any) {
    console.error('Error getting league players:', error);
    throw new Error(error.message);
  }
};

// Join league (convert user to player)
export const joinLeague = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isPlayer: true,
      updatedAt: Timestamp.now(),
    });
    
    // Create player entry in players collection
    const user = await getUser(userId);
    if (user) {
      await createPlayer({
        name: user.name,
        email: user.email,
        skillLevel: user.skillLevel || 3, // Default to 3 if not set
        wins: 0,
        losses: 0,
        winRate: 0,
        gamesPlayed: 0,
      });
    }
    
    // Update league player count
    const stats = await getLeagueStats();
    await updateLeagueStats({
      players: stats.players + 1,
    });
  } catch (error: any) {
    console.error('Error joining league:', error);
    throw new Error(error.message);
  }
};

// ==================== PLAYER MANAGEMENT (existing code) ====================
export const createPlayer = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const playerRef = doc(db, 'players', playerId);
    
    await setDoc(playerRef, {
      ...playerData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return playerId;
  } catch (error: any) {
    console.error('Error creating player:', error);
    throw new Error(error.message);
  }
};

// Get all players sorted by wins and win rate
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy('wins', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const players: Player[] = [];
    querySnapshot.forEach((doc) => {
      players.push({ id: doc.id, ...doc.data() } as Player);
    });
    
    // Sort by wins first, then by win rate
    players.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.winRate - a.winRate;
    });
    
    return players;
  } catch (error: any) {
    console.error('Error getting players:', error);
    throw new Error(error.message);
  }
};

// Get a single player
export const getPlayer = async (playerId: string): Promise<Player | null> => {
  try {
    const playerRef = doc(db, 'players', playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (playerDoc.exists()) {
      return { id: playerDoc.id, ...playerDoc.data() } as Player;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting player:', error);
    throw new Error(error.message);
  }
};

// Update player stats (wins, losses, etc.)
export const updatePlayerStats = async (
  playerId: string,
  stats: Partial<Pick<Player, 'wins' | 'losses' | 'skillLevel'>>
) => {
  try {
    const playerRef = doc(db, 'players', playerId);
    
    // Calculate new win rate
    const wins = stats.wins ?? 0;
    const losses = stats.losses ?? 0;
    const gamesPlayed = wins + losses;
    const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;
    
    await updateDoc(playerRef, {
      ...stats,
      gamesPlayed,
      winRate: Math.round(winRate),
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating player stats:', error);
    throw new Error(error.message);
  }
};

// Get league stats
export const getLeagueStats = async (): Promise<LeagueStats> => {
  try {
    const statsRef = doc(db, 'leagueStats', 'current');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data() as LeagueStats;
    }
    
    // Return default stats if not found
    return {
      players: 0,
      currentWeek: 1,
      totalWeeks: 12,
      matches: 0,
    };
  } catch (error: any) {
    console.error('Error getting league stats:', error);
    return {
      players: 0,
      currentWeek: 1,
      totalWeeks: 12,
      matches: 0,
    };
  }
};

// Update league stats
export const updateLeagueStats = async (stats: Partial<LeagueStats>) => {
  try {
    const statsRef = doc(db, 'leagueStats', 'current');
    await setDoc(statsRef, stats, { merge: true });
  } catch (error: any) {
    console.error('Error updating league stats:', error);
    throw new Error(error.message);
  }
};

// Create test players for development
export const createTestPlayers = async () => {
  const testPlayers = [
    { name: 'Friday Mufasa', skillLevel: 6, wins: 13, losses: 1 },
    { name: 'Oxygen', skillLevel: 6, wins: 14, losses: 2 },
    { name: 'Fluke Twofer', skillLevel: 5, wins: 12, losses: 4 },
    { name: 'Pocket Pro', skillLevel: 5, wins: 10, losses: 5 },
    { name: 'Cue Master', skillLevel: 4, wins: 9, losses: 6 },
  ];
  
  const createdPlayers = [];
  
  for (const player of testPlayers) {
    const gamesPlayed = player.wins + player.losses;
    const winRate = (player.wins / gamesPlayed) * 100;
    
    const playerId = await createPlayer({
      name: player.name,
      skillLevel: player.skillLevel,
      wins: player.wins,
      losses: player.losses,
      winRate: Math.round(winRate),
      gamesPlayed,
    });
    
    createdPlayers.push(playerId);
  }
  
  // Update league stats
  await updateLeagueStats({
    players: testPlayers.length,
    matches: testPlayers.reduce((sum, p) => sum + p.wins + p.losses, 0) / 2, // Each match counts for 2 players
  });
  
  return createdPlayers;
};

// ==================== ADMIN FUNCTIONS ====================

// Update player skill level (admin only)
export const updatePlayerSkillLevel = async (playerId: string, skillLevel: number) => {
  try {
    if (skillLevel < 1 || skillLevel > 7) {
      throw new Error('Skill level must be between 1 and 7');
    }
    
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      skillLevel,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating skill level:', error);
    throw new Error(error.message);
  }
};

// Update player record manually (admin only)
export const updatePlayerRecord = async (
  playerId: string,
  wins: number,
  losses: number
) => {
  try {
    const gamesPlayed = wins + losses;
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
    
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      wins,
      losses,
      gamesPlayed,
      winRate,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating player record:', error);
    throw new Error(error.message);
  }
};

// Delete a player (admin only)
export const deletePlayer = async (playerId: string) => {
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      updatedAt: Timestamp.now(),
    });
    // Soft delete - you can implement hard delete if needed
    // await deleteDoc(playerRef);
  } catch (error: any) {
    console.error('Error deleting player:', error);
    throw new Error(error.message);
  }
};

// Create a match result (admin only)
export const createMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const matchRef = doc(db, 'matches', matchId);
    
    await setDoc(matchRef, {
      ...matchData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Update player stats if match is completed
    if (matchData.status === 'completed') {
      await updatePlayersAfterMatch(matchData);
    }
    
    return matchId;
  } catch (error: any) {
    console.error('Error creating match:', error);
    throw new Error(error.message);
  }
};

// Helper function to update players after match
const updatePlayersAfterMatch = async (matchData: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const player1 = await getPlayer(matchData.player1Id);
    const player2 = await getPlayer(matchData.player2Id);
    
    if (!player1 || !player2) {
      throw new Error('Players not found');
    }
    
    // Determine winner
    const player1Won = matchData.player1Score > matchData.player2Score;
    
    // Update player 1
    await updatePlayerStats(matchData.player1Id, {
      wins: player1.wins + (player1Won ? 1 : 0),
      losses: player1.losses + (player1Won ? 0 : 1),
    });
    
    // Update player 2
    await updatePlayerStats(matchData.player2Id, {
      wins: player2.wins + (player1Won ? 0 : 1),
      losses: player2.losses + (player1Won ? 1 : 0),
    });
    
    // Update league match count
    const stats = await getLeagueStats();
    await updateLeagueStats({
      matches: stats.matches + 1,
    });
  } catch (error: any) {
    console.error('Error updating players after match:', error);
    throw new Error(error.message);
  }
};

// Get all matches
export const getAllMatches = async (): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, orderBy('week', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const matches: Match[] = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() } as Match);
    });
    
    return matches;
  } catch (error: any) {
    console.error('Error getting matches:', error);
    throw new Error(error.message);
  }
};

// ==================== ADMIN MATCHUP MANAGEMENT ====================

// Shuffle array randomly (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Create randomized matchups for Week 1
export const createWeek1Matchups = async (date: string): Promise<string[]> => {
  try {
    const players = await getAllPlayers();
    
    if (players.length < 2) {
      throw new Error('Need at least 2 players to create matchups');
    }
    
    // Randomize player order
    const shuffledPlayers = shuffleArray(players);
    
    const matchIds: string[] = [];
    
    // Pair players sequentially
    for (let i = 0; i < shuffledPlayers.length - 1; i += 2) {
      const player1 = shuffledPlayers[i];
      const player2 = shuffledPlayers[i + 1];
      
      // Calculate race-to numbers based on APA handicapping
      const [p1RaceTo, p2RaceTo] = calculateAPARace(player1.skillLevel, player2.skillLevel);
      
      const matchId = await createWeeklyMatchup(
        1,
        player1.id,
        player2.id,
        date,
        player1.skillLevel,
        player2.skillLevel,
        p1RaceTo,
        p2RaceTo
      );
      
      matchIds.push(matchId);
    }
    
    // If odd number of players, one gets a bye
    if (shuffledPlayers.length % 2 !== 0) {
      console.log(`Player ${shuffledPlayers[shuffledPlayers.length - 1].name} has a bye this week`);
    }
    
    return matchIds;
  } catch (error: any) {
    console.error('Error creating Week 1 matchups:', error);
    throw new Error(error.message);
  }
};

// Create matchup for the week (admin only)
export const createWeeklyMatchup = async (
  week: number,
  player1Id: string,
  player2Id: string,
  date: string,
  player1SkillLevel?: number,
  player2SkillLevel?: number,
  player1RaceTo?: number,
  player2RaceTo?: number
): Promise<string> => {
  try {
    const player1 = await getPlayer(player1Id);
    const player2 = await getPlayer(player2Id);
    
    if (!player1 || !player2) {
      throw new Error('Players not found');
    }
    
    // Use provided skill levels or get from player data
    const p1Skill = player1SkillLevel ?? player1.skillLevel;
    const p2Skill = player2SkillLevel ?? player2.skillLevel;
    
    // Calculate race-to if not provided
    let p1Race = player1RaceTo;
    let p2Race = player2RaceTo;
    
    if (!p1Race || !p2Race) {
      [p1Race, p2Race] = calculateAPARace(p1Skill, p2Skill);
    }
    
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const matchRef = doc(db, 'matches', matchId);
    
    await setDoc(matchRef, {
      week,
      player1Id,
      player1Name: player1.name,
      player1SkillLevel: p1Skill,
      player1RaceTo: p1Race,
      player1Score: 0,
      player2Id,
      player2Name: player2.name,
      player2SkillLevel: p2Skill,
      player2RaceTo: p2Race,
      player2Score: 0,
      date,
      status: 'scheduled',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return matchId;
  } catch (error: any) {
    console.error('Error creating matchup:', error);
    throw new Error(error.message);
  }
};

// Get matches for a specific week
export const getMatchesByWeek = async (week: number): Promise<Match[]> => {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, where('week', '==', week));
    const querySnapshot = await getDocs(q);
    
    const matches: Match[] = [];
    querySnapshot.forEach((doc) => {
      matches.push({ id: doc.id, ...doc.data() } as Match);
    });
    
    return matches;
  } catch (error: any) {
    console.error('Error getting matches by week:', error);
    throw new Error(error.message);
  }
};

// Update match score (admin only)
export const updateMatchScore = async (
  matchId: string,
  player1Score: number,
  player2Score: number
) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      player1Score,
      player2Score,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error updating match score:', error);
    throw new Error(error.message);
  }
};

// Complete a match and update player stats (admin only)
export const completeMatch = async (matchId: string) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);
    
    if (!matchDoc.exists()) {
      throw new Error('Match not found');
    }
    
    const matchData = matchDoc.data() as Match;
    
    // Update match status
    await updateDoc(matchRef, {
      status: 'completed',
      updatedAt: Timestamp.now(),
    });
    
    // Update player stats
    const player1Won = matchData.player1Score > matchData.player2Score;
    
    const player1 = await getPlayer(matchData.player1Id);
    const player2 = await getPlayer(matchData.player2Id);
    
    if (player1 && player2) {
      await updatePlayerStats(matchData.player1Id, {
        wins: player1.wins + (player1Won ? 1 : 0),
        losses: player1.losses + (player1Won ? 0 : 1),
      });
      
      await updatePlayerStats(matchData.player2Id, {
        wins: player2.wins + (player1Won ? 0 : 1),
        losses: player2.losses + (player1Won ? 1 : 0),
      });
      
      // Update league stats
      const stats = await getLeagueStats();
      await updateLeagueStats({
        matches: stats.matches + 1,
      });
    }
  } catch (error: any) {
    console.error('Error completing match:', error);
    throw new Error(error.message);
  }
};

// Delete a match (admin only)
export const deleteMatch = async (matchId: string) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error deleting match:', error);
    throw new Error(error.message);
  }
};

