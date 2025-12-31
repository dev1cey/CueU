/**
 * Example: How to use Realtime Database for live matches and Firestore for standings
 * 
 * This demonstrates the workflow:
 * 1. Create match in Realtime DB
 * 2. Both players authenticate
 * 3. Update scores/racks in real-time
 * 4. Set winner and confirm
 * 5. Sync to Firestore for standings
 */

import { useState, useEffect } from 'react';
import { getCurrentUser } from './firebase';
import {
  createMatch,
  authenticatePlayerToMatch,
  updateMatchRack,
  setMatchWinner,
  confirmMatchResult,
  subscribeToMatch,
  MatchState,
} from './realtimeDb';
import { watchMatchForSync } from './matchSync';

export const useLiveMatch = (matchId: string) => {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Subscribe to real-time match updates
    const unsubscribe = subscribeToMatch(matchId, (matchData) => {
      setMatch(matchData);
      setLoading(false);
    });

    // Watch for completion and sync to Firestore
    const syncUnsubscribe = watchMatchForSync(matchId, (completedMatch) => {
      console.log('Match completed and synced to Firestore:', completedMatch);
    });

    return () => {
      unsubscribe();
      syncUnsubscribe();
    };
  }, [matchId]);

  return { match, loading };
};

// Example component usage:
/*
import React from 'react';
import { useLiveMatch } from '../lib/matchExample';
import { authenticatePlayerToMatch, updateMatchRack, setMatchWinner, confirmMatchResult } from '../lib/realtimeDb';
import { getCurrentUser } from '../lib/firebase';

export const MatchScreen = ({ matchId }: { matchId: string }) => {
  const { match, loading } = useLiveMatch(matchId);
  const user = getCurrentUser();

  const handleAuthenticate = async () => {
    if (!user) return;
    await authenticatePlayerToMatch(matchId, user.uid);
  };

  const handleUpdateRack = async (rackNumber: number, player1Score: number, player2Score: number) => {
    if (!user) return;
    await updateMatchRack(matchId, rackNumber, player1Score, player2Score, user.uid);
  };

  const handleSetWinner = async (winnerId: string) => {
    await setMatchWinner(matchId, winnerId);
  };

  const handleConfirm = async () => {
    if (!user) return;
    const isFullyConfirmed = await confirmMatchResult(matchId, user.uid);
    if (isFullyConfirmed) {
      console.log('Match confirmed by both players!');
    }
  };

  if (loading) return <Text>Loading match...</Text>;
  if (!match) return <Text>Match not found</Text>;

  return (
    <View>
      <Text>Match: {match.player1Name} vs {match.player2Name}</Text>
      <Text>Score: {match.player1Score} - {match.player2Score}</Text>
      <Text>Status: {match.status}</Text>
      
      {match.status === 'waiting' && (
        <Button title="Authenticate" onPress={handleAuthenticate} />
      )}
      
      {match.status === 'active' && (
        <>
          <Button 
            title="Update Rack" 
            onPress={() => handleUpdateRack(match.currentRack + 1, 5, 3)} 
          />
          <Button 
            title="Set Winner" 
            onPress={() => handleSetWinner(match.player1Id)} 
          />
        </>
      )}
      
      {match.status === 'pending_confirmation' && (
        <Button title="Confirm Result" onPress={handleConfirm} />
      )}
    </View>
  );
};
*/

