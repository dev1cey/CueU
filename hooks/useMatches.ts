// Hook to get user's matches
export const useUserMatches = (userId: string | null) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await getMatchesForUser(userId);
        setMatches(matchesData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const matchesData = await getMatchesForUser(userId);
      setMatches(matchesData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch };
};

import { useData } from '../contexts/DataContext';
import { useState, useEffect } from 'react';
import { Match } from '../firebase/types';
import { getMatchesForUser, getMatchesBySeason } from '../firebase/services';

// Hook to get upcoming matches (uses shared DataContext)
export const useUpcomingMatches = (userId?: string) => {
  const { upcomingMatches, matchesLoading, matchesError, refetchMatches } = useData();
  
  // Update matches when userId changes - use silent refresh to avoid loading flicker
  useEffect(() => {
    if (userId !== undefined) {
      refetchMatches(userId, true); // Silent refresh when userId changes
    }
  }, [userId]); // Removed refetchMatches from dependencies - it's stable

  return { 
    matches: upcomingMatches, 
    loading: matchesLoading, 
    error: matchesError, 
    refetch: () => refetchMatches(userId) // Manual refetch shows loading
  };
};

// Hook to get matches by season
export const useSeasonMatches = (seasonId: string | null) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!seasonId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await getMatchesBySeason(seasonId);
        setMatches(matchesData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [seasonId]);

  const refetch = async () => {
    if (!seasonId) return;
    
    try {
      setLoading(true);
      const matchesData = await getMatchesBySeason(seasonId);
      setMatches(matchesData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch };
};

