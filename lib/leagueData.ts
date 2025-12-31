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
  createdAt?: any;
  updatedAt?: any;
}

export interface LeagueStats {
  players: number;
  currentWeek: number;
  totalWeeks: number;
  matches: number;
}

// Create a new player
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

