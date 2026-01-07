import { useState, useEffect } from 'react';
import { User } from '../firebase/types';
import { getUserById, getTopPlayers, getAllUsers, getTopPlayersByIds } from '../firebase/services';

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

// Hook to get top players by player IDs (for season-specific rankings)
export const useSeasonTopPlayers = (
  playerIds: string[] | null, 
  limit?: number,
  seasonId?: string
) => {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!playerIds || playerIds.length === 0) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await getTopPlayersByIds(playerIds, limit, seasonId);
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [playerIds, limit, seasonId]);

  const refetch = async () => {
    if (!playerIds || playerIds.length === 0) return;
    
    try {
      setLoading(true);
      const playersData = await getTopPlayersByIds(playerIds, limit, seasonId);
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

