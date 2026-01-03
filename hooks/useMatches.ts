import { useState, useEffect } from 'react';
import { Match } from '../firebase/types';
import { getMatchesForUser, getUpcomingMatches, getMatchesBySeason } from '../firebase/services';

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

// Hook to get upcoming matches
export const useUpcomingMatches = (userId?: string) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const matchesData = await getUpcomingMatches(userId);
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
    try {
      setLoading(true);
      const matchesData = await getUpcomingMatches(userId);
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

