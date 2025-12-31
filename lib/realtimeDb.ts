// Realtime Database utility functions for live match updates
import { realtimeDb } from '../config/firebase';
import {
  ref,
  set,
  update,
  remove,
  get,
  onValue,
  off,
  push,
  serverTimestamp,
  DatabaseReference,
  DataSnapshot,
} from 'firebase/database';

// Match-related types
export interface MatchState {
  matchId: string;
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  currentRack: number;
  racks: RackData[];
  status: 'waiting' | 'active' | 'completed' | 'pending_confirmation';
  winnerId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RackData {
  rackNumber: number;
  player1Score: number;
  player2Score: number;
  updatedBy: string;
  timestamp: number;
}

/**
 * Create a new match in Realtime Database
 */
export const createMatch = async (
  matchId: string,
  player1Id: string,
  player1Name: string,
  player2Id: string,
  player2Name: string
): Promise<void> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    const matchData: MatchState = {
      matchId,
      player1Id,
      player1Name,
      player2Id,
      player2Name,
      player1Score: 0,
      player2Score: 0,
      currentRack: 1,
      racks: [],
      status: 'waiting',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await set(matchRef, matchData);
  } catch (error: any) {
    throw new Error(`Failed to create match: ${error.message}`);
  }
};

/**
 * Authenticate a player to a match
 * Both players must authenticate before the match becomes active
 */
export const authenticatePlayerToMatch = async (
  matchId: string,
  playerId: string
): Promise<void> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    const authRef = ref(realtimeDb, `matches/${matchId}/authenticatedPlayers/${playerId}`);
    
    // Check if match exists and add player to authenticated list
    await set(authRef, {
      playerId,
      authenticatedAt: Date.now(),
    });

    // Check if both players are authenticated, then set status to 'active'
    const authPlayersRef = ref(realtimeDb, `matches/${matchId}/authenticatedPlayers`);
    const snapshot = await get(authPlayersRef);

    if (snapshot.exists()) {
      const authenticatedPlayers = snapshot.val();
      const playerIds = Object.keys(authenticatedPlayers);
      
      if (playerIds.length >= 2) {
        // Both players authenticated, activate match
        await update(matchRef, {
          status: 'active',
          updatedAt: Date.now(),
        });
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to authenticate player: ${error.message}`);
  }
};

/**
 * Update match scores and rack data in real-time
 */
export const updateMatchRack = async (
  matchId: string,
  rackNumber: number,
  player1Score: number,
  player2Score: number,
  updatedBy: string
): Promise<void> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    const racksRef = ref(realtimeDb, `matches/${matchId}/racks/${rackNumber}`);
    
    const rackData: RackData = {
      rackNumber,
      player1Score,
      player2Score,
      updatedBy,
      timestamp: Date.now(),
    };

    // Update the specific rack
    await set(racksRef, rackData);

    // Update match totals and current rack
    await update(matchRef, {
      player1Score,
      player2Score,
      currentRack: rackNumber,
      updatedAt: Date.now(),
    });
  } catch (error: any) {
    throw new Error(`Failed to update rack: ${error.message}`);
  }
};

/**
 * Set match winner and mark as pending confirmation
 */
export const setMatchWinner = async (
  matchId: string,
  winnerId: string
): Promise<void> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    await update(matchRef, {
      winnerId,
      status: 'pending_confirmation',
      updatedAt: Date.now(),
    });
  } catch (error: any) {
    throw new Error(`Failed to set winner: ${error.message}`);
  }
};

/**
 * Confirm match result (both players must confirm)
 */
export const confirmMatchResult = async (
  matchId: string,
  playerId: string
): Promise<boolean> => {
  try {
    const confirmationsRef = ref(realtimeDb, `matches/${matchId}/confirmations/${playerId}`);
    await set(confirmationsRef, {
      playerId,
      confirmedAt: Date.now(),
    });

    // Check if both players confirmed
    const confirmationsRef = ref(realtimeDb, `matches/${matchId}/confirmations`);
    const snapshot = await get(confirmationsRef);

    if (snapshot.exists()) {
      const confirmations = snapshot.val();
      const confirmedPlayerIds = Object.keys(confirmations);
      
      if (confirmedPlayerIds.length >= 2) {
        // Both players confirmed, mark match as completed
        const matchRef = ref(realtimeDb, `matches/${matchId}`);
        await update(matchRef, {
          status: 'completed',
          updatedAt: Date.now(),
        });
        return true; // Match is fully confirmed
      }
    }
    return false; // Waiting for other player's confirmation
  } catch (error: any) {
    throw new Error(`Failed to confirm match: ${error.message}`);
  }
};

/**
 * Subscribe to real-time match updates
 * Returns an unsubscribe function
 */
export const subscribeToMatch = (
  matchId: string,
  callback: (match: MatchState | null) => void
): (() => void) => {
  const matchRef = ref(realtimeDb, `matches/${matchId}`);
  
  const unsubscribe = onValue(
    matchRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as MatchState);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error listening to match updates:', error);
      callback(null);
    }
  );

  // Return unsubscribe function
  return () => {
    off(matchRef);
    unsubscribe();
  };
};

/**
 * Get current match state (one-time read)
 */
export const getMatchState = async (matchId: string): Promise<MatchState | null> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    return new Promise((resolve, reject) => {
      const unsubscribe = onValue(
        matchRef,
        (snapshot) => {
          unsubscribe();
          if (snapshot.exists()) {
            resolve(snapshot.val() as MatchState);
          } else {
            resolve(null);
          }
        },
        reject
      );
    });
  } catch (error: any) {
    throw new Error(`Failed to get match state: ${error.message}`);
  }
};

/**
 * Delete a match (cleanup)
 */
export const deleteMatch = async (matchId: string): Promise<void> => {
  try {
    const matchRef = ref(realtimeDb, `matches/${matchId}`);
    await remove(matchRef);
  } catch (error: any) {
    throw new Error(`Failed to delete match: ${error.message}`);
  }
};

