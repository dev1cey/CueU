// Sync completed matches from Realtime Database to Firestore for standings
import { MatchState } from './realtimeDb';
import { createDocument, updateDocument, getDocument } from './firebase';
import { subscribeToMatch } from './realtimeDb';

/**
 * Sync a completed match to Firestore for standings and history
 * This should be called when a match status changes to 'completed'
 */
export const syncMatchToFirestore = async (match: MatchState): Promise<void> => {
  try {
    // Store match result in Firestore
    await createDocument('matchResults', {
      matchId: match.matchId,
      player1Id: match.player1Id,
      player1Name: match.player1Name,
      player1Score: match.player1Score,
      player2Id: match.player2Id,
      player2Name: match.player2Name,
      player2Score: match.player2Score,
      winnerId: match.winnerId,
      winnerName: match.winnerId === match.player1Id ? match.player1Name : match.player2Name,
      racks: match.racks,
      completedAt: match.updatedAt,
    }, match.matchId);

    // Update player standings
    await updatePlayerStandings(match);
  } catch (error: any) {
    throw new Error(`Failed to sync match to Firestore: ${error.message}`);
  }
};

/**
 * Update player standings in Firestore
 */
const updatePlayerStandings = async (match: MatchState): Promise<void> => {
  try {
    if (!match.winnerId) return;

    const winnerId = match.winnerId;
    const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;

    // Update winner's stats
    const winnerDoc = await getDocument('standings', winnerId);
    if (winnerDoc) {
      await updateDocument('standings', winnerId, {
        wins: (winnerDoc.wins || 0) + 1,
        totalMatches: (winnerDoc.totalMatches || 0) + 1,
        totalPoints: (winnerDoc.totalPoints || 0) + (winnerId === match.player1Id ? match.player1Score : match.player2Score),
        lastMatchAt: match.updatedAt,
      });
    } else {
      // Create new standings entry
      await createDocument('standings', {
        playerId: winnerId,
        playerName: winnerId === match.player1Id ? match.player1Name : match.player2Name,
        wins: 1,
        losses: 0,
        totalMatches: 1,
        totalPoints: winnerId === match.player1Id ? match.player1Score : match.player2Score,
        lastMatchAt: match.updatedAt,
      }, winnerId);
    }

    // Update loser's stats
    const loserDoc = await getDocument('standings', loserId);
    if (loserDoc) {
      await updateDocument('standings', loserId, {
        losses: (loserDoc.losses || 0) + 1,
        totalMatches: (loserDoc.totalMatches || 0) + 1,
        totalPoints: (loserDoc.totalPoints || 0) + (loserId === match.player1Id ? match.player1Score : match.player2Score),
        lastMatchAt: match.updatedAt,
      });
    } else {
      // Create new standings entry
      await createDocument('standings', {
        playerId: loserId,
        playerName: loserId === match.player1Id ? match.player1Name : match.player2Name,
        wins: 0,
        losses: 1,
        totalMatches: 1,
        totalPoints: loserId === match.player1Id ? match.player1Score : match.player2Score,
        lastMatchAt: match.updatedAt,
      }, loserId);
    }
  } catch (error: any) {
    throw new Error(`Failed to update standings: ${error.message}`);
  }
};

/**
 * Watch a match and automatically sync to Firestore when completed
 * Returns an unsubscribe function
 */
export const watchMatchForSync = (
  matchId: string,
  onComplete?: (match: MatchState) => void
): (() => void) => {
  return subscribeToMatch(matchId, async (match) => {
    if (match && match.status === 'completed') {
      try {
        await syncMatchToFirestore(match);
        if (onComplete) {
          onComplete(match);
        }
      } catch (error) {
        console.error('Error syncing match to Firestore:', error);
      }
    }
  });
};

