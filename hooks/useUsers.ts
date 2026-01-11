import { useState, useEffect, useRef } from 'react';
import { User } from '../firebase/types';
import { getUserById, getTopPlayers, getAllUsers } from '../firebase/services';
import { useData } from '../contexts/DataContext';

// Hook to get a user by ID
export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

// Hook to get top players
export const useTopPlayers = (limit: number = 10) => {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await getTopPlayers(limit);
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [limit]);

  const refetch = async () => {
    try {
      setLoading(true);
      const playersData = await getTopPlayers(limit);
      setPlayers(playersData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { players, loading, error, refetch };
};

// Hook to get all users
export const useAllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getAllUsers();
        setUsers(usersData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, error, refetch };
};

// Hook to get top players by player IDs (for season-specific rankings) - uses shared DataContext
export const useSeasonTopPlayers = (
  playerIds: string[] | null, 
  limit?: number,
  seasonId?: string
) => {
  const { seasonPlayers, playersLoading, playersError, refetchPlayers } = useData();
  
  // Track previous values to avoid unnecessary refetches when array reference changes but values are the same
  const prevParamsRef = useRef<{ playerIds: string[] | null; limit?: number; seasonId?: string }>({ playerIds: null, limit: undefined, seasonId: undefined });
  
  // Helper to compare arrays by value
  const arraysEqual = (a: string[] | null, b: string[] | null): boolean => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };
  
  // Update players when params change - use silent refresh to avoid loading flicker
  useEffect(() => {
    const paramsChanged = 
      !arraysEqual(playerIds, prevParamsRef.current.playerIds) ||
      limit !== prevParamsRef.current.limit ||
      seasonId !== prevParamsRef.current.seasonId;
    
    if (paramsChanged) {
      prevParamsRef.current = { playerIds, limit, seasonId };
      refetchPlayers(playerIds, limit, seasonId, true); // Silent refresh when params change
    }
  }, [playerIds, limit, seasonId]); // refetchPlayers is stable (useCallback with no deps), so we don't need it in deps

  return { 
    players: seasonPlayers, 
    loading: playersLoading, 
    error: playersError, 
    refetch: () => refetchPlayers(playerIds, limit, seasonId) // Manual refetch shows loading
  };
};

